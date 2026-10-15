// Le gardien du site Ȥrk.
//
// Lancé par .github/workflows/gardien.yml toutes les 5 minutes. Il vérifie le site en
// ligne une fois par minute pendant son passage, puis, une fois par heure ou dès qu'un
// incident apparaît, il compile et teste le site et demande à une IA Groq d'analyser
// les résultats. L'IA peut proposer UNE petite correction ; elle n'est appliquée que si
// des règles strictes, une seconde IA relectrice, la compilation et les tests la valident.
// Tout est écrit dans le ticket « Journal du gardien », que le panneau admin affiche.
// Le dépôt est public : rien de secret ne doit être écrit dans le journal.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const env = process.env;
const SITE_URL = env.SITE_URL || "https://www.zrk.lol";
const REPO = env.GITHUB_REPOSITORY;
const TOKEN = env.GITHUB_TOKEN;
const GROQ_KEY = env.GROQ_API_KEY || "";
const MODEL = env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GITHUB_API = env.GITHUB_API_URL || "https://api.github.com";
const GROQ_API = env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const DRY_RUN = env.GARDIEN_DRY_RUN === "1"; // tout faire sauf publier (pour les tests)
const ROUNDS = Number(env.GARDIEN_ROUNDS ?? 50);
const JOURNAL_TITLE = "🛡️ Journal du gardien";
const STATUS_MARK = "gardien:statut";
const ENTRY_MARK = "gardien:entree";
const REQUIRED_HEADERS = ["strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy"];

