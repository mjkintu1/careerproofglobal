import type { Occupation } from "@careerproof/career-graph";
import { schoolSubjects, subjectEvidenceCount } from "@careerproof/reference-data";
import { subjectRules } from "@careerproof/sample-data";
import { graph } from "./careers";

const GENERIC = new Set(subjectRules.generic);
const ALIASES = subjectRules.aliases;
const ABOUT = subjectRules.about;

export interface SubjectUse { occupation: Occupation; required: boolean }
export interface Subject {
  slug: string;
  name: string;
  about: string;
  uses: SubjectUse[];
  /** Global structure (reference-data/school-subjects.json). */
  group: string;
  isced: string[];
  onet: string[];
  exams: Record<string, string[]>;
  /** O*NET occupations rating this subject's knowledge "very important" (4+). */
  evidence: number;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(phrase: string): { name: string; required: boolean }[] {
  if (GENERIC.has(phrase.toLowerCase())) return [];
  const parts = phrase.split(/\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => ({ name: ALIASES[p] ?? p, required: parts.length === 1 }));
}

function build(): Subject[] {
  const canon = new Map(schoolSubjects.map((c) => [c.slug, c]));
  const make = (slug: string, name: string): Subject => {
    const c = canon.get(slug);
    return {
      slug, name: c?.name ?? name, about: ABOUT[c?.name ?? name] ?? ABOUT[name] ?? `How ${c?.name ?? name} connects to careers and further study.`, uses: [],
      group: c?.group ?? "other", isced: c?.isced ?? [], onet: c?.onet ?? [], exams: c?.exams ?? {}, evidence: c ? subjectEvidenceCount(slug) : 0,
    };
  };
  const map = new Map<string, Subject>(schoolSubjects.map((c) => [c.slug, make(c.slug, c.name)]));
  for (const o of graph.occupations()) {
    for (const phrase of o.subjects) {
      for (const { name, required } of parse(phrase)) {
        const slug = slugify(name);
        const s = map.get(slug) ?? make(slug, name);
        if (!s.uses.some((u) => u.occupation.slug === o.slug)) s.uses.push({ occupation: o, required });
        map.set(slug, s);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.uses.length - a.uses.length || b.evidence - a.evidence || a.name.localeCompare(b.name));
}

export const subjects = build();

export function findSubject(slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

/** Subjects for one career, for the subject selector. */
export function subjectsForCareer(slug: string): { name: string; slug: string; required: boolean }[] {
  const o = graph.get(slug);
  if (!o) return [];
  return o.subjects.flatMap(parse).map((p) => ({ ...p, slug: slugify(p.name) }));
}
