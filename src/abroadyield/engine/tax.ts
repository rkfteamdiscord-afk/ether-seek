import type { FilingStatus, LocalTaxRule, TaxBracket, UsTaxParams } from "../types";

/**
 * Tax formulas. Every rate and threshold comes from editable parameters (admin panel);
 * nothing here hardcodes a tax rule. These are educational estimates, not tax advice.
 */

/** Tax on `amount` under progressive brackets (each `upTo` is the bracket's upper bound). */
export function progressiveTax(amount: number, brackets: TaxBracket[]): number {
  if (amount <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (amount > lower) tax += (Math.min(amount, upper) - lower) * bracket.rate;
    if (amount <= upper) break;
    lower = upper;
  }
  return tax;
}

/** Marginal rate that applies to the next dollar above `amount`. */
export function marginalRate(amount: number, brackets: TaxBracket[]): number {
  let lower = 0;
  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (amount < upper) return bracket.rate;
    lower = upper;
  }
  return brackets[brackets.length - 1]?.rate ?? 0;
}

export interface LocalTaxInput {
  rule: LocalTaxRule;
  collectedRentUsd: number;
  netOperatingIncomeUsd: number;
  strategy: "long" | "short";
}

/**
 * Local (host-country) income tax on rent.
 * - "gross" basis: rate × collected rent × taxable share (e.g. Costa Rica taxes 85% of gross).
 * - "net" basis: rate × max(0, net operating income).
 * Progressive brackets replace the flat rate when configured.
 */
export function localRentalTax({
  rule,
  collectedRentUsd,
  netOperatingIncomeUsd,
  strategy,
}: LocalTaxInput): number {
  const base =
    rule.basis === "gross"
      ? collectedRentUsd * rule.taxableShareOfGross
      : Math.max(0, netOperatingIncomeUsd);
  if (base <= 0) return 0;
  if (rule.brackets && rule.brackets.length > 0) return progressiveTax(base, rule.brackets);
  const rate =
    strategy === "short" && rule.shortTermRate !== undefined ? rule.shortTermRate : rule.rate;
  return base * rate;
}

export interface UsTaxInput {
  params: UsTaxParams;
  filing: FilingStatus;
  /** Household income before this property (AGI proxy). */
  baseIncomeUsd: number;
  /** Net operating income from the property in USD. */
  netOperatingIncomeUsd: number;
  mortgageInterestUsd: number;
  /** Depreciable basis = price + capitalised closing costs. */
  depreciableBasisUsd: number;
  foreignTaxPaidUsd: number;
  /** Two-letter state code, or null when no state tax applies (e.g. living abroad). */
  state: string | null;
}

export interface UsTaxResult {
  depreciationUsd: number;
  scheduleENetUsd: number;
  federalBeforeCreditUsd: number;
  foreignTaxCreditUsd: number;
  excessForeignTaxUsd: number;
  niitUsd: number;
  additionalFederalUsd: number;
  stateTaxUsd: number;
  stateRate: number;
  marginalFederalRate: number;
  passiveLossUsd: number;
}

const bracketsFor = (params: UsTaxParams, filing: FilingStatus) =>
  filing === "mfj" ? params.federalBrackets.mfj : params.federalBrackets.single;
const deductionFor = (params: UsTaxParams, filing: FilingStatus) =>
  filing === "mfj" ? params.standardDeduction.mfj : params.standardDeduction.single;
const niitThreshold = (params: UsTaxParams, filing: FilingStatus) =>
  filing === "mfj" ? params.niit.thresholdMfj : params.niit.thresholdSingle;

/**
 * Estimated US tax on foreign rental income.
 * 1. Schedule E net = NOI − mortgage interest − depreciation (basis × building share ÷ recovery years).
 * 2. Federal tax on the rent = tax(taxable income with the rent) − tax(taxable income without it),
 *    where taxable income = income − standard deduction (an unused deduction shelters rent).
 * 3. Foreign Tax Credit = min(foreign tax paid, §904 limitation). The limitation (Form 1116) is
 *    total US tax × foreign-source taxable income ÷ worldwide taxable income, with the standard
 *    deduction apportioned by income (Form 1116 line 3). Any excess is a carryforward, not a refund.
 * 4. NIIT (3.8%) on the lesser of net rent and MAGI above the threshold; the FTC does not offset it.
 * 5. State tax = state rate × net rent; most states give no credit for foreign tax.
 */
