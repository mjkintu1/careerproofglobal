import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Route } from "lucide-react";
import { careerGraphData } from "@careerproof/sample-data";
import { LocationSelect } from "@/components/careers/location-select";
import { ClusterIcon } from "@/components/cluster-icon";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { careerHref, findLocation, GLOBAL, graph, isLocationCode, levelLabel, locationOptions } from "@/lib/careers";

const findCluster = (slug: string) => careerGraphData.clusters.find((c) => c.slug === slug);

export function generateStaticParams() {
  return careerGraphData.clusters.map((c) => ({ location: GLOBAL, cluster: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[location]/field/[cluster]">): Promise<Metadata> {
  const { location, cluster } = await params;
  const c = findCluster(cluster);
  const where = findLocation(location);
  if (!c) return {};
  return { title: `${c.name} careers${where ? ` in ${where.name}` : ""}`, description: c.description };
}

async function FieldContent({ params }: Pick<PageProps<"/careers/[location]/field/[cluster]">, "params">) {
  const { location, cluster } = await params;
  const c = findCluster(cluster);
  if (!c || !isLocationCode(location)) notFound();
  const where = findLocation(location);
  const careers = graph.inCluster(cluster);

  return (
    <>
      <PageBand kicker="Career field" title={`${c.name} careers${where ? ` in ${where.name}` : ""}`} intro={c.description}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="chip bg-navy-800 text-white"><ClusterIcon cluster={c.slug} size={16} /> {careers.length} careers</span>
          <LocationSelect current={location} options={locationOptions} tone="dark" />
        </div>
      </PageBand>
      <Container className="py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((o) => {
            const moves = graph.nextMoves(o.slug).length;
            return (
              <li key={o.slug}>
                <Link href={careerHref(location, o.slug)} className="card card-link flex h-full flex-col gap-3 p-5 text-ink no-underline hover:text-ink">
                  <span className="font-display text-xl font-bold">{o.title}</span>
                  <span className="text-ink-muted">{o.summary}</span>
                  <span className="mt-auto flex flex-wrap gap-2">
                    <span className="chip bg-teal-50 text-teal-800">{levelLabel[o.level]}</span>
                    <span className="chip bg-gold-50 text-gold-800"><Route aria-hidden="true" size={14} /> {moves} onward move{moves === 1 ? "" : "s"}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}

export default function FieldPage({ params }: PageProps<"/careers/[location]/field/[cluster]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading careers...</p></Container>}>
      <FieldContent params={params} />
    </Suspense>
  );
}
