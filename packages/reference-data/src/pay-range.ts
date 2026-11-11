import type { PayBenchmark } from "./pay";

export type Period = PayBenchmark["period"];

/** Monthly equivalent for year, month and week figures. Hourly pay is not converted: hours worked vary. */
export function toMonthly(v: number, period: Period): number | null {
  if (period === "hour") return null;
  return period === "year" ? v / 12 : period === "week" ? (v * 52) / 12 : v;
}

/** Bring a benchmark value into the user's period, when that is a fair conversion. */
export function inPeriod(v: number, from: Period, to: Period): number | null {
  if (from === to) return v;
  const m = toMonthly(v, from);
  if (m === null || to === "hour") return null;
  return to === "year" ? m * 12 : to === "week" ? (m * 12) / 52 : m;
}

/** Where a figure sits in a posted range: 0 = bottom, 1 = top (can fall outside). */
export const rangePosition = (v: number, min: number, max: number) => (max > min ? (v - min) / (max - min) : 0.5);

export interface BenchmarkPoint { label: string; value: number }

/** The benchmark figures we can place on the user's scale (same currency, convertible period). */
export function benchmarkPoints(b: PayBenchmark, currency: string, period: Period): BenchmarkPoint[] {
  if (b.currency.toUpperCase() !== currency.toUpperCase()) return [];
  const raw: [string, number | undefined][] = b.granularity === "legal-minimum"
    ? [["Legal minimum", b.scaleMin]]
    : [
      ["Lowest 10% earn under", b.p10], ["A quarter earn under", b.p25], ["Median (middle)", b.median], ["Average", b.mean],
      ["Three quarters earn under", b.p75], ["Top 10% earn over", b.p90],
      [b.isEntry ? "Scale minimum (entry pay)" : "Scale minimum", b.scaleMin], ["Scale maximum", b.scaleMax],
    ];
  return raw.flatMap(([label, v]) => {
    if (v === undefined) return [];
    const c = inPeriod(v, b.period, period);
    return c === null ? [] : [{ label, value: c }];
  });
}
