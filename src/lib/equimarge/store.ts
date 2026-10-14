import { getSupabase } from "@/integrations/supabase/client";
import { newId } from "./demo";
import type { Expense, Horse, Revenue, Structure, Workspace } from "./types";

export interface Account {
  id: string;
  email: string;
}

export type WorkspaceData = Pick<Workspace, "horses" | "expenses" | "revenues">;

/** Everything the app needs from a backend: accounts and one structure per account. */
export interface EquiStore {
  mode: "cloud" | "local";
  currentAccount(): Promise<Account | null>;
  onAccountChange(listener: (account: Account | null) => void): () => void;
  signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  load(): Promise<Workspace | null>;
  saveStructure(structure: Structure): Promise<void>;
  saveHorse(horse: Horse): Promise<void>;
  deleteHorse(id: string): Promise<void>;
  saveExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveRevenue(revenue: Revenue): Promise<void>;
  deleteRevenue(id: string): Promise<void>;
  /** Replaces every horse, expense and revenue (sample data, reset). */
  replaceData(data: WorkspaceData): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Cloud store (Supabase, protected by Row Level Security)             */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

const toNumber = (value: unknown) => (value == null ? 0 : Number(value));
const toDate = (value: unknown) => (value == null ? null : String(value).slice(0, 10));

const structureFromRow = (r: Row): Structure => ({
  id: String(r["id"]),
  name: String(r["name"] ?? ""),
  declaredHorseCount: toNumber(r["declared_horse_count"]),
  activities: (r["activities"] as Structure["activities"]) ?? [],
  mainExpenses: (r["main_expenses"] as Structure["mainExpenses"]) ?? [],
  lessonsPerWeek: toNumber(r["lessons_per_week"]),
  plan: (r["plan"] as Structure["plan"]) ?? "essai",
  trialEndsAt: toDate(r["trial_ends_at"]) ?? "",
  isDemo: Boolean(r["is_demo"]),
  onboarded: Boolean(r["onboarded"]),
  createdAt: String(r["created_at"] ?? ""),
});

const structureToRow = (s: Structure) => ({
  id: s.id,
  name: s.name,
  declared_horse_count: s.declaredHorseCount,
  activities: s.activities,
  main_expenses: s.mainExpenses,
  lessons_per_week: s.lessonsPerWeek,
  plan: s.plan,
  trial_ends_at: s.trialEndsAt,
  is_demo: s.isDemo,
  onboarded: s.onboarded,
});

const horseFromRow = (r: Row): Horse => ({
  id: String(r["id"]),
  name: String(r["name"]),
  type: r["type"] as Horse["type"],
  arrivalDate: toDate(r["arrival_date"]) ?? "",
  departureDate: toDate(r["departure_date"]),
  monthlyPrice: toNumber(r["monthly_price"]),
  lessonsPerWeek: toNumber(r["lessons_per_week"]),
  notes: String(r["notes"] ?? ""),
});

const horseToRow = (h: Horse) => ({
  id: h.id,
  name: h.name,
  type: h.type,
  arrival_date: h.arrivalDate,
  departure_date: h.departureDate,
  monthly_price: h.monthlyPrice,
  lessons_per_week: h.lessonsPerWeek,
  notes: h.notes,
});

const expenseFromRow = (r: Row): Expense => ({
  id: String(r["id"]),
  category: r["category"] as Expense["category"],
  label: String(r["label"] ?? ""),
  amount: toNumber(r["amount"]),
  date: toDate(r["date"]) ?? "",
  recurrence: r["recurrence"] as Expense["recurrence"],
  endDate: toDate(r["end_date"]),
  horseId: r["horse_id"] ? String(r["horse_id"]) : null,
});

const expenseToRow = (e: Expense) => ({
  id: e.id,
  category: e.category,
  label: e.label,
  amount: e.amount,
  date: e.date,
  recurrence: e.recurrence,
  end_date: e.endDate,
  horse_id: e.horseId,
});

const revenueFromRow = (r: Row): Revenue => ({
  id: String(r["id"]),
  kind: r["kind"] as Revenue["kind"],
  lessonFormat: (r["lesson_format"] as Revenue["lessonFormat"]) ?? null,
  label: String(r["label"] ?? ""),
  amount: toNumber(r["amount"]),
  date: toDate(r["date"]) ?? "",
  recurrence: r["recurrence"] as Revenue["recurrence"],
  endDate: toDate(r["end_date"]),
});

const revenueToRow = (r: Revenue) => ({
  id: r.id,
  kind: r.kind,
  lesson_format: r.lessonFormat,
  label: r.label,
  amount: r.amount,
  date: r.date,
  recurrence: r.recurrence,
  end_date: r.endDate,
});

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("already registered")) return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("email not confirmed"))
    return "Confirmez d'abord votre adresse : un lien vous a été envoyé par e-mail.";
  if (m.includes("password")) return "Le mot de passe doit contenir au moins 8 caractères.";
  return "Une erreur est survenue. Vérifiez votre connexion et réessayez.";
}

