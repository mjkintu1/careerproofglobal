import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";

export const metadata: Metadata = seo("/disclaimer", {
  title: "Disclaimer",
  description: "What CareerProof Global's information is, and is not: guidance built on cited official data, not professional advice or an official decision.",
});

const UPDATED = "11 November 2026";

export default function Page() {
  const h2 = "font-display text-xl font-bold text-ink";
  return (
    <>
      <PageBand kicker="Legal" title="Disclaimer" intro="What the information on this site is, where it comes from, and what it is not." />
      <Container className="max-w-3xl space-y-8 py-10 text-ink">
        <p className="text-sm text-ink-muted">Last updated {UPDATED}.</p>

        <section className="space-y-2">
          <h2 className={h2}>Guidance, not advice or a decision</h2>
          <p>CareerProof Global gives general information to help people explore careers, study options and pay. It is not legal, financial, immigration, medical or other professional advice, and it does not take account of your personal circumstances.</p>
          <p>Universities, examination bodies, employers, licensing and regulatory bodies, and governments make the official decisions. Always confirm entry requirements, fees, deadlines, licensing rules and pay with the body concerned before you act.</p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Where the information comes from</h2>
          <p>Classifications, statistics, admission figures and pay figures come from official and international sources, and each is cited where it appears with its date. The full list, with licences, is on <Link href="/data-licences">Copyright and data licences</Link>.</p>
          <p>Career descriptions, typical routes and durations, the moves between careers and the rankings in the path planner are CareerProof Global guidance, built from those sources and labelled as such. Moves without a published duration are ranked by a stated rule, not a measured time.</p>
          <p>Official figures can change after we collect them. We show the year or date of every figure and update them when sources are revised, but we cannot guarantee that every figure is current, complete or free of error. If you spot a mistake, please tell us.</p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Pay figures</h2>
          <p>Pay figures describe what groups of people earn or are entitled to, not what any one person will be offered. Each figure says what it covers: a single occupation, a group of occupations, a public-sector entry scale, or a legal minimum. Legal minimums are floors, not typical pay. Figures are shown in the currency the source publishes.</p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Admission calculators and cut-off points</h2>
          <p>Calculators apply published formulas and compare results with published cut-off points from past intakes. They do not predict an offer or a chance of admission; cut-off points change every year.</p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Links to other websites</h2>
          <p>We link to official bodies and other sites for reference. We do not control them and are not responsible for their content, availability or privacy practices.</p>
        </section>

        <section className="space-y-2">
          <h2 className={h2}>Limits of responsibility</h2>
          <p>To the extent the law allows, CareerProof Global is not liable for loss arising from reliance on information on this site. Nothing here limits any rights you have under the law that applies to you.</p>
        </section>
      </Container>
    </>
  );
}
