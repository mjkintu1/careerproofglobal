import type { Metadata } from "next";
import { institutionAttribution, institutionCounts, institutionTotal } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CountryGrid } from "@/components/catalogue/country-grid";

export const metadata: Metadata = {
  title: "Where to study: universities and colleges worldwide",
  description: `${institutionTotal.toLocaleString("en")} universities, colleges and education institutions in every country, from the Research Organization Registry.`,
};

export default function InstitutionsPage() {
  const countries = careerGraphData.locations
    .filter((l) => institutionCounts[l.code])
    .map((l) => ({ ...l, count: institutionCounts[l.code]! }));
  return (
    <>
      <PageBand kicker="Where to study" title="Universities and colleges worldwide"
        intro={`${institutionTotal.toLocaleString("en")} education institutions in ${countries.length} countries and territories. Choose a country.`} />
      <Container className="space-y-8 py-10">
        <CountryGrid countries={countries.map(({ code, name, count }) => ({ code, name, count }))} />
        <p className="text-xs text-ink-muted">
          {institutionAttribution.source}. <a href={institutionAttribution.url}>{institutionAttribution.text}</a> Listing is not accreditation; check
          recognition with the national regulator.
        </p>
      </Container>
    </>
  );
}
