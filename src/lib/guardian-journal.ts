/**
 * Reads the guardian's journal straight from the public GitHub repository, in the
 * browser: no server and no secret needed. Only comments written by the guardian
 * itself are trusted, since anyone can comment on a public issue.
 */
const REPO = "rkfteamdiscord-afk/ether-seek";
const BOT = "github-actions[bot]";

/** SHA-256 of the panel code. The journal is public anyway: this only keeps the panel out of casual sight. */
export const ADMIN_CODE_HASH = "a3346b8b4c26feb607f8a40699c934ef426dee5ceebf51f9f7209aa79c08a0da";

export async function codeMatches(code: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code.trim()));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("") === ADMIN_CODE_HASH;
}

export type SiteCheck = { at: string; ok: boolean; status: number | null; ms: number | null; headers: Record<string, boolean>; error?: string };
export type GuardianStatus = { activity: string; site: string; checks: SiteCheck[]; updated: string };
export type GuardianEntry = {
  at: string; reason: string; results: Array<{ command: string; ok: boolean }>;
  pensee: string; constats: string[]; decision: string; relecture?: string;
  correction: { fichier: string; chercher: string; remplacer: string; raison: string } | null;
};
export type GuardianRun = { status: string; conclusion: string | null; createdAt: string; url: string };
export type GuardianFix = { sha: string; message: string; date: string; url: string };
export type Journal = { repo: string; journalUrl: string | null; status: GuardianStatus | null; entries: GuardianEntry[]; runs: GuardianRun[]; fixes: GuardianFix[]; fetchedAt: string; error?: string };

async function github<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, { headers: { accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(response.status === 403 ? "limite de GitHub atteinte, réessaie dans quelques minutes" : `GitHub ${response.status}`);
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

export async function loadJournal(): Promise<Journal> {
  const issues = await github<Array<{ number: number; title: string; html_url: string; user: { login: string } }>>(`/issues?state=all&per_page=100&creator=${encodeURIComponent(BOT)}`);
  const journal = issues.find((issue) => issue.title === "🛡️ Journal du gardien" && issue.user.login === BOT);
  const [comments, runs, commits] = await Promise.all([
    journal ? github<Array<{ body: string; issue_url: string; user: { login: string } }>>(`/issues/comments?sort=updated&direction=desc&per_page=60`) : Promise.resolve([]),
    github<{ workflow_runs: Array<{ status: string; conclusion: string | null; created_at: string; html_url: string }> }>(`/actions/workflows/gardien.yml/runs?per_page=6`).catch(() => ({ workflow_runs: [] })),
    github<Array<{ sha: string; html_url: string; commit: { message: string; author: { date: string } } }>>(`/commits?per_page=40`),
  ]);
  const own = comments.filter((comment) => comment.user.login === BOT && journal && comment.issue_url.endsWith(`/issues/${journal.number}`));
  return {
    repo: REPO,
    journalUrl: journal?.html_url ?? null,
    status: own.map((comment) => decode<GuardianStatus>(comment.body, "gardien:statut")).find((item) => item && item.checks) ?? null,
    entries: own.map((comment) => decode<GuardianEntry>(comment.body, "gardien:entree")).filter((item): item is GuardianEntry => !!item).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 25),
    runs: runs.workflow_runs.map((run) => ({ status: run.status, conclusion: run.conclusion, createdAt: run.created_at, url: run.html_url })),
    fixes: commits.filter((commit) => commit.commit.message.startsWith("gardien:")).map((commit) => ({ sha: commit.sha.slice(0, 7), message: commit.commit.message.split("\n")[0]!, date: commit.commit.author.date, url: commit.html_url })),
    fetchedAt: new Date().toISOString(),
  };
}
