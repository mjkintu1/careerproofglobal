import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { careerGraphData } from "@careerproof/sample-data";
import { ClusterIcon } from "@/components/cluster-icon";
import { careerHref, clusterName, GLOBAL, graph } from "@/lib/careers";
import { SectionHeading } from "./section-heading";

export function Fields() {
  return (
    <section aria-labelledby="fields-heading" className="space-y-6">
      <SectionHeading id="fields-heading" kicker="Career fields" title="Explore by field"
        action={<Link href={`/careers/${GLOBAL}`} className="inline-flex items-center gap-1 font-semibold">All careers <ArrowRight aria-hidden="true" size={16} /></Link>} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {careerGraphData.clusters.map((c) => (
          <li key={c.slug}>
            <Link href={`/careers/${GLOBAL}/field/${c.slug}`} className="card card-link flex h-full flex-col gap-2 p-5 text-ink no-underline hover:text-ink">
              <span className="self-start rounded-xl bg-teal-50 p-2 text-teal-800"><ClusterIcon cluster={c.slug} size={22} /></span>
              <span className="font-display font-bold">{c.name}</span>
              <span className="text-sm text-ink-muted">{graph.inCluster(c.slug).length} careers</span>
              <span className="mt-auto text-sm font-semibold text-teal-700">View careers</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Popular({ slugs }: { slugs: string[] }) {
  return (
    <section aria-labelledby="popular-heading" className="space-y-6">
      <SectionHeading id="popular-heading" kicker="Popular careers" title="Popular starting points" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug) => {
          const o = graph.get(slug)!;
          const moves = graph.nextMoves(slug).length;
          return (
            <li key={slug}>
              <Link href={careerHref(GLOBAL, slug)} className="card card-link flex h-full flex-col gap-3 p-5 text-ink no-underline hover:text-ink">
                <span className="flex items-center gap-2 text-sm font-semibold text-teal-800"><ClusterIcon cluster={o.cluster} size={16} /> {clusterName(o.cluster)}</span>
                <span className="font-display text-xl font-bold">{o.title}</span>
                <span className="text-ink-muted">{o.summary}</span>
                <span className="chip mt-auto self-start bg-gold-50 text-gold-800"><Route aria-hidden="true" size={14} /> {moves} onward move{moves === 1 ? "" : "s"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
