import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { HorseForm } from "@/components/equimarge/forms";
import { EmptyState, PageHeader } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { currentMonth, horseCosts, isHorsePresent } from "@/lib/equimarge/calc";
import { horseTypes, plans } from "@/lib/equimarge/catalog";
import { eurosRound } from "@/lib/equimarge/format";
import type { HorseType } from "@/lib/equimarge/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/app/chevaux/")({
  component: HorsesPage,
});

const filters: Array<{ value: HorseType | "tous"; label: string }> = [
  { value: "tous", label: "Tous" },
  { value: "club", label: "Club" },
  { value: "pension", label: "Pension" },
  { value: "proprietaire", label: "Propriétaire" },
];

function HorsesPage() {
  const { workspace, month } = useReadyWorkspace();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<HorseType | "tous">("tous");

  const costs = useMemo(
    () => new Map(horseCosts(workspace, month).map((c) => [c.horse.id, c])),
    [workspace, month],
  );
  const horses = [...workspace.horses]
    .filter((h) => filter === "tous" || h.type === filter)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const present = workspace.horses.filter((h) => isHorsePresent(h, currentMonth())).length;
  const limit = plans[workspace.structure.plan].horseLimit;

  return (
    <>
      <PageHeader
        title="Mes chevaux"
        intro={`${present} cheva${present > 1 ? "ux" : "l"} présent${present > 1 ? "s" : ""}${limit ? ` sur ${limit} inclus dans votre offre` : ""}. Touchez un cheval pour voir son coût réel.`}
        action={
          <Button
            className="h-12 rounded-full px-5 text-base font-semibold"
            onClick={() => setAdding(true)}
          >
            <Plus /> Ajouter un cheval
          </Button>
        }
      />

      <div
        className="mb-4 flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filtrer par type"
      >
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 font-semibold",
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {horses.length === 0 ? (
        <EmptyState
          title={
            workspace.horses.length ? "Aucun cheval de ce type" : "Aucun cheval pour l'instant"
          }
        >
          {!workspace.horses.length && (
            <p>Ajoutez vos chevaux un par un : nom, type et date d'arrivée suffisent.</p>
          )}
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => {
            const cost = costs.get(horse.id);
            const gone = !cost;
            return (
              <li key={horse.id}>
                <Link
                  to="/equimarge/app/chevaux/$horseId"
                  params={{ horseId: horse.id }}
                  className={cn(
                    "flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/40",
                    gone && "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif-em text-xl font-semibold",
                      horse.type === "club" && "bg-accent text-accent-foreground",
                      horse.type === "pension" &&
                        "bg-[var(--em-brown-soft)] text-[oklch(0.42_0.07_55)]",
                      horse.type === "proprietaire" && "bg-secondary text-secondary-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {horse.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-semibold">{horse.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {horseTypes[horse.type].label}
                      {horse.type === "pension" && ` · ${eurosRound(horse.monthlyPrice)}/mois`}
                    </span>
                  </span>
                  <span className="text-right">
                    {cost ? (
                      <>
                        <span className="block font-semibold tabular-nums">
                          {eurosRound(cost.total)}
                        </span>
                        <span className="block text-xs text-muted-foreground">coût du mois</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Absent ce mois</span>
                    )}
                  </span>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {adding && <HorseForm open onOpenChange={setAdding} />}
    </>
  );
}
