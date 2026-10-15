import { formatDate, formatPct, formatUsd, type ScenarioResult } from "../engine";
import type { City, Country, SectionMeta, UsTaxParams } from "../types";

/**
 * "Ask about your report" — grounded answers only.
 * The knowledge base is built from the user's report and the platform's stored data; every answer
 * cites a report section and its "last verified" date. Questions asking for personal advice are
 * declined, and anything not covered gets an explicit "I don't know".
 */

export interface KnowledgeChunk {
  section: string;
  anchor: string;
  keywords: string[];
  text: string;
  meta: SectionMeta;
}

export function buildKnowledge(args: {
  country: Country;
  cities: City[];
  result: ScenarioResult;
  usTax: UsTaxParams;
}): KnowledgeChunk[] {
  const { country, cities, result, usTax } = args;
  const c = country;
  return [
    {
      section: "Executive summary — returns",
      anchor: "returns",
      keywords: [
        "yield",
        "return",
        "earn",
        "income",
        "net",
        "gross",
        "profit",
        "keep",
        "cash flow",
        "cashflow",
        "money",
      ],
      text: `In this scenario gross rent is ${formatUsd(result.potentialRentUsd)} a year (${formatPct(result.grossYield)} gross yield). Net operating income after running costs is ${formatUsd(result.noiUsd)} (${formatPct(result.netYieldBeforeTax)}). After local and US taxes you keep about ${formatUsd(result.afterTaxIncomeUsd)}, an after-tax net yield of ${formatPct(result.afterTaxYield)}.${result.debtServiceUsd > 0 ? ` After mortgage payments of ${formatUsd(result.debtServiceUsd)}, annual cash flow is ${formatUsd(result.annualCashFlowUsd)}.` : ""}`,
      meta: c.rental.meta,
    },
    {
      section: "Can you buy?",
      anchor: "ownership",
      keywords: [
        "buy",
        "own",
        "ownership",
        "allowed",
        "foreigner",
        "restriction",
        "document",
        "passport",
        "tax id",
        "nif",
        "nie",
        "timeline",
        "how long",
        "weeks",
        "residency",
        "visa",
        "golden",
        "trust",
        "fideicomiso",
      ],
      text: `${c.ownership.summary} Restrictions: ${c.ownership.restrictions.join(" ")} Documents: ${c.ownership.documents.join(", ")}. Typical timeline: ${c.ownership.timelineWeeks[0]}–${c.ownership.timelineWeeks[1]} weeks. Local tax ID: ${c.ownership.taxIdName}. Residency: ${c.residencyNotes}`,
      meta: c.ownership.meta,
    },
    {
      section: "Total acquisition cost",
      anchor: "acquisition",
      keywords: [
        "closing",
        "cost",
        "fee",
        "notary",
        "lawyer",
        "transfer tax",
        "stamp",
        "agent",
        "commission",
        "one-time",
        "purchase tax",
      ],
      text: `One-time buying costs: ${c.acquisition.items.map((i) => `${i.label} ${i.kind === "pct" ? (i.low === i.high ? formatPct(i.low) : `${formatPct(i.low)}–${formatPct(i.high)}`) : `${formatUsd(i.low)}–${formatUsd(i.high)}`}`).join("; ")}.`,
      meta: c.acquisition.meta,
    },
    {
      section: "Financing",
      anchor: "financing",
      keywords: [
        "mortgage",
        "loan",
        "finance",
        "financing",
        "bank",
        "borrow",
        "rate",
        "interest",
        "down payment",
        "ltv",
        "lender",
        "heloc",
      ],
      text: `Local mortgages for non-residents: ${c.financing.localBankForNonResidents}, up to about ${formatPct(c.financing.maxLtvNonResident, 0)} loan-to-value. Typical down payment ${formatPct(c.financing.downPaymentRange[0], 0)}–${formatPct(c.financing.downPaymentRange[1], 0)}, rates ${formatPct(c.financing.rateRange[0])}–${formatPct(c.financing.rateRange[1])}, terms up to ${c.financing.termYears} years. Options: ${c.financing.options.map((o) => `${o.name} (${o.available}): ${o.notes}`).join(" ")}`,
      meta: c.financing.meta,
    },
    {
      section: "Local tax on rent",
      anchor: "returns",
      keywords: [
        "local tax",
        "foreign tax",
        "rental tax",
        c.localTax.regimeName.toLowerCase(),
        "withholding",
        "treaty",
        "income tax",
      ],
      text: `${c.localTax.regimeName}: ${c.localTax.notes} In your scenario that is about ${formatUsd(result.localTaxUsd)} a year. Treaty: ${c.localTax.treatyNotes}`,
      meta: c.localTax.meta,
    },
    {
      section: "US tax module — Foreign Tax Credit",
      anchor: "us-tax",
      keywords: [
        "foreign tax credit",
        "ftc",
        "1116",
        "double tax",
        "credit",
        "federal",
        "us tax",
        "irs",
        "niit",
        "3.8",
      ],
      text: `${usTax.notes.foreignTaxCredit} In your scenario the estimated US federal tax on the rent before credit is ${formatUsd(result.us.federalBeforeCreditUsd)}, the credit is ${formatUsd(result.us.foreignTaxCreditUsd)}, leaving ${formatUsd(result.federalTaxUsd)} of additional federal tax (including ${formatUsd(result.us.niitUsd)} of Net Investment Income Tax).${result.us.excessForeignTaxUsd > 1 ? ` About ${formatUsd(result.us.excessForeignTaxUsd)} of foreign tax exceeds the limitation and may be carried forward.` : ""}`,
      meta: usTax.meta,
    },
    {
      section: "US tax module — Schedule E and depreciation",
      anchor: "us-tax",
      keywords: [
        "schedule e",
        "depreciation",
        "depreciate",
        "30 year",
        "deduct",
        "deduction",
        "report rental",
      ],
      text: `${usTax.notes.scheduleE} ${usTax.notes.depreciation} Estimated depreciation in your scenario: ${formatUsd(result.us.depreciationUsd)} a year, giving Schedule E net income of ${formatUsd(result.us.scheduleENetUsd)}.`,
      meta: usTax.meta,
    },
    {
      section: "US tax module — Foreign Earned Income Exclusion",
      anchor: "us-tax",
      keywords: ["feie", "2555", "exclusion", "earned income", "exclude"],
      text: usTax.notes.feie,
      meta: usTax.meta,
    },
    {
      section: "US tax module — reporting obligations",
      anchor: "us-tax",
      keywords: [
        "fbar",
        "fincen",
        "114",
        "fatca",
        "8938",
        "report account",
        "bank account",
        "threshold",
        "reporting",
        "3520",
        "5471",
      ],
      text: `${usTax.notes.reporting} FBAR threshold: ${formatUsd(usTax.fbarThresholdUsd)}. Form 8938 thresholds (single, living in the US): ${formatUsd(usTax.fatca8938.livingInUs.single[0])} at year end or ${formatUsd(usTax.fatca8938.livingInUs.single[1])} at any time.`,
      meta: usTax.meta,
    },
    {
      section: "US tax module — state tax",
      anchor: "us-tax",
      keywords: ["state tax", "state", "california", "new york", "resident"],
      text: `Most states tax worldwide income and do not credit foreign taxes. In your scenario state tax is about ${formatUsd(result.stateTaxUsd)} a year (rate used: ${formatPct(result.us.stateRate)}).`,
      meta: usTax.meta,
    },
    {
      section: "US tax module — selling",
      anchor: "us-tax",
      keywords: ["sell", "sale", "capital gain", "capital gains", "exit", "resale"],
      text: `${usTax.notes.capitalGains} ${usTax.capitalGains.notes} In ${c.name}: ${c.localTax.capitalGainsNotes}`,
      meta: usTax.meta,
    },
    {
      section: "Best cities",
      anchor: "cities",
      keywords: [
        "city",
        "cities",
        "neighborhood",
        "neighbourhood",
        "which city",
        ...cities.map((ci) => ci.name.toLowerCase()),
      ],
      text: `Cities covered: ${cities.map((ci) => `${ci.name} (${ci.highlight} Short-term rentals: ${ci.strAllowed}.)`).join(" ")}`,
      meta: cities[0]?.meta ?? c.rental.meta,
    },
    {
      section: "Short-term rental rules",
      anchor: "cities",
      keywords: [
        "short-term",
        "short term",
        "airbnb",
        "vacation",
        "holiday",
        "licence",
        "license",
        "str",
      ],
      text: c.rental.strRules,
      meta: c.rental.meta,
    },
    {
      section: "Risks",
      anchor: "risks",
      keywords: [
        "risk",
        "currency",
        "exchange",
        "political",
        "legal",
        "title",
        "liquidity",
        "earthquake",
        "hurricane",
        "flood",
        "natural",
        "safe",
        "danger",
        "scam",
      ],
      text: c.risks.items
        .map((r) => `${r.key} (level ${r.level}/5): ${r.summary} Mitigation: ${r.mitigation}`)
        .join(" "),
      meta: c.risks.meta,
    },
    {
      section: "Buying checklist",
      anchor: "checklist",
      keywords: [
        "step",
        "steps",
        "process",
        "checklist",
        "how do i",
        "how to buy",
        "next",
        "procedure",
      ],
      text: c.checklist.steps.map((s, i) => `${i + 1}. ${s}`).join(" "),
      meta: c.checklist.meta,
    },
  ];
}

