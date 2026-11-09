/**
 * ILLUSTRATIVE CAREER DATA for demos and tests.
 * Written for Career Proof (not copied from any other site). ISCO-08 codes,
 * typical years and regulators are best-effort and NOT yet verified.
 */
import type { CareerGraphData, Occupation, Transition, TransitionKind } from "@careerproof/career-graph";
import clusters from "./clusters.json";
import countries from "./countries.json";
import locationDetails from "./locations.json";
import agriculture from "./occ-agriculture.json";
import business from "./occ-business.json";
import construction from "./occ-construction.json";
import creative from "./occ-creative.json";
import education from "./occ-education.json";
import engineering from "./occ-engineering.json";
import health from "./occ-health.json";
import hospitalityScience from "./occ-hospitality-science.json";
import law from "./occ-law.json";
import technology from "./occ-technology.json";
import technology2 from "./occ-technology-2.json";
import transport from "./occ-transport.json";
import regulatorsRaw from "./regulators.json";
import skills from "./skills.json";
import subjectRulesRaw from "./subjects.json";
import transitions1 from "./transitions-1.json";
import transitions2 from "./transitions-2.json";

type RawTransition = [string, string, string, number, string];

const occupations = [
  ...health, ...engineering, ...technology, ...technology2, ...business, ...law,
  ...education, ...agriculture, ...creative, ...construction, ...hospitalityScience, ...transport,
] as Occupation[];

const transitions: Transition[] = ([...transitions1, ...transitions2] as RawTransition[]).map(
  ([from, to, kind, years, via]) => ({ from, to, kind: kind as TransitionKind, years, via }),
);

const regulators = Object.fromEntries(
  Object.entries(regulatorsRaw).filter(([k]) => !k.startsWith("_")),
) as Record<string, Record<string, string>>;

/** Every country (ISO 3166-1, plus Kosovo), with extra detail where we have it. */
const details = new Map(locationDetails.map((l) => [l.code, l]));
const locations = countries.map((c) => {
  const d = details.get(c.code);
  return d ? { code: c.code, name: c.name, currency: d.currency, secondaryExams: d.secondaryExams } : c;
});

export const careerGraphData: CareerGraphData = {
  clusters,
  skills,
  locations,
  occupations,
  transitions,
  regulators,
};


export interface SubjectRules {
  generic: string[];
  aliases: Record<string, string>;
  about: Record<string, string>;
}

/** Shared rules for turning career subject phrases into a subject list. */
export const subjectRules: SubjectRules = subjectRulesRaw;
