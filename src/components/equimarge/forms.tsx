import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import {
  Choice,
  ConfirmDelete,
  Field,
  FormDialog,
  MoneyInput,
  today,
} from "@/components/equimarge/ui";
import { Button } from "@/components/ui/button";
import {
  activities,
  expenseCategories,
  expenseCategoryOrder,
  horseTypes,
  lessonFormats,
  revenueKinds,
} from "@/lib/equimarge/catalog";
import { newId } from "@/lib/equimarge/demo";
import { parseAmount } from "@/lib/equimarge/format";
import type {
  Expense,
  ExpenseCategory,
  Horse,
  HorseType,
  LessonFormat,
  Recurrence,
  Revenue,
  RevenueKind,
} from "@/lib/equimarge/types";

function amountText(value: number | undefined) {
  return value ? String(value).replace(".", ",") : "";
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-[var(--em-bad-soft)] px-4 py-3 text-[var(--em-bad)]">
      {message}
    </p>
  );
}

function SubmitRow({
  busy,
  onCancel,
  label = "Enregistrer",
}: {
  busy: boolean;
  onCancel: () => void;
  label?: string;
}) {
  return (
    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" className="h-12 rounded-full px-6" onClick={onCancel}>
        Annuler
      </Button>
      <Button
        type="submit"
        className="h-12 rounded-full px-6 text-base font-semibold"
        disabled={busy}
      >
        {busy && <Loader2 className="animate-spin" />}
        {label}
      </Button>
    </div>
  );
}

