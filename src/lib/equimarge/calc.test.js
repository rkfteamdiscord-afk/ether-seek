import { describe, expect, test } from "bun:test";
import {
  activityResults,
  addMonths,
  alertsFor,
  amountInMonth,
  horseCosts,
  monthSummary,
  recommendations,
  simulate,
  defaultHypotheses,
} from "./calc";
import { buildDemoData, DEMO_CENTRE_NAME } from "./demo";
import { euros, parseAmount } from "./format";

const month = "2026-10";

function demoWorkspace() {
  return {
    structure: {
      id: "s",
      name: DEMO_CENTRE_NAME,
      declaredHorseCount: 15,
      activities: ["pensions", "cours", "stages", "balades", "competition"],
      mainExpenses: ["foin"],
      lessonsPerWeek: 45,
      plan: "essai",
      trialEndsAt: "2026-10-28",
      isDemo: true,
      onboarded: true,
      createdAt: "2026-10-14",
    },
    ...buildDemoData(month),
  };
}

describe("format", () => {
  test("writes euros the French way", () => {
    expect(euros(1234.56)).toBe("1 234,56 €");
  });
  test("reads amounts typed on a phone", () => {
    expect(parseAmount("1 234,5")).toBe(1234.5);
    expect(parseAmount("abc")).toBeNull();
  });
});

describe("months", () => {
  test("crosses years", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2025-12", 2)).toBe("2026-02");
  });
  test("monthly items repeat until their end", () => {
    const item = {
      id: "x",
      category: "eau",
      label: "Eau",
      amount: 50,
      date: "2026-05-01",
      recurrence: "mensuelle",
      endDate: "2026-08-31",
      horseId: null,
    };
    expect(amountInMonth(item, "2026-04")).toBe(0);
    expect(amountInMonth(item, "2026-06")).toBe(50);
    expect(amountInMonth(item, "2026-09")).toBe(0);
  });
});

describe("demo centre", () => {
  const ws = demoWorkspace();

  test("has 15 horses", () => {
    expect(ws.horses).toHaveLength(15);
  });

  test("horse costs add up to total expenses", () => {
    const total = horseCosts(ws, month).reduce((t, c) => t + c.total, 0);
    expect(Math.round(total)).toBe(Math.round(monthSummary(ws, month).expenses));
  });

  test("activity results add up to the global margin", () => {
    const margin = activityResults(ws, month).reduce((t, r) => t + r.margin, 0);
    expect(Math.round(margin)).toBe(Math.round(monthSummary(ws, month).margin));
  });

  test("flags Tornado's under-priced board", () => {
    const alert = alertsFor(ws, month).find((a) => a.id.startsWith("pension-"));
    expect(alert?.message).toContain("Tornado");
    expect(alert?.message).toContain("vous la facturez 380");
  });

  test("flags the club pony that works little", () => {
    expect(
      alertsFor(ws, month).some(
        (a) => a.kind === "club-deficitaire" && a.title.includes("Caramel"),
      ),
    ).toBe(true);
  });

  test("flags the hay rise", () => {
    expect(alertsFor(ws, month).some((a) => a.id === "hausse-foin")).toBe(true);
  });

  test("gives exactly three recommendations", () => {
    expect(recommendations(ws, month)).toHaveLength(3);
  });
});

describe("simulator", () => {
  const ws = demoWorkspace();

  test("no change means no impact", () => {
    const result = simulate(ws, month, defaultHypotheses(ws));
    expect(result.monthlyDelta).toBe(0);
    expect(result.newMargin).toBe(result.baseMargin);
  });

  test("raising pensions by 20 € on 6 horses adds 120 € a month", () => {
    const result = simulate(ws, month, { ...defaultHypotheses(ws), pensionPriceChange: 20 });
    expect(result.monthlyDelta).toBe(120);
    expect(result.annualDelta).toBe(1440);
  });

  test("dearer hay lowers the margin", () => {
    const result = simulate(ws, month, { ...defaultHypotheses(ws), hayPricePercent: 10 });
    expect(result.monthlyDelta).toBeLessThan(0);
  });
});
