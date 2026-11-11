/**
 * School-leaving curricula studied across countries (Cambridge, Pearson Edexcel, IB, AP/SAT) and the national
 * exams already covered (UCE/UACE, KCSE, WASSCE, NSC), with how universities use them and how each country
 * recognises foreign results. Facts are from the awarding or recognition body, cited by data-sources slug.
 */
import snap from "./curricula.json";
import { schoolSubjects, type SchoolSubject } from "./subjects";

export interface CitedFact { text: string; source: string }
export interface CurriculumSubject { name: string; code: string | null; subject: string }
export interface Curriculum {
  slug: string; name: string; body: string; family: "international" | "national"; countries?: string[];
  level: string; ages: string | null; length: string | null; grading: string | null; series: string | null;
  facts: CitedFact[]; universityUse: CitedFact[]; guidance: string | null;
  subjects?: CurriculumSubject[]; subjectsFrom?: string; subjectsNote?: string;
  url: string; sourceNote?: string; pending?: string; next?: string[];
  calculator?: { href: string; label: string };
}
export interface RecognitionRoute { country: string; name: string; body: string; facts: CitedFact[]; url: string }

export const curriculaMeta = snap.meta;
export const curricula = snap.curricula as Curriculum[];
export const recognitionRoutes = snap.recognition as RecognitionRoute[];
export const curriculum = (slug: string) => curricula.find((c) => c.slug === slug);

/** Subjects of a curriculum, each linked to a global subject. National exams reuse school-subjects.json exam names. */
export function curriculumSubjects(c: Curriculum): (CurriculumSubject & { global: SchoolSubject })[] {
  const list: CurriculumSubject[] = c.subjectsFrom
    ? schoolSubjects.flatMap((s) => (s.exams?.[c.subjectsFrom!] ?? []).map((name) => ({ name, code: null, subject: s.slug })))
    : c.subjects ?? [];
  return list.flatMap((x) => {
    const global = schoolSubjects.find((s) => s.slug === x.subject);
    return global ? [{ ...x, global }] : [];
  });
}

/** Where a global subject is offered: curriculum, syllabus name and code. */
export function curriculaForSubject(slug: string): { curriculum: Curriculum; names: { name: string; code: string | null }[] }[] {
  return curricula.flatMap((c) => {
    const names = curriculumSubjects(c).filter((x) => x.subject === slug).map(({ name, code }) => ({ name, code }));
    return names.length ? [{ curriculum: c, names }] : [];
  });
}

/** Every source slug cited by the curricula data (for tests and the sources list). */
export const curriculaSourceSlugs = [...new Set([...curricula, ...recognitionRoutes].flatMap((c) => [
  ...c.facts.map((f) => f.source), ...("universityUse" in c ? c.universityUse.map((f) => f.source) : []),
]))];
