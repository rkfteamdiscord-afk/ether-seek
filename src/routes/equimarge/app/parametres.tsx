import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, Download, FileSpreadsheet, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field, PageHeader, Panel } from "@/components/equimarge/ui";
import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { Button } from "@/components/ui/button";
import {
  activities,
  expenseCategories,
  offer,
  onboardingActivities,
  plans,
} from "@/lib/equimarge/catalog";
import { downloadCsv, downloadJson } from "@/lib/equimarge/export";
import type { ActivityKey, PlanKey } from "@/lib/equimarge/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equimarge/app/parametres")({
  component: SettingsPage,
});

function SettingsPage() {
  const { workspace, saveStructure, loadDemo, clearData, account, mode } = useReadyWorkspace();
  const structure = workspace.structure;
  const [name, setName] = useState(structure.name);
  const [declared, setDeclared] = useState(String(structure.declaredHorseCount));
  const [lessons, setLessons] = useState(String(structure.lessonsPerWeek));
  const [chosen, setChosen] = useState<ActivityKey[]>(structure.activities);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState<"demo" | "clear" | null>(null);

  async function saveInfo(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Indiquez le nom de votre structure.");
      return;
    }
    const lessonsValue = Number(lessons);
    if (!Number.isInteger(lessonsValue) || lessonsValue < 0) {
      toast.error("Indiquez un nombre de cours valide.");
      return;
    }
    setBusy(true);
    try {
      await saveStructure({
        ...structure,
        name: name.trim(),
        declaredHorseCount: Number(declared) || 0,
        lessonsPerWeek: lessonsValue,
        activities: chosen,
      });
      toast.success("Informations enregistrées.");
    } catch {
      /* already reported */
    } finally {
      setBusy(false);
    }
  }

  async function choosePlan(plan: PlanKey) {
    try {
      await saveStructure({ ...structure, plan });
      toast.success(`Offre ${plans[plan].label} sélectionnée.`);
    } catch {
      /* already reported */
    }
  }

  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(structure.trialEndsAt).getTime() - Date.now()) / 86_400_000),
  );
  const horseCount = workspace.horses.filter((h) => !h.departureDate).length;

  return (
    <>
      <PageHeader title="Paramètres" intro="Votre structure, votre abonnement et vos données." />
      <div className="flex flex-col gap-5">
        <Panel title="Ma structure">
          <form onSubmit={saveInfo} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nom de la structure" htmlFor="set-name">
                <input
                  id="set-name"
                  className="em-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Nombre de chevaux (environ)" htmlFor="set-horses">
              <input
                id="set-horses"
                className="em-input"
                inputMode="numeric"
                value={declared}
                onChange={(e) => setDeclared(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Field
              label="Cours par semaine"
              htmlFor="set-lessons"
              hint="Utilisé par le simulateur."
            >
              <input
                id="set-lessons"
                className="em-input"
                inputMode="numeric"
                value={lessons}
                onChange={(e) => setLessons(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <div className="sm:col-span-2">
              <p className="mb-2 font-semibold">Activités</p>
              <div className="flex flex-wrap gap-2">
                {onboardingActivities.map((a) => {
                  const on = chosen.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setChosen(on ? chosen.filter((x) => x !== a) : [...chosen, a])}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 font-semibold",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card",
                      )}
                    >
                      {on && <Check className="h-4 w-4" />}
                      {activities[a].label}
                    </button>
                  );
                })}
              </div>
              {structure.mainExpenses.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Dépenses principales :{" "}
                  {structure.mainExpenses.map((c) => expenseCategories[c].label).join(", ")}.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="h-12 rounded-full px-6 text-base font-semibold"
                disabled={busy}
              >
                {busy && <Loader2 className="animate-spin" />} Enregistrer
              </Button>
            </div>
          </form>
        </Panel>

        <Panel title="Abonnement" className="scroll-mt-20" description={undefined}>
          <div id="abonnement" className="-mt-20 pt-20" aria-hidden="true" />
          <p className="mb-4">
            {structure.plan === "essai"
              ? `Vous êtes en essai gratuit : encore ${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""}, toutes les fonctions sont débloquées. Aucune carte bancaire n'est demandée.`
              : `Votre offre actuelle : ${plans[structure.plan].label}, ${plans[structure.plan].pricePerMonth} € par mois, résiliable à tout moment.`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["essentiel", "pro"] as const).map((plan) => {
              const current = structure.plan === plan;
              const tooSmall = plan === "essentiel" && horseCount > offer.essentielHorseLimit;
              return (
                <div
                  key={plan}
                  className={cn(
                    "rounded-2xl border p-4",
                    current ? "border-primary bg-accent/50" : "border-border",
                  )}
                >
                  <p className="text-lg font-semibold">
                    {plans[plan].label} · {plans[plan].pricePerMonth} €/mois
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {plan === "essentiel"
                      ? `Jusqu'à ${offer.essentielHorseLimit} chevaux, simulateur simple.`
                      : "Chevaux illimités, simulateur avancé."}
                  </p>
                  <Button
                    className="mt-3 h-11 w-full rounded-full"
                    variant={current ? "outline" : "default"}
                    disabled={current || tooSmall}
                    onClick={() => void choosePlan(plan)}
                  >
                    {current
                      ? "Offre actuelle"
                      : tooSmall
                        ? `Vous avez plus de ${offer.essentielHorseLimit} chevaux`
                        : "Choisir cette offre"}
                  </Button>
                </div>
              );
            })}
          </div>
          {structure.plan !== "essai" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Pour résilier, écrivez-nous : l'abonnement s'arrête à la fin du mois en cours, sans
              frais.
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Le paiement en ligne sera activé à la fin de votre essai. Votre choix est enregistré dès
            maintenant.
          </p>
        </Panel>

        <Panel
          title="Mes données"
          description="Elles vous appartiennent : téléchargez-les quand vous voulez."
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              className="h-12 rounded-full px-5"
              onClick={() => downloadCsv(workspace)}
            >
              <FileSpreadsheet /> Exporter en tableur (CSV)
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full px-5"
              onClick={() => downloadJson(workspace)}
            >
              <Download /> Sauvegarde complète (JSON)
            </Button>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="font-semibold">Centre d'exemple</p>
            <p className="text-sm text-muted-foreground">
              Rechargez le centre fictif de 15 chevaux pour explorer, ou repartez d'une page
              blanche. Ces deux actions remplacent tous vos chevaux, dépenses et recettes.
            </p>
            {confirmReset ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-[var(--em-bad-soft)] p-3">
                <span className="font-semibold text-[var(--em-bad)]">
                  {confirmReset === "demo"
                    ? "Remplacer vos données par l'exemple ?"
                    : "Effacer tous vos chevaux et chiffres ?"}
                </span>
                <Button
                  variant="destructive"
                  className="h-11 rounded-full"
                  onClick={async () => {
                    if (confirmReset === "demo") await loadDemo();
                    else await clearData();
                    setConfirmReset(null);
                  }}
                >
                  Oui, confirmer
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-full"
                  onClick={() => setConfirmReset(null)}
                >
                  Annuler
                </Button>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-11 rounded-full"
                  onClick={() => setConfirmReset("demo")}
                >
                  <RefreshCcw /> Charger le centre d'exemple
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 rounded-full text-destructive"
                  onClick={() => setConfirmReset("clear")}
                >
                  <Trash2 /> Tout effacer
                </Button>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Mon compte">
          <p>
            Connecté avec <strong>{account?.email}</strong>.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "cloud"
              ? "Vos données sont stockées sur un serveur sécurisé et visibles par vous seul."
              : "Mode démonstration : vos données sont enregistrées dans ce navigateur uniquement."}
          </p>
        </Panel>
      </div>
    </>
  );
}
