import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { LEGAL_UPDATED, OPERATOR } from "@/lib/site";

/** Shared layout for legal pages: title band, last-updated line, readable column, contact footer. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <PageBand kicker="Legal" title={title} intro={intro} />
      <Container className="max-w-3xl space-y-8 py-10 text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_section]:space-y-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
        <p className="text-sm text-ink-muted">Last updated {LEGAL_UPDATED}.</p>
        {children}
        <section>
          <h2>Contact</h2>
          <p>{OPERATOR.name}, {OPERATOR.address}. Email: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.</p>
        </section>
      </Container>
    </>
  );
}