const ADVICE_PATTERNS = [
  /\bshould i (buy|invest|sell|purchase|choose|go with|pick)\b/i,
  /\b(is|would) (it|this|that) (be )?(a )?(good|bad|smart|wise|safe) (investment|idea|deal|buy)\b/i,
  /\bwhich (property|apartment|house|building|listing|one) should\b/i,
  /\b(recommend|advise) (me )?(a|which|what) (property|apartment|house|listing)\b/i,
  /\bhow (do|can) i (avoid|evade|hide)\b/i,
  /\b(my|our) (specific|personal) tax (situation|return)\b/i,
];

export const ADVICE_REFUSAL =
  "I can't give personal tax, legal or investment advice, and I can't tell you whether to buy a specific property. I can explain what your report says. For a decision, please speak with a qualified professional — a US CPA or enrolled agent for taxes and a local attorney for the purchase. You can request an introduction in the “Talk to an expert” section.";

export function isAdviceRequest(question: string): boolean {
  return ADVICE_PATTERNS.some((pattern) => pattern.test(question));
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** Ranks chunks by keyword and word overlap with the question. */
export function retrieve(question: string, chunks: KnowledgeChunk[], limit = 2): KnowledgeChunk[] {
  const q = question.toLowerCase();
  const qTokens = new Set(tokens(question));
  const scored = chunks.map((chunk) => {
    let score = 0;
    for (const keyword of chunk.keywords)
      if (keyword && q.includes(keyword)) score += keyword.includes(" ") ? 4 : 3;
    for (const token of tokens(chunk.section)) if (qTokens.has(token)) score += 1;
    return { chunk, score };
  });
  return scored
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.chunk);
}

