import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CitedFact } from "@/components/cited";
import { curricula, curriculaMeta, curriculumSubjects, recognitionRoutes, type Curriculum } from "@careerproof/reference-data";

export const metadata: Metadata = {
  title: "School curricula: Cambridge, Pearson Edexcel, IB, AP and national exams",
  description: "How Cambridge IGCSE and A Levels, Pearson Edexcel International, the IB Diploma, AP and the SAT, UACE, KCSE, WASSCE and the NSC are graded, how universities use them, and how countries recognise foreign results.",
  alternates: { canonical: "/curricula" },
};

function CurriculumCard({ c }: { c: Curriculum }) {
  const n = curriculumSubjects(c).length;
  return (
    <li>
      <Link href={`/curricula/${c.slug}`} className="card card-link block h-full space-y-2 p-5 text-ink no-underline hover:text-ink">
        <span className="block font-display text-lg font-bold">{c.name}</span>
        <span className="block text-sm text-ink-muted">{c.body}</span>
        <span className="block text-sm">{c.level}</span>
        {c.grading && <span className="block text-sm text-ink-muted">Grading: {c.grading.split(". ")[0]}.</span>}
        {n > 0 && <span className="chip bg-teal-50 text-teal-800">{n} subjects linked to careers</span>}
      </Link>
    </li>
  );
}

export default function Page() {
  const intl = curricula.filter((c) => c.family === "international");
  const national = curricula.filter((c) => c.family === "national");
  return (
    <>
      <PageBand kicker="Where to Study" title="School curricula and exams"
        intro="International and national school-leaving qualifications: how they are graded, how universities use them, and which subjects lead to which careers. Every fact comes from the awarding body or an official admissions or recognition body." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="intl" className="space-y-4">
          <h2 id="intl" className="text-2xl font-extrabold">International curricula</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{intl.map((c) => <CurriculumCard key={c.slug} c={c} />)}</ul>
        </section>
        <section aria-labelledby="national" className="space-y-4">
          <h2 id="national" className="text-2xl font-extrabold">National exams</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{national.map((c) => <CurriculumCard key={c.slug} c={c} />)}</ul>
        </section>
        <section id="recognition" aria-labelledby="recog" className="scroll-mt-24 space-y-4">
          <h2 id="recog" className="text-2xl font-extrabold">Using foreign results at home: recognition by country</h2>
          <p className="max-w-3xl text-ink-muted">If you studied one curriculum and apply to university in another country, that country decides how your results count. These are the official routes we have confirmed so far.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {recognitionRoutes.map((r) => (
              <article key={r.country} className="card space-y-2 p-5">
                <h3 className="font-display text-lg font-bold">{r.name}</h3>
                <p className="text-sm font-semibold"><a href={r.url}>{r.body}</a></p>
                <ul className="list-disc space-y-1 pl-5 text-sm">{r.facts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
              </article>
            ))}
          </div>
        </section>
        <p className="text-sm text-ink-muted">Checked {curriculaMeta.checkedAt}. {curriculaMeta.method}</p>
      </Container>
    </>
  );
}
