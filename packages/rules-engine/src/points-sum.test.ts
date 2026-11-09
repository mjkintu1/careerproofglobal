import { describe, expect, it } from "vitest";
import { sumQualificationPoints, type PointsQualification } from "./points-sum";

// Values from UCAS 2027 Tariff tables.
const table: PointsQualification[] = [
  { id: "a-level", label: "A level", grades: [{ grade: "A*", points: 56 }, { grade: "A", points: 48 }, { grade: "B", points: 40 }] },
  { id: "epq", label: "Extended Project", grades: [{ grade: "A", points: 24 }] },
];

describe("sumQualificationPoints", () => {
  it("adds points per qualification", () => {
    const r = sumQualificationPoints(table, [
      { qualification: "a-level", grade: "A*" },
      { qualification: "a-level", grade: "A" },
      { qualification: "a-level", grade: "B" },
      { qualification: "epq", grade: "A" },
    ]);
    expect(r.total).toBe(168);
    expect(r.lines).toHaveLength(4);
    expect(r.unknown).toEqual([]);
  });

  it("reports, and does not count, unknown grades or qualifications", () => {
    const r = sumQualificationPoints(table, [
      { qualification: "a-level", grade: "Z" },
      { qualification: "nope", grade: "A" },
      { qualification: "a-level", grade: "A" },
    ]);
    expect(r.total).toBe(48);
    expect(r.unknown).toHaveLength(2);
  });

  it("returns zero for no entries", () => {
    expect(sumQualificationPoints(table, []).total).toBe(0);
  });
});
