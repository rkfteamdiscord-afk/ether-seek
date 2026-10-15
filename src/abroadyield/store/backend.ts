import type { ProductKey } from "../types";

/**
 * Storage and auth contract. Two implementations:
 *  - LocalBackend: a self-contained demo that keeps everything in this browser (no account, no
 *    payment provider needed). Used automatically when Supabase is not configured.
 *  - SupabaseBackend: production. Postgres with row-level security, Supabase Auth, and Edge
 *    Functions for Stripe Checkout, webhooks, refunds, the AI assistant and account deletion.
 */

export type Collection =
  | "countries"
  | "cities"
  | "config"
  | "partners"
  | "leads"
  | "orders"
  | "reports"
  | "waitlist"
  | "events"
  | "blog"
  | "audit"
  | "unlock_clicks"
  | "subscribers"
  | "refund_requests";

/** Collections anyone may read (published content). Everything else is owner- or admin-only. */
export const PUBLIC_COLLECTIONS: Collection[] = ["countries", "cities", "config", "blog"];
/** Collections whose edits are recorded in the audit log. */
export const AUDITED_COLLECTIONS: Collection[] = [
  "countries",
  "cities",
  "config",
  "partners",
  "blog",
  "leads",
  "orders",
];

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface CheckoutRequest {
  product: ProductKey;
  countryIds: string[];
  email: string;
  successPath: string;
  cancelPath: string;
}

export interface CheckoutResponse {
  /** Redirect target (Stripe Checkout URL, or a local confirmation page in demo mode). */
  url: string;
}

export interface AssistantRequest {
  question: string;
  reportContext: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface Backend {
  readonly mode: "local" | "supabase";
  list<T>(collection: Collection): Promise<T[] | null>;
  get<T>(collection: Collection, id: string): Promise<T | null>;
  put<T extends { id: string }>(collection: Collection, item: T): Promise<void>;
  remove(collection: Collection, id: string): Promise<void>;
  /** Inserts that anyone may make (events, leads, waitlist, unlock clicks). */
  insert<T extends { id: string }>(collection: Collection, item: T): Promise<void>;

  currentUser(): Promise<AuthUser | null>;
  signUp(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser | null; needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<AuthUser>;
  sendMagicLink(email: string, redirectPath: string): Promise<{ demoLink?: string }>;
  completeMagicLink(): Promise<AuthUser | null>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  onAuthChange(listener: () => void): () => void;

  startCheckout(request: CheckoutRequest): Promise<CheckoutResponse>;
  refundOrder(orderId: string): Promise<void>;
  askAssistant(request: AssistantRequest): Promise<string | null>;
}

export function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}
