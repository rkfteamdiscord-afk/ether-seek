import type { City, Country } from "../types";

/**
 * Seed rows checked field by field against dated public sources in the October 2026 audit
 * (docs/abroadyield/AUDIT-2026-10.md). Listed rows start as "verified"; every other row stays
 * "SAMPLE DATA – TO BE VERIFIED". Modelling assumptions (vacancy, management, maintenance,
 * insurance) remain assumptions and are described as such on the methodology page.
 */
export const AUDIT_VERIFIED_BY = "AbroadYield research desk – public sources cited in each section";
export const AUDIT_VERIFIED_ON = "2026-10-19";

export const verifiedCountryIds: readonly string[] = [
  "pt",
  "es",
  "it",
  "gr",
  "mx",
  "cr",
  "ae",
  "gb",
  "de",
  "hr",
  "do",
  "fr",
  "ie",
  "pa",
  "co",
  "th",
  "jp",
];
export const verifiedCityIds: readonly string[] = [
  "pt-lisbon",
  "pt-porto",
  "es-madrid",
  "es-barcelona",
  "es-valencia",
  "es-malaga",
  "es-alicante",
  "it-milan",
  "it-rome",
  "it-florence",
  "it-bologna",
  "it-lecce",
  "gr-athens",
  "gr-thessaloniki",
  "mx-cdmx",
  "mx-playa",
  "mx-merida",
  "cr-escazu",
  "cr-tamarindo",
  "cr-atenas",
  "ae-downtown",
  "ae-business-bay",
  "fr-paris",
  "fr-nice",
  "fr-bordeaux",
  "fr-montpellier",
  "gb-london",
  "gb-manchester",
  "gb-liverpool",
  "gb-edinburgh",
  "ie-dublin",
  "ie-cork",
  "ie-limerick",
  "de-berlin",
  "de-munich",
  "de-leipzig",
  "de-frankfurt",
  "hr-zagreb",
  "hr-zadar",
  "pa-panama-city",
  "co-medellin",
  "co-cartagena",
  "co-bogota",
  "do-punta-cana",
  "do-santo-domingo",
  "th-bangkok",
  "th-phuket",
  "th-pattaya",
  "jp-tokyo",
  "jp-osaka",
  "jp-kyoto",
  "jp-fukuoka",
  "mx-san-miguel",
  "mx-tulum",
  "pt-madeira",
  "es-marbella",
  "it-sicily",
  "pt-algarve",
  "pt-braga",
  "gr-chania",
  "gr-corfu",
  "mx-pv",
  "ae-marina",
  "ae-jvc",
  "ie-galway",
  "hr-split",
  "hr-dubrovnik",
  "pa-boquete",
  "pa-pedasi",
  "co-santa-marta",
  "th-chiang-mai",
  "mx-los-cabos",
];

/** Replaces verifiedBy / lastVerified on the row and on every section's meta. */
function stamp<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stamp) as T;
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) out[k] = stamp(v);
  if ("verifiedBy" in out) out["verifiedBy"] = AUDIT_VERIFIED_BY;
  if ("lastVerified" in out) out["lastVerified"] = AUDIT_VERIFIED_ON;
  return out as T;
}

export function applyAudit(country: Country): Country {
  return verifiedCountryIds.includes(country.id)
    ? { ...stamp(country), dataStatus: "verified" }
    : country;
}

export function applyCityAudit(city: City): City {
  return verifiedCityIds.includes(city.id) ? { ...stamp(city), dataStatus: "verified" } : city;
}
