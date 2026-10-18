import { describe, expect, test } from "bun:test";
import { seedCities, seedCountries } from "../data/countries";
import { seedSettings, seedUsTax } from "../data/config";
import { emptyProfile } from "../profile";
import type { Country, LocalTaxRule, Profile } from "../types";
import {
  acquisitionCosts,
  adjustedWeights,
  borrowingCapacity,
  buildScenarioInput,
  cityMetrics,
  computeScenario,
  executiveSummary,
  firstYearInterest,
  formatPct,
  formatUsd,
  fromUsd,
  loanFromPayment,
  localRentalTax,
  marginalRate,
  monthlyPayment,
  progressiveTax,
  rankCountries,
  reportingFlags,
  roughly,
  scale,
  scoreCountry,
  toUsd,
  usRentalTax,
  waterfallBars,
  type ScenarioInput,
} from "./index";

const country = (id: string): Country => {
  const found = seedCountries.find((c) => c.id === id);
  if (!found) throw new Error(id);
  return found;
};

const profile = (overrides: Partial<Profile> = {}): Profile => ({
  ...emptyProfile,
  citizenship: "us_citizen",
  residence: "us",
  usState: "TX",
  income: "150to250",
  filingStatus: "mfj",
  cashUsd: 150000,
  budgetUsd: 300000,
  financing: "cash",
  goal: "income",
  strategy: "long",
  risk: "medium",
  ...overrides,
});

const flatRule = (overrides: Partial<LocalTaxRule> = {}): LocalTaxRule => ({
  ...country("pt").localTax,
  ...overrides,
});

describe("format", () => {
  test("US-style dollars", () => {
    expect(formatUsd(1234.56, { cents: true })).toBe("$1,234.56");
    expect(formatUsd(1234.56)).toBe("$1,235");
    expect(formatUsd(-500)).toBe("-$500");
    expect(formatUsd(Number.NaN)).toBe("—");
  });
  test("percentages", () => {
    expect(formatPct(0.0425)).toBe("4.3%");
    expect(formatPct(0.0425, 2)).toBe("4.25%");
  });
  test("roughly rounds for plain-English sentences", () => {
    expect(roughly(9742)).toBe(9700);
    expect(roughly(123456)).toBe(123500);
  });
});

describe("currency conversion", () => {
  const rates = { USD: 1, EUR: 1.1 };
  test("local → USD and back", () => {
    expect(toUsd(100, "EUR", rates)).toBeCloseTo(110, 6);
    expect(fromUsd(110, "EUR", rates)).toBeCloseTo(100, 6);
  });
  test("missing rate throws instead of silently returning 0", () => {
    expect(() => toUsd(1, "JPY", rates)).toThrow();
  });
});

describe("mortgage maths", () => {
  test("standard amortizing payment", () => {
    // $200,000 at 6% over 30 years = $1,199.10/month (textbook value).
    expect(monthlyPayment(200000, 0.06, 30)).toBeCloseTo(1199.1, 1);
  });
  test("zero rate repays principal evenly", () => {
    expect(monthlyPayment(120000, 0, 10)).toBeCloseTo(1000, 6);
  });
  test("no loan, no payment", () => {
    expect(monthlyPayment(0, 0.05, 30)).toBe(0);
  });
  test("first-year interest is slightly below rate × principal", () => {
    const interest = firstYearInterest(200000, 0.06, 30);
    expect(interest).toBeLessThan(12000);
    expect(interest).toBeGreaterThan(11800);
  });
  test("loanFromPayment inverts monthlyPayment", () => {
    const payment = monthlyPayment(250000, 0.05, 25);
    expect(loanFromPayment(payment, 0.05, 25)).toBeCloseTo(250000, 4);
  });
  test("borrowing capacity is the lower of income and LTV limits", () => {
    const result = borrowingCapacity({
      annualIncomeUsd: 120000,
      debtToIncome: 0.3,
      annualRate: 0.05,
      termYears: 25,
      maxLtv: 0.6,
      priceUsd: 400000,
      cashUsd: 100000,
    });
    expect(result.loanFromLtv).toBe(240000);
    expect(result.maxLoan).toBe(Math.min(result.loanFromIncome, 240000));
    expect(result.limitedBy).toBe(result.loanFromIncome < 240000 ? "income" : "ltv");
    expect(result.maxPriceWithCash).toBeCloseTo(
      Math.min(100000 / 0.4, 100000 + result.loanFromIncome),
      4,
    );
  });
});