export function citation(chunk: KnowledgeChunk): string {
  return `Source: “${chunk.section}” section, data last verified on ${formatDate(chunk.meta.lastVerified)}.`;
}

export const UNKNOWN_ANSWER =
  "I don't know — that isn't covered by your report or our verified data. I won't guess. A qualified professional (a US CPA or enrolled agent, or a local attorney) can answer it for your situation.";

/** Answer built only from retrieved chunks (used offline, and as a fallback when the AI service is unavailable). */
export function groundedAnswer(
  question: string,
  chunks: KnowledgeChunk[],
): { answer: string; sources: KnowledgeChunk[] } {
  if (isAdviceRequest(question)) return { answer: ADVICE_REFUSAL, sources: [] };
  const found = retrieve(question, chunks);
  if (!found.length) return { answer: UNKNOWN_ANSWER, sources: [] };
  return {
    answer: found.map((chunk) => `${chunk.text}\n${citation(chunk)}`).join("\n\n"),
    sources: found,
  };
}

/** Plain-text context sent to the AI service (server-side prompt restricts answers to it). */
export function contextForAi(chunks: KnowledgeChunk[]): string {
  return chunks
    .map((c) => `[${c.section} | last verified ${c.meta.lastVerified}]\n${c.text}`)
    .join("\n\n");
}

const RATE_KEY = "ay.v1.assistant-usage";

/** Client-side hourly limit (the server enforces its own limit too). */
export function consumeRateLimit(
  limitPerHour: number,
  now = Date.now(),
): { allowed: boolean; remaining: number } {
  let stamps: number[] = [];
  try {
    stamps = JSON.parse(window.localStorage.getItem(RATE_KEY) ?? "[]") as number[];
  } catch {
    stamps = [];
  }
  stamps = stamps.filter((t) => now - t < 3_600_000);
  if (stamps.length >= limitPerHour) return { allowed: false, remaining: 0 };
  stamps.push(now);
  try {
    window.localStorage.setItem(RATE_KEY, JSON.stringify(stamps));
  } catch {
    // ignore
  }
  return { allowed: true, remaining: limitPerHour - stamps.length };
}
