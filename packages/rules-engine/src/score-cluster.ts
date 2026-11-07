import { gradePoints } from "./grades";
import type { Applicant, ClusterGeometricScoring, Programme, RuleSet } from "./types";
import type { ScoreOutcome } from "./score-weighted";

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Kenya KUCCPS-style cluster points: sqrt((r/R) * (t/T)) * multiplier. */
export function scoreCluster(
  ruleSet: RuleSet,
  scoring: ClusterGeometricScoring,
  programme: Programme,
  applicant: Applicant,
): ScoreOutcome {
  const blockedBy: string[] = [];
  const listed = programme.requirements.cluster ?? [];

  const clusterSubjects = listed
    .filter((code) => applicant.results[code] !== undefined)
    .map((code) => ({ code, points: gradePoints(ruleSet, code, applicant.results[code] as string) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, scoring.clusterSize);

  if (clusterSubjects.length < scoring.clusterSize) {
    const names = listed.map((c) => ruleSet.subjects[c]?.name ?? c).join(", ");
    blockedBy.push(`Needs ${scoring.clusterSize} cluster subjects from: ${names}`);
  }

  const all = Object.entries(applicant.results)
    .map(([code, grade]) => gradePoints(ruleSet, code, grade))
    .sort((a, b) => b - a)
    .slice(0, scoring.aggregateSubjects);

  const r = clusterSubjects.reduce((sum, s) => sum + s.points, 0);
  const t = all.reduce((sum, p) => sum + p, 0);
  const points = Math.sqrt((r / scoring.maxClusterPoints) * (t / scoring.maxAggregatePoints)) * scoring.multiplier;

  return {
    points: round(points),
    blockedBy,
    breakdown: [
      {
        label: "Cluster subjects (r)",
        detail: `${clusterSubjects.map((s) => ruleSet.subjects[s.code]?.name ?? s.code).join(", ") || "none"} = ${r} of ${scoring.maxClusterPoints}`,
        points: r,
      },
      {
        label: `Best ${scoring.aggregateSubjects} subjects (t)`,
        detail: `${t} of ${scoring.maxAggregatePoints}`,
        points: t,
      },
      {
        label: "Cluster points",
        detail: `sqrt((${r}/${scoring.maxClusterPoints}) x (${t}/${scoring.maxAggregatePoints})) x ${scoring.multiplier}`,
        points: round(points),
      },
    ],
  };
}
