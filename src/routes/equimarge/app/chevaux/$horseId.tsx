import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { ExpenseForm, HorseForm } from "@/components/equimarge/forms";
import { MonthPicker } from "@/components/equimarge/MonthPicker";
import {
  ConfirmDelete,
  EmptyState,
  Explain,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { activeHorses, horseCosts } from "@/lib/equimarge/calc";
import { expenseCategories, horseTypes } from "@/lib/equimarge/catalog";
import { dateLabel, euros, eurosRound, monthLabel } from "@/lib/equimarge/format";
import type { Expense } from "@/lib/equimarge/types";

export const Route = createFileRoute("/equimarge/app/chevaux/$horseId")({
  component: HorsePage,
});

function HorsePage() {
  const { horseId } = Route.useParams();
  const { workspace, month, deleteHorse } = useReadyWorkspace();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [expenseForm, setExpenseForm] = useState<{ expense?: Expense } | null>(null);

  const horse = workspace.horses.find((h) => h.id === horseId);
  const cost = useMemo(
    () => horseCosts(workspace, month).find((c) => c.horse.id === horseId),
    [workspace, month, horseId],
  );
  const headcount = activeHorses(workspace.horses, month).length;
  const expenses = workspace.expenses
    .filter((e) => e.horseId === horseId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!horse)
    return (
      <EmptyState title="Ce cheval n'existe plus">
        <Link to="/equimarge/app/chevaux" className="font-semibold text-primary">
          Retour à la liste
        </Link>
      </EmptyState>
    );

  let sentence: string | null = null;
  let tone: "good" | "bad" | "info" = "info";
  if (cost && horse.type === "pension") {
    const diff = horse.monthlyPrice - cost.averageTotal;
    tone = diff >= 0 ? "good" : "bad";
    sentence =
      diff >= 0
        ? `La pension de ${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois, vous la facturez ${eurosRound(horse.monthlyPrice)} : vous gagnez ${eurosRound(diff)} chaque mois.`
        : `La pension de ${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois, vous la facturez ${eurosRound(horse.monthlyPrice)} : vous perdez ${eurosRound(-diff)} chaque mois.`;
  } else if (cost && horse.type === "club") {
    const diff = cost.averageIncome - cost.averageTotal;
    tone = diff >= 0 ? "good" : "bad";
    sentence =
      diff >= 0
        ? `${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois et rapporte environ ${eurosRound(cost.averageIncome)} en cours : il vous laisse ${eurosRound(diff)} chaque mois.`
        : `${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois et rapporte environ ${eurosRound(cost.averageIncome)} en cours : il vous manque ${eurosRound(-diff)} chaque mois.`;
  } else if (cost) {
    sentence = `${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois en moyenne. C'est le prix de votre passion !`;
  }

  return (
    <>
      <Link
        to="/equimarge/app/chevaux"
        className="mb-3 inline-flex min-h-10 items-center gap-1 font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Mes chevaux
      </Link>
      <PageHeader
        title={horse.name}
        intro={`${horseTypes[horse.type].label} · arrivé le ${dateLabel(horse.arrivalDate)}${horse.departureDate ? ` · parti le ${dateLabel(horse.departureDate)}` : ""}`}
        action={
          <>
            <MonthPicker />
            <Button
              variant="outline"
              className="h-12 rounded-full px-5"
              onClick={() => setEditing(true)}
            >
              <Pencil /> Modifier
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        {sentence && <Explain tone={tone}>{sentence}</Explain>}

        {cost ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label={`Coût réel en ${monthLabel(month, false)}`}
              value={eurosRound(cost.total)}
              sentence={`Moyenne sur 3 mois : ${eurosRound(cost.averageTotal)}.`}
            />
            <StatCard
              label="Part des dépenses communes"
              value={eurosRound(cost.commonShare)}
              sentence={`Foin, paille, salaires… divisés entre vos ${headcount} chevaux.`}
            />
            <StatCard
              label="Ses frais propres"
              value={eurosRound(cost.specific)}
              sentence="Vétérinaire, maréchal, dentiste, compléments ce mois-ci."
            />
          </div>
        ) : (
          <Explain>
            {horse.name} n'était pas présent en {monthLabel(month)}.
          </Explain>
        )}

        <Panel
          title="Frais spécifiques"
          description="Les dépenses qui ne concernent que ce cheval."
          action={
            <Button className="h-11 rounded-full" onClick={() => setExpenseForm({})}>
              <Plus /> Ajouter
            </Button>
          }
        >
          {expenses.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun frais spécifique enregistré pour {horse.name}.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {expenses.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left"
                    onClick={() => setExpenseForm({ expense: e })}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{e.label}</span>
                      <span className="block text-sm text-muted-foreground">
                        {expenseCategories[e.category].label} · {dateLabel(e.date)}
                        {e.recurrence === "mensuelle" && " · chaque mois"}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">{euros(e.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {horse.notes && (
          <Panel title="Notes">
            <p className="whitespace-pre-line">{horse.notes}</p>
          </Panel>
        )}

        <div className="flex justify-end">
          <ConfirmDelete
            what={`${horse.name} et ses frais`}
            label="Supprimer ce cheval"
            onConfirm={async () => {
              await deleteHorse(horse.id);
              await navigate({ to: "/equimarge/app/chevaux" });
            }}
          />
        </div>
      </div>

      {editing && <HorseForm open onOpenChange={setEditing} horse={horse} />}
      {expenseForm && (
        <ExpenseForm
          open
          onOpenChange={(o) => !o && setExpenseForm(null)}
          expense={expenseForm.expense}
          horseId={horse.id}
        />
      )}
    </>
  );
}
