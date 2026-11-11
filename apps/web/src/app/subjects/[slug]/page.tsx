import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { careerHref, clusterName, GLOBAL } from "@/lib/careers";
import { curriculaForSubject, iscedFieldLabel, importanceLabel, occupationsForSubject, onetEvidenceAttribution, subjectGroups } from "@careerproof/reference-data";
import { findSubject, subjects, type SubjectUse } from "@/lib/subjects";

export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/subjects/[slug]">): Promise<Metadata> {
  const s = findSubject((await params).slug);
  return s ? seo(`/subjects/${s.slug}`, { title: `Careers with ${s.name}`, description: s.about }) : {};
}

function CareerGrid({ uses }: { uses: SubjectUse[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {uses.map(({ occupation: o }) => (
        <li key={o.slug}>
          <Link href={careerHref(GLOBAL, o.slug)} className="card card-link block h-full p-4 text-ink no-underline hover:text-ink">
            <span className="block font-display font-bold">{o.title}</span>
            <span className="text-sm text-ink-muted">{clusterName(o.cluster)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function SubjectContent({ params }: Pick<PageProps<"/subjects/[slug]">, "params">) {
  const s = findSubject((await params).slug);
  if (!s) notFound();
  const needed = s.uses.filter((u) => u.required);
  const option = s.uses.filter((u) => !u.required);
  return (
    <>
      <PageBand kicker="Subject" title={s.name} intro={s.about} />
      <Container className="space-y-10 py-10">
        <section aria-label="Where this subject fits" className="card grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-sm text-ink-muted">Subject group</p>
            <p className="font-semibold">{subjectGroups.find((g) => g.id === s.group)?.name ?? "Other"}</p>
          </div>
          <div>
            <p className="text-sm text-ink-muted">Leads into (UNESCO ISCED-F 2013)</p>
            {s.isced.length ? s.isced.map((c) => <p key={c} className="font-semibold">{c} {iscedFieldLabel(c)}</p>) : <p className="text-ink-muted">Not classified yet</p>}
          </div>
          <div>
            <p className="text-sm text-ink-muted">Offered in (<Link href="/curricula">curricula</Link>)</p>
            {curriculaForSubject(s.slug).length ? curriculaForSubject(s.slug).map(({ curriculum: c, names }) => (
              <p key={c.slug}><Link href={`/curricula/${c.slug}`} className="font-semibold">{c.name}</Link>: {names.map((n) => (n.code ? `${n.name} (${n.code})` : n.name)).join(", ")}</p>
            )) : <p className="text-ink-muted">Being added country by country</p>}
          </div>
        </section>
        {needed.length > 0 && (
          <section aria-labelledby="needed" className="space-y-4">
            <h2 id="needed" className="text-xl font-extrabold">Careers that need {s.name} ({needed.length})</h2>
            <CareerGrid uses={needed} />
          </section>
        )}
        {option.length > 0 && (
          <section aria-labelledby="option" className="space-y-4">
            <h2 id="option" className="text-xl font-extrabold">Careers where {s.name} is one option ({option.length})</h2>
            <CareerGrid uses={option} />
          </section>
        )}
        <EvidenceSection slug={s.slug} name={s.name} />
        <p><Link href="/subjects">All subjects</Link></p>
      </Container>
    </>
  );
}

function EvidenceSection({ slug, name }: { slug: string; name: string }) {
  const list = occupationsForSubject(slug, 4, 24);
  if (!list.length) return null;
  return (
    <section aria-labelledby="evidence" className="space-y-4">
      <div>
        <h2 id="evidence" className="text-xl font-extrabold">Where {name} matters most at work</h2>
        <p className="text-ink-muted">Occupations where O*NET rates this knowledge very important (4 or more out of 5), based on surveys of people doing the job.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((o) => (
          <li key={o.onet} className="card flex h-full flex-col gap-1 p-4">
            {o.esco ? <Link href={`/occupations/${o.esco}`} className="font-display font-bold">{o.title}</Link>
              : <a href={`https://www.onetonline.org/link/summary/${o.onet}`} className="font-display font-bold">{o.title}</a>}
            <span className="text-sm text-ink-muted">{importanceLabel(o.importance)} ({o.importance.toFixed(1)} of 5)</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">{onetEvidenceAttribution}</p>
    </section>
  );
}

export default function SubjectPage({ params }: PageProps<"/subjects/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading subject...</p></Container>}>
      <SubjectContent params={params} />
    </Suspense>
  );
}
