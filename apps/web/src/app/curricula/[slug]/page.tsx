import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CitedFact, Guidance, sourceBySlug } from "@/components/cited";
import { curricula, curriculaMeta, curriculum, curriculumSubjects, recognitionRoutes } from "@careerproof/reference-data";

export function generateStaticParams() {
  return curricula.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/curricula/[slug]">): Promise<Metadata> {
  const c = curriculum((await params).slug);
  return c ? {
    title: `${c.name}: grading, university entry and subjects`,
    description: `${c.name} (${c.body}): ${c.grading ?? c.level}`.slice(0, 300),
    alternates: { canonical: `/curricula/${c.slug}` },
  } : {};
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return value ? <div><dt className="text-sm text-ink-muted">{label}</dt><dd className="font-semibold">{value}</dd></div> : null;
}

async function Content({ params }: Pick<PageProps<"/curricula/[slug]">, "params">) {
  const c = curriculum((await params).slug);
  if (!c) notFound();
  const subjects = curriculumSubjects(c);
  const sources = [...new Set([...c.facts, ...c.universityUse].map((f) => f.source))].map(sourceBySlug);
  const next = (c.next ?? []).map(curriculum).filter((x) => x !== undefined);
  const routes = c.countries ? recognitionRoutes.filter((r) => !c.countries!.includes(r.country)) : recognitionRoutes;
  return (
    <>
      <PageBand kicker={c.family === "international" ? "International curriculum" : "National exam"} title={c.name} intro={c.body} />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <dl className="card grid gap-4 p-5 sm:grid-cols-2">
            <Fact label="Stage" value={c.level} />
            <Fact label="Typical ages" value={c.ages} />
            <Fact label="Course length" value={c.length} />
            <Fact label="Exam sessions" value={c.series} />
            <div className="sm:col-span-2"><Fact label="Grading" value={c.grading ?? "Not yet confirmed from an official source"} /></div>
          </dl>

          <section aria-labelledby="about" className="space-y-3">
            <h2 id="about" className="text-xl font-extrabold">Key facts</h2>
            <ul className="list-disc space-y-2 pl-5">{c.facts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
            {c.sourceNote && <p className="text-sm text-ink-muted">{c.sourceNote}</p>}
            {c.pending && <p className="rounded-lg bg-gold-50 p-3 text-sm text-ink"><strong>Not yet published:</strong> {c.pending}</p>}
          </section>

          {(c.universityUse.length > 0 || c.guidance || c.calculator) && (
            <section aria-labelledby="uni" className="space-y-3">
              <h2 id="uni" className="text-xl font-extrabold">How universities use it</h2>
              {c.universityUse.length > 0 && <ul className="list-disc space-y-2 pl-5">{c.universityUse.map((f) => <CitedFact key={f.text} {...f} />)}</ul>}
              {c.guidance && <Guidance>{c.guidance}</Guidance>}
              {c.calculator && <p><Link href={c.calculator.href} className="font-semibold">{c.calculator.label} &rarr;</Link></p>}
            </section>
          )}

          {subjects.length > 0 && (
            <section aria-labelledby="subjects" className="space-y-3">
              <h2 id="subjects" className="text-xl font-extrabold">Subjects and the careers they lead to</h2>
              <p className="text-sm text-ink-muted">Each subject links to our global subject page, which shows the careers that rely on it. {c.subjectsNote}</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {subjects.map((s) => (
                  <li key={s.name + s.code}>
                    <Link href={`/subjects/${s.subject}`} className="card card-link flex items-baseline justify-between gap-3 p-3 text-ink no-underline hover:text-ink">
                      <span>{s.name}{s.code && <span className="ml-2 text-xs text-ink-muted">{s.code}</span>}</span>
                      <span className="text-xs text-teal-800">{s.global.name} &rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {next.length > 0 && (
            <section aria-labelledby="next" className="space-y-3">
              <h2 id="next" className="text-xl font-extrabold">What students often take next</h2>
              <ul className="flex flex-wrap gap-2">{next.map((n) => <li key={n.slug}><Link href={`/curricula/${n.slug}`} className="chip bg-teal-50 text-teal-800">{n.name}</Link></li>)}</ul>
            </section>
          )}

          <section aria-labelledby="recog" className="space-y-3">
            <h2 id="recog" className="text-xl font-extrabold">Applying in another country</h2>
            <p className="text-sm text-ink-muted">The country where you apply decides how these results count. Official routes we have confirmed:</p>
            <ul className="space-y-1 text-sm">{routes.map((r) => <li key={r.country}><strong>{r.name}:</strong> <a href={r.url}>{r.body}</a></li>)}</ul>
            <p className="text-sm"><Link href="/curricula#recognition">Details for each country &rarr;</Link></p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-2 p-4 text-sm">
            <p className="font-semibold">Official page</p>
            <p><a href={c.url}>{c.body}</a></p>
          </div>
          <div className="card space-y-2 p-4 text-sm">
            <p className="font-semibold">Sources (checked {curriculaMeta.checkedAt})</p>
            <ul className="space-y-1">{sources.map((s) => <li key={s.slug}>{s.url ? <a href={s.url}>{s.name}</a> : s.name}</li>)}</ul>
          </div>
          <p className="text-sm"><Link href="/curricula">All curricula</Link></p>
        </aside>
      </Container>
    </>
  );
}

export default function CurriculumPage({ params }: PageProps<"/curricula/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading curriculum...</p></Container>}>
      <Content params={params} />
    </Suspense>
  );
}
