import { describe, expect, test } from "bun:test";
import { seedCities, seedCountries } from "../data/countries";
import { seedSettings, seedUsTax } from "../data/config";
import { runScenario } from "../engine";
import { emptyProfile } from "../profile";
import {
  ADVICE_REFUSAL,
  UNKNOWN_ANSWER,
  buildKnowledge,
  groundedAnswer,
  isAdviceRequest,
  retrieve,
} from "./assistant";

const country = seedCountries.find((c) => c.id === "pt")!;
const cities = seedCities.filter((c) => c.countryId === "pt");
const { result } = runScenario({
  country,
  profile: { ...emptyProfile, residence: "us", usState: "NY" },
  settings: seedSettings,
  usTax: seedUsTax,
});
const chunks = buildKnowledge({ country, cities, result, usTax: seedUsTax });

describe("report assistant", () => {
  test("declines personal investment advice", () => {
    expect(isAdviceRequest("Should I buy this apartment in Lisbon?")).toBe(true);
    expect(groundedAnswer("Is this a good investment?", chunks).answer).toBe(ADVICE_REFUSAL);
  });
  test("answers factual questions from the report with a citation", () => {
    const { answer, sources } = groundedAnswer("Do I need to file an FBAR?", chunks);
    expect(sources[0]?.section).toContain("reporting");
    expect(answer).toContain("last verified");
  });
  test("says it doesn't know when the data does not cover the question", () => {
    expect(groundedAnswer("What's the best pizza place?", chunks).answer).toBe(UNKNOWN_ANSWER);
  });
  test("finds the closing-cost section", () => {
    expect(retrieve("How much are closing costs and notary fees?", chunks)[0]?.anchor).toBe(
      "acquisition",
    );
  });
});