function RecurrenceField({
  value,
  onChange,
  endDate,
  onEndDate,
  name,
}: {
  value: Recurrence;
  onChange: (value: Recurrence) => void;
  endDate: string;
  onEndDate: (value: string) => void;
  name: string;
}) {
  return (
    <>
      <Field label="Fréquence">
        <Choice
          name={name}
          value={value}
          onChange={onChange}
          options={[
            {
              value: "ponctuelle",
              label: "Ponctuelle",
              hint: "Une facture, un achat, un mois précis.",
            },
            {
              value: "mensuelle",
              label: "Chaque mois",
              hint: "Se répète tous les mois à partir de la date.",
            },
          ]}
        />
      </Field>
      {value === "mensuelle" && (
        <Field
          label="Jusqu'à (facultatif)"
          htmlFor={`${name}-end`}
          hint="Laissez vide si elle continue."
        >
          <input
            id={`${name}-end`}
            type="date"
            className="em-input"
            value={endDate}
            onChange={(e) => onEndDate(e.target.value)}
          />
        </Field>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

export function HorseForm({
  open,
  onOpenChange,
  horse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horse?: Horse | undefined;
}) {
  const { saveHorse } = useReadyWorkspace();
  const [name, setName] = useState(horse?.name ?? "");
  const [type, setType] = useState<HorseType>(horse?.type ?? "club");
  const [arrival, setArrival] = useState(horse?.arrivalDate ?? today());
  const [departure, setDeparture] = useState(horse?.departureDate ?? "");
  const [price, setPrice] = useState(amountText(horse?.monthlyPrice));
  const [hours, setHours] = useState(horse ? String(horse.lessonsPerWeek) : "8");
  const [notes, setNotes] = useState(horse?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Indiquez le nom du cheval.");
    if (!arrival) return setError("Indiquez sa date d'arrivée.");
    if (departure && departure < arrival)
      return setError("La date de départ doit suivre la date d'arrivée.");
    const monthlyPrice = type === "pension" ? parseAmount(price) : 0;
    if (type === "pension" && (monthlyPrice === null || monthlyPrice < 0))
      return setError("Indiquez le prix de la pension par mois, par exemple 450.");
    const lessons = type === "club" ? Number(hours.replace(",", ".")) : 0;
    if (type === "club" && (!Number.isFinite(lessons) || lessons < 0 || lessons > 60))
      return setError("Indiquez un nombre d'heures de cours par semaine entre 0 et 60.");
    setBusy(true);
    const ok = await saveHorse({
      id: horse?.id ?? newId(),
      name: name.trim(),
      type,
      arrivalDate: arrival,
      departureDate: departure || null,
      monthlyPrice: monthlyPrice ?? 0,
      lessonsPerWeek: lessons,
      notes: notes.trim(),
    });
    setBusy(false);
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={horse ? `Modifier ${horse.name}` : "Ajouter un cheval"}
      description="Ses frais (vétérinaire, maréchal…) se saisissent ensuite depuis sa fiche."
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Nom du cheval" htmlFor="horse-name">
          <input
            id="horse-name"
            className="em-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Type">
          <div className="grid gap-2">
            {(Object.keys(horseTypes) as HorseType[]).map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${type === t ? "border-primary bg-accent/60" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="horse-type"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  checked={type === t}
                  onChange={() => setType(t)}
                />
                <span>
                  <span className="block font-semibold">{horseTypes[t].label}</span>
                  <span className="block text-sm text-muted-foreground">{horseTypes[t].help}</span>
                </span>
              </label>
            ))}
          </div>
        </Field>
        {type === "pension" && (
          <Field label="Prix de la pension par mois" htmlFor="horse-price">
            <MoneyInput id="horse-price" value={price} onChange={setPrice} placeholder="450" />
          </Field>
        )}
        {type === "club" && (
          <Field
            label="Heures de cours par semaine"
            htmlFor="horse-hours"
            hint="Sert à répartir les recettes des cours entre vos chevaux de club."
          >
            <input
              id="horse-hours"
              className="em-input"
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date d'arrivée" htmlFor="horse-arrival">
            <input
              id="horse-arrival"
              type="date"
              className="em-input"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
            />
          </Field>
          <Field label="Date de départ" htmlFor="horse-departure" hint="Seulement s'il est parti.">
            <input
              id="horse-departure"
              type="date"
              className="em-input"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Notes (facultatif)" htmlFor="horse-notes">
          <textarea
            id="horse-notes"
            className="em-input min-h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <FormError message={error} />
        <SubmitRow busy={busy} onCancel={() => onOpenChange(false)} />
      </form>
    </FormDialog>
  );
}

/* ------------------------------------------------------------------ */

export function ExpenseForm({
  open,
  onOpenChange,
  expense,
  horseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | undefined;
  /** Pre-selects a horse when adding from its card. */
  horseId?: string | undefined;
}) {
  const { workspace, saveExpense, deleteExpense } = useReadyWorkspace();
  const main = workspace.structure.mainExpenses;
  const defaultCategory: ExpenseCategory = horseId ? "veterinaire" : (main[0] ?? "foin");
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? defaultCategory);
  const [label, setLabel] = useState(expense?.label ?? "");
  const [amount, setAmount] = useState(amountText(expense?.amount));
  const [date, setDate] = useState(expense?.date ?? today());
  const [recurrence, setRecurrence] = useState<Recurrence>(expense?.recurrence ?? "ponctuelle");
  const [endDate, setEndDate] = useState(expense?.endDate ?? "");
  const [scope, setScope] = useState<"commune" | "cheval">(
    expense?.horseId || horseId ? "cheval" : "commune",
  );
  const [target, setTarget] = useState(
    expense?.horseId ?? horseId ?? workspace.horses[0]?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ordered = [...main, ...expenseCategoryOrder.filter((c) => !main.includes(c))];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const value = parseAmount(amount);
    if (value === null || value <= 0)
      return setError("Indiquez un montant, par exemple 1 250 ou 89,90.");
    if (!date) return setError("Indiquez la date de la dépense.");
    if (scope === "cheval" && !target) return setError("Choisissez le cheval concerné.");
    if (recurrence === "mensuelle" && endDate && endDate < date)
      return setError("La date de fin doit suivre la date de début.");
    setBusy(true);
    const ok = await saveExpense({
      id: expense?.id ?? newId(),
      category,
      label: label.trim() || expenseCategories[category].label,
      amount: value,
      date,
      recurrence,
      endDate: recurrence === "mensuelle" && endDate ? endDate : null,
      horseId: scope === "cheval" ? target : null,
    });
    setBusy(false);
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={expense ? "Modifier la dépense" : "Ajouter une dépense"}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Catégorie" htmlFor="expense-category">
          <select
            id="expense-category"
            className="em-input"
            value={category}
            onChange={(e) => {
              const next = e.target.value as ExpenseCategory;
              setCategory(next);
              if (!expense && expenseCategories[next].perHorse && workspace.horses.length)
                setScope("cheval");
            }}
          >
            {ordered.map((c) => (
              <option key={c} value={c}>
                {expenseCategories[c].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Montant" htmlFor="expense-amount">
          <MoneyInput id="expense-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Date" htmlFor="expense-date">
          <input
            id="expense-date"
            type="date"
            className="em-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <RecurrenceField
          name="expense-recurrence"
          value={recurrence}
          onChange={setRecurrence}
          endDate={endDate}
          onEndDate={setEndDate}
        />
        <Field label="Pour qui ?">
          <Choice
            name="expense-scope"
            value={scope}
            onChange={setScope}
            options={[
              {
                value: "commune",
                label: "Toute l'écurie",
                hint: "Répartie à parts égales entre vos chevaux.",
              },
              {
                value: "cheval",
                label: "Un cheval précis",
                hint: "Affectée uniquement à ce cheval.",
              },
            ]}
          />
        </Field>
        {scope === "cheval" && (
          <Field label="Cheval concerné" htmlFor="expense-horse">
            <select
              id="expense-horse"
              className="em-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {workspace.horses.length === 0 && <option value="">Aucun cheval enregistré</option>}
              {[...workspace.horses]
                .sort((a, b) => a.name.localeCompare(b.name, "fr"))
                .map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
            </select>
          </Field>
        )}
        <Field label="Libellé (facultatif)" htmlFor="expense-label">
          <input
            id="expense-label"
            className="em-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`Ex. ${category === "foin" ? "Livraison 12 balles rondes" : expenseCategories[category].label}`}
          />
        </Field>
        <FormError message={error} />
        <SubmitRow busy={busy} onCancel={() => onOpenChange(false)} />
        {expense && (
          <div className="border-t border-border pt-3">
            <ConfirmDelete
              what="cette dépense"
              onConfirm={async () => {
                await deleteExpense(expense.id);
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </form>
    </FormDialog>
  );
}

/* ------------------------------------------------------------------ */

export function RevenueForm({
  open,
  onOpenChange,
  revenue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenue?: Revenue | undefined;
}) {
  const { saveRevenue, deleteRevenue } = useReadyWorkspace();
  const [kind, setKind] = useState<RevenueKind>(revenue?.kind ?? "cours");
  const [format, setFormat] = useState<LessonFormat>(revenue?.lessonFormat ?? "carte");
  const [label, setLabel] = useState(revenue?.label ?? "");
  const [amount, setAmount] = useState(amountText(revenue?.amount));
  const [date, setDate] = useState(revenue?.date ?? today());
  const [recurrence, setRecurrence] = useState<Recurrence>(revenue?.recurrence ?? "ponctuelle");
  const [endDate, setEndDate] = useState(revenue?.endDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const value = parseAmount(amount);
    if (value === null || value <= 0) return setError("Indiquez un montant, par exemple 1 150.");
    if (!date) return setError("Indiquez la date.");
    if (recurrence === "mensuelle" && endDate && endDate < date)
      return setError("La date de fin doit suivre la date de début.");
    setBusy(true);
    const ok = await saveRevenue({
      id: revenue?.id ?? newId(),
      kind,
      lessonFormat: kind === "cours" ? format : null,
      label: label.trim() || (kind === "cours" ? lessonFormats[format] : activities[kind].label),
      amount: value,
      date,
      recurrence,
      endDate: recurrence === "mensuelle" && endDate ? endDate : null,
    });
    setBusy(false);
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={revenue ? "Modifier la recette" : "Ajouter une recette"}
      description="Les pensions se calculent toutes seules à partir du prix indiqué sur chaque fiche cheval."
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Activité" htmlFor="revenue-kind">
          <select
            id="revenue-kind"
            className="em-input"
            value={kind}
            onChange={(e) => setKind(e.target.value as RevenueKind)}
          >
            {revenueKinds.map((k) => (
              <option key={k} value={k}>
                {activities[k].label}
              </option>
            ))}
          </select>
        </Field>
        {kind === "cours" && (
          <Field label="Type de cours">
            <Choice
              name="lesson-format"
              value={format}
              onChange={setFormat}
              options={(Object.keys(lessonFormats) as LessonFormat[]).map((f) => ({
                value: f,
                label: lessonFormats[f],
              }))}
            />
          </Field>
        )}
        <Field label="Montant encaissé" htmlFor="revenue-amount">
          <MoneyInput id="revenue-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field label="Date" htmlFor="revenue-date">
          <input
            id="revenue-date"
            type="date"
            className="em-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <RecurrenceField
          name="revenue-recurrence"
          value={recurrence}
          onChange={setRecurrence}
          endDate={endDate}
          onEndDate={setEndDate}
        />
        <Field label="Libellé (facultatif)" htmlFor="revenue-label">
          <input
            id="revenue-label"
            className="em-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Cartes de 10 cours vendues"
          />
        </Field>
        <FormError message={error} />
        <SubmitRow busy={busy} onCancel={() => onOpenChange(false)} />
        {revenue && (
          <div className="border-t border-border pt-3">
            <ConfirmDelete
              what="cette recette"
              onConfirm={async () => {
                await deleteRevenue(revenue.id);
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </form>
    </FormDialog>
  );
}
