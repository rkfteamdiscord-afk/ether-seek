import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/equimarge/Illustrations";
import { useWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Field } from "@/components/equimarge/ui";
import { Button } from "@/components/ui/button";
import {
  activities,
  expenseCategories,
  onboardingActivities,
  offer,
} from "@/lib/equimarge/catalog";
import { buildDemoData, demoStructureDefaults, newId, trialEnd } from "@/lib/equimarge/demo";
import { getStore } from "@/lib/equimarge/store";
import type { ActivityKey, ExpenseCategory, Structure } from "@/lib/equimarge/types";
import { cn } from "@/lib/utils";

const expenseChoices: ExpenseCategory[] = [
  "foin",
  "paille",
  "granules",
  "veterinaire",
  "marechal",
  "salaires",
  "electricite",
  "eau",
  "assurance",
  "entretien",
  "materiel",
  "loyer",
];

function Chips<T extends string>({
  options,
  selected,
  onToggle,
  labelFor,
}: {
  options: T[];
  selected: T[];
  onToggle: (value: T) => void;
  labelFor: (value: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(option)}
            className={cn(
              "inline-flex min-h-12 items-center gap-2 rounded-full border px-4 font-semibold transition-colors",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50",
            )}
          >
            {on && <Check className="h-4 w-4" aria-hidden="true" />}
            {labelFor(option)}
          </button>
        );
      })}
    </div>
  );
}

