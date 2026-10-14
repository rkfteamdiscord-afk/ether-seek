import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Repeat } from "lucide-react";

import { RevenueForm } from "@/components/equimarge/forms";
import { MonthPicker } from "@/components/equimarge/MonthPicker";
import { EmptyState, PageHeader, Panel } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { activeHorses, amountInMonth, revenueByActivity } from "@/lib/equimarge/calc";
import { activities, lessonFormats } from "@/lib/equimarge/catalog";
import { dateLabel, euros, eurosRound, monthLabel } from "@/lib/equimarge/format";
import type { ActivityKey, Revenue } from "@/lib/equimarge/types";

export const Route = createFileRoute("/equimarge/app/revenus")({
  component: RevenuesPage,
});

function RevenuesPage() {
  const { workspace, month } = useReadyWorkspace();
  const [form, setForm] = useState<{ revenue?: Revenue } | null>(null);

  const totals = useMemo(() => revenueByActivity(workspace, month), [workspace, month]);
  const pensions = activeHorses(workspace.horses, month)
    .filter((h) => h.type === "pension")
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const entries = workspace.revenues
    .filter((r) => amountInMonth(r, month) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = Object.values(totals).reduce((t, v) => t + v, 0);
  const shown = (Object.keys(totals) as ActivityKey[]).filter((k) => totals[k] > 0);

  return (
    <>
      <PageHeader
        title="Revenus"
        intro="Pensions, cours, stages, balades : tout ce que vous encaissez."
        action={
          <>
            <MonthPicker />
            <Button
              className="h-12 rounded-full px-5 text-base font-semibold"
              onClick={() => setForm({})}
            >
              <Plus /> Ajouter
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        <Panel
          title={`Total : ${eurosRound(total)}`}
          description={`Encaissé en ${monthLabel(month)}, par activité.`}
        >
          {shown.length === 0 ? (
            <p className="text-muted-foreground">Aucune recette ce mois-ci.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {shown.map((k) => (
                <li key={k} className="rounded-xl bg-secondary/70 p-3">
                  <span className="block text-sm text-muted-foreground">{activities[k].label}</span>
                  <span className="block font-serif-em text-xl font-semibold tabular-nums">
                    {eurosRound(totals[k])}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel
            title="Pensions"
            description="Calculées à partir du prix de chaque cheval en pension. Pour changer un prix, ouvrez la fiche du cheval."
          >
            {pensions.length === 0 ? (
              <p className="text-muted-foreground">Aucun cheval en pension ce mois-ci.</p>
            ) : (
              <ul className="divide-y divide-border">
                {pensions.map((h) => (
                  <li key={h.id}>
                    <Link
                      to="/equimarge/app/chevaux/$horseId"
                      params={{ horseId: h.id }}
                      className="flex min-h-14 items-center justify-between gap-3 py-2"
                    >
                      <span className="font-semibold">{h.name}</span>
                      <span className="flex items-center gap-1 font-semibold tabular-nums">
                        {euros(h.monthlyPrice)}{" "}
                        <span className="text-sm font-normal text-muted-foreground">/mois</span>
                        <ChevronRight
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Cours, stages, balades et autres"
            description="Touchez une ligne pour la modifier ou la supprimer."
          >
            {entries.length === 0 ? (
              <EmptyState title="Rien de saisi ce mois-ci">
                <p>Ajoutez vos forfaits, cartes de cours, stages ou balades.</p>
              </EmptyState>
            ) : (
              <ul className="divide-y divide-border">
                {entries.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="flex min-h-16 w-full items-center justify-between gap-3 py-2 text-left"
                      onClick={() => setForm({ revenue: r })}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{r.label}</span>
                        <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                          {r.kind === "cours" && r.lessonFormat
                            ? lessonFormats[r.lessonFormat]
                            : activities[r.kind].label}
                          <span aria-hidden="true">·</span>
                          {r.recurrence === "mensuelle" ? (
                            <span className="inline-flex items-center gap-1">
                              <Repeat className="h-3.5 w-3.5" aria-hidden="true" /> chaque mois
                            </span>
                          ) : (
                            dateLabel(r.date)
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{euros(r.amount)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {form && (
        <RevenueForm open onOpenChange={(o) => !o && setForm(null)} revenue={form.revenue} />
      )}
    </>
  );
}
