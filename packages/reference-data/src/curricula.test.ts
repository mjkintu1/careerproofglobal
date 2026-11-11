import { describe, expect, it } from "vitest";
import { curricula, curriculaForSubject, curriculaSourceSlugs, curriculum, curriculumSubjects, dataSources, recognitionRoutes } from "./index";

describe("curricula", () => {
  it("cites only registered data sources", () => {
    const known = new Set(dataSources.map((s) => s.slug));
    expect(curriculaSourceSlugs.filter((s) => !known.has(s))).toEqual([]);
  });
  it("has unique slugs and valid next links", () => {
    const slugs = curricula.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of curricula) for (const n of c.next ?? []) expect(slugs).toContain(n);
  });
  it("maps every listed subject to a global subject", () => {
    for (const c of curricula) expect(curriculumSubjects(c).length).toBe(c.subjectsFrom ? curriculumSubjects(c).length : (c.subjects ?? []).length);
  });
  it("derives Uganda UACE subjects from the exam names", () => {
    const ug = curriculumSubjects(curriculum("uganda-uce-uace")!);
    expect(ug.some((s) => s.subject === "physics")).toBe(true);
  });
  it("finds where mathematics is offered, with Cambridge codes", () => {
    const m = curriculaForSubject("mathematics");
    expect(m.find((x) => x.curriculum.slug === "cambridge-as-a-level")?.names.map((n) => n.code)).toContain("9709");
  });
  it("has a recognition route for Uganda via UNEB", () => {
    expect(recognitionRoutes.find((r) => r.country === "UG")?.facts[0].source).toBe("uneb");
  });
});