export function Onboarding() {
  const { reload } = useWorkspace();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [horseCount, setHorseCount] = useState("15");
  const [chosenActivities, setActivities] = useState<ActivityKey[]>(["cours", "pensions"]);
  const [mainExpenses, setMainExpenses] = useState<ExpenseCategory[]>([
    "foin",
    "paille",
    "marechal",
    "salaires",
  ]);
  const [withDemo, setWithDemo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const steps = ["Votre structure", "Vos chevaux", "Vos activités", "Vos dépenses"];

  function next(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (step === 0 && name.trim().length < 2) {
      setError("Indiquez le nom de votre structure, par exemple « Écurie du Moulin ».");
      return;
    }
    const count = Number(horseCount);
    if (step === 1 && (!Number.isInteger(count) || count < 0 || count > 500)) {
      setError("Indiquez un nombre de chevaux entre 0 et 500.");
      return;
    }
    if (step === 2 && chosenActivities.length === 0) {
      setError("Choisissez au moins une activité.");
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    void finish();
  }

  async function finish() {
    setBusy(true);
    try {
      const store = getStore();
      const structure: Structure = {
        id: newId(),
        name: name.trim(),
        declaredHorseCount: Number(horseCount),
        activities: chosenActivities,
        mainExpenses,
        lessonsPerWeek: chosenActivities.includes("cours")
          ? demoStructureDefaults().lessonsPerWeek
          : 0,
        plan: "essai",
        trialEndsAt: trialEnd(new Date(), offer.trialDays),
        isDemo: withDemo,
        onboarded: true,
        createdAt: new Date().toISOString(),
      };
      // Keep any structure row created by an interrupted onboarding.
      const existing = await store.load();
      if (existing) structure.id = existing.structure.id;
      await store.saveStructure(structure);
      await store.replaceData(
        withDemo ? buildDemoData() : { horses: [], expenses: [], revenues: [] },
      );
      await reload();
      toast.success(
        withDemo ? "Bienvenue ! Voici le centre d'exemple." : "Bienvenue sur EquiMarge !",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-6">
      <Logo />
      <div className="mt-8" aria-hidden="true">
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn("h-2 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-muted-foreground">
        Étape {step + 1} sur {steps.length} · {steps[step]}
      </p>

      <form onSubmit={next} className="mt-4 flex flex-1 flex-col">
        {step === 0 && (
          <>
            <h1 className="text-3xl font-semibold">
              Bienvenue ! Comment s'appelle votre structure ?
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ce nom apparaîtra sur vos rapports mensuels.
            </p>
            <div className="mt-6">
              <Field label="Nom de la structure" htmlFor="structure-name">
                <input
                  id="structure-name"
                  className="em-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Écurie du Moulin"
                  autoFocus
                  autoComplete="organization"
                />
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-3xl font-semibold">Combien de chevaux avez-vous ?</h1>
            <p className="mt-2 text-muted-foreground">
              Tous confondus : chevaux de club, en pension et chevaux de propriétaire. Un ordre
              d'idée suffit.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-14 w-14 rounded-full text-2xl"
                aria-label="Un cheval de moins"
                onClick={() => setHorseCount(String(Math.max(0, Number(horseCount || 0) - 1)))}
              >
                −
              </Button>
              <input
                aria-label="Nombre de chevaux"
                className="em-input h-14 max-w-32 text-center text-2xl font-semibold"
                inputMode="numeric"
                value={horseCount}
                onChange={(e) => setHorseCount(e.target.value.replace(/\D/g, ""))}
              />
              <Button
                type="button"
                variant="outline"
                className="h-14 w-14 rounded-full text-2xl"
                aria-label="Un cheval de plus"
                onClick={() => setHorseCount(String(Number(horseCount || 0) + 1))}
              >
                +
              </Button>
            </div>
            {Number(horseCount) > offer.essentielHorseLimit && (
              <p className="mt-4 text-[0.95rem] text-muted-foreground">
                Au-delà de {offer.essentielHorseLimit} chevaux, l'offre Pro sera la plus adaptée.
                Pendant l'essai, tout est débloqué.
              </p>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-semibold">Quelles activités proposez-vous ?</h1>
            <p className="mt-2 text-muted-foreground">
              Touchez pour sélectionner, plusieurs choix possibles.
            </p>
            <div className="mt-6">
              <Chips
                options={onboardingActivities}
                selected={chosenActivities}
                onToggle={(v) => setActivities(toggle(chosenActivities, v))}
                labelFor={(v) => activities[v].label}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-semibold">Quelles sont vos principales dépenses ?</h1>
            <p className="mt-2 text-muted-foreground">
              Nous les mettrons en avant lors de la saisie.
            </p>
            <div className="mt-6">
              <Chips
                options={expenseChoices}
                selected={mainExpenses}
                onToggle={(v) => setMainExpenses(toggle(mainExpenses, v))}
                labelFor={(v) => expenseCategories[v].label}
              />
            </div>
            <fieldset className="mt-8 rounded-2xl border border-border bg-card p-4">
              <legend className="px-1 font-semibold">Pour bien démarrer</legend>
              <label className="flex cursor-pointer gap-3 py-2">
                <input
                  type="radio"
                  name="start"
                  className="mt-1 h-5 w-5 accent-[var(--primary)]"
                  checked={withDemo}
                  onChange={() => setWithDemo(true)}
                />
                <span>
                  <span className="block font-semibold">
                    Voir d'abord un centre d'exemple (conseillé)
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    15 chevaux fictifs déjà saisis pour comprendre l'outil. Vous l'effacez en un
                    clic.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 py-2">
                <input
                  type="radio"
                  name="start"
                  className="mt-1 h-5 w-5 accent-[var(--primary)]"
                  checked={!withDemo}
                  onChange={() => setWithDemo(false)}
                />
                <span>
                  <span className="block font-semibold">Partir de zéro</span>
                  <span className="block text-sm text-muted-foreground">
                    Je saisis directement mes chevaux et mes chiffres.
                  </span>
                </span>
              </label>
            </fieldset>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-[var(--em-bad-soft)] px-4 py-3 text-[var(--em-bad)]"
          >
            {error}
          </p>
        )}

        <div className="mt-auto flex gap-3 pt-10">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full px-5"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft /> Retour
            </Button>
          )}
          <Button
            type="submit"
            className="h-12 flex-1 rounded-full text-base font-semibold"
            disabled={busy}
          >
            {busy && <Loader2 className="animate-spin" />}
            {step < steps.length - 1 ? (
              <>
                Continuer <ArrowRight />
              </>
            ) : (
              "Découvrir mon tableau de bord"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
