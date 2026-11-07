import type { Cutoff, ProgrammeResult, Zone, ZoneConfig } from "./types";

/**
 * Picks the cut-offs that apply to an applicant: merit scheme, and the
 * sex-specific row when one exists for that year, otherwise the "any" row.
 */
export function applicableCutoffs(cutoffs: Cutoff[], sex?: "F" | "M"): Cutoff[] {
  const merit = cutoffs.filter((c) => (c.scheme ?? "merit") === "merit");
  const byYear = new Map<number, Cutoff>();
  for (const c of merit) {
    const rowSex = c.sex ?? "any";
    if (rowSex !== "any" && rowSex !== sex) continue;
    const existing = byYear.get(c.year);
    if (!existing || (rowSex !== "any" && (existing.sex ?? "any") === "any")) {
      byYear.set(c.year, c);
    }
  }
  return [...byYear.values()].sort((a, b) => b.year - a.year);
}

/** Simple, explainable zone: compare with the min/max of recent cut-offs. */
export function zoneFor(
  points: number,
  cutoffs: Cutoff[],
  config: ZoneConfig,
): { zone: Zone; range: ProgrammeResult["cutoffRange"] } {
  const recent = cutoffs.slice(0, config.window);
  if (recent.length < config.minYears) {
    return { zone: "no_data", range: null };
  }
  const values = recent.map((c) => c.points);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = { min, max, years: recent.map((c) => c.year) };
  if (points >= max + config.safeMargin) return { zone: "safe", range };
  if (points >= min) return { zone: "borderline", range };
  return { zone: "danger", range };
}
