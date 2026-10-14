import type {
  ActivityKey,
  ExpenseCategory,
  HorseType,
  LessonFormat,
  PlanKey,
  RevenueKind,
} from "./types";

export const horseTypes: Record<HorseType, { label: string; short: string; help: string }> = {
  club: {
    label: "Cheval de club",
    short: "Club",
    help: "Appartient à la structure et travaille en cours, stages ou balades.",
  },
  pension: {
    label: "Cheval en pension",
    short: "Pension",
    help: "Appartient à un client qui vous paie une pension chaque mois.",
  },
  proprietaire: {
    label: "Cheval de propriétaire",
    short: "Propriétaire",
    help: "Votre cheval personnel ou celui de la structure, hors cours et sans pension (compétition, retraite, jeune cheval).",
  },
};

export const activities: Record<ActivityKey, { label: string; help: string }> = {
  pensions: { label: "Pensions", help: "Chevaux de clients hébergés et soignés chez vous." },
  cours: { label: "Cours", help: "Forfaits, cartes et cours à l'unité." },
  stages: { label: "Stages", help: "Stages pendant les vacances, passages de galops." },
  balades: { label: "Balades", help: "Promenades et randonnées." },
  competition: {
    label: "Compétition",
    help: "Engagements, coaching et chevaux de propriétaire.",
  },
  autres: { label: "Autres", help: "Anniversaires, location de carrière, divers." },
};

export const onboardingActivities: ActivityKey[] = [
  "cours",
  "pensions",
  "stages",
  "balades",
  "competition",
];

export const revenueKinds: RevenueKind[] = ["cours", "stages", "balades", "competition", "autres"];

export const lessonFormats: Record<LessonFormat, string> = {
  forfait: "Forfait annuel ou trimestriel",
  carte: "Carte de cours",
  unite: "Cours à l'unité",
};

export const expenseCategories: Record<
  ExpenseCategory,
  { label: string; perHorse: boolean; variable: boolean }
> = {
  foin: { label: "Foin", perHorse: false, variable: true },
  paille: { label: "Paille / litière", perHorse: false, variable: true },
  granules: { label: "Granulés / aliments", perHorse: false, variable: true },
  veterinaire: { label: "Vétérinaire", perHorse: true, variable: true },
  marechal: { label: "Maréchal-ferrant", perHorse: true, variable: true },
  dentiste: { label: "Dentiste", perHorse: true, variable: true },
  complements: { label: "Compléments", perHorse: true, variable: true },
  salaires: { label: "Salaires", perHorse: false, variable: false },
  electricite: { label: "Électricité", perHorse: false, variable: false },
  eau: { label: "Eau", perHorse: false, variable: false },
  assurance: { label: "Assurance", perHorse: false, variable: false },
  entretien: { label: "Entretien des installations", perHorse: false, variable: false },
  materiel: { label: "Matériel", perHorse: false, variable: false },
  loyer: { label: "Loyer ou crédit", perHorse: false, variable: false },
  autre: { label: "Autre dépense", perHorse: false, variable: false },
};

export const expenseCategoryOrder = Object.keys(expenseCategories) as ExpenseCategory[];

export const plans: Record<
  PlanKey,
  { label: string; pricePerMonth: number; horseLimit: number | null; advancedSimulator: boolean }
> = {
  essai: { label: "Essai gratuit", pricePerMonth: 0, horseLimit: null, advancedSimulator: true },
  essentiel: {
    label: "Essentiel",
    pricePerMonth: 49,
    horseLimit: 20,
    advancedSimulator: false,
  },
  pro: { label: "Pro", pricePerMonth: 79, horseLimit: null, advancedSimulator: true },
};

/** Commercial terms shared by the landing page, onboarding and settings. */
export const offer = {
  trialDays: 14,
  trialNeedsCard: false,
  essentielHorseLimit: 20,
} as const;