describe("acquisition costs", () => {
  const items = [
    { label: "Transfer tax", kind: "pct" as const, low: 0.05, high: 0.07 },
    { label: "Setup", kind: "fixed" as const, low: 500, high: 1500 },
  ];
  test("mid uses the midpoint of each range", () => {
    const result = acquisitionCosts(200000, items, "mid");
    expect(result.totalUsd).toBeCloseTo(200000 * 0.06 + 1000, 6);
    expect(result.pctOfPrice).toBeCloseTo((12000 + 1000) / 200000, 6);
  });
  test("low and high bracket the mid", () => {
    expect(acquisitionCosts(200000, items, "low").totalUsd).toBeCloseTo(10500, 6);
    expect(acquisitionCosts(200000, items, "high").totalUsd).toBeCloseTo(15500, 6);
  });
});

describe("progressive tax", () => {
  const brackets = [
    { upTo: 10000, rate: 0.1 },
    { upTo: 40000, rate: 0.2 },
    { upTo: null, rate: 0.3 },
  ];
  test("sums each bracket slice", () => {
    expect(progressiveTax(5000, brackets)).toBeCloseTo(500, 6);
    expect(progressiveTax(40000, brackets)).toBeCloseTo(1000 + 6000, 6);
    expect(progressiveTax(50000, brackets)).toBeCloseTo(1000 + 6000 + 3000, 6);
  });
  test("zero and negative income pay nothing", () => {
    expect(progressiveTax(0, brackets)).toBe(0);
    expect(progressiveTax(-100, brackets)).toBe(0);
  });
  test("marginal rate", () => {
    expect(marginalRate(5000, brackets)).toBe(0.1);
    expect(marginalRate(10000, brackets)).toBe(0.2);
    expect(marginalRate(1e9, brackets)).toBe(0.3);
  });
});

describe("local rental tax", () => {
  test("net basis taxes NOI", () => {
    expect(
      localRentalTax({
        rule: flatRule({ basis: "net", rate: 0.25 }),
        collectedRentUsd: 20000,
        netOperatingIncomeUsd: 12000,
        strategy: "long",
      }),
    ).toBeCloseTo(3000, 6);
  });
  test("net basis never goes negative", () => {
    expect(
      localRentalTax({
        rule: flatRule({ basis: "net", rate: 0.25 }),
        collectedRentUsd: 2000,
        netOperatingIncomeUsd: -5000,
        strategy: "long",
      }),
    ).toBe(0);
  });
  test("gross basis with taxable share (Costa Rica style 15% × 85%)", () => {
    expect(
      localRentalTax({
        rule: flatRule({ basis: "gross", rate: 0.15, taxableShareOfGross: 0.85 }),
        collectedRentUsd: 20000,
        netOperatingIncomeUsd: 12000,
        strategy: "long",
      }),
    ).toBeCloseTo(2550, 6);
  });
  test("short-term rate overrides the flat rate", () => {
    expect(
      localRentalTax({
        rule: flatRule({ basis: "gross", rate: 0.21, shortTermRate: 0.26, taxableShareOfGross: 1 }),
        collectedRentUsd: 10000,
        netOperatingIncomeUsd: 0,
        strategy: "short",
      }),
    ).toBeCloseTo(2600, 6);
  });
  test("brackets replace the flat rate", () => {
    const rule = flatRule({
      basis: "gross",
      taxableShareOfGross: 1,
      brackets: [
        { upTo: 10000, rate: 0.15 },
        { upTo: null, rate: 0.35 },
      ],
    });
    expect(
      localRentalTax({ rule, collectedRentUsd: 20000, netOperatingIncomeUsd: 0, strategy: "long" }),
    ).toBeCloseTo(1500 + 3500, 6);
  });
});

