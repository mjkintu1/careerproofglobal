import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { careerGraphData } from "@careerproof/sample-data";
import { CareerSearch } from "@/components/careers/career-search";
import { LocationSelect } from "@/components/careers/location-select";
import { PathFinder } from "@/components/careers/path-finder";
import { ClusterIcon } from "@/components/cluster-icon";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/home/section-heading";
import { PageBand } from "@/components/page-band";
import { canonicalLocation, careerHref, findLocation, GLOBAL, graph, isLocationCode, locationOptions, searchItems } from "@/lib/careers";

export function generateStaticParams() {
  return [{ location: GLOBAL }];
}

export async function generateMetadata({ params }: PageProps<"/careers/[location]">): Promise<Metadata> {
  const { location } = await params;
  const where = findLocation(location);
  return {
    title: where ? `Career paths in ${where.name}` : "Career paths",
    description: `Explore ${careerGraphData.occupations.length} careers, the ways into them and how people move between them${where ? ` in ${where.name}` : ""}.`,
    alternates: { canonical: `/careers/${canonicalLocation(location)}` },
  };
}

async function CareersContent({ params }: Pick<PageProps<"/careers/[location]">, "params">) {
  const { location } = await params;
  if (!isLocationCode(location)) notFound();
  const where = findLocation(location);

  return (
    <>
      <PageBand kicker="Your journey" title={`Career paths${where ? ` in ${where.name}` : ""}`}
        intro="What each career involves, the different ways in, and where it can lead next, including moves into a new field.">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full max-w-xl"><CareerSearch items={searchItems} location={location} /></div>
          <LocationSelect current={location} options={locationOptions} tone="dark" />
        </div>
      </PageBand>

      <Container className="space-y-14 py-10">

        <section aria-labelledby="fields" className="space-y-6">
          <SectionHeading id="fields" kicker="Career fields" title="Browse by field" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {careerGraphData.clusters.map((c) => (
              <li key={c.slug}>
                <Link href={`/careers/${location}/field/${c.slug}`} className="card card-link flex h-full items-start gap-3 p-4 text-ink no-underline hover:text-ink">
                  <span className="rounded-xl bg-teal-50 p-2 text-teal-800"><ClusterIcon cluster={c.slug} /></span>
                  <span><span className="block font-display font-bold">{c.name}</span>
                    <span className="text-sm text-ink-muted">{graph.inCluster(c.slug).length} careers</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PathFinder location={location} />

        <section aria-labelledby="all-heading" className="space-y-6">
          <SectionHeading id="all-heading" kicker="A to Z" title={`All ${careerGraphData.occupations.length} careers`} />
          <div className="grid gap-6 md:grid-cols-2">
            {careerGraphData.clusters.map((c) => (
              <section key={c.slug} aria-labelledby={`cluster-${c.slug}`} className="card p-5">
                <h3 id={`cluster-${c.slug}`} className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                  <ClusterIcon cluster={c.slug} className="text-teal-700" /> {c.name}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {graph.inCluster(c.slug).map((o) => (
                    <li key={o.slug}>
                      <Link href={careerHref(location, o.slug)} className="chip border border-line bg-surface-muted text-ink no-underline hover:border-teal-100 hover:bg-teal-50 hover:text-teal-800">{o.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

export default function CareersPage({ params }: PageProps<"/careers/[location]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading career paths...</p></Container>}>
      <CareersContent params={params} />
    </Suspense>
  );
}
