import type { Country, Profile, ScoringWeights, Settings, UsTaxParams } from "../types";
import { acquisitionRangePct } from "./finance";
import { computeScenario } from "./returns";
import { buildScenarioInput, representativePrice } from "./scenario";

export type Badge = "strong" | "possible" | "not";

export type FactorKey = keyof ScoringWeights;

export interface Factor {
  key: FactorKey;
  label: string;
  /** 0–100, higher is better for this user. */
  value: number;
  weight: number;
  explanation: string;
}

export interface CountryScore {
  country: Country;
  score: number;
  badge: Badge;
  factors: Factor[];
  belowBudget: boolean;
  representativePriceUsd: number;
  afterTaxYield: number;
  netYieldBeforeTax: number;
  closingCostPct: [number, number];
}

export const FACTOR_LABELS: Record<FactorKey, string> = {
  yield: "After-tax yield",
  taxEfficiency: "Tax efficiency",
  entryCost: "Closing costs",
  ownership: "Ownership rules",
  stability: "Stability & risk",
  lifestyle: "Lifestyle fit",
  financing: "Financing access",
  strFit: "Short-term rental fit",
  budgetFit: "Budget fit",
};

/** Linear map of `value` from [low, high] to 0–100, clamped. */
export function scale(value: number, low: number, high: number): number {
  if (high === low) return 50;
  return Math.round(Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100)));
}

/**
 * Weight multipliers from the user's goal and risk tolerance. Base weights come from the admin
 * scoring editor; these only tilt them so the same data ranks differently for different people.
 */
export function adjustedWeights(base: ScoringWeights, profile: Profile): ScoringWeights {
  const w = { ...base };
  const multiply = (key: FactorKey, factor: number) => (w[key] = w[key] * factor);
  if (profile.risk === "low") {
    multiply("stability", 1.6);
    multiply("yield", 0.8);
    multiply("ownership", 1.3);
  } else if (profile.risk === "high") {
    multiply("yield", 1.3);
    multiply("stability", 0.6);
  }
  switch (profile.goal) {
    case "income":
      multiply("yield", 1.3);
      multiply("taxEfficiency", 1.2);
      break;
    case "retirement":
      multiply("lifestyle", 1.6);
      multiply("stability", 1.2);
      break;
    case "second_home":
      multiply("lifestyle", 1.4);
      multiply("strFit", 1.3);
      break;
    case "diversification":
      multiply("stability", 1.2);
      multiply("entryCost", 1.2);
      break;
  }
  // Factors that do not apply to this user drop out instead of scoring a neutral 50.
  if (profile.financing === "cash") w.financing = 0;
  if (profile.financing === "unsure" || profile.financing === "") w.financing *= 0.5;
  if (profile.strategy === "long") w.strFit = 0;
  if (profile.strategy === "unsure" || profile.strategy === "") w.strFit *= 0.5;
  if (profile.budgetUsd === null) w.budgetFit = 0;
  return w;
}

