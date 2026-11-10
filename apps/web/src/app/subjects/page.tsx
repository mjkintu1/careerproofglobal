import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/home/section-heading";
import { PageBand } from "@/components/page-band";
import { SubjectSelector } from "@/components/subject-selector";
import { searchItems } from "@/lib/careers";
import { subjectGroups, subjectStandards } from "@careerproof/reference-data";
import { subjects, subjectsForCareer } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "School subjects and the careers they lead to",
  description: "See which careers each school subject keeps open, or pick a dream career to see the subjects to take.",
};

export default function SubjectsPage() {
  const subjectsByCareer = Object.fromEntries(searchItems.map((c) => [c.slug, subjectsForCareer(c.slug)]));
  return (
    <>
      <PageBand kicker="Your journey" title="Make the right subject choices"
        intro="Know how your school subjects relate to your dream career, before you choose them." />
      <Container className="space-y-12 py-10">
        <SubjectSelector careers={searchItems} subjectsByCareer={subjectsByCareer} />
        <section aria-labelledby="subjects-heading" className="space-y-8">
          <div className="space-y-2">
            <SectionHeading id="subjects-heading" kicker="Subjects" title={`${subjects.length} subjects, one global structure`} />
            <p className="max-w-3xl text-ink-muted">
              Every subject is linked to the field of study it leads into (UNESCO ISCED-F 2013) and to how much each occupation relies on its
              knowledge (O*NET), so the same structure works for any country&apos;s exams.
            </p>
          </div>
          {[...subjectGroups, { id: "other", name: "Other subjects" }].map((g) => {
            const list = subjects.filter((s) => s.group === g.id);
            if (!list.length) return null;
            return (
              <div key={g.id} className="space-y-3">
                <h3 className="text-lg font-bold">{g.name}</h3>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/subjects/${s.slug}`} className="card card-link flex h-full flex-col gap-2 p-5 text-ink no-underline hover:text-ink">
                        <span className="font-display text-lg font-bold">{s.name}</span>
                        <span className="text-sm text-ink-muted">{s.about}</span>
                        <span className="mt-auto flex flex-wrap gap-2">
                          {s.uses.length > 0 && <span className="chip bg-teal-50 text-teal-800">{s.uses.length} guided career{s.uses.length === 1 ? "" : "s"}</span>}
                          {s.evidence > 0 && <span className="chip bg-surface-muted text-ink">{s.evidence} occupations rely on it</span>}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <p className="text-xs text-ink-muted">
            Standards: {subjectStandards.map((x, i) => <span key={x.url}>{i ? "; " : ""}<a href={x.url}>{x.name}</a> ({x.publisher})</span>)}.
            &quot;Rely on it&quot; means O*NET rates the subject&apos;s knowledge very important (4 or more out of 5) for the occupation.
          </p>
        </section>
      </Container>
    </>
  );
}
