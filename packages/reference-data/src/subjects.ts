/**
 * Global school-subject structure (ISCED-F 2013 + O*NET Knowledge) and O*NET career evidence:
 * which occupations rely on a subject, which subjects an occupation relies on, related
 * occupations and preparation levels. Server-side data; do not import into client components.
 */
import crosswalk from "./snapshots/esco-onet-crosswalk.json";
import knowledgeSnap from "./snapshots/onet-knowledge-related.json";
import onetSnap from "./snapshots/onet-occupations.json";
import subjectSnap from "./school-subjects.json";

export interface SchoolSubject { slug: string; name: string; group: string; isced: string[]; onet: string[]; exams?: Record<string, string[]> }
export const schoolSubjects = subjectSnap.subjects as SchoolSubject[];
export const subjectGroups = subjectSnap.groups;
export const subjectStandards = subjectSnap.meta.standards;
export const iscedFieldLabel = (code: string) => (subjectSnap.meta.iscedF as Record<string, string>)[code] ?? code;
export const schoolSubject = (slug: string) => schoolSubjects.find((s) => s.slug === slug);
export const onetEvidenceAttribution = knowledgeSnap.meta.attribution;

const elementIndex = new Map(knowledgeSnap.knowledgeElements.map((e, i) => [e.id, i]));
const elementName = new Map(knowledgeSnap.knowledgeElements.map((e) => [e.id, e.name]));
const knowledge = knowledgeSnap.knowledge as Record<string, (number | null)[]>;
const onetTitles = onetSnap.occupations as Record<string, { title: string; jobZone?: number | null }>;

/** O*NET code -> ESCO occupation codes (inverse of the official crosswalk; ESCO codes contain a dot). */
const escoByOnet = new Map<string, string[]>();
for (const [esco, socs] of Object.entries(crosswalk.map as Record<string, string[]>)) {
  if (!esco.includes(".")) continue;
  for (const soc of socs) escoByOnet.set(soc, [...(escoByOnet.get(soc) ?? []), esco]);
}

export interface EvidenceOccupation { onet: string; title: string; esco: string | null; importance: number }

/**
 * Importance of a subject for one occupation. Single-domain subjects use that domain's rating;
 * combined subjects (e.g. Environmental Science = Biology + Geography) use the average, because they need both.
 */
function subjectImportance(s: SchoolSubject, soc: string): number | null {
  const row = knowledge[soc];
  if (!row || !s.onet.length) return null;
  const vals = s.onet.map((id) => row[elementIndex.get(id) ?? -1]).filter((v): v is number => typeof v === "number");
  return vals.length === s.onet.length ? Math.round((vals.reduce((x, y) => x + y, 0) / vals.length) * 100) / 100 : null;
}

/** Occupations where the subject's knowledge is rated important (O*NET importance >= min, 1-5 scale). */
export function occupationsForSubject(slug: string, min = 4, limit = 24): EvidenceOccupation[] {
  const s = schoolSubject(slug);
  if (!s) return [];
  const out: EvidenceOccupation[] = [];
  for (const soc of Object.keys(knowledge)) {
    const imp = subjectImportance(s, soc);
    if (imp !== null && imp >= min && onetTitles[soc]) out.push({ onet: soc, title: onetTitles[soc].title, esco: escoByOnet.get(soc)?.[0] ?? null, importance: imp });
  }
  return out.sort((a, b) => b.importance - a.importance || a.title.localeCompare(b.title)).slice(0, limit);
}

/** Count of occupations rating the subject important, for the subject index. */
export function subjectEvidenceCount(slug: string, min = 4): number {
  const s = schoolSubject(slug);
  return s ? Object.keys(knowledge).filter((soc) => (subjectImportance(s, soc) ?? 0) >= min).length : 0;
}

/**
 * School subjects whose knowledge an O*NET occupation rates at least "Important" (3), most important first.
 * Subjects measured by the same O*NET domain are merged ("Economics or Accounting").
 */
