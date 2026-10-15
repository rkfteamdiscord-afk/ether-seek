import type { Backend } from "./backend";
import { LocalBackend } from "./local";
import { SupabaseBackend } from "./supabase";

export * from "./backend";
export { LocalBackend } from "./local";

let backend: Backend | null = null;

/**
 * Supabase when VITE_SUPABASE_URL and a publishable (anon) key are configured, otherwise the
 * in-browser demo. Both keys are public by design; row-level security protects the data.
 */
export function getBackend(): Backend {
  if (backend) return backend;
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env["VITE_SUPABASE_URL"];
  const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_ANON_KEY"];
  backend = url && key ? new SupabaseBackend(url.replace(/\/$/, ""), key) : new LocalBackend();
  return backend;
}