describe("US tax on foreign rent", () => {
  const base = {
    params: seedUsTax,
    filing: "single" as const,
    baseIncomeUsd: 100000,
    netOperatingIncomeUsd: 15000,
    mortgageInterestUsd: 0,
    depreciableBasisUsd: 300000,
    foreignTaxPaidUsd: 0,
    state: null,
  };
  test("depreciation = basis × building share ÷ recovery years", () => {
    const result = usRentalTax(base);
    expect(result.depreciationUsd).toBeCloseTo(
      (300000 * seedUsTax.depreciation.buildingShare) /
        seedUsTax.depreciation.foreignResidentialYears,
      6,
    );
    expect(result.scheduleENetUsd).toBeCloseTo(15000 - result.depreciationUsd, 6);
  });
  test("federal tax is the incremental tax on top of existing income", () => {
    const result = usRentalTax(base);
    const baseTaxable = 100000 - seedUsTax.standardDeduction.single;
    const expected =
      progressiveTax(baseTaxable + result.scheduleENetUsd, seedUsTax.federalBrackets.single) -
      progressiveTax(baseTaxable, seedUsTax.federalBrackets.single);
    expect(result.federalBeforeCreditUsd).toBeCloseTo(expected, 6);
    expect(result.additionalFederalUsd).toBeCloseTo(expected, 6); // no foreign tax, no credit, below NIIT threshold
  });
  test("FTC follows the §904 limitation (Form 1116); excess carries forward", () => {
    const result = usRentalTax({ ...base, foreignTaxPaidUsd: 50000 });
    // Hand computation: deduction apportioned to the rent pro rata to income (Form 1116 line 3).
    const ded = seedUsTax.standardDeduction.single;
    const net = result.scheduleENetUsd;
    const totalTaxable = 100000 + net - ded;
    const foreignTaxable = net - (ded * net) / (100000 + net);
    const totalTax = progressiveTax(totalTaxable, seedUsTax.federalBrackets.single);
    const limit = (totalTax * foreignTaxable) / totalTaxable;
    expect(result.foreignTaxCreditUsd).toBeCloseTo(limit, 6);
    expect(result.excessForeignTaxUsd).toBeCloseTo(50000 - limit, 6);
    // The average-rate limit is below the incremental tax, so some US tax can remain.
    expect(result.foreignTaxCreditUsd).toBeLessThanOrEqual(result.federalBeforeCreditUsd);
    expect(result.additionalFederalUsd).toBeCloseTo(result.federalBeforeCreditUsd - limit, 6);
  });
  test("an unused standard deduction shelters part of the rent", () => {
    const low = usRentalTax({ ...base, baseIncomeUsd: 5000 });
    const ded = seedUsTax.standardDeduction.single;
    const expected = progressiveTax(
      Math.max(0, 5000 + low.scheduleENetUsd - ded),
      seedUsTax.federalBrackets.single,
    );
    expect(low.federalBeforeCreditUsd).toBeCloseTo(expected, 6);
  });
  test("partial credit leaves the difference to pay", () => {
    const full = usRentalTax(base).federalBeforeCreditUsd;
    const result = usRentalTax({ ...base, foreignTaxPaidUsd: 500 });
    expect(result.additionalFederalUsd).toBeCloseTo(full - 500, 6);
  });
  test("NIIT applies above the threshold and is not offset by the credit", () => {
    const rich = usRentalTax({ ...base, baseIncomeUsd: 400000, foreignTaxPaidUsd: 1e6 });
    expect(rich.niitUsd).toBeCloseTo(seedUsTax.niit.rate * rich.scheduleENetUsd, 6);
    // The credit reduces regular tax only; the NIIT is always still owed.
    expect(rich.additionalFederalUsd).toBeCloseTo(
      rich.federalBeforeCreditUsd - rich.foreignTaxCreditUsd + rich.niitUsd,
      6,
    );
    expect(rich.additionalFederalUsd).toBeGreaterThanOrEqual(rich.niitUsd);
  });
  test("losses create no tax and are reported as passive losses", () => {
    const result = usRentalTax({
      ...base,
      netOperatingIncomeUsd: 1000,
      mortgageInterestUsd: 10000,
    });
    expect(result.federalBeforeCreditUsd).toBe(0);
    expect(result.passiveLossUsd).toBeGreaterThan(0);
    expect(result.stateTaxUsd).toBe(0);
  });
  test("state tax uses the configured state rate and no foreign credit", () => {
    const result = usRentalTax({ ...base, state: "CA", foreignTaxPaidUsd: 1e6 });
    expect(result.stateTaxUsd).toBeCloseTo(
      result.scheduleENetUsd * seedUsTax.stateRates["CA"]!.rate,
      6,
    );
    expect(usRentalTax({ ...base, state: "TX" }).stateTaxUsd).toBe(0);
  });
  test("married filing jointly uses MFJ brackets", () => {
    const single = usRentalTax({ ...base, baseIncomeUsd: 180000 });
    const mfj = usRentalTax({ ...base, baseIncomeUsd: 180000, filing: "mfj" });
    expect(mfj.federalBeforeCreditUsd).toBeLessThan(single.federalBeforeCreditUsd);
  });
});

