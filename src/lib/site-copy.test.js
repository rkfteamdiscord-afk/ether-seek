import { describe, expect, test } from "bun:test";
import { arrivalCopy, siteCopy } from "./site-copy";
import { halloweenOffer } from "./seasonal-offer";

/** Same keys, same list lengths: a text added in one language must exist in the other. */
const shape = (value) => Array.isArray(value) ? value.map(shape) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])])) : typeof value;

describe("Site copy", () => {
  test("English and French have the same texts", () => {
    expect(shape(siteCopy.en)).toEqual(shape(siteCopy.fr));
    expect(shape(arrivalCopy.en)).toEqual(shape(arrivalCopy.fr));
  });
  test("both languages show the shared Halloween offer", () => {
    for (const lang of ["en", "fr"]) {
      expect(siteCopy[lang].contactPromo).toContain(halloweenOffer.code);
      expect(siteCopy[lang].offerTitle).toContain(`${halloweenOffer.discountPercent} %`);
      expect(arrivalCopy[lang].reward).toContain(`${halloweenOffer.discountPercent} %`);
    }
  });
});
