import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { FAQ_CHECKED, faqSource, faqTopics, type Faq } from "@/lib/faqs";
import { OPERATOR, SITE_URL } from "@/lib/site";

export const metadata: Metadata = seo("/faqs", {
  title: "Frequently asked questions",
  description: "Answers on choosing subjects, university entry and cut-off points, recognition abroad, pay figures and changing career, each citing the official source it relies on.",
});

/** Plain-text answer for structured data: sourced facts, then our guidance. */
const answerText = (f: Faq) => [...f.facts, ...(f.guidance ? [`CareerProof guidance: ${f.guidance}`] : [])].join(" ");

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}/faqs`,
    mainEntity: faqTopics.flatMap((t) => t.faqs).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: answerText(f) },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}

function FaqItem({ f }: { f: Faq }) {
  return (
    <details id={f.id} className="group rounded-xl border border-slate-200 bg-white p-5 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg font-bold text-ink">
        <span>{f.q}</span>
        <span aria-hidden className="mt-1 text-teal-700 transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 space-y-3 text-ink">
        {f.facts.map((p) => <p key={p}>{p}</p>)}
        {f.guidance && (
          <div className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">CareerProof guidance</p>
            <p className="mt-1">{f.guidance}</p>
          </div>
        )}
        {f.links && (
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {f.links.map((l) => <Link key={l.href + l.label} href={l.href} className="font-semibold text-teal-700 hover:underline">{l.label} &rarr;</Link>)}
          </p>
        )}
        {f.sources.length > 0 && (
          <div className="border-t border-slate-100 pt-3 text-xs text-ink-muted">
            <p className="font-semibold">Sources (checked {FAQ_CHECKED})</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {f.sources.map(faqSource).map((s) => (
                <li key={s.slug}>{s.url ? <a href={s.url} className="underline hover:text-ink">{s.name}</a> : s.name}, {s.publisher}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

export default function Page() {
  return (
    <>
      <FaqJsonLd />
      <PageBand kicker="Help" title="Frequently asked questions"
        intro="The questions students, parents and career changers ask official bodies most often, answered in our own words. Each answer cites the official source it relies on; our own advice is marked as CareerProof guidance." />
      <Container className="grid gap-10 py-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Topics</p>
          <ul className="mt-2 space-y-1 text-sm">
            {faqTopics.map((t) => <li key={t.id}><a href={`#${t.id}`} className="text-teal-700 hover:underline">{t.title}</a></li>)}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-10">
          {faqTopics.map((t) => (
            <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="space-y-3">
              <h2 id={`${t.id}-h`} className="font-display text-2xl font-bold text-ink">{t.title}</h2>
              {t.faqs.map((f) => <FaqItem key={f.id} f={f} />)}
            </section>
          ))}
          <section className="rounded-xl bg-slate-50 p-5 text-sm text-ink">
            <h2 className="font-display text-lg font-bold">Didn&rsquo;t find your question?</h2>
            <p className="mt-1">Email <a href={`mailto:${OPERATOR.email}`} className="font-semibold text-teal-700 underline">{OPERATOR.email}</a>. Answers here are general guidance, not professional advice; admissions, licensing and pay are decided by the official bodies cited. See our <Link href="/disclaimer" className="underline">disclaimer</Link>.</p>
          </section>
        </div>
      </Container>
    </>
  );
}
