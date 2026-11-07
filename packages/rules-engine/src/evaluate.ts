import { gradePoints, scalePoints } from "./grades";
import { scoreCluster } from "./score-cluster";
import { scoreWeighted, type ScoreOutcome } from "./score-weighted";
import { applicableCutoffs, zoneFor } from "./zones";
import type { Applicant, Programme, ProgrammeResult, RuleSet, Zone } from "./types";

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Checks that apply to the applicant regardless of programme. */
export function generalEligibility(ruleSet: RuleSet, applicant: Applicant): string[] {
  const reasons: string[] = [];
  const { minPasses, minMean } = ruleSet.eligibility;

  if (minPasses) {
    const passes = Object.entries(applicant.results).filter(([code, grade]) => {
      const subject = ruleSet.subjects[code];
      return subject?.scale === minPasses.scale && gradePoints(ruleSet, code, grade) >= minPasses.minPoints;
    }).length;
    if (passes < minPasses.count) reasons.push(minPasses.label);
  }

  if (minMean) {
    const best = Object.entries(applicant.results)
      .map(([code, grade]) => gradePoints(ruleSet, code, grade))
      .sort((a, b) => b - a)
      .slice(0, minMean.subjects);
    const mean = best.length < minMean.subjects ? 0 : best.reduce((s, p) => s + p, 0) / minMean.subjects;
    if (mean < minMean.minMean) reasons.push(minMean.label);
  }

  return reasons;
}

function score(ruleSet: RuleSet, programme: Programme, applicant: Applicant): ScoreOutcome {
  const scoring = ruleSet.scoring;
  switch (scoring.method) {
    case "weighted_categories":
      return scoreWeighted(ruleSet, scoring, programme, applicant);
    case "cluster_geometric":
      return scoreCluster(ruleSet, scoring, programme, applicant);
  }
}

/** Full result for one programme: eligibility, points with working, and zone. */
export function evaluateProgramme(
  ruleSet: RuleSet,
  programme: Programme,
  applicant: Applicant,
): ProgrammeResult {
  const blockedBy = generalEligibility(ruleSet, applicant);

  for (const req of programme.requirements.mandatory ?? []) {
    const subject = ruleSet.subjects[req.subject];
    const grade = applicant.results[req.subject];
    const name = subject?.name ?? req.subject;
    const needed = subject ? scalePoints(ruleSet, subject.scale, req.minGrade) : Infinity;
    if (grade === undefined || gradePoints(ruleSet, req.subject, grade) < needed) {
      blockedBy.push(`Needs ${name} at grade ${req.minGrade} or better`);
    }
  }

  const outcome = score(ruleSet, programme, applicant);
  blockedBy.push(...outcome.blockedBy);
  const breakdown = [...outcome.breakdown];
  let points = outcome.points;

  for (const adj of ruleSet.adjustments) {
    const sexOk = adj.when.sex === undefined || adj.when.sex === applicant.sex;
    const typeOk = adj.when.institutionType === undefined || adj.when.institutionType === programme.institutionType;
    if (sexOk && typeOk) {
      points += adj.points;
      breakdown.push({ label: adj.label, detail: "applied", points: adj.points });
    }
  }
  points = round(points);

  const eligible = blockedBy.length === 0;
  const cutoffs = applicableCutoffs(programme.cutoffs, applicant.sex);
  const { zone, range } = eligible
    ? zoneFor(points, cutoffs, ruleSet.zones)
    : { zone: null, range: null };

  return {
    programme,
    eligible,
    blockedBy,
    points: eligible ? points : null,
    breakdown,
    zone,
    cutoffRange: range,
  };
}

const zoneRank: Record<Zone, number> = { safe: 0, borderline: 1, danger: 2, no_data: 3 };

/** Evaluates every programme; eligible ones first, safest first. */
export function evaluateAll(
  ruleSet: RuleSet,
  programmes: Programme[],
  applicant: Applicant,
): ProgrammeResult[] {
  return programmes
    .map((p) => evaluateProgramme(ruleSet, p, applicant))
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      const za = a.zone ? zoneRank[a.zone] : 9;
      const zb = b.zone ? zoneRank[b.zone] : 9;
      if (za !== zb) return za - zb;
      return a.programme.title.localeCompare(b.programme.title);
    });
}

/**
 * Backup options for a programme in the danger zone: same field, still open
 * to the applicant, and safe or borderline.
 */
export function suggestAlternatives(
  target: ProgrammeResult,
  all: ProgrammeResult[],
  limit = 3,
): ProgrammeResult[] {
  return all
    .filter(
      (r) =>
        r.programme.id !== target.programme.id &&
        r.programme.field === target.programme.field &&
        r.eligible &&
        (r.zone === "safe" || r.zone === "borderline"),
    )
    .slice(0, limit);
}
