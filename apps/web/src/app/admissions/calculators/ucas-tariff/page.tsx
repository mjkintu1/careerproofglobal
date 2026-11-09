import type { Metadata } from "next";
import Link from "next/link";
import { ucasTariff } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { TariffCalculator } from "@/components/admissions/tariff-calculator";

export const metadata: Metadata = {
  title: "UCAS Tariff points calculator (2027 entry)",
  description: "Work out your UCAS Tariff points for A levels, AS, the EPQ, IB Diploma components, Scottish Highers and the Irish Leaving Certificate, using UCAS's published tables.",
};

export default function UcasTariffPage() {
  return (
    <>
      <PageBand kicker="Admission calculators" title="UCAS Tariff points calculator"
        intro={`For UK university entry. Points come from UCAS's published Tariff tables for ${ucasTariff.cycle}.`} />
      <Container className="space-y-8 py-10">
        <TariffCalculator qualifications={ucasTariff.qualifications} />
        <section aria-labelledby="about" className="card space-y-3 p-6">
          <h2 id="about" className="text-xl font-extrabold">About these points</h2>
          <ul className="list-disc space-y-1 pl-5">
            {ucasTariff.notes.map((n) => <li key={n}>{n}</li>)}
            <li>Not every UK course uses Tariff points; many make offers in grades. Check each course&apos;s entry requirements on UCAS.</li>
            <li>UCAS updates its tables every May. Points for less common qualifications are in the full tables.</li>
          </ul>
          <p className="text-xs text-ink-muted">Source: <a href={ucasTariff.url}>{ucasTariff.source}</a>. Checked {ucasTariff.checkedAt}.</p>
        </section>
        <p><Link href="/admissions/calculators">All admission calculators</Link></p>
      </Container>
    </>
  );
}
