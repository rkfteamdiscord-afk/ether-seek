import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Repeat } from "lucide-react";

import { ExpenseForm } from "@/components/equimarge/forms";
import { MonthPicker } from "@/components/equimarge/MonthPicker";
import { EmptyState, Explain, PageHeader, Panel } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { activeHorses, addMonths, amountInMonth, expensesByCategory } from "@/lib/equimarge/calc";
import { expenseCategories, expenseCategoryOrder } from "@/lib/equimarge/catalog";
import { dateLabel, euros, eurosRound, monthLabel } from "@/lib/equimarge/format";
import type { Expense } from "@/lib/equimarge/types";

export const Route = createFileRoute("/equimarge/app/depenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { workspace, month } = useReadyWorkspace();
  const [form, setForm] = useState<{ expense?: Expense } | null>(null);

  const entries = useMemo(
    () =>
      workspace.expenses
        .filter((e) => amountInMonth(e, month) > 0)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [workspace, month],
  );
  const byCategory = useMemo(
    () => expensesByCategory(workspace.expenses, month),
    [workspace, month],
  );
  const previous = useMemo(
    () => expensesByCategory(workspace.expenses, addMonths(month, -1)),
    [workspace, month],
  );
  const total = entries.reduce((t, e) => t + amountInMonth(e, month), 0);
  const common = entries.filter((e) => !e.horseId).reduce((t, e) => t + amountInMonth(e, month), 0);
  const horseCount = activeHorses(workspace.horses, month).length;
  const horseName = (id: string | null) => workspace.horses.find((h) => h.id === id)?.name;
  const categories = expenseCategoryOrder
    .filter((c) => byCategory[c] > 0)
    .sort((a, b) => byCategory[b] - byCategory[a]);
  const max = Math.max(1, ...categories.map((c) => byCategory[c]));

  return (
    <>
      <PageHeader
        title="Dépenses"
        intro="Saisissez vos factures au fil du mois. Les dépenses communes sont réparties automatiquement entre vos chevaux."
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

      {entries.length === 0 ? (
        <EmptyState title={`Aucune dépense en ${monthLabel(month)}`}>
          <p>Commencez par les plus grosses : foin, paille, salaires, loyer ou crédit.</p>
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Panel
            title={`Total : ${eurosRound(total)}`}
            description={`Par catégorie, en ${monthLabel(month)}.`}
          >
            {horseCount > 0 && (
              <Explain>
                Vos {eurosRound(common)} de dépenses communes représentent{" "}
                {eurosRound(common / horseCount)} par cheval pour vos {horseCount} chevaux.
              </Explain>
            )}
            <ul className="mt-4 flex flex-col gap-3">
              {categories.map((c) => {
                const before = previous[c];
                const change = before > 0 ? ((byCategory[c] - before) / before) * 100 : null;
                return (
                  <li key={c}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{expenseCategories[c].label}</span>
                      <span className="font-semibold tabular-nums">
                        {eurosRound(byCategory[c])}
                      </span>
                    </div>
                    <div className="mt-1 h-2.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[var(--em-expense)]"
                        style={{ width: `${(byCategory[c] / max) * 100}%` }}
                      />
                    </div>
                    {change !== null && Math.abs(change) >= 10 && (
                      <p
                        className={`mt-0.5 text-sm ${change > 0 ? "text-[var(--em-bad)]" : "text-[var(--em-good)]"}`}
                      >
                        {change > 0 ? "+" : "−"}
                        {Math.round(Math.abs(change))} % par rapport au mois précédent
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            title="Détail du mois"
            description="Touchez une ligne pour la modifier ou la supprimer."
          >
            <ul className="divide-y divide-border">
              {entries.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className="flex min-h-16 w-full items-center justify-between gap-3 py-2 text-left"
                    onClick={() => setForm({ expense: e })}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{e.label}</span>
                      <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                        {expenseCategories[e.category].label}
                        <span aria-hidden="true">·</span>
                        {e.horseId
                          ? `Pour ${horseName(e.horseId) ?? "un cheval"}`
                          : "Toute l'écurie"}
                        <span aria-hidden="true">·</span>
                        {e.recurrence === "mensuelle" ? (
                          <span className="inline-flex items-center gap-1">
                            <Repeat className="h-3.5 w-3.5" aria-hidden="true" /> chaque mois
                          </span>
                        ) : (
                          dateLabel(e.date)
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{euros(e.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {form && (
        <ExpenseForm open onOpenChange={(o) => !o && setForm(null)} expense={form.expense} />
      )}
    </>
  );
}
