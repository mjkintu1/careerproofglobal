import Link from "next/link";
import { Route } from "lucide-react";
import type { Localised } from "@careerproof/career-graph";
import { careerGraphData } from "@careerproof/sample-data";
import { ClusterIcon } from "@/components/cluster-icon";
import { careerHref, findLocation, graph } from "@/lib/careers";
import { LocalDetail } from "./career-sections";
import { UsPayBenchmark } from "./provenance";
import { certificationsForCareer } from "@careerproof/reference-data";
import { Award } from "lucide-react";
import { LinkedInCard } from "./linkedin-links";

const popular = ["civil-engineer", "nurse", "pilot", "software-developer", "accountant"];

export function CareerSidebar({ location, local, current, isco }: { location: string; local: Localised; current: string; isco: string | null }) {
  return (
    <aside className="space-y-5" aria-label="More careers">
      <LocalDetail local={local} isco={isco} />
      {(location === "global" || location === "us") && (
        <UsPayBenchmark isco={isco} label={location === "us" ? "Pay in the United States" : "Pay benchmark: United States"} />
      )}
      {certificationsForCareer(current).length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Award aria-hidden="true" size={18} className="text-teal-700" /> Certifications that help</h2>
          <ul className="space-y-1">{certificationsForCareer(current).map((c) => <li key={c.slug}><Link href={`/certifications/${c.slug}`}>{c.name}</Link></li>)}</ul>
        </div>
      )}
      <LinkedInCard career={current} title={graph.get(current)?.title ?? current} countryName={findLocation(location)?.name ?? null} />
      <div className="card p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Popular careers</h2>
        <ol className="space-y-2">
          {popular.filter((s) => s !== current).slice(0, 4).map((slug, i) => (
            <li key={slug} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-50 text-sm font-bold text-gold-800">{i + 1}</span>
              <Link href={careerHref(location, slug)}>{graph.get(slug)?.title}</Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="card p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Career fields</h2>
        <ul className="space-y-1">
          {careerGraphData.clusters.map((c) => (
            <li key={c.slug}>
              <Link href={`/careers/${location}/field/${c.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink no-underline hover:bg-teal-50 hover:text-teal-800">
                <ClusterIcon cluster={c.slug} size={16} className="text-teal-700" /> {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[var(--radius-card)] bg-navy-900 p-5 text-white">
        <p className="font-display text-lg font-bold">Confused about your future?</p>
        <p className="mt-1 text-sm text-slate-300">Find the quickest known route from where you are to where you want to be.</p>
        <Link href={`/careers/${location}#path-finder-heading`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-400 px-4 font-bold text-ink no-underline hover:bg-white hover:text-ink">
          <Route aria-hidden="true" size={18} /> Plan my path
        </Link>
      </div>
    </aside>
  );
}
