import { describe, expect, it } from "vitest";
import { benchmarkPoints, inPeriod, rangePosition } from "./pay-range";

describe("range maths", () => {
  it("converts year and week to month but never hours", () => {
    expect(inPeriod(120000, "year", "month")).toBe(10000);
    expect(inPeriod(1000, "week", "year")).toBeCloseTo(52000);
    expect(inPeriod(20, "hour", "month")).toBeNull();
    expect(inPeriod(3000, "month", "hour")).toBeNull();
  });
  it("places an offer in a posted range", () => {
    expect(rangePosition(55, 50, 60)).toBe(0.5);
    expect(rangePosition(65, 50, 60)).toBe(1.5);
  });
  it("only compares benchmarks in the same currency", () => {
    const b = { country: "US", currency: "USD", period: "year", covers: "x", granularity: "occupation", median: 60000, p25: 48000, sector: "all", year: "2025" } as const;
    expect(benchmarkPoints(b, "UGX", "year")).toEqual([]);
    expect(benchmarkPoints(b, "usd", "month").map((p) => p.value)).toEqual([4000, 5000]);
  });
  it("labels a legal minimum as such, not as a scale", () => {
    const m = { country: "KE", currency: "KES", period: "month", granularity: "legal-minimum", scaleMin: 16000, scaleMax: 18000, sector: "all", year: "2026" } as const;
    expect(benchmarkPoints(m, "KES", "month")).toEqual([{ label: "Legal minimum", value: 16000 }]);
  });
});
