import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { careerHref, clusterName, GLOBAL } from "@/lib/careers";
import { findSubject, subjects, type SubjectUse } from "@/lib/subjects";

export function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/subjects/[slug]">): Promise<Metadata> {
  const s = findSubject((await params).slug);
  return s ? { title: `Careers with ${s.name}`, description: s.about } : {};
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
        <p><Link href="/subjects">All subjects</Link></p>
      </Container>
    </>
  );
}

export default function SubjectPage({ params }: PageProps<"/subjects/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading subject...</p></Container>}>
      <SubjectContent params={params} />
    </Suspense>
  );
}
