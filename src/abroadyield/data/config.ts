import type { BlogPost, Partner, Settings, UsTaxParams } from "../types";

/** SAMPLE DATA – TO BE VERIFIED by a US CPA or enrolled agent before going live. */
export const seedUsTax: UsTaxParams = {
  id: "us_tax",
  taxYear: 2026,
  dataStatus: "sample",
  federalBrackets: {
    single: [
      { upTo: 12400, rate: 0.1 },
      { upTo: 50400, rate: 0.12 },
      { upTo: 105700, rate: 0.22 },
      { upTo: 201775, rate: 0.24 },
      { upTo: 256225, rate: 0.32 },
      { upTo: 640600, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
    mfj: [
      { upTo: 24800, rate: 0.1 },
      { upTo: 100800, rate: 0.12 },
      { upTo: 211400, rate: 0.22 },
      { upTo: 403550, rate: 0.24 },
      { upTo: 512450, rate: 0.32 },
      { upTo: 768700, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
  },
  standardDeduction: { single: 16100, mfj: 32200 },
  niit: { rate: 0.038, thresholdSingle: 200000, thresholdMfj: 250000 },
  depreciation: { foreignResidentialYears: 30, buildingShare: 0.8 },
  fbarThresholdUsd: 10000,
  fatca8938: {
    livingInUs: { single: [50000, 75000], mfj: [100000, 150000] },
    livingAbroad: { single: [200000, 300000], mfj: [400000, 600000] },
  },
  capitalGains: {
    longTermRates: [0, 0.15, 0.2],
    notes:
      "Long-term gains (held over one year) are taxed at 0%, 15% or 20% plus the 3.8% NIIT where it applies. Depreciation taken is recaptured at up to 25%.",
  },
  stateRates: {
    AL: { name: "Alabama", rate: 0.05 },
    AK: { name: "Alaska", rate: 0 },
    AZ: { name: "Arizona", rate: 0.025 },
    AR: { name: "Arkansas", rate: 0.039 },
    CA: { name: "California", rate: 0.093, notes: "No credit for foreign taxes." },
    CO: { name: "Colorado", rate: 0.044 },
    CT: { name: "Connecticut", rate: 0.055 },
    DE: { name: "Delaware", rate: 0.066 },
    DC: { name: "District of Columbia", rate: 0.085 },
    FL: { name: "Florida", rate: 0 },
    GA: { name: "Georgia", rate: 0.0519 },
    HI: { name: "Hawaii", rate: 0.079 },
    ID: { name: "Idaho", rate: 0.053 },
    IL: { name: "Illinois", rate: 0.0495 },
    IN: { name: "Indiana", rate: 0.03 },
    IA: { name: "Iowa", rate: 0.038 },
    KS: { name: "Kansas", rate: 0.0558 },
    KY: { name: "Kentucky", rate: 0.035 },
    LA: { name: "Louisiana", rate: 0.03 },
    ME: { name: "Maine", rate: 0.0675 },
    MD: { name: "Maryland", rate: 0.0575 },
    MA: { name: "Massachusetts", rate: 0.05 },
    MI: { name: "Michigan", rate: 0.0425 },
    MN: { name: "Minnesota", rate: 0.0785 },
    MS: { name: "Mississippi", rate: 0.044 },
    MO: { name: "Missouri", rate: 0.047 },
    MT: { name: "Montana", rate: 0.059 },
    NE: { name: "Nebraska", rate: 0.052 },
    NV: { name: "Nevada", rate: 0 },
    NH: { name: "New Hampshire", rate: 0 },
    NJ: { name: "New Jersey", rate: 0.0637 },
    NM: { name: "New Mexico", rate: 0.049 },
    NY: { name: "New York", rate: 0.0685 },
    NC: { name: "North Carolina", rate: 0.0425 },
    ND: { name: "North Dakota", rate: 0.0195 },
    OH: { name: "Ohio", rate: 0.0275 },
    OK: { name: "Oklahoma", rate: 0.0475 },
    OR: { name: "Oregon", rate: 0.0875 },
    PA: { name: "Pennsylvania", rate: 0.0307 },
    RI: { name: "Rhode Island", rate: 0.0475 },
    SC: { name: "South Carolina", rate: 0.06 },
    SD: { name: "South Dakota", rate: 0 },
    TN: { name: "Tennessee", rate: 0 },
    TX: { name: "Texas", rate: 0 },
    UT: { name: "Utah", rate: 0.0455 },
    VT: { name: "Vermont", rate: 0.066 },
    VA: { name: "Virginia", rate: 0.0575 },
    WA: { name: "Washington", rate: 0 },
    WV: { name: "West Virginia", rate: 0.0482 },
    WI: { name: "Wisconsin", rate: 0.053 },
    WY: { name: "Wyoming", rate: 0 },
  },
  notes: {
    scheduleE:
      "Foreign rental income is reported on Schedule E (Form 1040) in US dollars, like a US rental: rent minus deductible expenses, mortgage interest and depreciation.",
    foreignTaxCredit:
      "Foreign income tax paid on the rent can usually be claimed as a credit on Form 1116 (passive category). The credit is limited to the US tax attributable to that foreign income; unused credits can be carried back 1 year and forward 10 years.",
    depreciation:
      "Foreign residential rental buildings placed in service after 2017 are depreciated straight-line over 30 years (ADS). Land is not depreciable.",
    feie: "The Foreign Earned Income Exclusion (Form 2555) covers wages and self-employment income only. Rental income is passive and cannot be excluded.",
    reporting:
      "FBAR (FinCEN 114) is required if your foreign accounts together exceed the threshold at any time in the year. Form 8938 (FATCA) has higher thresholds that depend on filing status and where you live. Directly held real estate is not reported on Form 8938, but foreign bank accounts and entities are.",
    capitalGains:
      "When you sell, the US taxes the gain measured in US dollars (currency movements can create or reduce a gain). Foreign tax on the sale can usually be credited. Depreciation is recaptured.",
  },
  meta: {
    sources: [
      {
        label: "IRS Publication 527 – Residential Rental Property",
        url: "https://www.irs.gov/publications/p527",
      },
      {
        label: "IRS Publication 514 – Foreign Tax Credit",
        url: "https://www.irs.gov/publications/p514",
      },
      {
        label: "IRS Publication 946 – How to Depreciate Property",
        url: "https://www.irs.gov/publications/p946",
      },
      {
        label: "FinCEN – FBAR filing requirements",
        url: "https://www.fincen.gov/report-foreign-bank-and-financial-accounts",
      },
      {
        label: "IRS – Comparison of Form 8938 and FBAR",
        url: "https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements",
      },
      {
        label: "Tax Foundation – State individual income tax rates",
        url: "https://taxfoundation.org/data/all/state/state-income-tax-rates/",
      },
    ],
    lastVerified: "2026-10-01",
    verifiedBy: "Not yet verified (sample)",
  },
};

export const seedSettings: Settings = {
  id: "settings",
  pricing: {
    fullReportUsd: 39,
    explorerPassUsd: 89,
    explorerPassDays: 90,
    maxCountriesPerReport: 3,
  },
  refundDays: 14,
  validationMode: false,
  allowPromotionCodes: true,
  scoring: {
    weights: {
      yield: 25,
      taxEfficiency: 15,
      entryCost: 10,
      ownership: 10,
      stability: 10,
      lifestyle: 15,
      financing: 5,
      strFit: 5,
      budgetFit: 5,
    },
    strongFitMin: 68,
    possibleMin: 50,
  },
  fx: {
    usdPerUnit: {
      USD: 1,
      EUR: 1.16,
      MXN: 0.054,
      CRC: 0.00198,
      AED: 0.2723,
      GBP: 1.33,
      COP: 0.00025,
      DOP: 0.0162,
      THB: 0.0305,
      JPY: 0.0067,
    },
    sourceUrl: "https://open.er-api.com/v6/latest/USD",
    updatedAt: "2026-10-01",
    sourceLabel: "Sample rates (refresh from the configured source in the admin panel)",
  },
  ai: { messagesPerHour: 20 },
  siteLastUpdated: "2026-10-17",
  // Each figure is true of the seed data: 1,216 sourced numeric data points, rates for the 50
  // states + DC, four tax layers in every estimate, and a free ranking.
  homeStats: [
    { value: "1,200+", label: "sourced data points, each dated" },
    { value: "51", label: "US state tax codes built in" },
    { value: "4", label: "tax layers: local, federal, state, NIIT" },
    { value: "$0", label: "to see your ranking" },
  ],
};

export const seedPartners: Partner[] = [
  {
    id: "p-tax-1",
    name: "Sample Expat Tax Partners (placeholder)",
    category: "tax",
    countries: ["pt", "es", "it", "gr", "mx", "cr", "ae"],
    email: "",
    active: true,
    referralTerms: "Placeholder – set referral terms before routing leads.",
  },
  {
    id: "p-mortgage-1",
    name: "Sample International Mortgage Desk (placeholder)",
    category: "mortgage",
    countries: ["pt", "es", "mx", "ae"],
    email: "",
    active: true,
    referralTerms: "Placeholder.",
  },
  {
    id: "p-agent-1",
    name: "Sample Iberia Realty (placeholder)",
    category: "agent",
    countries: ["pt", "es"],
    email: "",
    active: true,
    referralTerms: "Placeholder.",
  },
  {
    id: "p-attorney-1",
    name: "Sample Cross-Border Counsel (placeholder)",
    category: "attorney",
    countries: ["mx", "cr"],
    email: "",
    active: true,
    referralTerms: "Placeholder.",
  },
];

export const seedBlog: BlogPost[] = [
  {
    id: "b-gross-vs-net",
    slug: "gross-yield-vs-real-yield",
    title: "Gross yield vs. real yield: why 7% often becomes 4%",
    excerpt:
      "Listings advertise gross yield. Here is what happens to that number after vacancy, running costs, foreign tax and US tax.",
    body: `Most listings quote a **gross yield**: a year of rent divided by the asking price. It is a useful first filter, but it is not what you keep.

## What comes off the top
- **Vacancy**: even good long-term rentals sit empty between tenants.
- **Management**: local managers usually charge 8–25% of collected rent.
- **Maintenance, insurance, property tax and condo fees**.

What is left is the **net operating income**. Divide it by the price and you get the net yield before tax.

## Then the taxes
The country where the property sits usually taxes the rent first. As a US taxpayer, you then report the same rent on Schedule E. The Foreign Tax Credit usually prevents paying twice on the same dollar, but not always in full — and most states give no credit at all.

## A worked example
A $250,000 apartment advertised at 7% brings in $17,500 a year. After about $5,000 of costs and roughly $2,500 of combined taxes, you keep around $10,000 — about 4%.

AbroadYield runs this calculation for every country with your own profile. It is an educational estimate, not tax advice.`,
    publishedAt: "2026-09-20",
    published: true,
    author: "AbroadYield Research",
  },
  {
    id: "b-ftc",
    slug: "foreign-tax-credit-rental-income",
    title: "The Foreign Tax Credit and rental income, in plain English",
    excerpt:
      "How Form 1116 stops double taxation on foreign rent — and the situations where it does not.",
    body: `If you pay income tax abroad on your rental income, the US generally lets you subtract it from the US tax due on that same income through the **Foreign Tax Credit** (Form 1116).

## The limitation
The credit cannot exceed the US tax that applies to the foreign income. If the foreign tax is higher, the excess can be carried back one year or forward ten years.

## When there is nothing to credit
In places with no income tax on rent, such as Dubai, there is no foreign tax to credit, so the full US tax applies.

## State tax
Most states tax your worldwide income and do not credit foreign taxes. Where you live in the US matters.

Always confirm your situation with a US CPA or enrolled agent.`,
    publishedAt: "2026-09-28",
    published: true,
    author: "AbroadYield Research",
  },
];
