import { describe, expect, it } from "vitest";
import { jobZoneInfo, occupationsForSubject, relatedOnet, schoolSubjects, subjectsForOnet } from "./subjects";

describe("global subject structure and O*NET evidence", () => {
  it("every subject has a group and an ISCED-F code", () => {
    for (const s of schoolSubjects) {
      expect(s.group).toBeTruthy();
      expect(s.isced.every((c) => /^\d{4}$/.test(c))).toBe(true);
    }
  });

  it("accountants rely on economics/accounting and mathematics knowledge", () => {
    const names = subjectsForOnet("13-2011.00").map((x) => x.subject.name);
    expect(names).toContain("Economics");
    expect(names).toContain("Mathematics");
  });

  it("biology matters most in life-science and health occupations", () => {
    const top = occupationsForSubject("biology", 4, 10).map((o) => o.title).join(" ");
    expect(top).toMatch(/Biolog|Microbiolog|Medical|Physician|Zoolog|Veterinar/);
  });

  it("returns related occupations and job-zone descriptions", () => {
    expect(relatedOnet("13-2011.00").length).toBeGreaterThan(0);
    expect(jobZoneInfo(4)?.name).toMatch(/Job Zone Four/);
    expect(jobZoneInfo(1)?.name).toMatch(/Job Zone 1-2/);
  });
});
