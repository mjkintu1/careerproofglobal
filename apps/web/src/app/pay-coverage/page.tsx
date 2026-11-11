import type { Metadata } from "next";
import { detailedPayCountries, payCoverage } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CoverageTable, type CoverageRow } from "@/components/pay/coverage-table";

export const metadata: Metadata = {
  title: "Pay data coverage by country",
  description: "Which official pay sources CareerProof Global has for each country: pay by occupation, public-sector entry scales, legal minimum wages, ILOSTAT group averages, and World Bank and UN scales.",
  alternates: { canonical: "/pay-coverage" },
};

export default function Page() {
  const rows: CoverageRow[] = careerGraphData.locations.map((l) => {
    const c = payCoverage(l.code);
    const tiers = [c.occupationLevel, c.publicScales, c.legalMinimum, c.groupAverages, c.worldBank, c.unitedNations].filter(Boolean).length;
    return { ...c, name: l.name, code: l.code, tiers };
  }).sort((a, b) => b.tiers - a.tiers || a.name.localeCompare(b.name));
  const count = (f: (r: CoverageRow) => unknown) => rows.filter(f).length;

  return (
    <>
      <PageBand kicker="Pay data" title="Pay data coverage by country"
        intro="Every pay figure on CareerProof Global comes from an official source. This page shows which sources each country has, and how recent they are, so the gaps are visible." />
      <Container className="space-y-8 py-10">
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Pay by occupation", count((r) => r.occupationLevel)],
            ["Public entry scales", count((r) => r.publicScales)],
            ["Legal minimum", count((r) => r.legalMinimum)],
            ["Group averages", count((r) => r.groupAverages)],
            ["World Bank scales", count((r) => r.worldBank)],
            ["UN scales", count((r) => r.unitedNations)],
          ].map(([label, n]) => (
            <li key={label as string} className="card p-4"><p className="font-display text-2xl font-extrabold text-teal-800">{n as number}</p><p className="text-sm text-ink-muted">{label as string} (countries)</p></li>
          ))}
        </ul>
        <CoverageTable rows={rows} />
        <section className="space-y-2 text-sm text-ink-muted">
          <h2 className="font-display text-base font-bold text-ink">How the tiers work</h2>
          <p>Career pages and the path planner show the most specific figure first: public entry scales and pay by occupation, then ILOSTAT averages for broad occupation groups, then legal minimums as a floor. World Bank and UN scales are country-level references, not tied to occupations.</p>
          <p>Detailed national sources so far: {detailedPayCountries.map((d) => `${d.code} (${d.what})`).join("; ")}. Next: Canada, Australia and the EU (occupation-level pay), then public pay scales and wage orders for South Africa, Ghana, Nigeria, Tanzania and Rwanda.</p>
        </section>
      </Container>
    </>
  );
}
