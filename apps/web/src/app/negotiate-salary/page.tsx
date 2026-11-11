import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { careerGraphData } from "@careerproof/sample-data";
import { CitedFact, Guidance } from "@/components/cited";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { countryOptions } from "@/components/paths/paths-page";
import { RangeChecker } from "@/components/pay/range-checker";
import { nodeOptions } from "@/lib/path-network";

export const metadata: Metadata = seo("/negotiate-salary", {
  title: "Negotiating pay when a salary range is posted",
  description: "Check a posted pay range and an offer against official pay figures for the same job and country, and learn what pay-transparency laws in the EU, California and New York require.",
});

const laws = [
  { where: "European Union", facts: [
    { text: "Applicants have the right to information on the starting pay, or its range, for the job, for example in the job advert or before the interview, so that pay can be negotiated in an informed way.", source: "eu-pay-transparency" },
    { text: "Employers may not ask applicants about their pay history in current or previous jobs.", source: "eu-pay-transparency" },
    { text: "EU countries had to bring these rules into national law by 7 June 2026; check how your country has done so.", source: "eu-pay-transparency" },
  ] },
  { where: "California, United States", facts: [
    { text: "Employers with 15 or more employees must include the pay scale in any job posting, and applicants can ask for the pay scale of a job they apply for.", source: "ca-pay-scale" },
  ] },
  { where: "New York State, United States", facts: [
    { text: "Employers with four or more employees must list a compensation range for advertised jobs, promotions and transfers: a minimum and maximum annual salary or hourly rate.", source: "ny-pay-transparency" },
  ] },
];

const steps = [
  ["Read the range as the employer's budget", "The bottom is usually for someone who meets the basic requirements; the top is for someone who brings more than the advert asks for. Decide honestly where your experience and skills put you."],
  ["Check it against official pay", "Use the checker above. If the whole range sits below the median for the job, there may be room to ask for the upper end, or a reason to ask what else comes with the job."],
  ["Ask once, with a reason", "Name one figure inside the range and back it with evidence: a qualification, results from past work, or a skill the advert lists. Asking for more than the top of a posted range rarely works unless you bring much more than the job needs."],
  ["Look at the whole offer", "Allowances, transport, housing, medical cover, training, leave and a review date can matter as much as the basic pay, and are sometimes easier to change."],
  ["Get it in writing", "Before you accept, make sure the pay, its period (month or year) and anything you agreed are in your offer letter or contract."],
];

export default function Page() {
  return (
    <>
      <PageBand kicker="Career Tools" title="Negotiating pay when a range is posted"
        intro="A posted range tells you what the employer expects to pay. Compare it with official pay for the same job and country, then ask for a figure you can justify." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="checker" className="space-y-4">
          <h2 id="checker" className="text-2xl font-extrabold">Check a posted range</h2>
          <p className="max-w-3xl text-ink-muted">Nothing you enter is stored. Official figures come from our <Link href="/pay-coverage">pay sources by country</Link>.</p>
          <RangeChecker occupations={nodeOptions()} countries={countryOptions(careerGraphData.locations)} />
        </section>

        <section aria-labelledby="how" className="space-y-4">
          <h2 id="how" className="text-2xl font-extrabold">How to negotiate within a range</h2>
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map(([t, b], i) => (
              <li key={t} className="card space-y-1 p-5">
                <p className="font-display font-bold">{i + 1}. {t}</p>
                <p className="text-sm">{b}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-ink-muted">These steps are CareerProof guidance, not legal or financial advice.</p>
        </section>

        <section aria-labelledby="laws" className="space-y-4">
          <h2 id="laws" className="text-2xl font-extrabold">Pay-transparency laws</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {laws.map((l) => (
              <article key={l.where} className="card space-y-2 p-5">
                <h3 className="font-display text-lg font-bold">{l.where}</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm">{l.facts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
              </article>
            ))}
          </div>
          <Guidance>Where no law requires a range, you can still ask the employer for the pay range before or at the first interview. In Uganda, Kenya and many other countries, public-sector jobs are paid on published salary scales: see the pay figures on each career page.</Guidance>
        </section>
      </Container>
    </>
  );
}
