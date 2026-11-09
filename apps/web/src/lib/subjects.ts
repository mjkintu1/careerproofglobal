import type { Occupation } from "@careerproof/career-graph";
import { subjectRules } from "@careerproof/sample-data";
import { graph } from "./careers";

const GENERIC = new Set(subjectRules.generic);
const ALIASES = subjectRules.aliases;
const ABOUT = subjectRules.about;

export interface SubjectUse { occupation: Occupation; required: boolean }
export interface Subject { slug: string; name: string; about: string; uses: SubjectUse[] }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(phrase: string): { name: string; required: boolean }[] {
  if (GENERIC.has(phrase.toLowerCase())) return [];
  const parts = phrase.split(/\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => ({ name: ALIASES[p] ?? p, required: parts.length === 1 }));
}

function build(): Subject[] {
  const map = new Map<string, Subject>();
  for (const o of graph.occupations()) {
    for (const phrase of o.subjects) {
      for (const { name, required } of parse(phrase)) {
        const slug = slugify(name);
        const s = map.get(slug) ?? { slug, name, about: ABOUT[name] ?? `How ${name} connects to careers.`, uses: [] };
        if (!s.uses.some((u) => u.occupation.slug === o.slug)) s.uses.push({ occupation: o, required });
        map.set(slug, s);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.uses.length - a.uses.length || a.name.localeCompare(b.name));
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
