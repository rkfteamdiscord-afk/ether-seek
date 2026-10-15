import type { City, Country, FilingStatus, Profile, Settings, UsTaxParams } from "../types";
import { acquisitionCosts, toUsd } from "./finance";
import { computeScenario, type ScenarioInput, type ScenarioResult } from "./returns";

/** Midpoint household income for each questionnaire bracket (used as a base for marginal tax). */
export const INCOME_MIDPOINTS: Record<string, number> = {
  lt75: 55000,
  "75to150": 110000,
  "150to250": 200000,
  "250to500": 350000,
  gt500: 650000,
  skip: 110000,
  "": 110000,
};

export const DEFAULT_PRICE_USD = 300000;

export function baseIncome(profile: Pick<Profile, "income">): number {
  return INCOME_MIDPOINTS[profile.income] ?? 110000;
}

export function filingOf(profile: Pick<Profile, "filingStatus">): FilingStatus {
  return profile.filingStatus === "mfj" ? "mfj" : "single";
}

/** State tax applies only to US residents who chose a state. */
export function stateOf(profile: Pick<Profile, "residence" | "usState">): string | null {
  return profile.residence === "abroad" ? null : profile.usState || null;
}

export function strategyOf(profile: Pick<Profile, "strategy">): "long" | "short" {
  return profile.strategy === "short" ? "short" : "long";
}

/** Price we model when the user has not set one: their budget, but never below the country's entry price. */
export function representativePrice(country: Country, profile: Pick<Profile, "budgetUsd">): number {
  const budget = profile.budgetUsd ?? DEFAULT_PRICE_USD;
  return Math.max(country.minEntryPriceUsd, budget);
}

export interface CityMetrics {
  city: City;
  unitPriceUsd: number;
  pricePerSqmUsd: number;
  pricePerSqftUsd: number;
  longRentAnnualUsd: number;
  shortRevenueAnnualUsd: number;
  grossYieldLong: number;
  grossYieldShort: number;
  netYieldLong: number;
  netYieldShort: number;
}

const SQFT_PER_SQM = 10.7639;

export function cityMetrics(city: City, country: Country, settings: Settings): CityMetrics {
  const rates = settings.fx.usdPerUnit;
  const pricePerSqmUsd = toUsd(city.pricePerSqmLocal, country.currency, rates);
  const unitPriceUsd = pricePerSqmUsd * city.typicalUnitSqm;
  const longRentAnnualUsd = toUsd(city.longTermRentMonthlyLocal * 12, country.currency, rates);
  const shortRevenueAnnualUsd = toUsd(city.shortTermNightlyLocal * 365, country.currency, rates);
  const r = country.rental;
  const fixedCosts =
    unitPriceUsd * (r.maintenancePctOfPrice + r.insurancePctOfPrice + r.propertyTaxPctOfPrice) +
    r.hoaMonthlyUsd * 12;
  const netLong = longRentAnnualUsd * (1 - r.vacancyLong) * (1 - r.managementLong) - fixedCosts;
  const netShort =
    shortRevenueAnnualUsd * city.shortTermOccupancy * (1 - r.managementShort) - fixedCosts;
  return {
    city,
    unitPriceUsd,
    pricePerSqmUsd,
    pricePerSqftUsd: pricePerSqmUsd / SQFT_PER_SQM,
    longRentAnnualUsd,
    shortRevenueAnnualUsd: shortRevenueAnnualUsd * city.shortTermOccupancy,
    grossYieldLong: unitPriceUsd > 0 ? longRentAnnualUsd / unitPriceUsd : 0,
    grossYieldShort:
      unitPriceUsd > 0 ? (shortRevenueAnnualUsd * city.shortTermOccupancy) / unitPriceUsd : 0,
    netYieldLong: unitPriceUsd > 0 ? netLong / unitPriceUsd : 0,
    netYieldShort: unitPriceUsd > 0 ? netShort / unitPriceUsd : 0,
  };
}

export interface ScenarioOverrides {
  priceUsd?: number | undefined;
  potentialRentUsd?: number | undefined;
  vacancy?: number | undefined;
  interestRate?: number | undefined;
  downPaymentPct?: number | undefined;
  fxChange?: number | undefined;
  strategy?: "long" | "short" | undefined;
}

/**
 * Builds the default scenario for a country (and optionally a city) from the user's profile,
 * then applies simulator overrides. Without a city, rent comes from the country's mid gross yield.
 */
export function buildScenarioInput(args: {
  country: Country;
  city?: City | undefined;
  profile: Profile;
  settings: Settings;
  usTax: UsTaxParams;
  overrides?: ScenarioOverrides;
}): ScenarioInput {
  const { country, city, profile, settings, usTax, overrides = {} } = args;
  const strategy = overrides.strategy ?? strategyOf(profile);
  const metrics = city ? cityMetrics(city, country, settings) : null;
  const priceUsd =
    overrides.priceUsd ?? (metrics ? metrics.unitPriceUsd : representativePrice(country, profile));
  const midYield = (country.rental.grossYieldRange[0] + country.rental.grossYieldRange[1]) / 2;
  const potentialFromCity = metrics
    ? strategy === "short"
      ? metrics.shortRevenueAnnualUsd / Math.max(0.01, city?.shortTermOccupancy ?? 1)
      : metrics.longRentAnnualUsd
    : priceUsd * midYield * (strategy === "short" ? 1.25 / (1 - 0.35) : 1);
  // Scale city rent proportionally when the user changes the price, keeping the city's yield.
  const scaledRent =
    metrics && overrides.priceUsd !== undefined && metrics.unitPriceUsd > 0
      ? potentialFromCity * (overrides.priceUsd / metrics.unitPriceUsd)
      : potentialFromCity;
  const defaultVacancy =
    strategy === "short" ? 1 - (city?.shortTermOccupancy ?? 0.65) : country.rental.vacancyLong;
  const financed = profile.financing === "mortgage";
  const defaultDown = financed
    ? Math.max(country.financing.downPaymentRange[0], 1 - country.financing.maxLtvNonResident)
    : 1;
  return {
    priceUsd,
    potentialRentUsd: overrides.potentialRentUsd ?? scaledRent,
    strategy,
    vacancy: overrides.vacancy ?? defaultVacancy,
    managementPct:
      strategy === "short" ? country.rental.managementShort : country.rental.managementLong,
    maintenancePctOfPrice: country.rental.maintenancePctOfPrice,
    insurancePctOfPrice: country.rental.insurancePctOfPrice,
    propertyTaxPctOfPrice: country.rental.propertyTaxPctOfPrice,
    hoaAnnualUsd: country.rental.hoaMonthlyUsd * 12,
    acquisitionCostUsd: acquisitionCosts(priceUsd, country.acquisition.items, "mid").totalUsd,
    downPaymentPct: overrides.downPaymentPct ?? defaultDown,
    interestRate:
      overrides.interestRate ??
      (country.financing.rateRange[0] + country.financing.rateRange[1]) / 2,
    termYears: country.financing.termYears,
    fxChange: overrides.fxChange ?? 0,
    localTax: country.localTax,
    us: {
      params: usTax,
      filing: filingOf(profile),
      baseIncomeUsd: baseIncome(profile),
      state: stateOf(profile),
    },
  };
}

export function runScenario(args: Parameters<typeof buildScenarioInput>[0]): {
  input: ScenarioInput;
  result: ScenarioResult;
} {
  const input = buildScenarioInput(args);
  return { input, result: computeScenario(input) };
}
