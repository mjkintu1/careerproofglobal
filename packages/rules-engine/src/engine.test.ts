import { describe, expect, it } from "vitest";
import { evaluateAll, evaluateProgramme, suggestAlternatives } from "./evaluate";
import { gradePoints, UnknownGradeError } from "./grades";
import { applicableCutoffs, zoneFor } from "./zones";
import { keMedicine, keRules, ugMedicine, ugRules } from "./fixtures.test-helpers";
import type { Applicant, Programme } from "./types";

const bcm: Applicant = {
  results: { BIO: "A", CHE: "B", PHY: "C", GP: "Pass", SICT: "Pass" },
  secondaryBands: { distinction: 4, credit: 4, pass: 2 },
  sex: "M",
};

describe("grades", () => {
  it("uses the subject scale from the rule set", () => {
    expect(gradePoints(ugRules, "BIO", "A")).toBe(6);
    expect(gradePoints(ugRules, "GP", "Pass")).toBe(1);
  });

  it("rejects grades the subject scale does not define", () => {
    expect(() => gradePoints(ugRules, "GP", "A")).toThrow(UnknownGradeError);
    expect(() => gradePoints(ugRules, "XYZ", "A")).toThrow(UnknownGradeError);
  });
});

describe("Uganda weighted categories", () => {
  // Hand calculation:
  //   essential BIO A 6x3=18, CHE B 5x3=15; relevant PHY C 4x2=8; desirable GP 1x1=1  -> 42
  //   UCE bonus 4x0.3 + 4x0.2 + 2x0.1 = 2.2                                            -> 44.2
  it("weights essential, relevant and desirable subjects and adds the UCE bonus", () => {
    const r = evaluateProgramme(ugRules, ugMedicine, bcm);
    expect(r.eligible).toBe(true);
    expect(r.points).toBe(44.2);
    expect(r.breakdown.map((b) => b.points)).toEqual([18, 15, 8, 1, 2.2]);
  });

  it("adds the female bonus only at public institutions", () => {
    expect(evaluateProgramme(ugRules, ugMedicine, { ...bcm, sex: "F" }).points).toBe(45.7);
    const privateMed: Programme = { ...ugMedicine, institutionType: "private" };
    expect(evaluateProgramme(ugRules, privateMed, { ...bcm, sex: "F" }).points).toBe(44.2);
  });

  it("caps the UCE bonus at maxSubjects, keeping the best bands", () => {
    const r = evaluateProgramme(ugRules, ugMedicine, { ...bcm, secondaryBands: { distinction: 8, credit: 5 } });
    // 8x0.3 + 2x0.2 = 2.8 (only 10 subjects count)
    expect(r.points).toBe(42 + 2.8);
  });

  it("blocks a programme when essential subjects are missing, and says why", () => {
    const pcm: Applicant = { results: { PHY: "A", CHE: "A", MAT: "A", GP: "Pass" } };
    const r = evaluateProgramme(ugRules, ugMedicine, pcm);
    expect(r.eligible).toBe(false);
    expect(r.points).toBeNull();
    expect(r.blockedBy[0]).toContain("Biology, Chemistry");
  });

  it("enforces the minimum number of principal passes", () => {
    const r = evaluateProgramme(ugRules, ugMedicine, { results: { BIO: "A", CHE: "F", PHY: "F" } });
    expect(r.blockedBy).toContain("Needs 2 principal passes");
  });

  it("never opens more programmes when a subject is dropped", () => {
    const other: Programme = {
      ...ugMedicine,
      id: "eng",
      field: "engineering",
      requirements: { essential: ["MAT", "PHY"], relevant: ["CHE"], desirable: ["GP"] },
    };
    const applicant: Applicant = { results: { BIO: "B", CHE: "B", PHY: "B", MAT: "B", GP: "Pass" } };
    const base = evaluateAll(ugRules, [ugMedicine, other], applicant).filter((r) => r.eligible).length;
    for (const code of Object.keys(applicant.results)) {
      const results = { ...applicant.results };
      delete results[code];
      const after = evaluateAll(ugRules, [ugMedicine, other], { results }).filter((r) => r.eligible).length;
      expect(after).toBeLessThanOrEqual(base);
    }
  });
});

describe("Kenya cluster points", () => {
  const strong: Applicant = {
    results: { ENG: "B", KIS: "B-", MAT: "A-", BIO: "A", CHE: "A-", PHY: "B+", GEO: "B" },
  };

  // r = BIO 12 + CHE 11 + MAT 11 + PHY 10 = 44; t = 12+11+11+10+9+9+8 = 70
  // C = sqrt((44/48) x (70/84)) x 48 = 41.952
  it("computes sqrt((r/R) x (t/T)) x 48", () => {
    const r = evaluateProgramme(keRules, keMedicine, strong);
    expect(r.eligible).toBe(true);
    expect(r.points).toBeCloseTo(41.952, 3);
  });

  it("enforces mandatory minimum grades", () => {
    const r = evaluateProgramme(keRules, keMedicine, { results: { ...strong.results, BIO: "C+" } });
    expect(r.blockedBy).toContain("Needs BIO at grade B or better");
  });

  it("enforces the minimum mean grade", () => {
    const allC = Object.fromEntries(Object.keys(strong.results).map((c) => [c, "C"]));
    const r = evaluateProgramme(keRules, { ...keMedicine, requirements: { cluster: keMedicine.requirements.cluster } }, { results: allC });
    expect(r.blockedBy).toContain("Needs mean grade C+");
  });
});

describe("zones", () => {
  const cutoffs = applicableCutoffs(ugMedicine.cutoffs);
  const cfg = ugRules.zones;

  it("is safe only above the highest recent cut-off plus the margin", () => {
    expect(zoneFor(50.3, cutoffs, cfg).zone).toBe("safe");
    expect(zoneFor(50.2, cutoffs, cfg).zone).toBe("borderline");
    expect(zoneFor(48.5, cutoffs, cfg).zone).toBe("borderline");
    expect(zoneFor(48.4, cutoffs, cfg).zone).toBe("danger");
  });

  it("reports no_data instead of guessing when history is too short", () => {
    expect(zoneFor(40, [{ year: 2025, points: 30 }], cfg).zone).toBe("no_data");
  });

  it("prefers sex-specific cut-offs when they exist", () => {
    const rows = applicableCutoffs(
      [
        { year: 2025, points: 49, sex: "any" },
        { year: 2025, points: 47.5, sex: "F" },
      ],
      "F",
    );
    expect(rows).toEqual([{ year: 2025, points: 47.5, sex: "F" }]);
  });
});

describe("alternatives", () => {
  it("suggests safer programmes in the same field", () => {
    const easier: Programme = {
      ...ugMedicine,
      id: "med-2",
      title: "Medicine (other)",
      cutoffs: [
        { year: 2024, points: 40 },
        { year: 2025, points: 41 },
      ],
    };
    const all = evaluateAll(ugRules, [ugMedicine, easier], bcm);
    const target = all.find((r) => r.programme.id === "med")!;
    expect(target.zone).toBe("danger");
    expect(suggestAlternatives(target, all).map((r) => r.programme.id)).toEqual(["med-2"]);
  });
});
