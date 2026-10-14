export type HorseType = "club" | "pension" | "proprietaire";

export type ActivityKey = "pensions" | "cours" | "stages" | "balades" | "competition" | "autres";

export type RevenueKind = Exclude<ActivityKey, "pensions">;

export type LessonFormat = "forfait" | "carte" | "unite";

export type Recurrence = "mensuelle" | "ponctuelle";

export type ExpenseCategory =
  | "foin"
  | "paille"
  | "granules"
  | "veterinaire"
  | "marechal"
  | "dentiste"
  | "complements"
  | "salaires"
  | "electricite"
  | "eau"
  | "assurance"
  | "entretien"
  | "materiel"
  | "loyer"
  | "autre";

export type PlanKey = "essai" | "essentiel" | "pro";

/** Month key in the form "2026-10". */
export type MonthKey = string;

export interface Structure {
  id: string;
  name: string;
  declaredHorseCount: number;
  activities: ActivityKey[];
  mainExpenses: ExpenseCategory[];
  /** Usual number of lessons given each week, used by the simulator. */
  lessonsPerWeek: number;
  plan: PlanKey;
  trialEndsAt: string;
  /** True while the workspace still holds the fictional sample centre. */
  isDemo: boolean;
  onboarded: boolean;
  createdAt: string;
}

export interface Horse {
  id: string;
  name: string;
  type: HorseType;
  arrivalDate: string;
  departureDate: string | null;
  /** Monthly board price billed to the owner (pension horses only). */
  monthlyPrice: number;
  /** Hours of lessons per week (club horses only), used to share lesson income. */
  lessonsPerWeek: number;
  notes: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  date: string;
  recurrence: Recurrence;
  /** Last month of a monthly expense, inclusive. Null means "still running". */
  endDate: string | null;
  /** Null for a shared expense split between all horses. */
  horseId: string | null;
}

export interface Revenue {
  id: string;
  kind: RevenueKind;
  lessonFormat: LessonFormat | null;
  label: string;
  amount: number;
  date: string;
  recurrence: Recurrence;
  endDate: string | null;
}

export interface Workspace {
  structure: Structure;
  horses: Horse[];
  expenses: Expense[];
  revenues: Revenue[];
}
