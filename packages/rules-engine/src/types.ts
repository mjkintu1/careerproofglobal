/**
 * Core types for the rules engine.
 *
 * A RuleSet is plain JSON stored (versioned) in the database. The engine never
 * hard-codes a country: grade scales, scoring method, eligibility and bonuses
 * all come from the RuleSet. Adding a country = adding a RuleSet, not code,
 * unless it needs a scoring method the engine does not have yet.
 */

/** Grade label -> points, e.g. { A: 6, B: 5 } or { pass: 1, fail: 0 }. */
export type GradeScale = Record<string, number>;

export type RuleSetStatus = "draft" | "illustrative" | "published" | "retired";

export interface SubjectDef {
  name: string;
  /** Key into RuleSet.grades. */
  scale: string;
}

export type CategoryRole = "essential" | "relevant" | "desirable";

/** Uganda-style: best N subjects from each programme category, multiplied by a weight. */
export interface WeightedCategoriesScoring {
  method: "weighted_categories";
  categories: {
    role: CategoryRole;
    pick: number;
    weight: number;
    /** If true, the programme is blocked unless `pick` passed subjects fill this category. */
    required: boolean;
  }[];
  /** Optional bonus from a lower-level exam, entered as counts per band (e.g. distinctions). */
  secondaryBonus?: {
    label: string;
    bands: { id: string; label: string; points: number }[];
    maxSubjects: number;
  };
}

/** Kenya KUCCPS-style: C = sqrt((r/R) * (t/T)) * multiplier. */
export interface ClusterGeometricScoring {
  method: "cluster_geometric";
  /** Number of cluster subjects counted (r is their sum). */
  clusterSize: number;
  /** R: maximum possible r. */
  maxClusterPoints: number;
  /** Number of best subjects in the aggregate (t is their sum). */
  aggregateSubjects: number;
  /** T: maximum possible t. */
  maxAggregatePoints: number;
  multiplier: number;
}

export type Scoring = WeightedCategoriesScoring | ClusterGeometricScoring;

export interface Adjustment {
  id: string;
  label: string;
  points: number;
  when: { sex?: "F" | "M"; institutionType?: "public" | "private" };
}

export interface Eligibility {
  /** At least `count` subjects on `scale` with >= `minPoints` each. */
  minPasses?: { scale: string; count: number; minPoints: number; label: string };
  /** Mean points over the best `subjects` subjects must be >= `minMean`. */
  minMean?: { subjects: number; minMean: number; label: string };
}

export interface ZoneConfig {
  /** How many most-recent intake years to consider. */
  window: number;
  /** Fewer years than this -> "no_data". */
  minYears: number;
  /** Points above the highest past cut-off needed to call it "safe". */
  safeMargin: number;
}

export interface RuleSet {
  /** Framework code, e.g. "UG-UACE". */
  framework: string;
  /** ISO country code, e.g. "UG". */
  region: string;
  /** Rule-set version, e.g. "2026.1". Recorded on every simulation result. */
  version: string;
  status: RuleSetStatus;
  /** Human-readable name, e.g. "Uganda public university admission (PUJAB)". */
  label: string;
  /** Name for points shown to users, e.g. "weighted points" or "cluster points". */
  pointsLabel: string;
  grades: Record<string, GradeScale>;
  subjects: Record<string, SubjectDef>;
  scoring: Scoring;
  eligibility: Eligibility;
  adjustments: Adjustment[];
  zones: ZoneConfig;
}

export interface Cutoff {
  year: number;
  points: number;
  scheme?: string;
  sex?: "any" | "F" | "M";
}

export interface Programme {
  id: string;
  code: string;
  title: string;
  institution: string;
  institutionType: "public" | "private";
  field: string;
  requirements: {
    essential?: string[];
    relevant?: string[];
    desirable?: string[];
    cluster?: string[];
    mandatory?: { subject: string; minGrade: string }[];
  };
  cutoffs: Cutoff[];
}

export interface Applicant {
  /** Subject code -> grade label, for the rule set framework. */
  results: Record<string, string>;
  /** Band id -> number of subjects (for secondaryBonus). */
  secondaryBands?: Record<string, number>;
  sex?: "F" | "M";
}

export type Zone = "safe" | "borderline" | "danger" | "no_data";

export interface BreakdownLine {
  label: string;
  detail: string;
  points: number;
}

export interface ProgrammeResult {
  programme: Programme;
  eligible: boolean;
  /** Plain-language reasons the programme is closed to this applicant. */
  blockedBy: string[];
  points: number | null;
  breakdown: BreakdownLine[];
  zone: Zone | null;
  cutoffRange: { min: number; max: number; years: number[] } | null;
}