export function subjectsForOnet(soc: string, min = 3): { subject: SchoolSubject; importance: number; alternatives: SchoolSubject[]; domain: string }[] {
  const scored = schoolSubjects
    .map((subject) => ({ subject, importance: subjectImportance(subject, soc) ?? 0 }))
    .filter((x) => x.importance >= min)
    .sort((a, b) => b.importance - a.importance || a.subject.onet.length - b.subject.onet.length);
  const out: { subject: SchoolSubject; importance: number; alternatives: SchoolSubject[]; domain: string }[] = [];
  for (const x of scored) {
    const key = [...x.subject.onet].sort().join();
    const same = out.find((y) => [...y.subject.onet].sort().join() === key);
    if (same) { same.alternatives.push(x.subject); continue; }
    out.push({ ...x, alternatives: [], domain: x.subject.onet.map((id) => elementName.get(id) ?? id).join(" + ") });
  }
  return out;
}

/** O*NET related occupations (primary tiers), with ESCO links where the crosswalk has one. */
export function relatedOnet(soc: string): { onet: string; title: string; esco: string | null }[] {
  return ((knowledgeSnap.related as Record<string, string[]>)[soc] ?? [])
    .filter((c) => onetTitles[c])
    .map((c) => ({ onet: c, title: onetTitles[c]!.title, esco: escoByOnet.get(c)?.[0] ?? null }));
}

export interface JobZone { name: string; experience: string; education: string; training: string }
/** Official O*NET Job Zone description (zones 1 and 2 share one description in O*NET 31.0). */
export function jobZoneInfo(zone: number | null | undefined): JobZone | null {
  if (!zone) return null;
  const zones = knowledgeSnap.jobZones as Record<string, JobZone>;
  return zones[String(Math.max(2, zone))] ?? null;
}

/** O*NET importance anchors: 1 Not important, 2 Somewhat, 3 Important, 4 Very, 5 Extremely important. */
export function importanceLabel(v: number): string {
  if (v >= 4.5) return "Extremely important";
  if (v >= 3.5) return "Very important";
  if (v >= 2.5) return "Important";
  if (v >= 1.5) return "Somewhat important";
  return "Not important";
}

// Guided careers <-> ESCO, and the O*NET evidence that follows from the official crosswalk.
import careerEsco from "./career-esco.json";
import { bestOnetFor } from "./catalogue";

export interface CareerEvidence {
  esco: string;
  escoTitle: string;
  isco: string;
  match: string;
  iscoAgrees: boolean | null;
  onet: { code: string; title: string; education: string | null; jobZone: number | null } | null;
  jobZone: JobZone | null;
  subjects: { subject: SchoolSubject; importance: number; alternatives: SchoolSubject[]; domain: string }[];
  related: { onet: string; title: string; esco: string | null }[];
}

/** Evidence for a guided career: its ESCO concept and the linked O*NET occupation's data. */
export function careerEvidence(careerSlug: string, careerTitle?: string): CareerEvidence | null {
  const link = (careerEsco.links as Record<string, { esco: string; escoTitle: string; isco: string; match: string; iscoAgrees: boolean | null }>)[careerSlug];
  if (!link) return null;
  const o = bestOnetFor(link.esco, careerTitle ?? link.escoTitle, link.escoTitle, (x) => Boolean(knowledge[x.code]));
  return {
    ...link,
    onet: o ? { code: o.code, title: o.title, education: o.education ?? null, jobZone: o.jobZone ?? null } : null,
    jobZone: jobZoneInfo(o?.jobZone),
    subjects: o ? subjectsForOnet(o.code) : [],
    related: o ? relatedOnet(o.code) : [],
  };
}

/** True when O*NET has knowledge ratings for the occupation (used to prefer evidence-rich links). */
export const hasOnetEvidence = (soc: string) => Boolean(knowledge[soc]);
