import { gradePoints } from "./grades";
import type {
  Applicant,
  BreakdownLine,
  Programme,
  RuleSet,
  WeightedCategoriesScoring,
} from "./types";

export interface ScoreOutcome {
  points: number;
  breakdown: BreakdownLine[];
  blockedBy: string[];
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Uganda-style weighted categories (essential x3, relevant x2, desirable x1 ...). */
export function scoreWeighted(
  ruleSet: RuleSet,
  scoring: WeightedCategoriesScoring,
  programme: Programme,
  applicant: Applicant,
): ScoreOutcome {
  const used = new Set<string>();
  const breakdown: BreakdownLine[] = [];
  const blockedBy: string[] = [];
  let total = 0;

  for (const category of scoring.categories) {
    const listed = programme.requirements[category.role] ?? [];
    const candidates = listed
      .filter((code) => !used.has(code) && applicant.results[code] !== undefined)
      .map((code) => ({
        code,
        grade: applicant.results[code] as string,
        points: gradePoints(ruleSet, code, applicant.results[code] as string),
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, category.pick);

    const passed = candidates.filter((c) => c.points > 0);
    if (category.required && passed.length < category.pick) {
      const names = listed.map((c) => ruleSet.subjects[c]?.name ?? c).join(", ");
      blockedBy.push(
        `Needs ${category.pick} passed ${category.role} subject${category.pick > 1 ? "s" : ""} from: ${names}`,
      );
    }

    for (const c of candidates) {
      used.add(c.code);
      const points = c.points * category.weight;
      total += points;
      breakdown.push({
        label: `${ruleSet.subjects[c.code]?.name ?? c.code} (${category.role})`,
        detail: `${c.grade} = ${c.points} x ${category.weight}`,
        points: round(points),
      });
    }
  }

  const bonus = scoring.secondaryBonus;
  if (bonus && applicant.secondaryBands) {
    let remaining = bonus.maxSubjects;
    let bonusTotal = 0;
    const parts: string[] = [];
    // Bands are listed best-first, so the cap keeps the strongest subjects.
    for (const band of bonus.bands) {
      const count = Math.min(Math.max(0, applicant.secondaryBands[band.id] ?? 0), remaining);
      remaining -= count;
      if (count > 0) {
        bonusTotal += count * band.points;
        parts.push(`${count} ${band.label.toLowerCase()} x ${band.points}`);
      }
    }
    if (bonusTotal > 0) {
      total += bonusTotal;
      breakdown.push({ label: bonus.label, detail: parts.join(", "), points: round(bonusTotal) });
    }
  }

  return { points: round(total), breakdown, blockedBy };
}
