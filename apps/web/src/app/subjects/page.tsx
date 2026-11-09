import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/home/section-heading";
import { PageBand } from "@/components/page-band";
import { SubjectSelector } from "@/components/subject-selector";
import { searchItems } from "@/lib/careers";
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
        <section aria-labelledby="subjects-heading" className="space-y-6">
          <SectionHeading id="subjects-heading" kicker="Subjects" title={`${subjects.length} subjects`} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => (
              <li key={s.slug}>
                <Link href={`/subjects/${s.slug}`} className="card card-link flex h-full flex-col gap-2 p-5 text-ink no-underline hover:text-ink">
                  <span className="font-display text-lg font-bold">{s.name}</span>
                  <span className="text-sm text-ink-muted">{s.about}</span>
                  <span className="chip mt-auto self-start bg-teal-50 text-teal-800">{s.uses.length} career{s.uses.length === 1 ? "" : "s"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
