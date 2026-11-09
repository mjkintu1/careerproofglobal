/**
 * "Sum of qualification points" calculators, e.g. the UCAS Tariff.
 *
 * The method is generic: an official body publishes a table of points per
 * qualification and grade, and a student's total is the sum over the
 * qualifications they hold. Tables are data (from the publisher), never code.
 */

export interface PointsQualification {
  id: string;
  label: string;
  /** Display group, e.g. "Scotland" or "International Baccalaureate". */
  group?: string;
  grades: { grade: string; points: number }[];
}

export interface PointsEntry {
  qualification: string;
  grade: string;
}

export interface PointsLine {
  qualification: string;
  label: string;
  grade: string;
  points: number;
}

export interface PointsResult {
  total: number;
  lines: PointsLine[];
  /** Entries whose qualification or grade is not in the table. */
  unknown: PointsEntry[];
}

export function sumQualificationPoints(
  table: readonly PointsQualification[],
  entries: readonly PointsEntry[],
): PointsResult {
  const byId = new Map(table.map((q) => [q.id, q]));
  const lines: PointsLine[] = [];
  const unknown: PointsEntry[] = [];
  for (const e of entries) {
    const q = byId.get(e.qualification);
    const g = q?.grades.find((x) => x.grade === e.grade);
    if (!q || !g) {
      unknown.push(e);
      continue;
    }
    lines.push({ qualification: q.id, label: q.label, grade: g.grade, points: g.points });
  }
  return { total: lines.reduce((s, l) => s + l.points, 0), lines, unknown };
}
