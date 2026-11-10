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

  const anyScale = scoring.anyScale ?? "principal";
  const expand = (codes: string[]) =>
    codes.flatMap((c) => (c === "*" ? Object.keys(ruleSet.subjects).filter((k) => ruleSet.subjects[k]?.scale === anyScale) : [c]));
  const nameOf = (code: string) => ruleSet.subjects[code]?.name ?? code;
  const scored = (code: string) => ({
    code,
    grade: applicant.results[code] as string,
    points: gradePoints(ruleSet, code, applicant.results[code] as string),
  });

  for (const category of scoring.categories) {
    const pick = programme.requirements.picks?.[category.role] ?? category.pick;
    const min = category.minPoints ?? 1;
    const level = min > 1 ? " at principal level (grade E or better)" : "";
    const listed = [...new Set(expand(programme.requirements[category.role] ?? []))];
    const fixed = category.role === "essential" ? (programme.requirements.essentialFixed ?? []) : [];

    const chosen: { code: string; grade: string; points: number }[] = [];
    for (const code of fixed) {
      if (used.has(code)) continue;
      const c = applicant.results[code] !== undefined ? scored(code) : null;
      if (!c || c.points < min) {
        blockedBy.push(`Needs ${nameOf(code)} as an essential subject${level}`);
      } else {
        chosen.push(c);
      }
    }
    const remaining = Math.max(0, pick - fixed.length);
    const others = listed
      .filter((code) => !used.has(code) && !fixed.includes(code) && applicant.results[code] !== undefined)
      .map(scored)
      .filter((c) => c.points >= min)
      .sort((a, b) => b.points - a.points)
      .slice(0, remaining);
    chosen.push(...others);

    if (category.required && others.length < remaining) {
      const names = listed.filter((c) => !fixed.includes(c)).map(nameOf).join(", ");
      const n = remaining;
      blockedBy.push(`Needs ${n} ${category.role} subject${n > 1 ? "s" : ""}${level} from: ${names}`);
    }

    for (const c of chosen) {
      used.add(c.code);
      const points = c.points * category.weight;
      total += points;
      breakdown.push({
        label: `${nameOf(c.code)} (${category.role})`,
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
