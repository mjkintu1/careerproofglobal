import type { Applicant } from "@careerproof/rules-engine";

export interface Preset {
  id: string;
  label: string;
  applicant: Applicant;
}

/** Distinction or credit at subsidiary level (Uganda): 1 point. */
const SUB = "Distinction or credit (D1 to C6)";

/** Example students so the tool can start with one click. Not real people. */
export const presets: Record<string, Preset[]> = {
  UG: [
    {
      id: "bcm",
      label: "Biology, Chemistry, Maths (female)",
      applicant: {
        results: { BIO: "B", CHE: "B", MAT: "C", GP: SUB, SICT: SUB },
        secondaryBands: { distinction: 3, credit: 5, pass: 2 },
        sex: "F",
      },
    },
    {
      id: "pcm",
      label: "Physics, Chemistry, Maths (male)",
      applicant: {
        results: { PHY: "A", CHE: "B", MAT: "A", GP: SUB, SICT: SUB },
        secondaryBands: { distinction: 5, credit: 4, pass: 1 },
        sex: "M",
      },
    },
    {
      id: "heg",
      label: "History, Economics, Geography (female)",
      applicant: {
        results: { HIS: "B", ECO: "A", GEO: "B", GP: SUB, SMAT: SUB },
        secondaryBands: { distinction: 2, credit: 5, pass: 3 },
        sex: "F",
      },
    },
  ],
};
