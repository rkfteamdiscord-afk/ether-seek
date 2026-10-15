import { seedBlog, seedPartners, seedSettings, seedUsTax } from "../data/config";
import { seedCities, seedCountries } from "../data/countries";
import type { Collection } from "./backend";

/** Seed rows per collection, used until an admin saves real data. */
export function seedCollection(collection: Collection): unknown[] | null {
  switch (collection) {
    case "countries":
      return structuredClone(seedCountries);
    case "cities":
      return structuredClone(seedCities);
    case "config":
      return structuredClone([seedSettings, seedUsTax]);
    case "partners":
      return structuredClone(seedPartners);
    case "blog":
      return structuredClone(seedBlog);
    default:
      return null;
  }
}
