import { describe, expect, it } from "vitest";
import { CareerGraph } from "./graph";
import type { CareerGraphData, Occupation } from "./types";

const occ = (slug: string, skills: string[], cluster = "c"): Occupation => ({
  slug, title: slug.toUpperCase(), isco: null, cluster, level: "bachelor", riasec: "I",
  summary: "", tasks: [], skills, subjects: [], routes: [],
});

const data: CareerGraphData = {
  clusters: [{ slug: "c", name: "C", description: "" }],
  skills: { a: "Skill A", b: "Skill B", c: "Skill C", d: "Skill D" },
  locations: [{ code: "UG", name: "Uganda", currency: "UGX", secondaryExams: "UACE" }],
  occupations: [occ("nurse", ["a", "b"]), occ("midwife", ["a", "b", "c"]), occ("doctor", ["a", "c"]), occ("analyst", ["d"], "other"), occ("lecturer", ["c"])],
  transitions: [
    { from: "nurse", to: "midwife", kind: "specialisation", years: 1.5, via: "" },
    { from: "nurse", to: "doctor", kind: "progression", years: 6, via: "" },
    { from: "midwife", to: "doctor", kind: "progression", years: 3, via: "" },
    { from: "doctor", to: "lecturer", kind: "pivot", years: 4, via: "" },
    { from: "nurse", to: "analyst", kind: "pivot", years: 1, via: "" },
  ],
  regulators: { nurse: { UG: "Nurses Council" } },
};

const g = new CareerGraph(data);

describe("CareerGraph", () => {
  it("lists next and previous moves", () => {
    expect(g.nextMoves("nurse").map((m) => m.occupation.slug)).toEqual(["midwife", "doctor", "analyst"]);
    expect(g.previousMoves("doctor").map((m) => m.occupation.slug)).toEqual(["nurse", "midwife"]);
  });

  it("finds related careers by skill overlap, never itself", () => {
    // nurse {a,b}: midwife {a,b,c} = 2/3, doctor {a,c} = 1/3, lecturer {c} = 0, analyst {d} = 0
    const r = g.related("nurse");
    expect(r.map((x) => x.occupation.slug)).toEqual(["midwife", "doctor"]);
    expect(r[0]!.overlap).toBeCloseTo(2 / 3);
    expect(r[0]!.sharedSkills).toEqual(["a", "b"]);
  });

  it("finds the quickest path, not the one with fewest steps", () => {
    // nurse -> doctor directly is 6 years; via midwife is 1.5 + 3 = 4.5
    const p = g.findPath("nurse", "doctor")!;
    expect(p.steps.map((s) => s.to.slug)).toEqual(["midwife", "doctor"]);
    expect(p.totalYears).toBe(4.5);
  });

  it("chains several moves and respects direction", () => {
    expect(g.findPath("nurse", "lecturer")!.steps.map((s) => s.to.slug)).toEqual(["midwife", "doctor", "lecturer"]);
    expect(g.findPath("lecturer", "nurse")).toBeNull();
  });

  it("respects the maximum number of steps", () => {
    expect(g.findPath("nurse", "lecturer", 1)).toBeNull();
  });

  it("falls back to a slower path with fewer moves when the step limit requires it", () => {
    // Quickest is 3 moves (8.5 years); with a 2-move limit it must use nurse -> doctor -> lecturer (10 years)
    const p = g.findPath("nurse", "lecturer", 2)!;
    expect(p.steps.map((s) => s.to.slug)).toEqual(["doctor", "lecturer"]);
    expect(p.totalYears).toBe(10);
  });

  it("localises to a country, and returns nothing local for global", () => {
    expect(g.localise("nurse", "ug")).toMatchObject({ regulator: "Nurses Council", location: { name: "Uganda" } });
    expect(g.localise("nurse", "global")).toEqual({ location: null, regulator: null });
    expect(g.localise("doctor", "UG").regulator).toBeNull();
  });

  it("rejects broken data", () => {
    expect(() => new CareerGraph({ ...data, transitions: [{ from: "nurse", to: "ghost", kind: "pivot", years: 1, via: "" }] })).toThrow(/unknown occupation/);
  });
});
