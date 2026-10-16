import { newId, type AuthUser, type Backend, type Collection } from "./backend";

/**
 * Production backend on Supabase, spoken to over its REST endpoints (PostgREST, GoTrue and Edge
 * Functions) so the browser bundle needs no extra dependency. Security lives in the database:
 * row-level security policies in supabase/migrations decide who reads and writes what, and the
 * admin role is checked server-side. Secrets (Stripe, AI) live only in Edge Function settings.
 */

interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

const SESSION_KEY = "ay.v1.sb-session";
const OWNED: Collection[] = [
  "orders",
  "reports",
  "leads",
  "waitlist",
  "unlock_clicks",
  "subscribers",
  "refund_requests",
];

export class SupabaseBackend implements Backend {
  readonly mode = "supabase" as const;
  private listeners = new Set<() => void>();
  private session: Session | null = null;
  private loaded = false;

  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {}

  private loadSession() {
    if (this.loaded || typeof window === "undefined") return;
    this.loaded = true;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      this.session = raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      this.session = null;
    }
  }

  private saveSession(session: Session | null) {
    this.session = session;
    try {
      if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage errors; the session lives in memory for this page.
    }
    this.listeners.forEach((listener) => listener());
  }

  private async token(): Promise<string> {
    this.loadSession();
    if (!this.session) return this.key;
    if (Date.now() > this.session.expiresAt - 60_000) {
      try {
        const response = await this.authFetch("/token?grant_type=refresh_token", {
          refresh_token: this.session.refreshToken,
        });
        await this.acceptSession(response);
      } catch {
        this.saveSession(null);
        return this.key;
      }
    }
    return this.session?.accessToken ?? this.key;
  }

  private async rest(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.key,
        authorization: `Bearer ${await this.token()}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok)
      throw new Error(`Database request failed (${response.status}): ${await response.text()}`);
    return response;
  }

  async list<T>(collection: Collection): Promise<T[] | null> {
    if (collection === "reports") {
      // Saved reports come back through a function that decrypts the owner's financial inputs.
      if (!(await this.currentUser())) return null;
      const rows = (await (
        await this.rest("rpc/ay_my_reports", { method: "POST", body: "{}" })
      ).json()) as T[];
      return rows.length ? rows : null;
    }
    const response = await this.rest(
      `ay_documents?collection=eq.${collection}&select=data&order=updated_at.asc`,
    );
    const rows = (await response.json()) as Array<{ data: T }>;
    return rows.length ? rows.map((row) => row.data) : null;
  }

  async get<T>(collection: Collection, id: string): Promise<T | null> {
    const response = await this.rest(
      `ay_documents?collection=eq.${collection}&id=eq.${encodeURIComponent(id)}&select=data`,
    );
    const rows = (await response.json()) as Array<{ data: T }>;
    return rows[0]?.data ?? null;
  }

  private async ownerId(collection: Collection): Promise<string | null> {
    if (!OWNED.includes(collection)) return null;
    return (await this.currentUser())?.id ?? null;
  }

  async put<T extends { id: string }>(collection: Collection, item: T): Promise<void> {
    await this.rest("ay_documents?on_conflict=collection,id", {
      method: "POST",
      headers: { prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        collection,
        id: item.id,
        data: item,
        owner_id: await this.ownerId(collection),
      }),
    });
  }

  async remove(collection: Collection, id: string): Promise<void> {
    await this.rest(`ay_documents?collection=eq.${collection}&id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async insert<T extends { id: string }>(collection: Collection, item: T): Promise<void> {
    await this.rest("ay_documents", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({
        collection,
        id: item.id,
        data: item,
        owner_id: await this.ownerId(collection),
      }),
    });
  }

  // ---------- auth ----------

  private async authFetch(
    path: string,
    body: unknown,
    accessToken?: string,
  ): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.url}/auth/v1${path}`, {
      method: "POST",
      headers: {
        apikey: this.key,
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok)
      throw new Error(
        String(
          payload["msg"] ??
            payload["error_description"] ??
            payload["message"] ??
            "Authentication failed",
        ),
      );
    return payload;
  }

  private async roleFor(userId: string, accessToken: string): Promise<AuthUser["role"]> {
    const response = await fetch(
      `${this.url}/rest/v1/ay_user_roles?user_id=eq.${userId}&select=role`,
      {
        headers: { apikey: this.key, authorization: `Bearer ${accessToken}` },
      },
    );
    if (!response.ok) return "user";
    const rows = (await response.json()) as Array<{ role: string }>;
    return rows.some((row) => row.role === "admin") ? "admin" : "user";
  }

  private async acceptSession(payload: Record<string, unknown>): Promise<AuthUser> {
    const accessToken = String(payload["access_token"] ?? "");
    const refreshToken = String(payload["refresh_token"] ?? "");
    const expiresIn = Number(payload["expires_in"] ?? 3600);
    const rawUser = (payload["user"] ?? {}) as { id?: string; email?: string };
    if (!accessToken || !rawUser.id) throw new Error("No session returned");
    const user: AuthUser = {
      id: rawUser.id,
      email: rawUser.email ?? "",
      role: await this.roleFor(rawUser.id, accessToken),
    };
    this.saveSession({ accessToken, refreshToken, expiresAt: Date.now() + expiresIn * 1000, user });
    return user;
  }

  async currentUser(): Promise<AuthUser | null> {
    this.loadSession();
    if (!this.session) return null;
    await this.token();
    return this.session?.user ?? null;
  }

  async signUp(email: string, password: string) {
    const payload = await this.authFetch("/signup", { email, password });
    if (payload["access_token"])
      return { user: await this.acceptSession(payload), needsConfirmation: false };
    return { user: null, needsConfirmation: true };
  }

  async signIn(email: string, password: string) {
    return this.acceptSession(
      await this.authFetch("/token?grant_type=password", { email, password }),
    );
  }

  async sendMagicLink(email: string, redirectPath: string) {
    const redirect = `${window.location.origin}${redirectPath}`;
    await this.authFetch(`/otp?redirect_to=${encodeURIComponent(redirect)}`, {
      email,
      create_user: true,
    });
    return {};
  }

  async completeMagicLink(): Promise<AuthUser | null> {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    if (!accessToken) return null;
    const response = await fetch(`${this.url}/auth/v1/user`, {
      headers: { apikey: this.key, authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    const rawUser = await response.json();
    const user = await this.acceptSession({
      access_token: accessToken,
      refresh_token: hash.get("refresh_token"),
      expires_in: hash.get("expires_in"),
      user: rawUser,
    });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return user;
  }

  async signOut() {
    const token = this.session?.accessToken;
    this.saveSession(null);
    if (token) await this.authFetch("/logout", {}, token).catch(() => undefined);
  }

  async deleteAccount() {
    await this.invoke("ay-delete-account", {});
    this.saveSession(null);
  }

  onAuthChange(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // ---------- edge functions ----------

  private async invoke<T>(name: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.url}/functions/v1/${name}`, {
      method: "POST",
      headers: {
        apikey: this.key,
        authorization: `Bearer ${await this.token()}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? `Request failed (${response.status})`);
    return payload;
  }

  async startCheckout(request: Parameters<Backend["startCheckout"]>[0]) {
    return this.invoke<{ url: string }>("ay-checkout", {
      ...request,
      origin: window.location.origin,
      idempotencyKey: newId("chk"),
    });
  }

  async refundOrder(orderId: string) {
    await this.invoke("ay-refund", { orderId });
  }

  async askAssistant(request: Parameters<Backend["askAssistant"]>[0]) {
    try {
      const payload = await this.invoke<{ answer?: string }>("ay-assistant", request);
      return payload.answer ?? null;
    } catch (error) {
      if (error instanceof Error && /rate limit/i.test(error.message)) throw error;
      return null;
    }
  }
}