describe("reporting flags", () => {
  test("FBAR threshold comes from parameters", () => {
    const flags = reportingFlags(seedUsTax, {
      filing: "single",
      residence: "us",
      foreignAccountPeakUsd: seedUsTax.fbarThresholdUsd + 1,
    });
    expect(flags.find((f) => f.form.startsWith("FBAR"))?.required).toBe("likely");
  });
  test("Form 8938 thresholds are higher for people living abroad", () => {
    const amount = 80000;
    const inUs = reportingFlags(seedUsTax, {
      filing: "single",
      residence: "us",
      foreignAccountPeakUsd: amount,
    });
    const abroad = reportingFlags(seedUsTax, {
      filing: "single",
      residence: "abroad",
      foreignAccountPeakUsd: amount,
    });
    expect(inUs.find((f) => f.form.startsWith("Form 8938"))?.required).toBe("likely");
    expect(abroad.find((f) => f.form.startsWith("Form 8938"))?.required).toBe("not_expected");
  });
});

const scenario = (overrides: Partial<ScenarioInput> = {}): ScenarioInput => ({
  priceUsd: 250000,
  potentialRentUsd: 17500,
  strategy: "long",
  vacancy: 0.05,
  managementPct: 0.08,
  maintenancePctOfPrice: 0.01,
  insurancePctOfPrice: 0.002,
  propertyTaxPctOfPrice: 0.003,
  hoaAnnualUsd: 1200,
  acquisitionCostUsd: 20000,
  downPaymentPct: 1,
  interestRate: 0.05,
  termYears: 25,
  fxChange: 0,
  localTax: flatRule({ basis: "net", rate: 0.25, brackets: undefined as never }),
  us: { params: seedUsTax, filing: "single", baseIncomeUsd: 110000, state: null },
  ...overrides,
});

