import type { City, Country, Profile, UsTaxParams } from "../types";
import { formatPct, formatUsd } from "./format";
import type { ScenarioResult } from "./returns";

/** Rounds dollar amounts to a "roughly" figure: $9,742 → $9,700. */
export function roughly(value: number): number {
  const magnitude = Math.abs(value) >= 10000 ? 500 : 100;
  return Math.round(value / magnitude) * magnitude;
}

/** One plain sentence explaining the headline numbers, in the AbroadYield tone of voice. */
export function headlineSentence(args: {
  country: Country;
  city?: City | undefined;
  result: ScenarioResult;
  strategy: "long" | "short";
}): string {
  const { country, city, result } = args;
  const place = city ? `${city.name}` : country.name;
  const what = args.strategy === "short" ? "vacation rental" : "rental";
  return `A ${what} in ${place} at about ${formatUsd(roughly(result.potentialRentUsd / Math.max(result.grossYield, 0.0001)))} shows a ${formatPct(result.grossYield)} gross yield. After costs and taxes in ${shortName(country)} and the US, you'd keep about ${formatPct(result.afterTaxYield)} per year, or roughly ${formatUsd(roughly(result.afterTaxIncomeUsd))}.`;
}

export function shortName(country: Country): string {
  return country.name.replace(/\s*\(.*\)$/, "");
}

const GOAL_SENTENCE: Record<string, (country: Country) => string> = {
  income: (c) =>
    `For an income goal, the key numbers are the after-tax yield and cash flow below; ${shortName(c)}'s main watch-out is: ${c.keyRisk.charAt(0).toLowerCase()}${c.keyRisk.slice(1)}`,
  retirement: (c) =>
    `For retirement abroad, residency matters as much as yield: ${c.residencyNotes}`,
  second_home: (c) =>
    `As a second home that pays for itself, short-term rental rules matter: ${c.rental.strRules}`,
  diversification: (c) =>
    `For diversification, note that your rent and resale value are in ${c.currency}, which is ${c.currency === "AED" ? "pegged to the US dollar" : "not tied to the US dollar"}.`,
  "": (c) => `${shortName(c)}'s main watch-out: ${c.keyRisk}`,
};

/** 3–5 sentence executive summary personalised to the profile. */
export function executiveSummary(args: {
  country: Country;
  city?: City | undefined;
  profile: Profile;
  result: ScenarioResult;
  usTax: UsTaxParams;
  strategy: "long" | "short";
}): string[] {
  const { country, profile, result } = args;
  const sentences = [headlineSentence(args)];
  sentences.push(
    country.ownership.status === "allowed"
      ? `As an American you can buy in ${shortName(country)} directly; expect ${country.ownership.timelineWeeks[0]}–${country.ownership.timelineWeeks[1]} weeks from offer to keys.`
      : `${shortName(country)} restricts direct foreign ownership in some areas: ${country.ownership.summary}`,
  );
  if (result.localTaxUsd <= 0.5) {
    sentences.push(
      "Because no local income tax is paid on the rent, there is no Foreign Tax Credit to use, so US tax applies to the full net rent.",
    );
  } else if (result.us.excessForeignTaxUsd > 1) {
    sentences.push(
      `Local tax (${formatUsd(result.localTaxUsd)}) is higher than the US tax on this income, so you likely owe no extra US federal income tax and build up about ${formatUsd(result.us.excessForeignTaxUsd)} of unused foreign tax credit per year.`,
    );
  } else {
    sentences.push(
      `Local tax of about ${formatUsd(result.localTaxUsd)} is credited against US tax, leaving an estimated ${formatUsd(result.federalTaxUsd)} of extra US federal tax per year.`,
    );
  }
  if (result.stateTaxUsd > 1 && profile.usState) {
    sentences.push(
      `Your state adds about ${formatUsd(result.stateTaxUsd)} because most states do not credit foreign taxes.`,
    );
  }
  sentences.push(GOAL_SENTENCE[profile.goal]?.(country) ?? GOAL_SENTENCE[""]!(country));
  return sentences.slice(0, 5);
}
