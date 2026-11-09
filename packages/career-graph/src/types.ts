export type Level = "none" | "certificate" | "diploma" | "bachelor" | "master" | "doctorate";
export type RouteType = "degree" | "diploma" | "certificate" | "apprenticeship" | "certification" | "licence" | "experience";
export type TransitionKind = "progression" | "specialisation" | "pivot";

export interface Cluster {
  slug: string;
  name: string;
  description: string;
}

export interface Location {
  /** ISO country code, e.g. "UG". */
  code: string;
  name: string;
  /** ISO 4217 code, when recorded. */
  currency?: string;
  /** School-leaving exams, when recorded. */
  secondaryExams?: string;
}

export interface Route {
  type: RouteType;
  title: string;
  years: number;
}

export interface Occupation {
  slug: string;
  title: string;
  /** ISCO-08 unit group, when known. */
  isco: string | null;
  cluster: string;
  level: Level;
  /** Holland interest code, e.g. "IRC". */
  riasec: string;
  summary: string;
  tasks: string[];
  skills: string[];
  subjects: string[];
  routes: Route[];
}

export interface Transition {
  from: string;
  to: string;
  kind: TransitionKind;
  years: number;
  via: string;
}

export interface CareerGraphData {
  clusters: Cluster[];
  skills: Record<string, string>;
  locations: Location[];
  occupations: Occupation[];
  transitions: Transition[];
  /** occupation slug -> country code -> licensing body. */
  regulators: Record<string, Record<string, string>>;
}

export interface PathStep {
  from: Occupation;
  to: Occupation;
  transition: Transition;
}

export interface CareerPath {
  steps: PathStep[];
  totalYears: number;
}