function createCloudStore(): EquiStore {
  const supabase = getSupabase()!;

  async function check<T extends { error: { message: string } | null }>(promise: PromiseLike<T>) {
    const result = await promise;
    if (result.error) throw new Error("L'enregistrement a échoué. Réessayez dans un instant.");
    return result;
  }

  return {
    mode: "cloud",
    async currentAccount() {
      const { data } = await supabase.auth.getUser();
      return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
    },
    onAccountChange(listener) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        listener(session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null);
      });
      return () => data.subscription.unsubscribe();
    },
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/equimarge/app` },
      });
      if (error) throw new Error(translateAuthError(error.message));
      return { needsConfirmation: !data.session };
    },
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(translateAuthError(error.message));
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/equimarge/connexion`,
      });
      if (error) throw new Error(translateAuthError(error.message));
    },
    async signOut() {
      await supabase.auth.signOut();
    },
    async load() {
      const { data: structure } = await check(
        supabase.from("structures").select("*").maybeSingle(),
      );
      if (!structure) return null;
      const [horses, expenses, revenues] = await Promise.all([
        check(supabase.from("horses").select("*").order("name")),
        check(supabase.from("expenses").select("*").order("date", { ascending: false })),
        check(supabase.from("revenues").select("*").order("date", { ascending: false })),
      ]);
      return {
        structure: structureFromRow(structure as Row),
        horses: (horses.data as Row[]).map(horseFromRow),
        expenses: (expenses.data as Row[]).map(expenseFromRow),
        revenues: (revenues.data as Row[]).map(revenueFromRow),
      };
    },
    async saveStructure(structure) {
      await check(supabase.from("structures").upsert(structureToRow(structure)));
    },
    async saveHorse(horse) {
      await check(supabase.from("horses").upsert(horseToRow(horse)));
    },
    async deleteHorse(id) {
      await check(supabase.from("horses").delete().eq("id", id));
    },
    async saveExpense(expense) {
      await check(supabase.from("expenses").upsert(expenseToRow(expense)));
    },
    async deleteExpense(id) {
      await check(supabase.from("expenses").delete().eq("id", id));
    },
    async saveRevenue(revenue) {
      await check(supabase.from("revenues").upsert(revenueToRow(revenue)));
    },
    async deleteRevenue(id) {
      await check(supabase.from("revenues").delete().eq("id", id));
    },
    async replaceData(data) {
      // RLS limits these deletes to the signed-in account's rows.
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Session expirée, reconnectez-vous.");
      await check(supabase.from("expenses").delete().eq("user_id", userId));
      await check(supabase.from("revenues").delete().eq("user_id", userId));
      await check(supabase.from("horses").delete().eq("user_id", userId));
      if (data.horses.length)
        await check(supabase.from("horses").insert(data.horses.map(horseToRow)));
      if (data.expenses.length)
        await check(supabase.from("expenses").insert(data.expenses.map(expenseToRow)));
      if (data.revenues.length)
        await check(supabase.from("revenues").insert(data.revenues.map(revenueToRow)));
    },
  };
}

/* ------------------------------------------------------------------ */
/* Local store (demo mode, data kept in this browser only)             */
/* ------------------------------------------------------------------ */

const USERS_KEY = "equimarge:comptes";
const SESSION_KEY = "equimarge:session";
const dataKey = (userId: string) => `equimarge:donnees:${userId}`;

