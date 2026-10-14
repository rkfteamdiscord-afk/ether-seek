import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, getRequestIP, setCookie } from "@tanstack/react-start/server";

/**
 * Admin panel back end. The code is read from the ADMIN_CODE secret and checked on the
 * server only; five wrong tries lock the visitor out for 15 minutes. A signed, HttpOnly
 * cookie keeps the session for 12 hours, signed with ADMIN_SESSION_SECRET (or, when it
 * is not set, a key derived from the other server secrets). The guardian's journal is
 * read from GitHub, keeping only comments written by the guardian itself.
 */

const COOKIE = "zrk_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const MAX_TRIES = 5;
const REPO = () => process.env["GARDIEN_REPO"] ?? "rkfteamdiscord-afk/ether-seek";
const BOT = "github-actions[bot]";

// Per server instance: slows down guessing even though instances can be recycled.
const attempts = new Map<string, { count: number; until: number }>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sameText(a: string, b: string) {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
}

async function sign(value: string) {
  const secret = process.env["ADMIN_SESSION_SECRET"] ?? `${process.env["GROQ_API_KEY"] ?? ""}::${process.env["ADMIN_CODE"] ?? ""}::zrk-admin`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isAdmin() {
  const [expires, signature] = (getCookie(COOKIE) ?? "").split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return sameText(signature, await sign(expires));
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const code = (input as { code?: unknown } | null)?.code;
    return { code: typeof code === "string" ? code.trim().slice(0, 64) : "" };
  })
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_CODE"];
    if (!expected) return { ok: false, message: "Panneau pas encore configuré : ajoute le secret ADMIN_CODE dans Lovable." };
    const visitor = getRequestIP({ xForwardedFor: true }) ?? "inconnu";
    const record = attempts.get(visitor);
    if (record && record.until > Date.now()) {
      return { ok: false, message: `Trop d’essais. Réessaie dans ${Math.ceil((record.until - Date.now()) / 60000)} min.` };
    }
    if (!sameText(data.code, expected)) {
      await sleep(1000);
      const count = (record?.count ?? 0) + 1;
      attempts.set(visitor, count >= MAX_TRIES ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 });
      return { ok: false, message: count >= MAX_TRIES ? "Trop d’essais : accès bloqué 15 minutes." : `Code incorrect (${MAX_TRIES - count} essai${MAX_TRIES - count > 1 ? "s" : ""} restant${MAX_TRIES - count > 1 ? "s" : ""}).` };
    }
    attempts.delete(visitor);
    const expires = String(Date.now() + SESSION_MS);
    setCookie(COOKIE, `${expires}.${await sign(expires)}`, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: SESSION_MS / 1000 });
    return { ok: true, message: "" };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE, { path: "/" });
  return { ok: true };
});

export type SiteCheck = { at: string; ok: boolean; status: number | null; ms: number | null; headers: Record<string, boolean>; error?: string };
export type GuardianStatus = { activity: string; site: string; checks: SiteCheck[]; updated: string };
export type GuardianEntry = {
  at: string; reason: string; results: Array<{ command: string; ok: boolean }>;
  pensee: string; constats: string[]; decision: string; relecture?: string;
  correction: { fichier: string; chercher: string; remplacer: string; raison: string } | null;
};
export type GuardianRun = { status: string; conclusion: string | null; createdAt: string; url: string };
export type GuardianFix = { sha: string; message: string; date: string; url: string };
export type AdminData =
  | { authorized: false }
  | { authorized: true; repo: string; journalUrl: string | null; status: GuardianStatus | null; entries: GuardianEntry[]; runs: GuardianRun[]; fixes: GuardianFix[]; fetchedAt: string; error?: string };

let cache: { at: number; data: Extract<AdminData, { authorized: true }> } | null = null;

async function github<T>(path: string): Promise<T> {
  const token = process.env["GITHUB_TOKEN"];
  const response = await fetch(`https://api.github.com/repos/${REPO()}${path}`, {
    headers: { accept: "application/vnd.github+json", "user-agent": "zrk-admin", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  return (await response.json()) as T;
}

function decode<T>(body: string, mark: string): T | null {
  const match = body.match(new RegExp(`<!-- ${mark} ([A-Za-z0-9+/=]+) -->`));
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]!), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

async function loadJournal(): Promise<Extract<AdminData, { authorized: true }>> {
  const issues = await github<Array<{ number: number; title: string; html_url: string; user: { login: string } }>>(`/issues?state=all&per_page=100&creator=${encodeURIComponent(BOT)}`);
  const journal = issues.find((issue) => issue.title === "🛡️ Journal du gardien" && issue.user.login === BOT);
  const [comments, runs, commits] = await Promise.all([
    journal ? github<Array<{ body: string; issue_url: string; user: { login: string } }>>(`/issues/comments?sort=updated&direction=desc&per_page=60`) : Promise.resolve([]),
    github<{ workflow_runs: Array<{ status: string; conclusion: string | null; created_at: string; html_url: string }> }>(`/actions/workflows/gardien.yml/runs?per_page=6`).catch(() => ({ workflow_runs: [] })),
    github<Array<{ sha: string; html_url: string; commit: { message: string; author: { date: string } } }>>(`/commits?per_page=40`),
  ]);
  const own = comments.filter((comment) => comment.user.login === BOT && journal && comment.issue_url.endsWith(`/issues/${journal.number}`));
  const status = own.map((comment) => decode<GuardianStatus>(comment.body, "gardien:statut")).find((item) => item && item.checks) ?? null;
  const entries = own.map((comment) => decode<GuardianEntry>(comment.body, "gardien:entree")).filter((item): item is GuardianEntry => !!item).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 25);
  return {
    authorized: true,
    repo: REPO(),
    journalUrl: journal?.html_url ?? null,
    status,
    entries,
    runs: runs.workflow_runs.map((run) => ({ status: run.status, conclusion: run.conclusion, createdAt: run.created_at, url: run.html_url })),
    fixes: commits.filter((commit) => commit.commit.message.startsWith("gardien:")).map((commit) => ({ sha: commit.sha.slice(0, 7), message: commit.commit.message.split("\n")[0]!, date: commit.commit.author.date, url: commit.html_url })),
    fetchedAt: new Date().toISOString(),
  };
}

export const adminData = createServerFn({ method: "GET" }).handler(async (): Promise<AdminData> => {
  if (!(await isAdmin())) return { authorized: false };
  if (cache && Date.now() - cache.at < 10000) return cache.data;
  try {
    const data = await loadJournal();
    cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "erreur inconnue";
    if (cache) return { ...cache.data, error: `Données d’il y a quelques instants (GitHub : ${message}).` };
    return { authorized: true, repo: REPO(), journalUrl: null, status: null, entries: [], runs: [], fixes: [], fetchedAt: new Date().toISOString(), error: `Impossible de lire le journal (${message}).` };
  }
});
