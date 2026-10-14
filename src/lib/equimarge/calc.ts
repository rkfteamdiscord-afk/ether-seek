import { activities, expenseCategories, expenseCategoryOrder, horseTypes } from "./catalog";
import { euros, eurosRound, monthLabel, percent, roundCents } from "./format";
import type {
  ActivityKey,
  Expense,
  ExpenseCategory,
  Horse,
  MonthKey,
  Revenue,
  Workspace,
} from "./types";

/* ------------------------------------------------------------------ */
/* Months                                                              */
/* ------------------------------------------------------------------ */

export function monthOf(date: string): MonthKey {
  return date.slice(0, 7);
}

export function currentMonth(now = new Date()): MonthKey {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(month: MonthKey, delta: number): MonthKey {
  const [year = 0, index = 1] = month.split("-").map(Number);
  const total = year * 12 + (index - 1) + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (total % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

/** The `count` months ending with `last`, oldest first. */
export function monthRange(last: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, i) => addMonths(last, i - count + 1));
}

/** Amount an expense or revenue weighs on a given month. */
export function amountInMonth(item: Expense | Revenue, month: MonthKey): number {
  const start = monthOf(item.date);
  if (item.recurrence === "ponctuelle") return start === month ? item.amount : 0;
  if (start > month) return 0;
  if (item.endDate && monthOf(item.endDate) < month) return 0;
  return item.amount;
}

export function isHorsePresent(horse: Horse, month: MonthKey): boolean {
  if (monthOf(horse.arrivalDate) > month) return false;
  if (horse.departureDate && monthOf(horse.departureDate) < month) return false;
  return true;
}

export function activeHorses(horses: Horse[], month: MonthKey): Horse[] {
  return horses.filter((horse) => isHorsePresent(horse, month));
}

/** Months that hold at least one entry, newest first, always including `fallback`. */
export function monthsWithData(workspace: Workspace, fallback: MonthKey): MonthKey[] {
  const months = new Set<MonthKey>([fallback]);
  for (const item of [...workspace.expenses, ...workspace.revenues]) months.add(monthOf(item.date));
  return [...months].sort().reverse();
}

/* ------------------------------------------------------------------ */
/* Monthly totals                                                      */
/* ------------------------------------------------------------------ */

const sum = (values: number[]) => roundCents(values.reduce((total, value) => total + value, 0));

export function expensesByCategory(
  expenses: Expense[],
  month: MonthKey,
  filter: (expense: Expense) => boolean = () => true,
): Record<ExpenseCategory, number> {
  const totals = Object.fromEntries(expenseCategoryOrder.map((c) => [c, 0])) as Record<
    ExpenseCategory,
    number
  >;
  for (const expense of expenses) {
    if (!filter(expense)) continue;
    totals[expense.category] = roundCents(totals[expense.category] + amountInMonth(expense, month));
  }
  return totals;
}

export function totalExpenses(workspace: Workspace, month: MonthKey) {
  return sum(workspace.expenses.map((e) => amountInMonth(e, month)));
}

export function pensionIncome(workspace: Workspace, month: MonthKey) {
  return sum(
    activeHorses(workspace.horses, month)
      .filter((h) => h.type === "pension")
      .map((h) => h.monthlyPrice),
  );
}

export function revenueByActivity(
  workspace: Workspace,
  month: MonthKey,
): Record<ActivityKey, number> {
  const totals: Record<ActivityKey, number> = {
    pensions: pensionIncome(workspace, month),
    cours: 0,
    stages: 0,
    balades: 0,
    competition: 0,
    autres: 0,
  };
  for (const revenue of workspace.revenues) {
    totals[revenue.kind] = roundCents(totals[revenue.kind] + amountInMonth(revenue, month));
  }
  return totals;
}

export function totalRevenue(workspace: Workspace, month: MonthKey) {
  return sum(Object.values(revenueByActivity(workspace, month)));
}

/* ------------------------------------------------------------------ */
/* Cost of each horse                                                  */
/* ------------------------------------------------------------------ */

export interface HorseCost {
  horse: Horse;
  /** Share of the common expenses (hay, straw, wages...) for the month. */
  commonShare: number;
  /** Expenses booked on this horse for the month (vet, farrier...). */
  specific: number;
  total: number;
  /** Average total cost over the last three months the horse was present. */
  averageTotal: number;
  /** Board billed, or lesson income credited to a club horse. */
  income: number;
  averageIncome: number;
  margin: number;
}

function commonExpensesTotal(workspace: Workspace, month: MonthKey) {
  return sum(workspace.expenses.filter((e) => !e.horseId).map((e) => amountInMonth(e, month)));
}

function specificExpensesFor(workspace: Workspace, horseId: string, month: MonthKey) {
  return sum(
    workspace.expenses.filter((e) => e.horseId === horseId).map((e) => amountInMonth(e, month)),
  );
}

/** Lesson, course and ride income credited to each club horse, by hours worked. */
function clubIncomeShares(workspace: Workspace, month: MonthKey): Map<string, number> {
  const byActivity = revenueByActivity(workspace, month);
  const clubIncome = byActivity.cours + byActivity.stages + byActivity.balades;
  const club = activeHorses(workspace.horses, month).filter((h) => h.type === "club");
  const totalHours = club.reduce((total, h) => total + Math.max(0, h.lessonsPerWeek), 0);
  const shares = new Map<string, number>();
  for (const horse of club) {
    const weight =
      totalHours > 0 ? Math.max(0, horse.lessonsPerWeek) / totalHours : 1 / club.length;
    shares.set(horse.id, roundCents(clubIncome * weight));
  }
  return shares;
}

function incomeFor(horse: Horse, shares: Map<string, number>) {
  if (horse.type === "pension") return horse.monthlyPrice;
  if (horse.type === "club") return shares.get(horse.id) ?? 0;
  return 0;
}

export function horseCosts(workspace: Workspace, month: MonthKey): HorseCost[] {
  const window = monthRange(month, 3);
  const perMonth = window.map((m) => {
    const present = activeHorses(workspace.horses, m);
    return {
      month: m,
      present: new Set(present.map((h) => h.id)),
      share: present.length ? commonExpensesTotal(workspace, m) / present.length : 0,
      clubShares: clubIncomeShares(workspace, m),
    };
  });
  const current = perMonth[perMonth.length - 1]!;

  return activeHorses(workspace.horses, month).map((horse) => {
    const specific = specificExpensesFor(workspace, horse.id, month);
    const commonShare = roundCents(current.share);
    const total = roundCents(commonShare + specific);
    const income = incomeFor(horse, current.clubShares);

    const presentMonths = perMonth.filter((m) => m.present.has(horse.id));
    const averageTotal = roundCents(
      presentMonths.reduce(
        (t, m) => t + m.share + specificExpensesFor(workspace, horse.id, m.month),
        0,
      ) / Math.max(1, presentMonths.length),
    );
    const averageIncome = roundCents(
      presentMonths.reduce((t, m) => t + incomeFor(horse, m.clubShares), 0) /
        Math.max(1, presentMonths.length),
    );

    return {
      horse,
      commonShare,
      specific,
      total,
      averageTotal,
      income,
      averageIncome,
      margin: roundCents(income - total),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Result per activity                                                 */
/* ------------------------------------------------------------------ */

export interface ActivityResult {
  key: ActivityKey;
  label: string;
  revenue: number;
  cost: number;
  margin: number;
  sentence: string;
}

export function activityResults(workspace: Workspace, month: MonthKey): ActivityResult[] {
  const revenue = revenueByActivity(workspace, month);
  const costs: Record<ActivityKey, number> = {
    pensions: 0,
    cours: 0,
    stages: 0,
    balades: 0,
    competition: 0,
    autres: 0,
  };

  const horses = horseCosts(workspace, month);
  const clubCost = sum(horses.filter((h) => h.horse.type === "club").map((h) => h.total));
  costs.pensions = sum(horses.filter((h) => h.horse.type === "pension").map((h) => h.total));
  costs.competition = sum(
    horses.filter((h) => h.horse.type === "proprietaire").map((h) => h.total),
  );

  // Club horses carry lessons, courses and rides: split their cost by income.
  const clubIncome = revenue.cours + revenue.stages + revenue.balades;
  if (clubIncome > 0) {
    for (const key of ["cours", "stages", "balades"] as const) {
      costs[key] = roundCents((clubCost * revenue[key]) / clubIncome);
    }
  } else {
    costs.cours = clubCost;
  }

  // Without any horse, shared costs cannot be split: keep them visible.
  if (horses.length === 0) costs.autres = totalExpenses(workspace, month);

  const used = new Set<ActivityKey>(workspace.structure.activities);
  return (Object.keys(activities) as ActivityKey[])
    .filter((key) => used.has(key) || revenue[key] > 0 || costs[key] > 0)
    .map((key) => {
      const margin = roundCents(revenue[key] - costs[key]);
      const label = activities[key].label;
      const sentence =
        revenue[key] === 0 && costs[key] === 0
          ? `Aucun chiffre pour les ${label.toLowerCase()} en ${monthLabel(month)}.`
          : margin >= 0
            ? `${label} : ${euros(revenue[key])} encaissés pour ${euros(costs[key])} de coûts, vous gagnez ${euros(margin)} ce mois-ci.`
            : `${label} : ${euros(revenue[key])} encaissés pour ${euros(costs[key])} de coûts, vous perdez ${euros(-margin)} ce mois-ci.`;
      return { key, label, revenue: revenue[key], cost: costs[key], margin, sentence };
    });
}

/* ------------------------------------------------------------------ */
/* Summary and financial health                                        */
/* ------------------------------------------------------------------ */

export type HealthLevel = "vert" | "orange" | "rouge";

export interface MonthSummary {
  month: MonthKey;
  revenue: number;
  expenses: number;
  margin: number;
  marginRate: number;
  horseCount: number;
  averageHorseCost: number;
  health: HealthLevel;
  healthSentence: string;
}

export function healthFor(revenue: number, margin: number): HealthLevel {
  if (revenue <= 0) return margin >= 0 ? "orange" : "rouge";
  const rate = margin / revenue;
  if (rate >= 0.05) return "vert";
  if (rate >= 0) return "orange";
  return "rouge";
}

export function monthSummary(workspace: Workspace, month: MonthKey): MonthSummary {
  const revenue = totalRevenue(workspace, month);
  const expenses = totalExpenses(workspace, month);
  const margin = roundCents(revenue - expenses);
  const horseCount = activeHorses(workspace.horses, month).length;
  const averageHorseCost = horseCount ? roundCents(expenses / horseCount) : 0;
  const marginRate = revenue > 0 ? (margin / revenue) * 100 : 0;
  const health = healthFor(revenue, margin);

  let healthSentence: string;
  if (revenue === 0 && expenses === 0) {
    healthSentence = `Aucune dépense ni recette saisie pour ${monthLabel(month)}.`;
  } else if (health === "vert") {
    healthSentence = `Bonne santé : il vous reste ${eurosRound(margin)} sur ${eurosRound(revenue)} encaissés, soit ${percent(marginRate)} de vos recettes.`;
  } else if (health === "orange") {
    healthSentence = `À surveiller : vous couvrez vos dépenses, mais il ne vous reste que ${eurosRound(margin)} ce mois-ci.`;
  } else {
    healthSentence = `Attention : vos dépenses dépassent vos recettes de ${eurosRound(-margin)} ce mois-ci.`;
  }

  return {
    month,
    revenue,
    expenses,
    margin,
    marginRate,
    horseCount,
    averageHorseCost,
    health,
    healthSentence,
  };
}

export function monthlyHistory(workspace: Workspace, last: MonthKey, count = 6) {
  return monthRange(last, count).map((month) => ({
    month,
    revenue: totalRevenue(workspace, month),
    expenses: totalExpenses(workspace, month),
  }));
}

/* ------------------------------------------------------------------ */
/* Alerts                                                              */
/* ------------------------------------------------------------------ */

export interface Alert {
  id: string;
  kind: "pension-sous-cout" | "club-deficitaire" | "hausse-depense";
  level: "orange" | "rouge";
  title: string;
  message: string;
  amount: number;
  horseId?: string;
}

/** A category is flagged when it grows by 15 % and at least 50 € month on month. */
export const RISE_THRESHOLD = { percent: 15, minimumEuros: 50 } as const;

export function alertsFor(workspace: Workspace, month: MonthKey): Alert[] {
  const alerts: Alert[] = [];

  for (const cost of horseCosts(workspace, month)) {
    const { horse } = cost;
    if (horse.type === "pension" && horse.monthlyPrice < cost.averageTotal) {
      const loss = roundCents(cost.averageTotal - horse.monthlyPrice);
      alerts.push({
        id: `pension-${horse.id}`,
        kind: "pension-sous-cout",
        level: loss > 50 ? "rouge" : "orange",
        title: `Pension de ${horse.name} sous son coût réel`,
        message: `La pension de ${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois, vous la facturez ${eurosRound(horse.monthlyPrice)} : vous perdez ${eurosRound(loss)} chaque mois.`,
        amount: loss,
        horseId: horse.id,
      });
    }
    if (horse.type === "club" && cost.averageIncome < cost.averageTotal) {
      const loss = roundCents(cost.averageTotal - cost.averageIncome);
      alerts.push({
        id: `club-${horse.id}`,
        kind: "club-deficitaire",
        level: loss > 100 ? "rouge" : "orange",
        title: `${horse.name} coûte plus qu'il ne rapporte`,
        message: `${horse.name} vous coûte ${eurosRound(cost.averageTotal)} par mois et rapporte environ ${eurosRound(cost.averageIncome)} en cours : il vous manque ${eurosRound(loss)} chaque mois.`,
        amount: loss,
        horseId: horse.id,
      });
    }
  }

  const previous = addMonths(month, -1);
  const now = expensesByCategory(workspace.expenses, month);
  const before = expensesByCategory(workspace.expenses, previous);
  for (const category of expenseCategoryOrder) {
    const rise = roundCents(now[category] - before[category]);
    if (before[category] <= 0 || rise < RISE_THRESHOLD.minimumEuros) continue;
    const ratio = (rise / before[category]) * 100;
    if (ratio < RISE_THRESHOLD.percent) continue;
    const label = expenseCategories[category].label;
    alerts.push({
      id: `hausse-${category}`,
      kind: "hausse-depense",
      level: ratio >= 30 ? "rouge" : "orange",
      title: `Hausse du poste « ${label} »`,
      message: `Vos dépenses de ${label.toLowerCase()} passent de ${eurosRound(before[category])} en ${monthLabel(previous, false)} à ${eurosRound(now[category])} en ${monthLabel(month, false)} : +${percent(ratio)}, soit ${eurosRound(rise)} de plus.`,
      amount: rise,
    });
  }

  return alerts.sort((a, b) => b.amount - a.amount);
}

/* ------------------------------------------------------------------ */
/* Simulator                                                           */
/* ------------------------------------------------------------------ */

export interface Hypotheses {
  /** Change of the monthly board price, in euros per pension horse. */
  pensionPriceChange: number;
  /** Change of the hay price, in percent. */
  hayPricePercent: number;
  /** New number of lessons per week. */
  lessonsPerWeek: number;
  addPensionHorses: number;
  addClubHorses: number;
  departingHorseIds: string[];
}

export interface SimulationLine {
  label: string;
  monthly: number;
  sentence: string;
}

export interface SimulationResult {
  baseMargin: number;
  newMargin: number;
  monthlyDelta: number;
  annualDelta: number;
  baseAnnual: number;
  newAnnual: number;
  lines: SimulationLine[];
  /** Food, bedding and care that one more horse adds each month. */
  marginalHorseCost: number;
}

export function defaultHypotheses(workspace: Workspace): Hypotheses {
  return {
    pensionPriceChange: 0,
    hayPricePercent: 0,
    lessonsPerWeek: workspace.structure.lessonsPerWeek,
    addPensionHorses: 0,
    addClubHorses: 0,
    departingHorseIds: [],
  };
}

export function simulate(workspace: Workspace, month: MonthKey, h: Hypotheses): SimulationResult {
  const summary = monthSummary(workspace, month);
  const present = activeHorses(workspace.horses, month);
  const count = Math.max(1, present.length);
  const revenue = revenueByActivity(workspace, month);
  const common = expensesByCategory(workspace.expenses, month, (e) => !e.horseId);
  const specificTotal = sum(
    workspace.expenses.filter((e) => e.horseId).map((e) => amountInMonth(e, month)),
  );
  const hayFactor = 1 + h.hayPricePercent / 100;

  const variableCommon = expenseCategoryOrder
    .filter((c) => expenseCategories[c].variable)
    .reduce((t, c) => t + (c === "foin" ? common[c] * hayFactor : common[c]), 0);
  const marginalHorseCost = roundCents((variableCommon + specificTotal) / count);

  const lines: SimulationLine[] = [];
  const pensionHorses = present.filter((x) => x.type === "pension");

  if (h.pensionPriceChange !== 0 && pensionHorses.length) {
    const monthly = roundCents(h.pensionPriceChange * pensionHorses.length);
    lines.push({
      label: "Prix des pensions",
      monthly,
      sentence: `${h.pensionPriceChange > 0 ? "+" : "−"}${euros(Math.abs(h.pensionPriceChange))} sur ${pensionHorses.length} pensions : ${monthly >= 0 ? "+" : "−"}${eurosRound(Math.abs(monthly))} par mois.`,
    });
  }

  if (h.hayPricePercent !== 0 && common.foin > 0) {
    const monthly = roundCents(-common.foin * (h.hayPricePercent / 100));
    lines.push({
      label: "Prix du foin",
      monthly,
      sentence: `Foin ${h.hayPricePercent > 0 ? "plus cher" : "moins cher"} de ${percent(Math.abs(h.hayPricePercent))} : ${monthly >= 0 ? "+" : "−"}${eurosRound(Math.abs(monthly))} par mois sur votre marge.`,
    });
  }

  const baseLessons = workspace.structure.lessonsPerWeek;
  if (baseLessons > 0 && h.lessonsPerWeek !== baseLessons) {
    const perLesson = revenue.cours / (baseLessons * (52 / 12));
    const monthly = roundCents((h.lessonsPerWeek - baseLessons) * (52 / 12) * perLesson);
    lines.push({
      label: "Nombre de cours",
      monthly,
      sentence: `${h.lessonsPerWeek} cours par semaine au lieu de ${baseLessons} (environ ${euros(perLesson)} par cours) : ${monthly >= 0 ? "+" : "−"}${eurosRound(Math.abs(monthly))} par mois.`,
    });
  }

  const pensionPrice = pensionHorses.length
    ? pensionHorses.reduce((t, x) => t + x.monthlyPrice, 0) / pensionHorses.length +
      h.pensionPriceChange
    : 0;

  if (h.addPensionHorses > 0) {
    const monthly = roundCents(h.addPensionHorses * (pensionPrice - marginalHorseCost));
    lines.push({
      label: "Nouvelles pensions",
      monthly,
      sentence: `${h.addPensionHorses} pension${h.addPensionHorses > 1 ? "s" : ""} de plus à ${eurosRound(pensionPrice)}, pour environ ${eurosRound(marginalHorseCost)} de foin, litière et soins chacune : ${monthly >= 0 ? "+" : "−"}${eurosRound(Math.abs(monthly))} par mois.`,
    });
  }

  if (h.addClubHorses > 0) {
    const monthly = roundCents(-h.addClubHorses * marginalHorseCost);
    lines.push({
      label: "Nouveaux chevaux de club",
      monthly,
      sentence: `${h.addClubHorses} cheval${h.addClubHorses > 1 ? "aux" : ""} de club en plus coûte${h.addClubHorses > 1 ? "nt" : ""} environ ${eurosRound(-monthly)} par mois : à compenser par des cours en plus.`,
    });
  }

  for (const id of h.departingHorseIds) {
    const horse = present.find((x) => x.id === id);
    if (!horse) continue;
    const lostIncome = horse.type === "pension" ? horse.monthlyPrice + h.pensionPriceChange : 0;
    const monthly = roundCents(marginalHorseCost - lostIncome);
    const kind = horseTypes[horse.type].short.toLowerCase();
    lines.push({
      label: `Départ de ${horse.name}`,
      monthly,
      sentence:
        horse.type === "pension"
          ? `Sans ${horse.name} (${kind}), vous économisez ${eurosRound(marginalHorseCost)} mais perdez ${eurosRound(lostIncome)} de pension : ${monthly >= 0 ? "+" : "−"}${eurosRound(Math.abs(monthly))} par mois.`
          : `Sans ${horse.name} (${kind}), vous économisez environ ${eurosRound(marginalHorseCost)} par mois, si les autres chevaux assurent ses cours.`,
    });
  }

  const monthlyDelta = sum(lines.map((l) => l.monthly));
  const newMargin = roundCents(summary.margin + monthlyDelta);
  return {
    baseMargin: summary.margin,
    newMargin,
    monthlyDelta,
    annualDelta: roundCents(monthlyDelta * 12),
    baseAnnual: roundCents(summary.margin * 12),
    newAnnual: roundCents(newMargin * 12),
    lines,
    marginalHorseCost,
  };
}

/* ------------------------------------------------------------------ */
/* Recommendations for the monthly report                              */
/* ------------------------------------------------------------------ */

export function recommendations(workspace: Workspace, month: MonthKey): string[] {
  const tips: string[] = [];
  const alerts = alertsFor(workspace, month);
  const costs = horseCosts(workspace, month);

  const underpriced = alerts.filter((a) => a.kind === "pension-sous-cout");
  if (underpriced.length) {
    const pension = costs.filter((c) => c.horse.type === "pension");
    const average = pension.reduce((t, c) => t + c.averageTotal, 0) / Math.max(1, pension.length);
    const fair = Math.ceil((average * 1.1) / 5) * 5;
    tips.push(
      `Revoyez le prix de vos pensions : ${underpriced.length > 1 ? `${underpriced.length} pensions sont facturées sous leur coût` : "une pension est facturée sous son coût"}. Un tarif autour de ${eurosRound(fair)} couvrirait vos frais avec 10 % de marge.`,
    );
  }

  const club = alerts.filter((a) => a.kind === "club-deficitaire");
  if (club.length) {
    const names = club
      .slice(0, 3)
      .map((a) => costs.find((c) => c.horse.id === a.horseId)?.horse.name)
      .filter(Boolean);
    tips.push(
      `Faites travailler davantage ${names.join(", ")} ou envisagez une demi-pension : ${club.length > 1 ? "ces chevaux coûtent" : "ce cheval coûte"} plus qu'${club.length > 1 ? "ils ne rapportent" : "il ne rapporte"}.`,
    );
  }

  const rise = alerts.find((a) => a.kind === "hausse-depense");
  if (rise) {
    tips.push(
      `${rise.title.replace("Hausse du poste", "Surveillez le poste")} : comparez vos fournisseurs ou négociez un achat groupé. ${rise.message}`,
    );
  }

  const results = activityResults(workspace, month).filter((r) => r.revenue > 0 || r.cost > 0);
  const best = [...results].sort((a, b) => b.margin - a.margin)[0];
  if (best && best.margin > 0) {
    tips.push(
      `Développez vos ${best.label.toLowerCase()} : c'est votre activité la plus rentable ce mois-ci, avec ${eurosRound(best.margin)} de marge.`,
    );
  }

  tips.push(
    "Saisissez vos factures chaque fin de mois : 15 minutes suffisent pour garder des chiffres justes et repérer une hausse tout de suite.",
  );
  tips.push(
    "Gardez l'équivalent d'un mois de dépenses de côté pour absorber une hausse du foin ou une grosse facture vétérinaire.",
  );

  return tips.slice(0, 3);
}
