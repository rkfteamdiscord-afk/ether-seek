import type { FilingStatus, LocalTaxRule, UsTaxParams } from "../types";
import { firstYearInterest, monthlyPayment } from "./finance";
import { localRentalTax, usRentalTax, type UsTaxResult } from "./tax";

export interface ScenarioInput {
  priceUsd: number;
  /** Rent at full occupancy for a long-term let, or short-term revenue at 100% of the assumed nights. */
  potentialRentUsd: number;
  strategy: "long" | "short";
  /** Share of potential rent not collected (vacancy, or unbooked nights). */
  vacancy: number;
  managementPct: number;
  maintenancePctOfPrice: number;
  insurancePctOfPrice: number;
  propertyTaxPctOfPrice: number;
  hoaAnnualUsd: number;
  acquisitionCostUsd: number;
  /** 1 = all cash. */
  downPaymentPct: number;
  interestRate: number;
  termYears: number;
  /**
   * Change in the local currency's value against the USD after purchase (0.1 = +10%).
   * Applied to rent and local running costs; the purchase price and the loan stay in USD.
   */
  fxChange: number;
  localTax: LocalTaxRule;
  us: {
    params: UsTaxParams;
    filing: FilingStatus;
    baseIncomeUsd: number;
    state: string | null;
  };
}

export interface WaterfallStep {
  key: string;
  label: string;
  /** Signed amount: positive for income and totals, negative for deductions. */
  value: number;
  kind: "start" | "deduction" | "subtotal" | "total";
}

export interface ScenarioResult {
  grossYield: number;
  potentialRentUsd: number;
  vacancyLossUsd: number;
  collectedRentUsd: number;
  managementUsd: number;
  maintenanceUsd: number;
  insuranceUsd: number;
  propertyTaxUsd: number;
  hoaUsd: number;
  operatingExpensesUsd: number;
  noiUsd: number;
  netYieldBeforeTax: number;
  localTaxUsd: number;
  us: UsTaxResult;
  federalTaxUsd: number;
  stateTaxUsd: number;
  totalTaxUsd: number;
  afterTaxIncomeUsd: number;
  afterTaxYield: number;
  loanUsd: number;
  downPaymentUsd: number;
  interestUsd: number;
  debtServiceUsd: number;
  annualCashFlowUsd: number;
  cashInvestedUsd: number;
  cashOnCash: number;
  waterfall: WaterfallStep[];
}

/**
 * Year-one returns for one property, step by step:
 *   potential rent − vacancy = collected rent
 *   − management, maintenance, insurance, property tax, condo/HOA = net operating income (NOI)
 *   NOI ÷ price = net yield before tax
 *   − local income tax − additional US federal tax (after FTC, incl. NIIT) − state tax = after-tax income
 *   after-tax income ÷ price = after-tax net yield
 *   after-tax income − debt service = annual cash flow
 */
