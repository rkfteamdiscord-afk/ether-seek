import { describe, expect, test } from "bun:test";
import { halloweenOffer } from "./seasonal-offer";

describe("Halloween offer", () => {
  test("uses the requested code", () => {
    expect(halloweenOffer.code).toBe("haloween26");
  });
  test("offers ten percent off", () => {
    expect(halloweenOffer.discountPercent).toBe(10);
  });
  test("covers every service", () => {
    expect(halloweenOffer.appliesTo).toBe("all-services");
  });
});