describe("returns step by step", () => {
  test("every waterfall step reconciles to the totals", () => {
    const r = computeScenario(scenario());
    expect(r.collectedRentUsd).toBeCloseTo(17500 * 0.95, 6);
    expect(r.managementUsd).toBeCloseTo(r.collectedRentUsd * 0.08, 6);
    expect(r.noiUsd).toBeCloseTo(r.collectedRentUsd - r.operatingExpensesUsd, 6);
    expect(r.afterTaxIncomeUsd).toBeCloseTo(
      r.noiUsd - r.localTaxUsd - r.federalTaxUsd - r.stateTaxUsd,
      6,
    );
    const deductions = r.waterfall
      .filter((s) => s.kind === "deduction" && s.key !== "debt")
      .reduce((sum, s) => sum + s.value, 0);
    expect(r.potentialRentUsd + deductions).toBeCloseTo(r.afterTaxIncomeUsd, 6);
  });
  test("yields are relative to the purchase price", () => {
    const r = computeScenario(scenario());
    expect(r.grossYield).toBeCloseTo(0.07, 6);
    expect(r.netYieldBeforeTax).toBeCloseTo(r.noiUsd / 250000, 6);
    expect(r.afterTaxYield).toBeLessThan(r.netYieldBeforeTax);
  });
  test("the advertised-7%-becomes-about-4% example holds", () => {
    const r = computeScenario(scenario());
    expect(r.afterTaxYield).toBeGreaterThan(0.03);
    expect(r.afterTaxYield).toBeLessThan(0.05);
  });
  test("cash purchase has no debt and cash flow equals after-tax income", () => {
    const r = computeScenario(scenario());
    expect(r.debtServiceUsd).toBe(0);
    expect(r.annualCashFlowUsd).toBeCloseTo(r.afterTaxIncomeUsd, 6);
    expect(r.waterfall.at(-1)?.key).toBe("afterTax");
  });
  test("financing adds debt service and a cash-flow bar", () => {
    const r = computeScenario(scenario({ downPaymentPct: 0.4 }));
    expect(r.loanUsd).toBeCloseTo(150000, 6);
    expect(r.debtServiceUsd).toBeCloseTo(monthlyPayment(150000, 0.05, 25) * 12, 6);
    expect(r.annualCashFlowUsd).toBeCloseTo(r.afterTaxIncomeUsd - r.debtServiceUsd, 6);
    expect(r.cashInvestedUsd).toBeCloseTo(100000 + 20000, 6);
    expect(r.waterfall.at(-1)?.key).toBe("cashflow");
  });
  test("a weaker local currency lowers rent and local costs in USD", () => {
    const base = computeScenario(scenario());
    const weaker = computeScenario(scenario({ fxChange: -0.1 }));
    expect(weaker.potentialRentUsd).toBeCloseTo(base.potentialRentUsd * 0.9, 6);
    expect(weaker.afterTaxIncomeUsd).toBeLessThan(base.afterTaxIncomeUsd);
  });
  test("vacancy is clamped between 0 and 100%", () => {
    expect(computeScenario(scenario({ vacancy: 2 })).collectedRentUsd).toBe(0);
    expect(computeScenario(scenario({ vacancy: -1 })).vacancyLossUsd).toBe(0);
  });
  test("waterfall bars float from the running total", () => {
    const bars = waterfallBars(computeScenario(scenario()).waterfall);
    expect(bars[0]!.base).toBe(0);
    const vacancy = bars[1]!;
    expect(vacancy.base + vacancy.height).toBeCloseTo(bars[0]!.height, 6);
    const noi = bars.find((b) => b.key === "noi")!;
    expect(noi.running).toBeCloseTo(noi.value, 6);
  });
});

describe("scenario defaults", () => {
  test("city metrics convert local prices with the configured rate", () => {
    const lisbon = seedCities.find((c) => c.id === "pt-lisbon")!;
    const m = cityMetrics(lisbon, country("pt"), seedSettings);
    const { pricePerSqmLocal: price, typicalUnitSqm: sqm, longTermRentMonthlyLocal: rent } = lisbon;
    expect(m.pricePerSqmUsd).toBeCloseTo(price * seedSettings.fx.usdPerUnit["EUR"]!, 6);
    expect(m.unitPriceUsd).toBeCloseTo(m.pricePerSqmUsd * sqm, 6);
    expect(m.grossYieldLong).toBeCloseTo((rent * 12) / (price * sqm), 6);
    expect(m.netYieldLong).toBeLessThan(m.grossYieldLong);
  });
  test("mortgage profiles get a down payment from the country's LTV cap", () => {
    const input = buildScenarioInput({
      country: country("es"),
      profile: profile({ financing: "mortgage" }),
      settings: seedSettings,
      usTax: seedUsTax,
    });
    expect(input.downPaymentPct).toBeCloseTo(0.3, 6);
    expect(
      buildScenarioInput({
        country: country("es"),
        profile: profile(),
        settings: seedSettings,
        usTax: seedUsTax,
      }).downPaymentPct,
    ).toBe(1);
  });
  test("living abroad removes state tax", () => {
    const input = buildScenarioInput({
      country: country("pt"),
      profile: profile({ residence: "abroad", usState: "CA" }),
      settings: seedSettings,
      usTax: seedUsTax,
    });
    expect(input.us.state).toBeNull();
  });
  test("overrides win over defaults and scale city rent with price", () => {
    const lisbon = seedCities.find((c) => c.id === "pt-lisbon")!;
    const def = buildScenarioInput({
      country: country("pt"),
      city: lisbon,
      profile: profile(),
      settings: seedSettings,
      usTax: seedUsTax,
    });
    const doubled = buildScenarioInput({
      country: country("pt"),
      city: lisbon,
      profile: profile(),
      settings: seedSettings,
      usTax: seedUsTax,
      overrides: { priceUsd: def.priceUsd * 2 },
    });
    expect(doubled.potentialRentUsd).toBeCloseTo(def.potentialRentUsd * 2, 6);
  });
});

