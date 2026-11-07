import type { Applicant } from "@careerproof/rules-engine";

export interface Preset {
  id: string;
  label: string;
  applicant: Applicant;
}

/** Example students so a demo can start with one click. Not real people. */
export const presets: Record<string, Preset[]> = {
  UG: [
    {
      id: "bcm",
      label: "Biology, Chemistry, Maths (female)",
      applicant: {
        results: { BIO: "B", CHE: "B", MAT: "C", GP: "Pass", SICT: "Pass" },
        secondaryBands: { distinction: 3, credit: 5, pass: 2 },
        sex: "F",
      },
    },
    {
      id: "pcm",
      label: "Physics, Chemistry, Maths (male)",
      applicant: {
        results: { PHY: "A", CHE: "B", MAT: "A", GP: "Pass", SICT: "Pass" },
        secondaryBands: { distinction: 5, credit: 4, pass: 1 },
        sex: "M",
      },
    },
    {
      id: "heg",
      label: "History, Economics, Geography (female)",
      applicant: {
        results: { HIS: "B", ECO: "A", GEO: "B", GP: "Pass", SMAT: "Pass" },
        secondaryBands: { distinction: 2, credit: 5, pass: 3 },
        sex: "F",
      },
    },
  ],
  KE: [
    {
      id: "sciences",
      label: "Strong sciences",
      applicant: {
        results: { ENG: "B", KIS: "B-", MAT: "A-", BIO: "A", CHE: "A-", PHY: "B+", GEO: "B" },
      },
    },
    {
      id: "humanities",
      label: "Humanities and business",
      applicant: {
        results: { ENG: "A-", KIS: "B+", MAT: "C+", HIS: "A", GEO: "B+", CRE: "A-", BST: "B" },
      },
    },
  ],
};
