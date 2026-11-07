// Test fixtures. Shapes match the illustrative rule sets in packages/sample-data;
// values are for testing arithmetic only.
import type { Programme, RuleSet } from "./types";

export const ugRules: RuleSet = {
  framework: "UG-TEST",
  region: "UG",
  version: "test",
  status: "illustrative",
  label: "Uganda test",
  pointsLabel: "weighted points",
  grades: {
    principal: { A: 6, B: 5, C: 4, D: 3, E: 2, O: 1, F: 0 },
    subsidiary: { Pass: 1, Fail: 0 },
  },
  subjects: {
    PHY: { name: "Physics", scale: "principal" },
    CHE: { name: "Chemistry", scale: "principal" },
    BIO: { name: "Biology", scale: "principal" },
    MAT: { name: "Mathematics", scale: "principal" },
    ECO: { name: "Economics", scale: "principal" },
    GP: { name: "General Paper", scale: "subsidiary" },
    SMAT: { name: "Subsidiary Mathematics", scale: "subsidiary" },
    SICT: { name: "Subsidiary ICT", scale: "subsidiary" },
  },
  scoring: {
    method: "weighted_categories",
    categories: [
      { role: "essential", pick: 2, weight: 3, required: true },
      { role: "relevant", pick: 1, weight: 2, required: false },
      { role: "desirable", pick: 1, weight: 1, required: false },
    ],
    secondaryBonus: {
      label: "UCE bonus",
      bands: [
        { id: "distinction", label: "Distinctions", points: 0.3 },
        { id: "credit", label: "Credits", points: 0.2 },
        { id: "pass", label: "Passes", points: 0.1 },
      ],
      maxSubjects: 10,
    },
  },
  eligibility: {
    minPasses: { scale: "principal", count: 2, minPoints: 2, label: "Needs 2 principal passes" },
  },
  adjustments: [
    { id: "female", label: "Female bonus", points: 1.5, when: { sex: "F", institutionType: "public" } },
  ],
  zones: { window: 5, minYears: 2, safeMargin: 1 },
};

export const ugMedicine: Programme = {
  id: "med",
  code: "T-1",
  title: "Medicine",
  institution: "Test University",
  institutionType: "public",
  field: "medicine",
  requirements: { essential: ["BIO", "CHE"], relevant: ["PHY", "MAT"], desirable: ["GP", "SMAT", "SICT"] },
  cutoffs: [
    { year: 2021, points: 48.5 },
    { year: 2022, points: 49.0 },
    { year: 2023, points: 48.9 },
    { year: 2024, points: 49.3 },
    { year: 2025, points: 49.1 },
  ],
};

export const keRules: RuleSet = {
  framework: "KE-TEST",
  region: "KE",
  version: "test",
  status: "illustrative",
  label: "Kenya test",
  pointsLabel: "cluster points",
  grades: {
    kcse: { A: 12, "A-": 11, "B+": 10, B: 9, "B-": 8, "C+": 7, C: 6, "C-": 5, "D+": 4, D: 3, "D-": 2, E: 1 },
  },
  subjects: Object.fromEntries(
    ["ENG", "KIS", "MAT", "BIO", "CHE", "PHY", "GEO"].map((c) => [c, { name: c, scale: "kcse" }]),
  ),
  scoring: {
    method: "cluster_geometric",
    clusterSize: 4,
    maxClusterPoints: 48,
    aggregateSubjects: 7,
    maxAggregatePoints: 84,
    multiplier: 48,
  },
  eligibility: { minMean: { subjects: 7, minMean: 7, label: "Needs mean grade C+" } },
  adjustments: [],
  zones: { window: 5, minYears: 2, safeMargin: 1 },
};

export const keMedicine: Programme = {
  id: "ke-med",
  code: "T-2",
  title: "Medicine",
  institution: "Test University",
  institutionType: "public",
  field: "medicine",
  requirements: {
    cluster: ["BIO", "CHE", "MAT", "PHY", "ENG", "KIS"],
    mandatory: [{ subject: "BIO", minGrade: "B" }],
  },
  cutoffs: [
    { year: 2024, points: 45.6 },
    { year: 2025, points: 45.8 },
  ],
};
