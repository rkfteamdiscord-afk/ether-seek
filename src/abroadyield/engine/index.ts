/**
 * AbroadYield calculation engine — pure functions, no browser or network access, fully unit
 * tested (`bun test src/abroadyield`). See /abroadyield/methodology for the plain-English version.
 *
 *  - finance.ts   currency conversion, mortgage maths, borrowing capacity, closing costs
 *  - tax.ts       progressive brackets, local rental tax, US federal/FTC/NIIT/state, reporting flags
 *  - returns.ts   year-one returns step by step and the waterfall
 *  - scenario.ts  default scenarios from a country, city and user profile (+ simulator overrides)
 *  - scoring.ts   country ranking 0–100 with editable weights and badges
 *  - narrative.ts plain-English sentences for summaries
 *  - format.ts    US-style number formatting
 */
export * from "./finance";
export * from "./format";
export * from "./narrative";
export * from "./returns";
export * from "./scenario";
export * from "./scoring";
export * from "./tax";