// Only these files may be touched, and never the sensitive ones.
const ALLOWED = /^src\/.+\.(ts|tsx|css)$/;
const DENIED = [/^src\/server\.ts$/, /^src\/lib\/ghost-ai\.ts$/, /^src\/lib\/ghost-prompt\.ts$/, /^src\/lib\/ghost-browser-ai\.ts$/, /^src\/lib\/guardian-journal\.ts$/, /^src\/lib\/admin/, /^src\/routes\/admin/, /^src\/lib\/seasonal-offer/, /^src\/lib\/error-/, /routeTree\.gen\.ts$/, /\.test\./];
const FORBIDDEN = [/https?:\/\//i, /<script/i, /dangerouslySetInnerHTML/, /\beval\s*\(/, /new\s+Function/, /process\.env/, /\bfetch\s*\(/, /^\s*import\s/m, /document\.cookie/, /localStorage|sessionStorage/, /innerHTML/, /\brequire\s*\(/];
const MAX_LINES = 20;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();
const clean = (text, max = 3500) => String(text ?? "").split(GROQ_KEY || "\u0000").join("[secret]").split(TOKEN || "\u0000").join("[secret]").slice(-max);
const encode = (data) => Buffer.from(JSON.stringify(data), "utf8").toString("base64");

async function github(path, options = {}, retry = true) {
  // One retry on network errors: a connection can go stale during the long build.
  const response = await fetch(`${GITHUB_API}/repos/${REPO}${path}`, {
    method: options.method ?? "GET",
    headers: { authorization: `Bearer ${TOKEN}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "gardien-zrk" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch((error) => { if (retry) return null; throw error; });
  if (!response) return github(path, options, false);
  if (!response.ok) throw new Error(`GitHub ${options.method ?? "GET"} ${path} → ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function journalIssue() {
  const issues = await github(`/issues?state=all&per_page=100&creator=github-actions%5Bbot%5D`);
  const found = issues.find((issue) => issue.title === JOURNAL_TITLE);
  if (found) return found.number;
  const created = await github("/issues", { method: "POST", body: { title: JOURNAL_TITLE, body: "Journal automatique du gardien du site : surveillance, analyses et corrections. Le panneau admin du site l’affiche en direct." } });
  return created.number;
}

async function statusComment(issue) {
  const comments = await github(`/issues/${issue}/comments?per_page=100`);
  const found = comments.find((comment) => comment.body.includes(`<!-- ${STATUS_MARK}`));
  if (found) return found.id;
  const created = await github(`/issues/${issue}/comments`, { method: "POST", body: { body: `<!-- ${STATUS_MARK} ${encode({})} -->\nStatut en direct du gardien.` } });
  return created.id;
}

async function writeStatus(issue, commentId, state) {
  const last = state.checks.at(-1);
  const body = [
    `<!-- ${STATUS_MARK} ${encode(state)} -->`,
    `### Statut en direct — ${state.activity}`,
    last ? `Dernière vérification : ${last.at} — ${last.ok ? "✅ en ligne" : "❌ problème"} (${last.status ?? "?"}, ${last.ms ?? "?"} ms)` : "",
    last ? `Protections : ${REQUIRED_HEADERS.map((name) => `${last.headers?.[name] ? "✅" : "⚠️"} ${name}`).join(" · ")}` : "",
  ].join("\n");
  await github(`/issues/comments/${commentId}`, { method: "PATCH", body: { body } }).catch((error) => console.error(error.message));
}

async function checkSite() {
  const started = Date.now();
  try {
    const response = await fetch(SITE_URL, { redirect: "follow", headers: { "user-agent": "gardien-zrk" }, signal: AbortSignal.timeout(20000) });
    const html = await response.text();
    const headers = Object.fromEntries(REQUIRED_HEADERS.map((name) => [name, response.headers.has(name)]));
    return { at: now(), ok: response.ok && html.includes("rk"), status: response.status, ms: Date.now() - started, headers };
  } catch (error) {
    return { at: now(), ok: false, status: null, ms: Date.now() - started, headers: {}, error: clean(error.message, 300) };
  }
}

function run(command) {
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe", timeout: 240000 });
    return { command, ok: true, output: clean(output, 1500) };
  } catch (error) {
    return { command, ok: false, output: clean(`${error.stdout ?? ""}\n${error.stderr ?? ""}`) };
  }
}

const verify = () => [run("npx tsc --noEmit -p ."), run("npx vite build"), run("bun test src/lib/seasonal-offer.test.js")];

async function groq(system, user) {
  if (!GROQ_KEY) return null;
  const response = await fetch(`${GROQ_API}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${GROQ_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 1400, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Groq → ${response.status}`);
  const payload = await response.json();
  return JSON.parse(payload.choices?.[0]?.message?.content ?? "{}");
}

/** Lines around each TypeScript error, so the AI can see the code it would fix. */
function errorContext(results) {
  const tsc = results.find((result) => result.command.includes("tsc"));
  const files = new Map();
  for (const match of (tsc?.output ?? "").matchAll(/(src\/[\w./-]+)\((\d+),\d+\)/g)) files.set(match[1], Number(match[2]));
  return [...files].slice(0, 3).map(([file, line]) => {
    const lines = readFileSync(file, "utf8").split("\n");
    const from = Math.max(0, line - 20);
    return `--- ${file} (lignes ${from + 1} à ${Math.min(lines.length, line + 20)})\n${lines.slice(from, line + 20).join("\n")}`;
  }).join("\n\n");
}

const analystPrompt = `Tu es le gardien du site du studio Ȥrk (React, TanStack Start, TypeScript, Tailwind).
Tu surveilles le site jour et nuit. On te donne les résultats des vérifications et des extraits de code.
1. Écris ta pensée : ce que tu observes, ce qui va bien, ce qui pose problème et pourquoi.
2. Liste tes constats.
3. Propose AU PLUS UNE petite correction, seulement si elle est utile et sans danger :
   - en priorité, corriger une erreur de compilation ou un test qui échoue ;
   - sinon, enrichir les réponses du petit fantôme dans src/lib/ghost-knowledge.ts avec plus de détails,
     en n’utilisant QUE des faits présents dans la fiche (siteFacts) de ce fichier : jamais de prix, de délai ou de promesse inventés ;
   - sinon, ne propose rien (correction: null). Ne change jamais la structure, le design global, la sécurité, les liens ni l’offre.
   Une correction remplace un texte EXACT (présent une seule fois dans le fichier) par un autre, 20 lignes maximum.
Réponds uniquement en JSON : {"pensee": "...", "constats": ["..."], "correction": null ou {"fichier": "src/...", "chercher": "texte exact actuel", "remplacer": "nouveau texte", "raison": "..."}}`;

const reviewerPrompt = `Tu es le relecteur du gardien du site Ȥrk. Une IA propose une petite modification qui sera publiée automatiquement.
Approuve-la seulement si TOUTES ces conditions sont vraies : elle est petite ; elle ne casse rien ; elle ne touche ni à la sécurité, ni aux liens, ni à l’offre ;
elle ne change pas le design global ; et, si elle modifie le texte du fantôme, elle n’affirme que des faits de la fiche fournie (aucun prix, délai ou promesse inventés).
Dans le doute, refuse. Réponds uniquement en JSON : {"approuve": true ou false, "raison": "..."}`;

function guard(fix) {
  if (!fix || typeof fix !== "object") return "aucune correction proposée";
  const { fichier, chercher, remplacer } = fix;
  if (typeof fichier !== "string" || typeof chercher !== "string" || typeof remplacer !== "string" || !chercher) return "correction mal formée";
  if (!ALLOWED.test(fichier) || DENIED.some((rule) => rule.test(fichier))) return `fichier interdit : ${fichier}`;
  let source;
  try { source = readFileSync(fichier, "utf8"); } catch { return `fichier introuvable : ${fichier}`; }
  if (source.split(chercher).length !== 2) return "le texte à remplacer n’apparaît pas exactement une fois";
  if (chercher === remplacer) return "aucun changement";
  if (chercher.split("\n").length > MAX_LINES || remplacer.split("\n").length > MAX_LINES) return "correction trop grande";
  const added = FORBIDDEN.filter((rule) => rule.test(remplacer) && !rule.test(chercher));
  if (added.length) return "contenu dangereux ajouté (lien, script, accès réseau ou import)";
  return null;
}

async function deepAnalysis(issue, commentId, state, reason) {
  state.activity = "🔍 analyse complète en cours (compilation et tests)";
  await writeStatus(issue, commentId, state);
  // Work on the latest site, including changes made in Lovable since this run started.
  try { execSync("git pull --ff-only -q origin main", { stdio: "pipe" }); } catch { /* keep the current copy */ }
  const results = verify();
  const entry = { at: now(), reason, checks: state.checks.slice(-5), results: results.map(({ command, ok }) => ({ command, ok })), pensee: "", constats: [], correction: null, decision: "" };
  if (!GROQ_KEY) {
    entry.pensee = "Pas de clé GROQ_API_KEY dans les secrets GitHub : j’ai seulement fait les vérifications automatiques.";
  } else {
    try {
      state.activity = "🧠 l’IA réfléchit aux résultats";
      await writeStatus(issue, commentId, state);
      const knowledge = readFileSync("src/lib/ghost-knowledge.ts", "utf8");
      const analysis = await groq(analystPrompt, [
        `Raison du passage : ${reason}`,
        `Vérifications du site en ligne : ${JSON.stringify(state.checks.slice(-5))}`,
        ...results.map((result) => `$ ${result.command} → ${result.ok ? "OK" : "ÉCHEC"}\n${result.ok ? "" : result.output}`),
        errorContext(results),
        `--- src/lib/ghost-knowledge.ts\n${knowledge}`,
      ].join("\n\n"));
      entry.pensee = clean(analysis?.pensee, 2500);
      entry.constats = (Array.isArray(analysis?.constats) ? analysis.constats : []).slice(0, 8).map((item) => clean(item, 300));
      const problem = guard(analysis?.correction);
      if (problem) {
        entry.decision = problem === "aucune correction proposée" ? "Rien à corriger pour l’instant." : `Correction refusée par les règles : ${problem}.`;
      } else {
        const fix = analysis.correction;
        entry.correction = { fichier: fix.fichier, chercher: clean(fix.chercher, 1500), remplacer: clean(fix.remplacer, 1500), raison: clean(fix.raison, 300) };
        state.activity = "⚖️ le relecteur vérifie la correction";
        await writeStatus(issue, commentId, state);
        const review = await groq(reviewerPrompt, `Fichier : ${fix.fichier}\nRaison : ${fix.raison}\n\nAvant :\n${fix.chercher}\n\nAprès :\n${fix.remplacer}\n\nFiche du site :\n${knowledge.slice(knowledge.indexOf("siteFacts"))}`);
        entry.relecture = clean(review?.raison, 600);
        if (review?.approuve !== true) {
          entry.decision = "Correction refusée par le relecteur.";
        } else {
          const original = readFileSync(fix.fichier, "utf8");
          writeFileSync(fix.fichier, original.replace(fix.chercher, fix.remplacer));
          state.activity = "🧪 je vérifie que le site marche toujours avec la correction";
          await writeStatus(issue, commentId, state);
          const after = verify();
          if (after.every((result) => result.ok) && DRY_RUN) {
            writeFileSync(fix.fichier, original);
            entry.decision = "Correction validée (mode à blanc : rien n’a été publié).";
          } else if (after.every((result) => result.ok)) {
            const message = `gardien: ${String(fix.raison).replace(/\s+/g, " ").slice(0, 80)}`;
            execSync(`git add ${JSON.stringify(fix.fichier)}`);
            execSync(`git -c user.name="gardien-zrk[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" commit -m ${JSON.stringify(message)}`);
            execSync("git push origin HEAD:main");
            entry.decision = `Correction appliquée et publiée (${execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()}).`;
          } else {
            writeFileSync(fix.fichier, original);
            entry.decision = "Correction annulée : le site ne compilait plus ou un test échouait.";
          }
        }
      }
    } catch (error) {
      entry.pensee ||= "Je n’ai pas pu joindre l’IA cette fois-ci.";
      entry.decision = `Analyse IA interrompue : ${clean(error.message, 200)}`;
    }
  }
  const icon = reason.startsWith("incident") ? "🚨" : "🛡️";
  const body = [
    `<!-- ${ENTRY_MARK} ${encode(entry)} -->`,
    `## ${icon} Passage du ${entry.at}`,
    `**Raison :** ${reason}`,
    `**Vérifications :** ${entry.results.map((result) => `${result.ok ? "✅" : "❌"} \`${result.command}\``).join(" · ")}`,
    entry.pensee ? `**Pensée du gardien :** ${entry.pensee}` : "",
    entry.constats.length ? `**Constats :**\n${entry.constats.map((item) => `- ${item}`).join("\n")}` : "",
    entry.correction ? `**Correction proposée** dans \`${entry.correction.fichier}\` : ${entry.correction.raison}` : "",
    entry.relecture ? `**Relecture :** ${entry.relecture}` : "",
    `**Décision :** ${entry.decision}`,
  ].filter(Boolean).join("\n\n");
  await github(`/issues/${issue}/comments`, { method: "POST", body: { body } });
}

/** When the last full analysis was written to the journal, so it happens about once an hour whatever GitHub's delays. */
async function lastAnalysisAt(issue) {
  const comments = await github(`/issues/comments?sort=created&direction=desc&per_page=50`).catch(() => []);
  const latest = comments.find((comment) => comment.issue_url?.endsWith(`/issues/${issue}`) && comment.body?.includes(`<!-- ${ENTRY_MARK}`));
  return latest ? Date.parse(latest.created_at) : 0;
}

/** Start the next run, so watching continues around the clock even when GitHub delays its schedule. */
async function chainNextRun() {
  if (env.GARDIEN_CHAIN !== "1") return;
  await github("/actions/workflows/gardien.yml/dispatches", { method: "POST", body: { ref: "main", inputs: { analyse: "false" } } })
    .catch((error) => console.error("Relance impossible :", error.message));
}

async function main() {
  const issue = await journalIssue();
  const commentId = await statusComment(issue);
  const state = { activity: "👀 surveillance du site", site: SITE_URL, checks: [], updated: now() };
  let lastDeep = env.GARDIEN_DEEP === "1" ? 0 : await lastAnalysisAt(issue);
  let lastIncident = 0;
  for (let round = 0; round < ROUNDS; round++) {
    const check = await checkSite();
    state.checks = [...state.checks, check].slice(-10);
    state.activity = check.ok ? "👀 surveillance du site" : "⚠️ le site ne répond pas correctement";
    state.updated = now();
    await writeStatus(issue, commentId, state);
    const incident = state.checks.slice(-2).filter((item) => !item.ok).length === 2 && Date.now() - lastIncident > 30 * 60000;
    if (incident || Date.now() - lastDeep > 55 * 60000) {
      if (incident) lastIncident = Date.now();
      lastDeep = Date.now();
      await deepAnalysis(issue, commentId, state, incident ? "incident : le site a échoué deux vérifications de suite" : "analyse horaire");
      state.activity = "👀 surveillance du site";
      await writeStatus(issue, commentId, state);
    }
    if (round < ROUNDS - 1) await sleep(55000);
  }
  state.activity = env.GARDIEN_CHAIN === "1" ? "🔁 je me relance pour continuer la surveillance" : "😴 en attente du prochain passage";
  state.updated = now();
  await writeStatus(issue, commentId, state);
  await chainNextRun();
}

main().catch((error) => { console.error(error); process.exit(1); });