export function scoreCountry(
  country: Country,
  profile: Profile,
  settings: Settings,
  usTax: UsTaxParams,
): CountryScore {
  const weights = adjustedWeights(settings.scoring.weights, profile);
  const price = representativePrice(country, profile);
  const result = computeScenario(buildScenarioInput({ country, profile, settings, usTax }));
  const closingCostPct = acquisitionRangePct(price, country.acquisition.items);
  const closingMid = (closingCostPct[0] + closingCostPct[1]) / 2;
  const taxKeep = result.noiUsd > 0 ? result.afterTaxIncomeUsd / result.noiUsd : 0;
  const avgRisk =
    country.risks.items.reduce((sum, risk) => sum + risk.level, 0) /
    Math.max(1, country.risks.items.length);
  const lifestyleValue =
    profile.lifestyle.length === 0
      ? 60
      : Math.round(
          (profile.lifestyle.reduce((sum, key) => sum + country.lifestyle[key], 0) /
            profile.lifestyle.length) *
            10,
        );
  const financingValue = { yes: 100, limited: 50, no: 15 }[
    country.financing.localBankForNonResidents
  ];
  const belowBudget = profile.budgetUsd !== null && profile.budgetUsd < country.minEntryPriceUsd;
  const budgetValue =
    profile.budgetUsd === null
      ? 50
      : belowBudget
        ? 10
        : profile.budgetUsd >= country.minEntryPriceUsd * 1.5
          ? 100
          : 70;

  const raw: Array<[FactorKey, number, string]> = [
    [
      "yield",
      scale(result.afterTaxYield, 0.01, 0.045),
      `About ${(result.afterTaxYield * 100).toFixed(1)}% a year after costs and taxes on a ${Math.round(price / 1000)}k purchase.`,
    ],
    [
      "taxEfficiency",
      scale(taxKeep, 0.4, 0.95),
      `You keep about ${Math.round(taxKeep * 100)}% of net rent after local and US taxes.`,
    ],
    [
      "entryCost",
      scale(closingMid, 0.14, 0.03),
      `One-time buying costs are around ${(closingMid * 100).toFixed(1)}% of the price.`,
    ],
    [
      "ownership",
      country.ownership.status === "allowed" ? 100 : profile.risk === "low" ? 40 : 55,
      country.ownership.status === "allowed"
        ? "Americans can own property directly."
        : "Ownership is restricted in some areas.",
    ],
    [
      "stability",
      Math.round(country.stability * 10 * 0.6 + ((5 - avgRisk) / 4) * 100 * 0.4),
      `Stability ${country.stability}/10 with an average risk level of ${avgRisk.toFixed(1)}/5.`,
    ],
    [
      "lifestyle",
      lifestyleValue,
      profile.lifestyle.length === 0
        ? "No lifestyle preferences selected."
        : "Based on the lifestyle preferences you selected.",
    ],
    [
      "financing",
      financingValue,
      `Local mortgages for non-residents: ${country.financing.localBankForNonResidents}.`,
    ],
    [
      "strFit",
      country.rental.strFriendliness * 10,
      `Short-term rental friendliness ${country.rental.strFriendliness}/10.`,
    ],
    [
      "budgetFit",
      budgetValue,
      belowBudget
        ? `Typical entry prices start around $${country.minEntryPriceUsd.toLocaleString("en-US")}, above your budget.`
        : "Your budget covers typical entry prices.",
    ],
  ];
  const factors: Factor[] = raw.map(([key, value, explanation]) => ({
    key,
    label: FACTOR_LABELS[key],
    value,
    weight: weights[key],
    explanation,
  }));
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const score =
    totalWeight > 0
      ? Math.round(factors.reduce((sum, f) => sum + f.value * f.weight, 0) / totalWeight)
      : 0;
  const badge: Badge = belowBudget
    ? "not"
    : score >= settings.scoring.strongFitMin
      ? "strong"
      : score >= settings.scoring.possibleMin
        ? "possible"
        : "not";
  return {
    country,
    score,
    badge,
    factors,
    belowBudget,
    representativePriceUsd: price,
    afterTaxYield: result.afterTaxYield,
    netYieldBeforeTax: result.netYieldBeforeTax,
    closingCostPct,
  };
}

/** All published countries, best score first (ties broken by name for a stable order). */
export function rankCountries(
  countries: Country[],
  profile: Profile,
  settings: Settings,
  usTax: UsTaxParams,
): CountryScore[] {
  return countries
    .filter((country) => country.published)
    .map((country) => scoreCountry(country, profile, settings, usTax))
    .sort((a, b) => b.score - a.score || a.country.name.localeCompare(b.country.name));
}

/** The two strongest and the weakest weighted factors, for a short "why" line. */
export function explainScore(score: CountryScore): {
  strengths: Factor[];
  weakness: Factor | undefined;
} {
  const active = score.factors.filter((f) => f.weight > 0);
  const sorted = [...active].sort((a, b) => b.value - a.value);
  return { strengths: sorted.slice(0, 2), weakness: sorted[sorted.length - 1] };
}