interface LocalUser {
  id: string;
  email: string;
  salt: string;
  hash: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Impossible d'enregistrer dans ce navigateur (mode privé ?).");
  }
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: string) {
  // Pages opened from a file or plain http may lack SubtleCrypto: fall back to
  // a simple digest, acceptable for browser-only demo accounts.
  if (!globalThis.crypto?.subtle) {
    let h = 2166136261;
    for (const ch of salt + password) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return `fnv-${(h >>> 0).toString(16)}`;
  }
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 120_000, hash: "SHA-256" },
    material,
    256,
  );
  return toHex(bits);
}

function createLocalStore(): EquiStore {
  const listeners = new Set<(account: Account | null) => void>();
  const session = () => readJson<Account | null>(SESSION_KEY, null);
  const emit = () => listeners.forEach((l) => l(session()));

  function requireSession() {
    const account = session();
    if (!account) throw new Error("Session expirée, reconnectez-vous.");
    return account;
  }

  function update(mutator: (ws: Workspace) => Workspace) {
    const account = requireSession();
    const current = readJson<Workspace | null>(dataKey(account.id), null);
    if (!current) throw new Error("Structure introuvable.");
    writeJson(dataKey(account.id), mutator(current));
  }

  const upsert = <T extends { id: string }>(list: T[], item: T) =>
    list.some((x) => x.id === item.id)
      ? list.map((x) => (x.id === item.id ? item : x))
      : [...list, item];

  return {
    mode: "local",
    async currentAccount() {
      return session();
    },
    onAccountChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async signUp(email, password) {
      const users = readJson<LocalUser[]>(USERS_KEY, []);
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email === normalized))
        throw new Error("Un compte existe déjà avec cet e-mail.");
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
      const user: LocalUser = {
        id: newId(),
        email: normalized,
        salt,
        hash: await hashPassword(password, salt),
      };
      writeJson(USERS_KEY, [...users, user]);
      writeJson(SESSION_KEY, { id: user.id, email: user.email });
      emit();
      return { needsConfirmation: false };
    },
    async signIn(email, password) {
      const users = readJson<LocalUser[]>(USERS_KEY, []);
      const user = users.find((u) => u.email === email.trim().toLowerCase());
      if (!user || (await hashPassword(password, user.salt)) !== user.hash)
        throw new Error("E-mail ou mot de passe incorrect.");
      writeJson(SESSION_KEY, { id: user.id, email: user.email });
      emit();
    },
    async sendPasswordReset() {
      throw new Error(
        "En mode démonstration, les mots de passe ne peuvent pas être réinitialisés par e-mail.",
      );
    },
    async signOut() {
      window.localStorage.removeItem(SESSION_KEY);
      emit();
    },
    async load() {
      const account = session();
      return account ? readJson<Workspace | null>(dataKey(account.id), null) : null;
    },
    async saveStructure(structure) {
      const account = requireSession();
      const current = readJson<Workspace | null>(dataKey(account.id), null);
      writeJson(dataKey(account.id), {
        horses: [],
        expenses: [],
        revenues: [],
        ...current,
        structure,
      });
    },
    async saveHorse(horse) {
      update((ws) => ({ ...ws, horses: upsert(ws.horses, horse) }));
    },
    async deleteHorse(id) {
      update((ws) => ({
        ...ws,
        horses: ws.horses.filter((h) => h.id !== id),
        expenses: ws.expenses.filter((e) => e.horseId !== id),
      }));
    },
    async saveExpense(expense) {
      update((ws) => ({ ...ws, expenses: upsert(ws.expenses, expense) }));
    },
    async deleteExpense(id) {
      update((ws) => ({ ...ws, expenses: ws.expenses.filter((e) => e.id !== id) }));
    },
    async saveRevenue(revenue) {
      update((ws) => ({ ...ws, revenues: upsert(ws.revenues, revenue) }));
    },
    async deleteRevenue(id) {
      update((ws) => ({ ...ws, revenues: ws.revenues.filter((r) => r["id"] !== id) }));
    },
    async replaceData(data) {
      update((ws) => ({ ...ws, ...data }));
    },
  };
}

let store: EquiStore | null = null;

/** Cloud store when Supabase is configured, otherwise the in-browser demo store. */
export function getStore(): EquiStore {
  store ??= getSupabase() ? createCloudStore() : createLocalStore();
  return store;
}
