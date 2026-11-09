import type { Metadata } from "next";
import Link from "next/link";
import { catalogueCounts, escoCountUnder, iscoChildren, majorGroups, occupationSearchItems } from "@careerproof/reference-data";
import { CatalogueAttribution } from "@/components/catalogue/attribution";
import { CareerSearch } from "@/components/careers/career-search";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";

export const metadata: Metadata = {
  title: "Occupation directory: every occupation, international standard",
  description: `Browse ${catalogueCounts.escoOccupations.toLocaleString("en")} occupations organised by the ILO's ISCO-08 classification, with skills and tasks.`,
};

export default function OccupationsPage() {
  return (
    <>
      <PageBand kicker="Occupation directory" title="Every occupation, one international standard"
        intro={`${catalogueCounts.escoOccupations.toLocaleString("en")} occupations in ${catalogueCounts.unitGroups} ISCO-08 unit groups, with descriptions, skills and, where available, typical tasks, education and interests.`}>
        <div className="max-w-2xl">
          <CareerSearch items={occupationSearchItems} location="global" basePath="/occupations" placeholder="Search occupations (e.g. midwife, data engineer, welder)" />
        </div>
      </PageBand>
      <Container className="space-y-10 py-10">
        <section aria-labelledby="major-heading" className="space-y-5">
          <h2 id="major-heading" className="text-2xl font-extrabold">ISCO-08 major groups</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {majorGroups.map((g) => (
              <li key={g.code}>
                <Link href={`/occupations/isco/${g.code}`} className="card card-link flex h-full flex-col gap-2 p-5 text-ink no-underline hover:text-ink">
                  <span className="chip self-start bg-navy-900 text-white">Group {g.code}</span>
                  <span className="font-display text-lg font-bold">{g.title}</span>
                  <span className="text-sm text-ink-muted">{iscoChildren(g.code).length} sub-major groups · {escoCountUnder(g.code).toLocaleString("en")} occupations</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <CatalogueAttribution />
      </Container>
    </>
  );
}