describe("scoring", () => {
  test("scale clamps to 0–100", () => {
    expect(scale(5, 0, 10)).toBe(50);
    expect(scale(-1, 0, 10)).toBe(0);
    expect(scale(20, 0, 10)).toBe(100);
    expect(scale(0.05, 0.14, 0.03)).toBe(82); // reversed ranges reward lower costs
  });
  test("weights tilt with goal and risk, and inapplicable factors drop out", () => {
    const w = adjustedWeights(
      seedSettings.scoring.weights,
      profile({ risk: "low", financing: "cash", strategy: "long" }),
    );
    expect(w.stability).toBeCloseTo(seedSettings.scoring.weights.stability * 1.6, 6);
    expect(w.financing).toBe(0);
    expect(w.strFit).toBe(0);
  });
  test("every published country gets a 0–100 score and a badge", () => {
    const ranked = rankCountries(seedCountries, profile(), seedSettings, seedUsTax);
    expect(ranked).toHaveLength(seedCountries.filter((c) => c.published).length);
    for (const item of ranked) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
      expect(["strong", "possible", "not"]).toContain(item.badge);
    }
    for (let i = 1; i < ranked.length; i++)
      expect(ranked[i - 1]!.score).toBeGreaterThanOrEqual(ranked[i]!.score);
  });
  test("a budget below the entry price is never recommended", () => {
    const result = scoreCountry(
      country("ae"),
      profile({ budgetUsd: 100000 }),
      seedSettings,
      seedUsTax,
    );
    expect(result.belowBudget).toBe(true);
    expect(result.badge).toBe("not");
  });
  test("lifestyle preferences change the ranking", () => {
    const beach = scoreCountry(
      country("mx"),
      profile({ lifestyle: ["beach", "shortFlight", "warm"] }),
      seedSettings,
      seedUsTax,
    );
    const city = scoreCountry(
      country("mx"),
      profile({ lifestyle: ["city", "english"] }),
      seedSettings,
      seedUsTax,
    );
    expect(beach.score).toBeGreaterThan(city.score);
  });
  test("unpublished countries are hidden", () => {
    const hidden = seedCountries.map((c) => (c.id === "pt" ? { ...c, published: false } : c));
    expect(
      rankCountries(hidden, profile(), seedSettings, seedUsTax).some((s) => s.country.id === "pt"),
    ).toBe(false);
  });
});

describe("narrative", () => {
  test("Dubai summary explains the missing foreign tax credit", () => {
    const ae = country("ae");
    const input = buildScenarioInput({
      country: ae,
      profile: profile(),
      settings: seedSettings,
      usTax: seedUsTax,
    });
    const sentences = executiveSummary({
      country: ae,
      profile: profile(),
      result: computeScenario(input),
      usTax: seedUsTax,
      strategy: "long",
    });
    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences.length).toBeLessThanOrEqual(5);
    expect(sentences.join(" ")).toContain("no Foreign Tax Credit");
  });
});
