import type { AuditEntry } from "../types";
import {
  AUDITED_COLLECTIONS,
  newId,
  type AuthUser,
  type Backend,
  type Collection,
} from "./backend";

/**
 * Demo backend: everything lives in this browser's localStorage. It lets the whole product be
 * tried (questionnaire, demo checkout, reports, admin panel) without any server. It is not a
 * security boundary — the admin panel here only edits this browser's own copy of the data.
 */

const PREFIX = "ay.v1.";
const SESSION_KEY = `${PREFIX}session`;
const USERS_KEY = `${PREFIX}users`;
const MAX_EVENTS = 5000;

interface StoredUser extends AuthUser {
  passwordHash: string;
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the demo keeps working for this page view.
  }
}

async function hash(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`abroadyield-demo:${text}`),
  );
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export class LocalBackend implements Backend {
  readonly mode = "local" as const;
  private listeners = new Set<() => void>();

  async list<T>(collection: Collection): Promise<T[] | null> {
    return read<T[]>(collection);
  }

  async get<T>(collection: Collection, id: string): Promise<T | null> {
    const items = read<Array<T & { id: string }>>(collection) ?? [];
    return items.find((item) => item.id === id) ?? null;
  }

  async put<T extends { id: string }>(collection: Collection, item: T): Promise<void> {
    const items = read<T[]>(collection) ?? (await this.seedFor<T>(collection));
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index >= 0) items[index] = item;
    else items.push(item);
    write(collection, items);
    await this.audit(collection, item.id, index >= 0 ? "update" : "create");
  }

  async remove(collection: Collection, id: string): Promise<void> {
    const items =
      read<Array<{ id: string }>>(collection) ?? (await this.seedFor<{ id: string }>(collection));
    write(
      collection,
      items.filter((item) => item.id !== id),
    );
    await this.audit(collection, id, "delete");
  }

  async insert<T extends { id: string }>(collection: Collection, item: T): Promise<void> {
    const items = read<T[]>(collection) ?? [];
    items.push(item);
    write(collection, collection === "events" ? items.slice(-MAX_EVENTS) : items);
  }

  /** Editing a seeded collection for the first time copies the seed so other rows survive. */
  private async seedFor<T>(collection: Collection): Promise<T[]> {
    const seeds = await import("./seed");
    return (seeds.seedCollection(collection) as T[]) ?? [];
  }

  private async audit(collection: Collection, entityId: string, action: AuditEntry["action"]) {
    if (!AUDITED_COLLECTIONS.includes(collection)) return;
    const user = await this.currentUser();
    const entry: AuditEntry = {
      id: newId("audit"),
      at: new Date().toISOString(),
      actor: user?.email ?? "demo",
      collection,
      entityId,
      action,
      summary: `${action} ${collection}/${entityId}`,
    };
    await this.insert("audit", entry);
  }

  async currentUser(): Promise<AuthUser | null> {
    if (typeof window === "undefined") return null;
    const session = read<AuthUser>(SESSION_KEY.slice(PREFIX.length));
    return session ?? null;
  }

  private setSession(user: AuthUser | null) {
    if (user) write(SESSION_KEY.slice(PREFIX.length), user);
    else window.localStorage.removeItem(SESSION_KEY);
    this.listeners.forEach((listener) => listener());
  }

  private users(): StoredUser[] {
    return read<StoredUser[]>(USERS_KEY.slice(PREFIX.length)) ?? [];
  }

  async signUp(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if (this.users().some((u) => u.email === normalized))
      throw new Error("An account with this email already exists. Try logging in.");
    const user: StoredUser = {
      id: newId("user"),
      email: normalized,
      role: "user",
      passwordHash: await hash(password),
    };
    write(USERS_KEY.slice(PREFIX.length), [...this.users(), user]);
    const { passwordHash: _ignored, ...publicUser } = user;
    this.setSession(publicUser);
    return { user: publicUser, needsConfirmation: false };
  }

  async signIn(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = this.users().find((u) => u.email === normalized);
    if (!user || user.passwordHash !== (await hash(password)))
      throw new Error("Email or password is incorrect.");
    const { passwordHash: _ignored, ...publicUser } = user;
    this.setSession(publicUser);
    return publicUser;
  }

  async sendMagicLink(email: string, redirectPath: string) {
    const token = btoa(email.trim().toLowerCase());
    return {
      demoLink: `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}demo_magic=${encodeURIComponent(token)}`,
    };
  }

  async completeMagicLink(): Promise<AuthUser | null> {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("demo_magic");
    if (!token) return null;
    const user = await this.signInWithDemoToken(token);
    params.delete("demo_magic");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
    return user;
  }

  /** Demo stand-in for clicking the emailed magic link. */
  async signInWithDemoToken(token: string): Promise<AuthUser> {
    const email = atob(token);
    let user = this.users().find((u) => u.email === email);
    if (!user) {
      user = { id: newId("user"), email, role: "user", passwordHash: "" };
      write(USERS_KEY.slice(PREFIX.length), [...this.users(), user]);
    }
    const { passwordHash: _ignored, ...publicUser } = user;
    this.setSession(publicUser);
    return publicUser;
  }

  /** Demo only: lets the person trying the demo open the admin panel. */
  async becomeDemoAdmin(): Promise<void> {
    const user = (await this.currentUser()) ?? {
      id: newId("user"),
      email: "demo-admin@abroadyield.local",
      role: "user" as const,
    };
    this.setSession({ ...user, role: "admin" });
  }

  async signOut() {
    this.setSession(null);
  }

  async deleteAccount() {
    const user = await this.currentUser();
    if (!user) return;
    write(
      USERS_KEY.slice(PREFIX.length),
      this.users().filter((u) => u.id !== user.id),
    );
    for (const collection of ["orders", "reports", "leads", "waitlist"] as Collection[]) {
      const items = read<Array<{ userId?: string; email?: string }>>(collection) ?? [];
      write(
        collection,
        items.filter((item) => item.userId !== user.id && item.email !== user.email),
      );
    }
    window.localStorage.removeItem(`${PREFIX}profile`);
    this.setSession(null);
  }

  onAuthChange(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async startCheckout(request: Parameters<Backend["startCheckout"]>[0]) {
    const params = new URLSearchParams({
      demo: "1",
      product: request.product,
      countries: request.countryIds.join(","),
      email: request.email,
    });
    return { url: `/abroadyield/checkout?${params}` };
  }

  async refundOrder(orderId: string) {
    const order = await this.get<{ id: string; status: string }>("orders", orderId);
    if (order) await this.put("orders", { ...order, status: "refunded" });
  }

  async askAssistant() {
    return null;
  }
}