export function computeScenario(input: ScenarioInput): ScenarioResult {
  const fx = 1 + input.fxChange;
  const price = Math.max(0, input.priceUsd);
  const potentialRentUsd = Math.max(0, input.potentialRentUsd) * fx;
  const vacancyLossUsd = potentialRentUsd * clamp01(input.vacancy);
  const collectedRentUsd = potentialRentUsd - vacancyLossUsd;
  const managementUsd = collectedRentUsd * input.managementPct;
  const maintenanceUsd = price * input.maintenancePctOfPrice * fx;
  const insuranceUsd = price * input.insurancePctOfPrice * fx;
  const propertyTaxUsd = price * input.propertyTaxPctOfPrice * fx;
  const hoaUsd = input.hoaAnnualUsd * fx;
  const operatingExpensesUsd =
    managementUsd + maintenanceUsd + insuranceUsd + propertyTaxUsd + hoaUsd;
  const noiUsd = collectedRentUsd - operatingExpensesUsd;

  const downPct = clamp01(input.downPaymentPct);
  const loanUsd = price * (1 - downPct);
  const downPaymentUsd = price - loanUsd;
  const interestUsd =
    loanUsd > 0 ? firstYearInterest(loanUsd, input.interestRate, input.termYears) : 0;
  const debtServiceUsd =
    loanUsd > 0 ? monthlyPayment(loanUsd, input.interestRate, input.termYears) * 12 : 0;

  const localTaxUsd = localRentalTax({
    rule: input.localTax,
    collectedRentUsd,
    netOperatingIncomeUsd: noiUsd,
    strategy: input.strategy,
  });
  const us = usRentalTax({
    params: input.us.params,
    filing: input.us.filing,
    baseIncomeUsd: input.us.baseIncomeUsd,
    netOperatingIncomeUsd: noiUsd,
    mortgageInterestUsd: interestUsd,
    depreciableBasisUsd: price + input.acquisitionCostUsd,
    foreignTaxPaidUsd: localTaxUsd,
    state: input.us.state,
  });
  const federalTaxUsd = us.additionalFederalUsd;
  const stateTaxUsd = us.stateTaxUsd;
  const totalTaxUsd = localTaxUsd + federalTaxUsd + stateTaxUsd;
  const afterTaxIncomeUsd = noiUsd - totalTaxUsd;
  const annualCashFlowUsd = afterTaxIncomeUsd - debtServiceUsd;
  const cashInvestedUsd = downPaymentUsd + input.acquisitionCostUsd;

  const waterfall: WaterfallStep[] = [
    { key: "gross", label: "Gross rent", value: potentialRentUsd, kind: "start" },
    {
      key: "vacancy",
      label: input.strategy === "short" ? "Unbooked nights" : "Vacancy",
      value: -vacancyLossUsd,
      kind: "deduction",
    },
    { key: "management", label: "Management", value: -managementUsd, kind: "deduction" },
    { key: "maintenance", label: "Maintenance", value: -maintenanceUsd, kind: "deduction" },
    { key: "insurance", label: "Insurance", value: -insuranceUsd, kind: "deduction" },
    { key: "propertyTax", label: "Property tax", value: -propertyTaxUsd, kind: "deduction" },
    { key: "hoa", label: "Condo / HOA fees", value: -hoaUsd, kind: "deduction" },
    { key: "noi", label: "Net operating income", value: noiUsd, kind: "subtotal" },
    { key: "localTax", label: "Local income tax", value: -localTaxUsd, kind: "deduction" },
    {
      key: "federal",
      label: "US federal tax (after credit)",
      value: -federalTaxUsd,
      kind: "deduction",
    },
    { key: "state", label: "US state tax", value: -stateTaxUsd, kind: "deduction" },
    {
      key: "afterTax",
      label: "After-tax income",
      value: afterTaxIncomeUsd,
      kind: loanUsd > 0 ? "subtotal" : "total",
    },
  ];
  if (loanUsd > 0) {
    waterfall.push({
      key: "debt",
      label: "Mortgage payments",
      value: -debtServiceUsd,
      kind: "deduction",
    });
    waterfall.push({
      key: "cashflow",
      label: "Annual cash flow",
      value: annualCashFlowUsd,
      kind: "total",
    });
  }

  return {
    grossYield: price > 0 ? potentialRentUsd / price : 0,
    potentialRentUsd,
    vacancyLossUsd,
    collectedRentUsd,
    managementUsd,
    maintenanceUsd,
    insuranceUsd,
    propertyTaxUsd,
    hoaUsd,
    operatingExpensesUsd,
    noiUsd,
    netYieldBeforeTax: price > 0 ? noiUsd / price : 0,
    localTaxUsd,
    us,
    federalTaxUsd,
    stateTaxUsd,
    totalTaxUsd,
    afterTaxIncomeUsd,
    afterTaxYield: price > 0 ? afterTaxIncomeUsd / price : 0,
    loanUsd,
    downPaymentUsd,
    interestUsd,
    debtServiceUsd,
    annualCashFlowUsd,
    cashInvestedUsd,
    cashOnCash: cashInvestedUsd > 0 ? annualCashFlowUsd / cashInvestedUsd : 0,
    waterfall,
  };
}

/** Positions for a waterfall chart: each bar floats from `base` to `base + height`. */
export function waterfallBars(
  steps: WaterfallStep[],
): Array<WaterfallStep & { base: number; height: number; running: number }> {
  let running = 0;
  return steps.map((step) => {
    if (step.kind === "start" || step.kind === "subtotal" || step.kind === "total") {
      running = step.value;
      return { ...step, base: Math.min(0, step.value), height: Math.abs(step.value), running };
    }
    const before = running;
    running += step.value;
    return { ...step, base: Math.min(before, running), height: Math.abs(step.value), running };
  });
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
