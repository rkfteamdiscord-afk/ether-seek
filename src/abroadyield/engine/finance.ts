import type { CostItem, Range, Settings } from "../types";

/** Converts an amount in local currency to USD with the configured rate table. */
export function toUsd(
  amountLocal: number,
  currency: string,
  rates: Settings["fx"]["usdPerUnit"],
): number {
  const rate = rates[currency];
  if (rate === undefined || !(rate > 0)) throw new Error(`Missing exchange rate for ${currency}`);
  return amountLocal * rate;
}

/** Converts USD to local currency with the configured rate table. */
export function fromUsd(
  amountUsd: number,
  currency: string,
  rates: Settings["fx"]["usdPerUnit"],
): number {
  const rate = rates[currency];
  if (rate === undefined || !(rate > 0)) throw new Error(`Missing exchange rate for ${currency}`);
  return amountUsd / rate;
}

/**
 * Fixed-rate amortizing loan payment per month.
 * payment = P·r / (1 − (1 + r)^−n), with r the monthly rate and n the number of months.
 * A zero rate falls back to straight principal repayment.
 */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  const r = annualRate / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Interest paid during the first 12 months of an amortizing loan (deductible on Schedule E). */
export function firstYearInterest(principal: number, annualRate: number, years: number): number {
  const payment = monthlyPayment(principal, annualRate, years);
  const r = annualRate / 12;
  let balance = principal;
  let interest = 0;
  for (let month = 0; month < Math.min(12, Math.round(years * 12)); month++) {
    const monthInterest = balance * r;
    interest += monthInterest;
    balance -= payment - monthInterest;
  }
  return interest;
}

/** Present value of a stream of monthly payments: the loan a payment can support. */
export function loanFromPayment(payment: number, annualRate: number, years: number): number {
  if (payment <= 0 || years <= 0) return 0;
  const n = Math.round(years * 12);
  const r = annualRate / 12;
  if (r === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + r, -n))) / r;
}

export interface BorrowingInput {
  annualIncomeUsd: number;
  /** Share of gross monthly income lenders accept for this new payment (indicative). */
  debtToIncome: number;
  annualRate: number;
  termYears: number;
  maxLtv: number;
  priceUsd: number;
  cashUsd: number | null;
}

export interface BorrowingResult {
  loanFromIncome: number;
  loanFromLtv: number;
  maxLoan: number;
  /** Highest price reachable with the available cash plus the loan (ignoring closing costs). */
  maxPriceWithCash: number | null;
  limitedBy: "income" | "ltv";
}

/** Indicative borrowing capacity: the lower of what income supports and what the lender's LTV cap allows. */
export function borrowingCapacity(input: BorrowingInput): BorrowingResult {
  const maxPayment = (input.annualIncomeUsd / 12) * input.debtToIncome;
  const loanFromIncome = loanFromPayment(maxPayment, input.annualRate, input.termYears);
  const loanFromLtv = input.priceUsd * input.maxLtv;
  const maxLoan = Math.max(0, Math.min(loanFromIncome, loanFromLtv));
  const maxPriceWithCash =
    input.cashUsd === null
      ? null
      : Math.min(
          input.cashUsd / Math.max(0.0001, 1 - input.maxLtv),
          input.cashUsd + loanFromIncome,
        );
  return {
    loanFromIncome,
    loanFromLtv,
    maxLoan,
    maxPriceWithCash,
    limitedBy: loanFromIncome < loanFromLtv ? "income" : "ltv",
  };
}

export interface AcquisitionLine {
  label: string;
  amountUsd: number;
  notes?: string;
}

export interface AcquisitionResult {
  lines: AcquisitionLine[];
  totalUsd: number;
  pctOfPrice: number;
}

/** One-time purchase costs at the low, mid or high end of each configured range. */
export function acquisitionCosts(
  priceUsd: number,
  items: CostItem[],
  level: "low" | "mid" | "high" = "mid",
): AcquisitionResult {
  const pick = (low: number, high: number) =>
    level === "low" ? low : level === "high" ? high : (low + high) / 2;
  const lines = items.map((item) => {
    const value = pick(item.low, item.high);
    const amountUsd = item.kind === "pct" ? priceUsd * value : value;
    return item.notes
      ? { label: item.label, amountUsd, notes: item.notes }
      : { label: item.label, amountUsd };
  });
  const totalUsd = lines.reduce((sum, line) => sum + line.amountUsd, 0);
  return { lines, totalUsd, pctOfPrice: priceUsd > 0 ? totalUsd / priceUsd : 0 };
}

/** Closing costs as a share of price for a given price, as a [low, high] range. */
export function acquisitionRangePct(priceUsd: number, items: CostItem[]): Range {
  return [
    acquisitionCosts(priceUsd, items, "low").pctOfPrice,
    acquisitionCosts(priceUsd, items, "high").pctOfPrice,
  ];
}
