import { currentMonth, monthRange } from "./calc";
import type { Expense, Horse, Revenue, Structure, Workspace } from "./types";

type DemoData = Pick<Workspace, "horses" | "expenses" | "revenues">;

let counter = 0;
function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  counter += 1;
  return `id-${Date.now().toString(36)}-${counter}`;
}

export { newId };

/** Small deterministic wobble so the sample months look lived-in. */
function wobble(seed: number, spread: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * spread;
}

const round = (value: number) => Math.round(value * 100) / 100;

const horseSeeds: Array<Omit<Horse, "id" | "notes" | "departureDate"> & { notes?: string }> = [
  {
    name: "Tornado",
    type: "pension",
    arrivalDate: "2021-09-01",
    monthlyPrice: 380,
    lessonsPerWeek: 0,
    notes: "Pension box + paddock, tarif inchangé depuis 2021.",
  },
  {
    name: "Bella",
    type: "pension",
    arrivalDate: "2022-03-15",
    monthlyPrice: 480,
    lessonsPerWeek: 0,
  },
  {
    name: "Ulysse",
    type: "pension",
    arrivalDate: "2020-06-01",
    monthlyPrice: 520,
    lessonsPerWeek: 0,
  },
  {
    name: "Quartz",
    type: "pension",
    arrivalDate: "2023-01-10",
    monthlyPrice: 460,
    lessonsPerWeek: 0,
  },
  {
    name: "Viking",
    type: "pension",
    arrivalDate: "2024-05-01",
    monthlyPrice: 500,
    lessonsPerWeek: 0,
  },
  {
    name: "Sirène",
    type: "pension",
    arrivalDate: "2022-11-01",
    monthlyPrice: 450,
    lessonsPerWeek: 0,
  },
  { name: "Pépite", type: "club", arrivalDate: "2018-04-01", monthlyPrice: 0, lessonsPerWeek: 12 },
  { name: "Galopin", type: "club", arrivalDate: "2019-09-01", monthlyPrice: 0, lessonsPerWeek: 10 },
  {
    name: "Noisette",
    type: "club",
    arrivalDate: "2020-02-01",
    monthlyPrice: 0,
    lessonsPerWeek: 10,
  },
  { name: "Réglisse", type: "club", arrivalDate: "2021-07-01", monthlyPrice: 0, lessonsPerWeek: 9 },
  { name: "Hermès", type: "club", arrivalDate: "2017-10-01", monthlyPrice: 0, lessonsPerWeek: 11 },
  { name: "Mistral", type: "club", arrivalDate: "2023-08-01", monthlyPrice: 0, lessonsPerWeek: 12 },
  {
    name: "Caramel",
    type: "club",
    arrivalDate: "2012-05-01",
    monthlyPrice: 0,
    lessonsPerWeek: 3,
    notes: "Poney de 22 ans, travaille peu.",
  },
  {
    name: "Orage",
    type: "proprietaire",
    arrivalDate: "2019-03-01",
    monthlyPrice: 0,
    lessonsPerWeek: 0,
    notes: "Cheval de compétition de la structure.",
  },
  {
    name: "Daisy",
    type: "proprietaire",
    arrivalDate: "2015-06-01",
    monthlyPrice: 0,
    lessonsPerWeek: 0,
    notes: "Jument à la retraite.",
  },
];

