/**
 * AbroadYield domain types. Everything a country, city, tax rule or price can say lives
 * in data (seeded here, editable from the admin panel), never in presentation code.
 */

export type DataStatus = "sample" | "verified";

export interface Source {
  label: string;
  url?: string;
}

/** Provenance attached to every report section. */
export interface SectionMeta {
  sources: Source[];
  lastVerified: string; // ISO date
  verifiedBy: string;
}

export type Range = [number, number];

export type RiskKey = "currency" | "legal" | "liquidity" | "political" | "str" | "natural";

export interface Risk {
  key: RiskKey;
  level: number; // 1 (low) – 5 (high)
  summary: string;
  mitigation: string;
}

export interface CostItem {
  label: string;
  /** "pct" = share of purchase price (0.05 = 5%), "fixed" = USD amount. */
  kind: "pct" | "fixed";
  low: number;
  high: number;
  notes?: string;
}

export interface FinancingOption {
  name: string;
  available: "yes" | "limited" | "no";
  notes: string;
}

export interface TaxBracket {
  /** Upper bound of the bracket in the bracket's currency; null = no upper bound. */
  upTo: number | null;
  rate: number;
}

export interface LocalTaxRule {
  regimeName: string;
  /** "gross": rate applied to (gross collected × taxableShareOfGross); "net": rate applied to net operating income. */
  basis: "gross" | "net";
  rate: number;
  /** Optional progressive brackets (in USD) replacing the flat rate. */
  brackets?: TaxBracket[];
  taxableShareOfGross: number;
  /** Optional different flat rate for short-term rentals. */
  shortTermRate?: number;
  notes: string;
  treatyNotes: string;
  capitalGainsNotes: string;
  meta: SectionMeta;
}

export interface LifestyleScores {
  beach: number;
  city: number;
  lowCost: number;
  english: number;
  shortFlight: number;
  warm: number;
}

export interface Country {
  id: string;
  slug: string;
  name: string;
  currency: string;
  region: string;
  published: boolean;
  dataStatus: DataStatus;
  verifiedBy: string;
  lastVerified: string;
  tagline: string;
  summary: string;
  /** Optional city photograph (set from the admin panel; licensed images only). */
  imageUrl?: string;
  imageAlt?: string;
  keyRisk: string;
  minEntryPriceUsd: number;
  stability: number; // 0–10
  flightHoursFromNyc: number;
  lifestyle: LifestyleScores;
  residencyNotes: string;
  ownership: {
    status: "allowed" | "restricted";
    summary: string;
    restrictions: string[];
    documents: string[];
    timelineWeeks: Range;
    taxIdName: string;
    meta: SectionMeta;
  };
  acquisition: { items: CostItem[]; meta: SectionMeta };
  financing: {
    localBankForNonResidents: "yes" | "limited" | "no";
    maxLtvNonResident: number;
    downPaymentRange: Range;
    rateRange: Range;
    termYears: number;
    options: FinancingOption[];
    meta: SectionMeta;
  };
  rental: {
    grossYieldRange: Range;
    vacancyLong: number;
    managementLong: number;
    managementShort: number;
    maintenancePctOfPrice: number;
    insurancePctOfPrice: number;
    propertyTaxPctOfPrice: number;
    hoaMonthlyUsd: number;
    strFriendliness: number; // 0–10
    strRules: string;
    meta: SectionMeta;
  };
  localTax: LocalTaxRule;
  risks: { items: Risk[]; meta: SectionMeta };
  checklist: { steps: string[]; meta: SectionMeta };
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  dataStatus: DataStatus;
  pricePerSqmLocal: number;
  typicalUnitSqm: number;
  longTermRentMonthlyLocal: number;
  shortTermNightlyLocal: number;
  shortTermOccupancy: number; // 0–1
  strAllowed: "yes" | "restricted" | "no";
  strRules: string;
  highlight: string;
  meta: SectionMeta;
}

export type FilingStatus = "single" | "mfj" | "other";

