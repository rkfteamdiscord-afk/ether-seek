import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { MonthPicker } from "@/components/equimarge/MonthPicker";
import { HealthBadge, PageHeader, Panel } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { activityResults, monthSummary, recommendations } from "@/lib/equimarge/calc";
import { eurosRound, monthLabel } from "@/lib/equimarge/format";

export const Route = createFileRoute("/equimarge/app/rapport")({
  component: ReportPage,
});

function ReportPage() {
  const { workspace, month } = useReadyWorkspace();
  const [busy, setBusy] = useState(false);
  const summary = useMemo(() => monthSummary(workspace, month), [workspace, month]);
  const results = useMemo(() => activityResults(workspace, month), [workspace, month]);
  const tips = useMemo(() => recommendations(workspace, month), [workspace, month]);

  async function download() {
    setBusy(true);
    try {
      const { downloadMonthlyReport } = await import("@/lib/equimarge/report-pdf");
      await downloadMonthlyReport(workspace, month);
      toast.success("Votre rapport PDF est téléchargé.");
    } catch {
      toast.error("Le PDF n'a pas pu être créé. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Rapport mensuel"
        intro="Un résumé simple de votre mois, à télécharger, imprimer ou envoyer à votre comptable."
        action={
          <>
            <MonthPicker />
            <Button
              className="h-12 rounded-full px-5 text-base font-semibold"
              onClick={() => void download()}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Download />}
              Télécharger le PDF
            </Button>
          </>
        }
      />

      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <header className="border-b border-border pb-4">
          <p className="text-sm font-semibold text-primary">EquiMarge</p>
          <h2 className="text-2xl font-semibold">{workspace.structure.name}</h2>
          <p className="capitalize text-muted-foreground">Rapport de {monthLabel(month)}</p>
        </header>

        <section className="mt-5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Santé financière</h3>
            <HealthBadge level={summary.health} />
          </div>
          <p className="mt-2">{summary.healthSentence}</p>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold">Les chiffres clés</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Recettes", eurosRound(summary.revenue)],
              ["Dépenses", eurosRound(summary.expenses)],
              ["Résultat", eurosRound(summary.margin)],
              ["Coût moyen d'un cheval", eurosRound(summary.averageHorseCost)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-secondary/70 p-3">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-serif-em text-xl font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-semibold">Résultat par activité</h3>
          <ul className="mt-2 divide-y divide-border">
            {results.map((r) => (
              <li key={r.key} className="flex justify-between gap-3 py-2">
                <span>{r.label}</span>
                <span
                  className={`font-semibold tabular-nums ${r.margin >= 0 ? "text-[var(--em-good)]" : "text-[var(--em-bad)]"}`}
                >
                  {r.margin >= 0 ? "+" : "−"}
                  {eurosRound(Math.abs(r.margin))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <Panel title="3 recommandations" className="mt-6 bg-[var(--em-sage-soft)]">
          <ol className="flex flex-col gap-3">
            {tips.map((tip, i) => (
              <li key={tip} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="leading-snug">{tip}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </article>
    </>
  );
}