export function usRentalTax(input: UsTaxInput): UsTaxResult {
  const { params, filing } = input;
  const brackets = bracketsFor(params, filing);
  const depreciationUsd =
    (input.depreciableBasisUsd * params.depreciation.buildingShare) /
    params.depreciation.foreignResidentialYears;
  const scheduleENetUsd = input.netOperatingIncomeUsd - input.mortgageInterestUsd - depreciationUsd;
  const taxableNet = Math.max(0, scheduleENetUsd);
  const deduction = deductionFor(params, filing);
  const baseIncome = Math.max(0, input.baseIncomeUsd);
  const baseTaxable = Math.max(0, baseIncome - deduction);
  const totalTaxable = Math.max(0, baseIncome + taxableNet - deduction);
  const totalTaxUsd = progressiveTax(totalTaxable, brackets);
  const federalBeforeCreditUsd = totalTaxUsd - progressiveTax(baseTaxable, brackets);
  // §904 limitation: the deduction is apportioned to the rent pro rata to income.
  const grossIncome = baseIncome + taxableNet;
  const foreignTaxable = Math.max(
    0,
    taxableNet - (grossIncome > 0 ? (deduction * taxableNet) / grossIncome : 0),
  );
  const ftcLimitUsd =
    totalTaxable > 0 ? totalTaxUsd * Math.min(1, foreignTaxable / totalTaxable) : 0;
  const foreignTaxCreditUsd = Math.min(
    input.foreignTaxPaidUsd,
    ftcLimitUsd,
    federalBeforeCreditUsd,
  );
  const excessForeignTaxUsd = Math.max(0, input.foreignTaxPaidUsd - foreignTaxCreditUsd);
  const magi = input.baseIncomeUsd + taxableNet;
  const niitUsd =
    params.niit.rate * Math.max(0, Math.min(taxableNet, magi - niitThreshold(params, filing)));
  const stateRate = input.state ? (params.stateRates[input.state]?.rate ?? 0) : 0;
  const stateTaxUsd = taxableNet * stateRate;
  return {
    depreciationUsd,
    scheduleENetUsd,
    federalBeforeCreditUsd,
    foreignTaxCreditUsd,
    excessForeignTaxUsd,
    niitUsd,
    additionalFederalUsd: federalBeforeCreditUsd - foreignTaxCreditUsd + niitUsd,
    stateTaxUsd,
    stateRate,
    marginalFederalRate: marginalRate(totalTaxable, brackets),
    passiveLossUsd: Math.max(0, -scheduleENetUsd),
  };
}

export interface ReportingFlag {
  form: string;
  required: "likely" | "possible" | "not_expected";
  explanation: string;
}

/** Which US information returns may apply, using thresholds stored as parameters. */
export function reportingFlags(
  params: UsTaxParams,
  opts: { filing: FilingStatus; residence: "us" | "abroad"; foreignAccountPeakUsd: number },
): ReportingFlag[] {
  const fatca =
    opts.residence === "abroad" ? params.fatca8938.livingAbroad : params.fatca8938.livingInUs;
  const [yearEnd, anyTime] = opts.filing === "mfj" ? fatca.mfj : fatca.single;
  const fbar = opts.foreignAccountPeakUsd > params.fbarThresholdUsd;
  const form8938 = opts.foreignAccountPeakUsd > anyTime;
  const form8938Possible = opts.foreignAccountPeakUsd > yearEnd;
  return [
    {
      form: "FBAR (FinCEN 114)",
      required: fbar ? "likely" : "possible",
      explanation: `Required when all your foreign accounts together exceed $${params.fbarThresholdUsd.toLocaleString("en-US")} at any time in the year. Rent deposits and purchase funds often pass through a local account.`,
    },
    {
      form: "Form 8938 (FATCA)",
      required: form8938 ? "likely" : form8938Possible ? "possible" : "not_expected",
      explanation: `For your situation the thresholds are $${yearEnd.toLocaleString("en-US")} at year end or $${anyTime.toLocaleString("en-US")} at any time. Real estate held directly is not reported; foreign accounts and entities are.`,
    },
    {
      form: "Schedule E (Form 1040)",
      required: "likely",
      explanation: "Rental income and expenses are reported every year, converted to US dollars.",
    },
    {
      form: "Form 1116 (Foreign Tax Credit)",
      required: "possible",
      explanation: "Used to claim a credit for income tax paid abroad on the rent.",
    },
  ];
}
