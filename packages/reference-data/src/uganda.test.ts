import { describe, expect, it } from "vitest";
import { evaluateProgramme, type Applicant } from "@careerproof/rules-engine";
import { ugandaProgrammes, ugandaRuleSet } from "./uganda";

const prog = (code: string) => ugandaProgrammes.find((p) => p.code === code)!;
const SUB = "Distinction or credit (D1 to C6)";
const olevel = { distinction: 5, credit: 3, pass: 2 }; // 5 x 0.3 + 3 x 0.2 + 2 x 0.1 = 2.3

describe("Uganda weighting system (Notes to Schools 2026/2027)", () => {
  it("MBChB: essentials x3, relevant x2, desirable x1, plus O-level weight", () => {
    const a: Applicant = { results: { BIO: "A", CHE: "B", PHY: "C", GP: SUB }, secondaryBands: olevel, sex: "M" };
    const r = evaluateProgramme(ugandaRuleSet, prog("MAM"), a);
    // 6x3 + 5x3 + 4x2 + 1x1 + 2.3 = 44.3
    expect(r.eligible).toBe(true);
    expect(r.points).toBeCloseTo(44.3, 3);
  });

  it("adds 1.5 points for female candidates", () => {
    const a: Applicant = { results: { BIO: "A", CHE: "B", PHY: "C", GP: SUB }, secondaryBands: olevel, sex: "F" };
    expect(evaluateProgramme(ugandaRuleSet, prog("MAM"), a).points).toBeCloseTo(45.8, 3);
  });

  it("an essential subject passed at subsidiary level (O) blocks the programme", () => {
    const a: Applicant = { results: { BIO: "A", CHE: "O", PHY: "B", GP: SUB }, sex: "M" };
    const r = evaluateProgramme(ugandaRuleSet, prog("MAM"), a);
    expect(r.eligible).toBe(false);
    expect(r.blockedBy.join(" ")).toMatch(/principal level/);
  });

  it("subsidiary pass P7 to F9 carries no desirable point", () => {
    const a: Applicant = { results: { BIO: "A", CHE: "A", PHY: "A", GP: "Pass or fail (P7 to F9)" }, sex: "M" };
    expect(evaluateProgramme(ugandaRuleSet, prog("MAM"), a).points).toBe(48); // 18 + 18 + 12
  });

  it("Computer Science: Mathematics is always an essential subject", () => {
    const a: Applicant = { results: { MAT: "E", PHY: "A", CHE: "A", GP: SUB }, sex: "M" };
    const r = evaluateProgramme(ugandaRuleSet, prog("CSC"), a);
    // MAT 2x3 + PHY 6x3 (best other essential) + CHE 6x2 (best remaining) + GP 1 = 37
    expect(r.eligible).toBe(true);
    expect(r.points).toBe(37);
  });

  it("BA Economics: one essential and two relevant subjects", () => {
    const a: Applicant = { results: { ECO: "B", HIS: "A", GEO: "C", GP: SUB }, sex: "M" };
    // ECO 5x3 + HIS 6x2 + GEO 4x2 + GP 1 = 36
    expect(evaluateProgramme(ugandaRuleSet, prog("ECO"), a).points).toBe(36);
  });

  it("every programme has three years of official cut-offs", () => {
    for (const p of ugandaProgrammes) {
      expect(new Set(p.cutoffs.map((c) => c.year))).toEqual(new Set([2023, 2024, 2025]));
    }
  });
});
