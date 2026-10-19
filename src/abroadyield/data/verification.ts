import type { City, Country } from "../types";

/**
 * Seed rows checked field by field against dated public sources in the October 2026 audit
 * (docs/abroadyield/AUDIT-2026-10.md). Listed rows start as "verified"; every other row stays
 * "SAMPLE DATA – TO BE VERIFIED". Modelling assumptions (vacancy, management, maintenance,
 * insurance) remain assumptions and are described as such on the methodology page.
 */
export const AUDIT_VERIFIED_BY = "AbroadYield research desk – public sources cited in each section";
export const AUDIT_VERIFIED_ON = "2026-10-19";

export const verifiedCountryIds: readonly string[] = [];
export const verifiedCityIds: readonly string[] = [];

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