/** Fictional 15-horse centre over the six months ending `last`. */
export function buildDemoData(last = currentMonth()): DemoData {
  const months = monthRange(last, 6);
  const first = months[0]!;
  const horses: Horse[] = horseSeeds.map((seed) => ({
    id: newId(),
    name: seed.name,
    type: seed.type,
    arrivalDate: seed.arrivalDate,
    departureDate: null,
    monthlyPrice: seed.monthlyPrice,
    lessonsPerWeek: seed.lessonsPerWeek,
    notes: seed.notes ?? "",
  }));
  const byName = (name: string) => horses.find((h) => h.name === name)!.id;

  const expenses: Expense[] = [];
  const revenues: Revenue[] = [];
  const day = (month: string, d: number) => `${month}-${String(d).padStart(2, "0")}`;

  const recurringExpense = (category: Expense["category"], label: string, amount: number) =>
    expenses.push({
      id: newId(),
      category,
      label,
      amount,
      date: day(first, 1),
      recurrence: "mensuelle",
      endDate: null,
      horseId: null,
    });

  recurringExpense("salaires", "Salaire palefrenier (temps partiel)", 1900);
  recurringExpense("loyer", "Remboursement crédit écuries", 650);
  recurringExpense("assurance", "Assurance RC et bâtiments", 190);
  recurringExpense("eau", "Eau", 60);
  recurringExpense("materiel", "Petit matériel et sellerie", 90);

  months.forEach((month, i) => {
    const last = i === months.length - 1;
    const oneOff = (
      category: Expense["category"],
      label: string,
      amount: number,
      d: number,
      horseId: string | null = null,
    ) =>
      expenses.push({
        id: newId(),
        category,
        label,
        amount: round(amount),
        date: day(month, d),
        recurrence: "ponctuelle",
        endDate: null,
        horseId,
      });

    // Hay jumps on the latest month to show the rise alert.
    oneOff("foin", "Livraison de foin", last ? 1560 : 1250 + wobble(i + 1, 40), 5);
    oneOff("paille", "Paille", 600 + wobble(i + 11, 35), 6);
    oneOff("granules", "Granulés", 750 + wobble(i + 21, 30), 8);
    oneOff("electricite", "Électricité", 180 + wobble(i + 31, 25), 15);
    oneOff("entretien", "Entretien clôtures et carrière", 160 + wobble(i + 41, 60), 20);

    // Farrier every other month for club and own horses, alternating groups.
    const shod = horses.filter((h) => h.type !== "pension");
    shod.forEach((horse, index) => {
      if ((index + i) % 2 === 0)
        oneOff("marechal", `Parage / ferrure ${horse.name}`, 75, 12, horse.id);
    });
    oneOff("complements", "Compléments articulaires Caramel", 38, 3, byName("Caramel"));
    oneOff("complements", "Compléments Orage", 45, 3, byName("Orage"));
    if (i === 1) oneOff("veterinaire", "Vaccins grippe-tétanos (club)", 420, 18);
    if (i === 2) oneOff("veterinaire", "Visite boiterie Caramel", 185, 9, byName("Caramel"));
    if (i === 3) oneOff("dentiste", "Dentiste Galopin et Hermès", 160, 22);
    if (i === 4) oneOff("veterinaire", "Coliques Orage", 310, 14, byName("Orage"));
    if (i === 5) oneOff("veterinaire", "Visite annuelle Tornado", 65, 10, byName("Tornado"));

    const income = (
      kind: Revenue["kind"],
      label: string,
      amount: number,
      d: number,
      lessonFormat: Revenue["lessonFormat"] = null,
    ) =>
      revenues.push({
        id: newId(),
        kind,
        lessonFormat,
        label,
        amount: round(amount),
        date: day(month, d),
        recurrence: "ponctuelle",
        endDate: null,
      });

    income("cours", "Cartes de 10 cours", 1150 + wobble(i + 51, 180), 28, "carte");
    income("cours", "Cours à l'unité", 340 + wobble(i + 61, 90), 28, "unite");
    const holidays = i % 3 === 2;
    income("stages", holidays ? "Stages vacances" : "Stage du week-end", holidays ? 980 : 320, 25);
    income("balades", "Balades et randonnées", 520 + wobble(i + 71, 140), 27);
    income("competition", "Coaching concours", 240 + wobble(i + 81, 60), 27);
  });

  revenues.push({
    id: newId(),
    kind: "cours",
    lessonFormat: "forfait",
    label: "Forfaits annuels (mensualités)",
    amount: 3150,
    date: day(first, 1),
    recurrence: "mensuelle",
    endDate: null,
  });

  return { horses, expenses, revenues };
}

export function demoStructureDefaults(): Pick<Structure, "lessonsPerWeek" | "declaredHorseCount"> {
  return { lessonsPerWeek: 45, declaredHorseCount: 15 };
}

export const DEMO_CENTRE_NAME = "Centre équestre des Trois Chênes";

export function trialEnd(fromDate = new Date(), days = 14) {
  const end = new Date(fromDate.getTime() + days * 24 * 3600 * 1000);
  return end.toISOString().slice(0, 10);
}
