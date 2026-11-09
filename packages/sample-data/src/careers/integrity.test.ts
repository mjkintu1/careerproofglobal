import { describe, expect, it } from "vitest";
import { CareerGraph } from "@careerproof/career-graph";
import { careerGraphData as d } from "./index";

describe("sample career data", () => {
  const g = new CareerGraph(d);

  it("has at least 50 careers across every cluster", () => {
    expect(d.occupations.length).toBeGreaterThanOrEqual(50);
    for (const c of d.clusters) expect(g.inCluster(c.slug).length, c.slug).toBeGreaterThan(0);
  });

  it("only references known clusters and skills, with valid codes", () => {
    const clusters = new Set(d.clusters.map((c) => c.slug));
    for (const o of d.occupations) {
      expect(clusters.has(o.cluster), o.slug).toBe(true);
      for (const s of o.skills) expect(d.skills[s], `${o.slug}: ${s}`).toBeDefined();
      if (o.isco !== null) expect(o.isco, o.slug).toMatch(/^[0-9]{4}$/);
      expect(o.riasec, o.slug).toMatch(/^[RIASEC]{1,3}$/);
      expect(o.routes.length, o.slug).toBeGreaterThan(0);
    }
  });

  it("connects every career to at least one path", () => {
    for (const o of d.occupations) {
      const moves = g.nextMoves(o.slug).length + g.previousMoves(o.slug).length;
      expect(moves, o.slug).toBeGreaterThan(0);
    }
  });

  it("only lists regulators for known careers and locations", () => {
    const codes = new Set(d.locations.map((l) => l.code));
    for (const [slug, byCountry] of Object.entries(d.regulators)) {
      expect(g.get(slug), slug).toBeDefined();
      for (const code of Object.keys(byCountry)) expect(codes.has(code), `${slug}: ${code}`).toBe(true);
    }
  });

  it("finds a multi-step path across fields", () => {
    const p = g.findPath("it-support-technician", "data-scientist");
    expect(p).not.toBeNull();
    expect(p!.steps.length).toBeGreaterThan(1);
  });
});