export interface UsTaxParams {
  id: "us_tax";
  taxYear: number;
  dataStatus: DataStatus;
  federalBrackets: { single: TaxBracket[]; mfj: TaxBracket[] };
  standardDeduction: { single: number; mfj: number };
  niit: { rate: number; thresholdSingle: number; thresholdMfj: number };
  depreciation: { foreignResidentialYears: number; buildingShare: number };
  fbarThresholdUsd: number;
  fatca8938: {
    livingInUs: { single: Range; mfj: Range };
    livingAbroad: { single: Range; mfj: Range };
  };
  capitalGains: { longTermRates: number[]; notes: string };
  /** Representative state income tax rate applied to net foreign rental income. */
  stateRates: Record<string, { name: string; rate: number; notes?: string }>;
  notes: {
    scheduleE: string;
    foreignTaxCredit: string;
    depreciation: string;
    feie: string;
    reporting: string;
    capitalGains: string;
  };
  meta: SectionMeta;
}

export interface ScoringWeights {
  yield: number;
  taxEfficiency: number;
  entryCost: number;
  ownership: number;
  stability: number;
  lifestyle: number;
  financing: number;
  strFit: number;
  budgetFit: number;
}

export interface Settings {
  id: "settings";
  pricing: {
    fullReportUsd: number;
    explorerPassUsd: number;
    explorerPassDays: number;
    maxCountriesPerReport: number;
  };
  refundDays: number;
  validationMode: boolean;
  allowPromotionCodes: boolean;
  scoring: {
    weights: ScoringWeights;
    strongFitMin: number;
    possibleMin: number;
  };
  fx: {
    /** USD value of one unit of local currency. */
    usdPerUnit: Record<string, number>;
    sourceUrl: string;
    updatedAt: string;
    sourceLabel: string;
  };
  ai: { messagesPerHour: number };
  siteLastUpdated: string;
  /** The four figures on the landing page. Only publish claims you can substantiate. */
  homeStats: Array<{ value: string; label: string }>;
}

export type IncomeBracket = "lt75" | "75to150" | "150to250" | "250to500" | "gt500" | "skip";
export type Goal = "income" | "retirement" | "second_home" | "diversification";
export type Strategy = "long" | "short" | "unsure";
export type RiskTolerance = "low" | "medium" | "high";
export type LifestyleKey = keyof LifestyleScores;

export interface Profile {
  citizenship: "us_citizen" | "green_card" | "other" | "";
  residence: "us" | "abroad" | "";
  usState: string;
  income: IncomeBracket | "";
  filingStatus: FilingStatus | "";
  cashUsd: number | null;
  budgetUsd: number | null;
  budgetHelp: boolean;
  financing: "cash" | "mortgage" | "unsure" | "";
  goal: Goal | "";
  strategy: Strategy | "";
  risk: RiskTolerance | "";
  lifestyle: LifestyleKey[];
  email: string;
  marketingConsent: boolean;
}

export interface Partner {
  id: string;
  name: string;
  category: ExpertCategory;
  countries: string[];
  email: string;
  active: boolean;
  referralTerms: string;
}

export type ExpertCategory = "tax" | "mortgage" | "agent" | "attorney";
export type LeadStatus = "new" | "sent" | "contacted" | "converted";

export interface Lead {
  id: string;
  createdAt: string;
  category: ExpertCategory;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  countryId: string;
  budget: string;
  timeline: string;
  message: string;
  consent: true;
  status: LeadStatus;
  userId: string;
}

export type ProductKey = "report" | "pass";

export interface Order {
  id: string;
  createdAt: string;
  userId: string;
  email: string;
  product: ProductKey;
  amountUsd: number;
  status: "paid" | "refunded" | "demo";
  countryIds: string[];
  promoCode: string;
  stripeSessionId: string;
  expiresAt: string;
}

export interface SavedReport {
  id: string;
  createdAt: string;
  userId: string;
  countryIds: string[];
  orderId: string;
  profile: Profile;
}

export interface WaitlistEntry {
  id: string;
  createdAt: string;
  email: string;
  product: ProductKey;
  countryIds: string[];
}

export interface AnalyticsEvent {
  id: string;
  name: FunnelEvent;
  at: string;
  sessionId: string;
  props: Record<string, string | number | boolean>;
}

export type FunnelEvent =
  | "landing_view"
  | "questionnaire_start"
  | "questionnaire_step"
  | "questionnaire_complete"
  | "results_view"
  | "unlock_click"
  | "waitlist_join"
  | "checkout_start"
  | "purchase"
  | "report_view"
  | "simulator_change"
  | "pdf_download"
  | "expert_request"
  | "assistant_question"
  | "guide_view";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  published: boolean;
  author: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  collection: string;
  entityId: string;
  action: "create" | "update" | "delete";
  summary: string;
}
