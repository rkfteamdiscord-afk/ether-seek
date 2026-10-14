import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  ChevronRight,
  CircleAlert,
  Coins,
  Receipt,
  Scale,
} from "lucide-react";

import { HorseSilhouette } from "@/components/equimarge/Illustrations";
import { MonthPicker } from "@/components/equimarge/MonthPicker";
import { MonthlyChart } from "@/components/equimarge/MonthlyChart";
import {
  EmptyState,
  Explain,
  HealthBadge,
  HealthLight,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import {
  activityResults,
  alertsFor,
  horseCosts,
  monthlyHistory,
  monthSummary,
} from "@/lib/equimarge/calc";
import { horseTypes } from "@/lib/equimarge/catalog";
import { eurosRound, monthLabel } from "@/lib/equimarge/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { workspace, month } = useReadyWorkspace();
  const summary = useMemo(() => monthSummary(workspace, month), [workspace, month]);
  const alerts = useMemo(() => alertsFor(workspace, month), [workspace, month]);
  const results = useMemo(() => activityResults(workspace, month), [workspace, month]);
  const costs = useMemo(
    () => horseCosts(workspace, month).sort((a, b) => b.total - a.total),
    [workspace, month],
  );
  const history = useMemo(() => monthlyHistory(workspace, month, 6), [workspace, month]);

  const empty = workspace.horses.length === 0 && workspace.expenses.length === 0;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        intro={`Les chiffres de ${workspace.structure.name} pour ${monthLabel(month)}.`}
        action={<MonthPicker />}
      />

      {empty ? (
        <EmptyState title="Votre tableau de bord vous attend">
          <p>
            Commencez par ajouter vos chevaux, puis vos dépenses du mois : les calculs se font tout
            seuls.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              to="/equimarge/app/chevaux"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground"
            >
              Ajouter mes chevaux <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/equimarge/app/depenses"
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 font-semibold"
            >
              Saisir une dépense
            </Link>
          </div>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Health */}
          <section
            className={cn(
              "rounded-2xl border p-5",
              summary.health === "vert" && "border-[var(--em-good)]/25 bg-[var(--em-good-soft)]",
              summary.health === "orange" && "border-[var(--em-warn)]/30 bg-[var(--em-warn-soft)]",
              summary.health === "rouge" && "border-[var(--em-bad)]/25 bg-[var(--em-bad-soft)]",
            )}
            aria-labelledby="health-title"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="health-title" className="text-xl font-semibold">
                Santé financière
              </h2>
              <HealthBadge level={summary.health} />
              <HealthLight level={summary.health} />
            </div>
            <p className="mt-2 text-lg leading-snug">{summary.healthSentence}</p>
          </section>

          {/* Key figures */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Coût moyen d'un cheval"
              icon={<HorseSilhouette className="h-5 w-6" />}
              value={eurosRound(summary.averageHorseCost)}
              sentence={
                summary.horseCount
                  ? `Chaque cheval vous coûte en moyenne ${eurosRound(summary.averageHorseCost)} par mois, tout compris.`
                  : "Ajoutez vos chevaux pour calculer leur coût."
              }
            />
            <StatCard
              label="Recettes du mois"
              icon={<Coins className="h-5 w-5" />}
              value={eurosRound(summary.revenue)}
              sentence="Pensions, cours, stages, balades et autres."
            />
            <StatCard
              label="Dépenses du mois"
              icon={<Receipt className="h-5 w-5" />}
              value={eurosRound(summary.expenses)}
              sentence={`Pour ${summary.horseCount} cheva${summary.horseCount > 1 ? "ux" : "l"} présents.`}
            />
            <StatCard
              label="Ce qu'il vous reste"
              icon={<Scale className="h-5 w-5" />}
              value={eurosRound(summary.margin)}
              tone={summary.margin >= 0 ? "good" : "bad"}
              sentence={
                summary.margin >= 0
                  ? `Soit ${eurosRound(summary.margin * 12)} sur un an à ce rythme.`
                  : `Soit ${eurosRound(-summary.margin * 12)} de perte sur un an à ce rythme.`
              }
            />
          </div>

          {/* Alerts */}
          <Panel
            title={
              <span className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-[var(--em-brown)]" /> Alertes
              </span>
            }
            description={
              alerts.length
                ? `${alerts.length} point${alerts.length > 1 ? "s" : ""} à regarder ce mois-ci.`
                : undefined
            }
          >
            {alerts.length === 0 ? (
              <Explain tone="good">
                Aucune alerte ce mois-ci : vos pensions couvrent leurs frais et vos dépenses sont
                stables.
              </Explain>
            ) : (
              <ul className="flex flex-col gap-3">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={cn(
                      "flex gap-3 rounded-xl border p-4",
                      alert.level === "rouge"
                        ? "border-[var(--em-bad)]/25 bg-[var(--em-bad-soft)]"
                        : "border-[var(--em-warn)]/30 bg-[var(--em-warn-soft)]",
                    )}
                  >
                    {alert.level === "rouge" ? (
                      <AlertTriangle
                        className="mt-0.5 h-5 w-5 shrink-0 text-[var(--em-bad)]"
                        aria-label="Important"
                      />
                    ) : (
                      <CircleAlert
                        className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.5_0.12_60)]"
                        aria-label="À surveiller"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-0.5 leading-snug">{alert.message}</p>
                      {alert.horseId && (
                        <Link
                          to="/equimarge/app/chevaux/$horseId"
                          params={{ horseId: alert.horseId }}
                          className="mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-primary"
                        >
                          Voir la fiche <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Activities */}
            <Panel
              title="Résultat par activité"
              description="Ce que chaque activité rapporte, moins ce qu'elle coûte."
            >
              <ul className="flex flex-col divide-y divide-border">
                {results.map((r) => (
                  <li key={r.key} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-semibold">{r.label}</span>
                      <span
                        className={cn(
                          "font-serif-em text-xl font-semibold tabular-nums",
                          r.margin >= 0 ? "text-[var(--em-good)]" : "text-[var(--em-bad)]",
                        )}
                      >
                        {r.margin >= 0 ? "+" : "−"}
                        {eurosRound(Math.abs(r.margin))}
                      </span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span>
                        Revenus :{" "}
                        <span className="tabular-nums text-foreground">
                          {eurosRound(r.revenue)}
                        </span>
                      </span>
                      <span>
                        Coûts :{" "}
                        <span className="tabular-nums text-foreground">{eurosRound(r.cost)}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-[0.95rem] leading-snug text-muted-foreground">
                      {r.sentence}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Les chevaux de club sont rattachés aux cours, stages et balades ; les chevaux en
                pension aux pensions ; les chevaux de propriétaire à la compétition.
              </p>
            </Panel>

            {/* History */}
            <Panel
              title="Évolution sur 6 mois"
              description="Vos recettes et vos dépenses, mois par mois."
            >
              <MonthlyChart data={history} />
            </Panel>
          </div>

          {/* Horse costs */}
          <Panel
            title="Coût réel de chaque cheval"
            description="Sa part des dépenses communes, plus ses propres frais (vétérinaire, maréchal…)."
            action={
              <Link
                to="/equimarge/app/chevaux"
                className="hidden min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-primary hover:bg-secondary sm:inline-flex"
              >
                Tous les chevaux <ChevronRight className="h-4 w-4" />
              </Link>
            }
          >
            {costs.length === 0 ? (
              <p className="text-muted-foreground">Aucun cheval présent ce mois-ci.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {costs.map((c) => {
                  const losing = c.horse.type !== "proprietaire" && c.income < c.total;
                  return (
                    <li key={c.horse.id}>
                      <Link
                        to="/equimarge/app/chevaux/$horseId"
                        params={{ horseId: c.horse.id }}
                        className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 hover:border-primary/40"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{c.horse.name}</span>
                          <span className="block text-sm text-muted-foreground">
                            {horseTypes[c.horse.type].short}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-semibold tabular-nums">
                            {eurosRound(c.total)}
                          </span>
                          {c.horse.type !== "proprietaire" && (
                            <span
                              className={cn(
                                "block text-sm tabular-nums",
                                losing ? "text-[var(--em-bad)]" : "text-[var(--em-good)]",
                              )}
                            >
                              rapporte {eurosRound(c.income)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
