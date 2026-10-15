import type { Profile } from "./types";

export const emptyProfile: Profile = {
  citizenship: "",
  residence: "",
  usState: "",
  income: "",
  filingStatus: "",
  cashUsd: null,
  budgetUsd: null,
  budgetHelp: false,
  financing: "",
  goal: "",
  strategy: "",
  risk: "",
  lifestyle: [],
  email: "",
  marketingConsent: false,
};

export const DISCLAIMER =
  "AbroadYield provides educational estimates only. It is not tax, legal, financial or investment advice. Consult a qualified professional (e.g., a US CPA or enrolled agent and a local attorney) before making any decision.";

export const BRAND = {
  name: "AbroadYield",
  promise: "See what you'll actually earn abroad — after every tax, fee and currency risk.",
  basePath: "/abroadyield",
};
