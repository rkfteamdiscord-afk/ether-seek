import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { adminData, adminLogin, adminLogout, type AdminData, type GuardianEntry } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panneau du gardien — Ȥrk" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const REFRESH_MS = 15000;

function ago(iso: string | undefined, now: number) {
  if (!iso) return "jamais";
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 60) return `il y a ${seconds} s`;
  if (seconds < 3600) return `il y a ${Math.round(seconds / 60)} min`;
  return `il y a ${Math.round(seconds / 3600)} h`;
}

function when(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "medium" });
}

function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try { setData(await adminData()); } catch { setMessage("Impossible de joindre le serveur."); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!data?.authorized) return;
    const poll = window.setInterval(() => void refresh(), REFRESH_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(poll); window.clearInterval(tick); };
  }, [data?.authorized, refresh]);

  if (!data) return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">Chargement…</main>;

  if (!data.authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 font-body text-foreground">
        <form
          className="glass w-full max-w-sm rounded-3xl p-8"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true); setMessage("");
            const result = await adminLogin({ data: { code } }).catch(() => ({ ok: false, message: "Impossible de joindre le serveur." }));
            setBusy(false); setCode("");
            if (result.ok) await refresh(); else setMessage(result.message);
          }}
        >
          <p className="eyebrow">Accès réservé</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Panneau du gardien</h1>
          <label htmlFor="admin-code" className="mt-6 block text-sm text-muted-foreground">Code d’accès</label>
          <input id="admin-code" type="password" inputMode="numeric" autoComplete="current-password" value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 h-12 w-full rounded-full border border-border bg-background/70 px-5 text-lg tracking-[.4em] focus-visible:outline-2 focus-visible:outline-seasonal" />
          <button type="submit" disabled={busy || !code} className="ember-button mt-5 h-12 w-full rounded-full bg-seasonal font-semibold text-seasonal-foreground disabled:opacity-50">{busy ? "Vérification…" : "Entrer"}</button>
          <p role="alert" className="mt-4 min-h-5 text-sm text-destructive">{message}</p>
        </form>
      </main>
    );
  }

  const status = data.status;
  const last = status?.checks.at(-1);
  const running = data.runs.find((run) => run.status !== "completed");
  return (
    <main className="min-h-screen bg-background px-4 py-8 font-body text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow"><span className="admin-live-dot" aria-hidden="true" /> En direct · actualisé {ago(data.fetchedAt, now)}</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Panneau du gardien</h1>
          </div>
          <div className="flex gap-2">
            {data.journalUrl && <a href={data.journalUrl} target="_blank" rel="noopener noreferrer" className="glass rounded-full px-4 py-2 text-sm">Journal sur GitHub</a>}
            <button type="button" onClick={async () => { await adminLogout(); setData({ authorized: false }); }} className="glass rounded-full px-4 py-2 text-sm">Se déconnecter</button>
          </div>
        </header>
        {data.error && <p className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{data.error}</p>}

        <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Statut en direct">
          <div className="glass rounded-3xl p-6 md:col-span-2">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Ce que fait le gardien</h2>
            <p className="mt-3 font-display text-2xl font-bold">{running ? "🛡️ En plein passage" : status?.activity ?? "En attente du premier passage"}</p>
            {running && <p className="mt-1 text-muted-foreground">{status?.activity}</p>}
            <p className="mt-2 text-sm text-muted-foreground">Site surveillé : {status?.site ?? "—"} · dernière mise à jour {ago(status?.updated, now)}</p>
            <div className="mt-5 flex h-16 items-end gap-1.5" aria-label="Dix dernières vérifications">
              {(status?.checks ?? []).map((check, i) => (
                <span key={i} title={`${when(check.at)} · ${check.status ?? "?"} · ${check.ms ?? "?"} ms`} className={`admin-bar ${check.ok ? "is-ok" : "is-ko"}`} style={{ height: `${Math.min(100, 20 + (check.ms ?? 3000) / 40)}%` }} />
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Site en ligne</h2>
            <p className="mt-3 font-display text-2xl font-bold">{last ? (last.ok ? "✅ En ligne" : "❌ Problème") : "—"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{last ? `${last.status ?? "pas de réponse"} · ${last.ms ?? "?"} ms · ${ago(last.at, now)}` : "Aucune vérification encore"}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {Object.entries(last?.headers ?? {}).map(([name, present]) => <li key={name}>{present ? "🔒" : "⚠️"} {name}</li>)}
            </ul>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section aria-label="Pensées et décisions du gardien">
            <h2 className="font-display text-2xl font-bold">Pensées et décisions</h2>
            {data.entries.length === 0 && <p className="mt-4 text-muted-foreground">Le gardien n’a pas encore fait d’analyse complète. Elle a lieu chaque heure, ou tout de suite en cas d’incident.</p>}
            <ol className="mt-4 space-y-4">{data.entries.map((entry) => <Entry key={entry.at} entry={entry} />)}</ol>
          </section>
          <aside className="space-y-6">
            <section className="glass rounded-3xl p-6" aria-label="Derniers passages">
              <h2 className="font-display text-xl font-bold">Derniers passages</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.runs.map((run) => (
                  <li key={run.url}><a href={run.url} target="_blank" rel="noopener noreferrer" className="hover:text-seasonal">{run.status !== "completed" ? "⏳ en cours" : run.conclusion === "success" ? "✅ terminé" : "❌ échec"} · {when(run.createdAt)}</a></li>
                ))}
                {data.runs.length === 0 && <li className="text-muted-foreground">Aucun passage pour l’instant.</li>}
              </ul>
            </section>
            <section className="glass rounded-3xl p-6" aria-label="Corrections publiées">
              <h2 className="font-display text-xl font-bold">Corrections publiées</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.fixes.map((fix) => <li key={fix.sha}><a href={fix.url} target="_blank" rel="noopener noreferrer" className="hover:text-seasonal"><code className="text-seasonal">{fix.sha}</code> {fix.message.replace(/^gardien:\s*/, "")}</a><br /><span className="text-muted-foreground">{when(fix.date)}</span></li>)}
                {data.fixes.length === 0 && <li className="text-muted-foreground">Aucune correction pour l’instant.</li>}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Entry({ entry }: { entry: GuardianEntry }) {
  return (
    <li className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong>{entry.reason.startsWith("incident") ? "🚨" : "🛡️"} {when(entry.at)}</strong>
        <span className="text-sm text-muted-foreground">{entry.reason}</span>
      </div>
      <p className="mt-3 flex flex-wrap gap-2 text-xs">
        {entry.results.map((result) => <span key={result.command} className={`rounded-full px-2.5 py-1 ${result.ok ? "bg-whatsapp/20" : "bg-destructive/25"}`}>{result.ok ? "✅" : "❌"} {result.command.replace(/^npx |^bun /, "")}</span>)}
      </p>
      {entry.pensee && <blockquote className="mt-4 border-l-2 border-seasonal pl-4 italic leading-7 text-foreground/90">{entry.pensee}</blockquote>}
      {entry.constats.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{entry.constats.map((item, i) => <li key={i}>{item}</li>)}</ul>}
      {entry.correction && (
        <div className="mt-4 text-sm">
          <p>Correction dans <code className="text-seasonal">{entry.correction.fichier}</code> : {entry.correction.raison}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <pre className="overflow-x-auto rounded-xl bg-destructive/10 p-3 text-xs whitespace-pre-wrap">{entry.correction.chercher}</pre>
            <pre className="overflow-x-auto rounded-xl bg-whatsapp/10 p-3 text-xs whitespace-pre-wrap">{entry.correction.remplacer}</pre>
          </div>
        </div>
      )}
      {entry.relecture && <p className="mt-3 text-sm"><strong>Relecture :</strong> {entry.relecture}</p>}
      <p className="mt-3 text-sm"><strong>Décision :</strong> {entry.decision}</p>
    </li>
  );
}
