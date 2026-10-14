import type { MonthKey } from "./types";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const roundEuroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Normalises Intl's narrow/no-break spaces to a single no-break space. */
function tidy(value: string) {
  return value.replace(/[\u202f\u00a0]/g, "\u00a0");
}

/** French euro amount with cents: 1 234,56 €. */
export function euros(value: number) {
  return tidy(euroFormatter.format(roundCents(value)));
}

/** French euro amount without cents, for headlines: 1 235 €. */
export function eurosRound(value: number) {
  return tidy(roundEuroFormatter.format(Math.round(value)));
}

export function percent(value: number) {
  return `${Math.round(value)}\u00a0%`;
}

export function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

const monthNames = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function monthLabel(month: MonthKey, withYear = true) {
  const [year = 0, index = 1] = month.split("-").map(Number);
  const name = monthNames[index - 1] ?? month;
  return withYear ? `${name} ${year}` : name;
}

export function shortMonthLabel(month: MonthKey) {
  const name = monthLabel(month, false);
  return name.length > 4 ? `${name.slice(0, 4)}.` : name;
}

export function dateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

/** Parses "1 234,56", "1234.56" or "380" typed on a phone keyboard. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s\u00a0\u202f€]/g, "").replace(",", ".");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? roundCents(value) : null;
}
