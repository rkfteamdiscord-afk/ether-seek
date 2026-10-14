import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Lock, Minus, Plus, RotateCcw } from "lucide-react";

import { MonthPicker } from "@/components/equimarge/MonthPicker";
import { Explain, PageHeader, Panel } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import { activeHorses, defaultHypotheses, simulate, type Hypotheses } from "@/lib/equimarge/calc";
import { horseTypes, plans } from "@/lib/equimarge/catalog";
import { eurosRound, monthLabel } from "@/lib/equimarge/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/app/simulateur")({
  component: SimulatorPage,
});

function Stepper({
  id,
  label,
  hint,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <span className="font-serif-em text-xl font-semibold tabular-nums" aria-live="polite">
          {display}
        </span>
      </div>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 shrink-0 rounded-full p-0"
          aria-label={`${label} : diminuer`}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus />
        </Button>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={display}
          className="h-11 w-full accent-[var(--primary)]"
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 shrink-0 rounded-full p-0"
          aria-label={`${label} : augmenter`}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}

const signed = (value: number, unit: string) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value)} ${unit}`;

function SimulatorPage() {
  const { workspace, month } = useReadyWorkspace();
  const [h, setH] = useState<Hypotheses>(() => defaultHypotheses(workspace));
  const result = useMemo(() => simulate(workspace, month, h), [workspace, month, h]);
  const advanced = plans[workspace.structure.plan].advancedSimulator;
  const present = activeHorses(workspace.horses, month).sort((a, b) =>
    a.name.localeCompare(b.name, "fr"),
  );
  const set = (patch: Partial<Hypotheses>) => setH((prev) => ({ ...prev, ...patch }));
  const baseLessons = workspace.structure.lessonsPerWeek;

  const positive = result.monthlyDelta >= 0;

  return (
    <>
      <PageHeader
        title="Simulateur"
        intro={`Et si… ? Modifiez une hypothèse, l'impact sur votre marge s'affiche tout de suite. Base : ${monthLabel(month)}.`}
        action={<MonthPicker />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          <Panel title="Vos prix et vos coûts">
            <div className="flex flex-col gap-3">
              <Stepper
                id="sim-pension"
                label="Prix de la pension"
                hint="Variation par cheval et par mois."
                value={h.pensionPriceChange}
                display={signed(h.pensionPriceChange, "€")}
                min={-100}
                max={200}
                step={5}
                onChange={(v) => set({ pensionPriceChange: v })}
              />
              <Stepper
                id="sim-hay"
                label="Prix du foin"
                value={h.hayPricePercent}
                display={signed(h.hayPricePercent, "%")}
                min={-40}
                max={60}
                step={5}
                onChange={(v) => set({ hayPricePercent: v })}
              />
              <Stepper
                id="sim-lessons"
                label="Nombre de cours par semaine"
                hint={
                  baseLessons > 0
                    ? `Aujourd'hui : ${baseLessons} cours par semaine.`
                    : "Indiquez votre nombre de cours habituel dans les paramètres pour activer ce réglage."
                }
                value={h.lessonsPerWeek}
                display={`${h.lessonsPerWeek}`}
                min={0}
                max={Math.max(20, baseLessons * 2)}
                step={1}
                onChange={(v) => set({ lessonsPerWeek: v })}
              />
            </div>
          </Panel>

          <Panel
            title={
              <span className="flex items-center gap-2">
                Arrivées et départs
                <span className="rounded-full bg-[var(--em-brown)] px-2 py-0.5 text-xs font-semibold text-white">
                  Pro
                </span>
              </span>
            }
            description="Simulez l'arrivée de nouveaux chevaux ou le départ d'un cheval."
          >
            {advanced ? (
              <div className="flex flex-col gap-3">
                <Stepper
                  id="sim-add-pension"
                  label="Nouvelles pensions"
                  value={h.addPensionHorses}
                  display={`+${h.addPensionHorses}`}
                  min={0}
                  max={15}
                  step={1}
                  onChange={(v) => set({ addPensionHorses: v })}
                />
                <Stepper
                  id="sim-add-club"
                  label="Nouveaux chevaux de club"
                  value={h.addClubHorses}
                  display={`+${h.addClubHorses}`}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(v) => set({ addClubHorses: v })}
                />
                <fieldset className="rounded-2xl border border-border bg-background/60 p-4">
                  <legend className="px-1 font-semibold">Départ d'un cheval</legend>
                  <div className="mt-1 grid gap-1 sm:grid-cols-2">
                    {present.map((horse) => {
                      const checked = h.departingHorseIds.includes(horse.id);
                      return (
                        <label
                          key={horse.id}
                          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-secondary"
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 accent-[var(--primary)]"
                            checked={checked}
                            onChange={() =>
                              set({
                                departingHorseIds: checked
                                  ? h.departingHorseIds.filter((id) => id !== horse.id)
                                  : [...h.departingHorseIds, horse.id],
                              })
                            }
                          />
                          <span>
                            {horse.name}{" "}
                            <span className="text-sm text-muted-foreground">
                              ({horseTypes[horse.type].short})
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-2xl bg-secondary/70 p-4">
                <p className="flex gap-2">
                  <Lock className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  Le simulateur avancé est inclus dans l'offre Pro ({plans.pro.pricePerMonth}{" "}
                  €/mois).
                </p>
                <Link
                  to="/equimarge/app/parametres"
                  hash="abonnement"
                  className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
                >
                  Passer à l'offre Pro
                </Link>
              </div>
            )}
          </Panel>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <section
              className={cn(
                "rounded-2xl border p-5",
                result.monthlyDelta === 0
                  ? "border-border bg-card"
                  : positive
                    ? "border-[var(--em-good)]/30 bg-[var(--em-good-soft)]"
                    : "border-[var(--em-bad)]/30 bg-[var(--em-bad-soft)]",
              )}
              aria-live="polite"
            >
              <h2 className="text-lg font-semibold">Impact sur votre marge</h2>
              <p
                className={cn(
                  "mt-1 font-serif-em text-4xl font-semibold tabular-nums",
                  result.monthlyDelta !== 0 &&
                    (positive ? "text-[var(--em-good)]" : "text-[var(--em-bad)]"),
                )}
              >
                {result.monthlyDelta > 0 ? "+" : result.monthlyDelta < 0 ? "−" : ""}
                {eurosRound(Math.abs(result.monthlyDelta))}
                <span className="text-lg font-normal text-muted-foreground"> /mois</span>
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {result.annualDelta > 0 ? "+" : result.annualDelta < 0 ? "−" : ""}
                {eurosRound(Math.abs(result.annualDelta))} sur un an
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/10 pt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Marge mensuelle</dt>
                  <dd className="font-semibold tabular-nums">
                    {eurosRound(result.baseMargin)} → {eurosRound(result.newMargin)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Marge annuelle</dt>
                  <dd className="font-semibold tabular-nums">
                    {eurosRound(result.baseAnnual)} → {eurosRound(result.newAnnual)}
                  </dd>
                </div>
              </dl>
            </section>

            {result.lines.length === 0 ? (
              <Explain>
                Bougez un réglage pour voir son effet. Exemple : augmentez la pension de 20 €.
              </Explain>
            ) : (
              <ul className="flex flex-col gap-2">
                {result.lines.map((line) => (
                  <li
                    key={line.label}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <p className="font-semibold">{line.label}</p>
                    <p className="text-[0.95rem] leading-snug text-muted-foreground">
                      {line.sentence}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="outline"
              className="h-11 rounded-full"
              onClick={() => setH(defaultHypotheses(workspace))}
            >
              <RotateCcw /> Revenir à la situation actuelle
            </Button>
            <p className="text-sm text-muted-foreground">
              Un cheval de plus ou de moins pèse environ {eurosRound(result.marginalHorseCost)} par
              mois (foin, litière, aliments, soins). Les salaires, le loyer et l'assurance ne
              changent pas.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
