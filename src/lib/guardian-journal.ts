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
  corrections?: Array<{ fichier: string; chercher: string; remplacer: string; raison: string }>;
  theme?: "bug" | "deco" | "fantome" | "detail";
};
export type GuardianRun = { status: string; conclusion: string | null; createdAt: string; url: string };
export type GuardianFix = { sha: string; message: string; date: string; url: string };
export type Journal = { repo: string; journalUrl: string | null; issueNumber: number | null; totalComments: number; status: GuardianStatus | null; entries: GuardianEntry[]; runs: GuardianRun[]; fixes: GuardianFix[]; fetchedAt: string; error?: string };

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

type Comment = { body: string; issue_url: string; user: { login: string } };
type Issue = { number: number; title: string; html_url: string; comments: number; user: { login: string } };

const entriesOf = (comments: Comment[], issueNumber: number) =>
  comments
    .filter((comment) => comment.user.login === BOT && comment.issue_url.endsWith(`/issues/${issueNumber}`))
    .flatMap((comment) => decode<GuardianEntry[]>(comment.body, "gardien:recap") ?? [decode<GuardianEntry>(comment.body, "gardien:entree")])
    .filter((item): item is GuardianEntry => !!item);

/** Newest first, without duplicates. */
export function mergeEntries(...lists: GuardianEntry[][]) {
  const byTime = new Map<string, GuardianEntry>();
  for (const list of lists) for (const entry of list) byTime.set(entry.at, entry);
  return [...byTime.values()].sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Latest status and roughly the last 8 hours of analyses in one request. Runs, fixes and
 * the journal issue itself are fetched only when `withActivity` is set, to stay well
 * under GitHub's limit of 60 anonymous requests an hour.
 */
export async function loadJournal(previous: Journal | null, withActivity: boolean): Promise<Journal> {
  let issue: Issue | undefined;
  if (withActivity || !previous?.issueNumber) {
    const issues = await github<Issue[]>(`/issues?state=all&per_page=100&creator=${encodeURIComponent(BOT)}`);
    issue = issues.find((item) => item.title === "🛡️ Journal du gardien" && item.user.login === BOT);
  }
  const issueNumber = issue?.number ?? previous?.issueNumber ?? null;
  const [comments, runs, commits] = await Promise.all([
    issueNumber ? github<Comment[]>(`/issues/comments?sort=updated&direction=desc&per_page=100`) : Promise.resolve([]),
    withActivity ? github<{ workflow_runs: Array<{ status: string; conclusion: string | null; created_at: string; html_url: string }> }>(`/actions/workflows/gardien.yml/runs?per_page=6`).catch(() => ({ workflow_runs: [] })) : null,
    withActivity ? github<Array<{ sha: string; html_url: string; commit: { message: string; author: { date: string } } }>>(`/commits?per_page=60`) : null,
  ]);
  const own = comments.filter((comment) => comment.user.login === BOT && issueNumber && comment.issue_url.endsWith(`/issues/${issueNumber}`));
  return {
    repo: REPO,
    journalUrl: issue?.html_url ?? previous?.journalUrl ?? null,
    issueNumber,
    totalComments: issue?.comments ?? previous?.totalComments ?? 0,
    status: own.map((comment) => decode<GuardianStatus>(comment.body, "gardien:statut")).find((item) => item && item.checks) ?? previous?.status ?? null,
    entries: mergeEntries(previous?.entries ?? [], issueNumber ? entriesOf(own, issueNumber) : []),
    runs: runs ? runs.workflow_runs.map((run) => ({ status: run.status, conclusion: run.conclusion, createdAt: run.created_at, url: run.html_url })) : previous?.runs ?? [],
    fixes: commits ? commits.filter((commit) => commit.commit.message.startsWith("gardien:")).map((commit) => ({ sha: commit.sha.slice(0, 7), message: commit.commit.message.split("\n")[0]!, date: commit.commit.author.date, url: commit.html_url })) : previous?.fixes ?? [],
    fetchedAt: new Date().toISOString(),
  };
}

/** One older page of the journal (100 comments, oldest pages first on GitHub). */
export async function loadJournalPage(issueNumber: number, page: number) {
  return entriesOf(await github<Comment[]>(`/issues/${issueNumber}/comments?per_page=100&page=${page}`), issueNumber);
}
