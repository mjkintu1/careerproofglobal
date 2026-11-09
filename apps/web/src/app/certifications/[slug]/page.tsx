import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, ExternalLink, Route } from "lucide-react";
import { certification, certifications, certificationsCheckedAt } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { careerHref, GLOBAL, graph } from "@/lib/careers";

export function generateStaticParams() {
  return certifications.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/certifications/[slug]">): Promise<Metadata> {
  const c = certification((await params).slug);
  return c ? { title: `${c.name}: what it is and who it is for`, description: c.summary } : {};
}

async function CertContent({ params }: Pick<PageProps<"/certifications/[slug]">, "params">) {
  const c = certification((await params).slug);
  if (!c) notFound();
  const careers = c.careers.map((s) => graph.get(s)).filter((o) => o !== undefined);
  return (
    <>
      <PageBand kicker={c.category} title={c.name} intro={c.summary}>
        <p className="flex flex-wrap gap-2"><span className="chip bg-navy-800 text-white">{c.issuer}</span><span className="chip bg-navy-800 text-teal-500">{c.level}</span></p>
      </PageBand>
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="facts" className="card space-y-4 p-6">
          <h2 id="facts" className="text-xl font-extrabold">Key facts from the issuer</h2>
          <ul className="space-y-3">
            {c.facts.map((f) => (
              <li key={f} className="flex gap-3"><CheckCircle2 aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-teal-700" /><span>{f}</span></li>
            ))}
          </ul>
          <p className="text-xs text-ink-muted">
            Source: <a href={c.url} rel="noopener noreferrer" className="inline-flex items-center gap-1">{c.issuer} official page <ExternalLink aria-hidden="true" size={12} /></a>, checked {certificationsCheckedAt}. Fees, rules and syllabuses change; confirm with the issuer before you enrol.
          </p>
        </section>
        <aside className="space-y-5" aria-label="Related careers">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Route aria-hidden="true" size={18} className="text-teal-700" /> Careers it supports</h2>
            <ul className="space-y-1">{careers.map((o) => <li key={o.slug}><Link href={careerHref(GLOBAL, o.slug)}>{o.title}</Link></li>)}</ul>
          </div>
          <p className="text-sm"><Link href="/certifications">All certifications and the guide</Link></p>
        </aside>
      </Container>
    </>
  );
}

export default function CertificationPage({ params }: PageProps<"/certifications/[slug]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading...</p></Container>}>
      <CertContent params={params} />
    </Suspense>
  );
}
