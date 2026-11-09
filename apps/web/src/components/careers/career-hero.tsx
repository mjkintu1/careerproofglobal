import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Occupation } from "@careerproof/career-graph";
import { ClusterIcon } from "@/components/cluster-icon";
import { Container } from "@/components/container";
import { careerPageTitle, clusterName, levelLabel, locationName, locationOptions, searchItems } from "@/lib/careers";
import { CareerSearch } from "./career-search";
import { LocationSelect } from "./location-select";

export function CareerHero({ o, location }: { o: Occupation; location: string }) {
  return (
    <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
      <Container className="space-y-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1 text-slate-300">
              <li><Link href="/" className="text-slate-300 hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><Link href={`/careers/${location}`} className="text-slate-300 hover:text-white">Careers{location !== "global" ? ` in ${locationName(location)}` : ""}</Link></li>
              <li aria-hidden="true"><ChevronRight size={14} /></li>
              <li><Link href={`/careers/${location}/field/${o.cluster}`} className="text-slate-300 hover:text-white">{clusterName(o.cluster)}</Link></li>
            </ol>
          </nav>
          <div className="w-full max-w-sm">
            <p className="mb-1 text-sm font-semibold text-teal-500">I want to become...</p>
            <CareerSearch items={searchItems} location={location} />
          </div>
        </div>
        <div className="space-y-4">
          <p className="chip bg-navy-800 text-teal-500"><ClusterIcon cluster={o.cluster} size={16} /> {clusterName(o.cluster)}</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{careerPageTitle(o, location)}</h1>
          <p className="max-w-3xl text-lg text-slate-300">{o.summary}</p>
          <div className="flex flex-wrap items-center gap-3">
            <LocationSelect current={location} options={locationOptions} tone="dark" />
            <span className="chip bg-navy-800 text-white">{levelLabel[o.level]}</span>
            {o.isco && <Link href={`/occupations/isco/${o.isco}`} className="chip bg-navy-800 text-white no-underline hover:bg-teal-800 hover:text-white">ISCO-08 {o.isco}</Link>}
          </div>
        </div>
      </Container>
    </section>
  );
}
