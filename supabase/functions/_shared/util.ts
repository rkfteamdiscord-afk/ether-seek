// Shared helpers for AbroadYield Edge Functions (Deno).
// Secrets come from `supabase secrets set …` and never reach the browser.

export const cors = {
  "access-control-allow-origin": Deno.env.get("AY_ALLOWED_ORIGIN") ?? "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-allow-methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/** The signed-in user behind the request, verified with Supabase Auth. */
export async function getUser(
  req: Request,
): Promise<{ id: string; email: string; token: string } | null> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token || token === ANON_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id ? { id: user.id, email: user.email ?? "", token } : null;
}

export async function isAdmin(token: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ay_is_admin`, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: "{}",
  });
  return res.ok && (await res.json()) === true;
}

/** Service-role REST call (bypasses RLS — only for server-side writes). */
export async function admin(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      authorization: `Bearer ${SERVICE_KEY}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  return res;
}

export async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  const res = await admin(
    `ay_documents?collection=eq.${collection}&id=eq.${encodeURIComponent(id)}&select=data`,
  );
  const rows = (await res.json()) as Array<{ data: T }>;
  return rows[0]?.data ?? null;
}

export async function putDoc(
  collection: string,
  id: string,
  data: unknown,
  ownerId: string | null = null,
) {
  await admin("ay_documents?on_conflict=collection,id", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ collection, id, data, owner_id: ownerId }),
  });
}

/** Minimal Stripe REST client (form-encoded), no SDK needed. */
export async function stripe<T>(
  path: string,
  params?: Record<string, string>,
  method = "POST",
): Promise<T> {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Payments are not configured (STRIPE_SECRET_KEY missing)");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? `Stripe error ${res.status}`);
  return body as T;
}

export interface Settings {
  pricing: {
    fullReportUsd: number;
    explorerPassUsd: number;
    explorerPassDays: number;
    maxCountriesPerReport: number;
  };
  validationMode: boolean;
  allowPromotionCodes: boolean;
  ai: { messagesPerHour: number };
}

export const DEFAULT_SETTINGS: Settings = {
  pricing: {
    fullReportUsd: 39,
    explorerPassUsd: 89,
    explorerPassDays: 90,
    maxCountriesPerReport: 3,
  },
  validationMode: false,
  allowPromotionCodes: true,
  ai: { messagesPerHour: 20 },
};

export async function loadSettings(): Promise<Settings> {
  const stored = await getDoc<Partial<Settings>>("config", "settings");
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    pricing: { ...DEFAULT_SETTINGS.pricing, ...(stored?.pricing ?? {}) },
  } as Settings;
}
