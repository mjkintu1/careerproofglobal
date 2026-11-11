import Link from "next/link";
import { BookOpenCheck, DollarSign } from "lucide-react";
import { attributions, careerEvidence, iscoGroup, payBenchmarks, ukPayBenchmark, usPayBenchmark, type PayBenchmark } from "@careerproof/reference-data";
import { PayBenchmarks } from "@/components/pay/pay-benchmarks";

/** Small label saying where a section's content comes from. */
export function Provenance({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-ink-muted">{children}</p>;
}

export const GUIDANCE_NOTE = "CareerProof Global guidance: common routes and typical durations compiled by our team; they vary by country and person.";

/** Official ISCO-08 definition of the career's unit group (via ESCO). */
export function OfficialDefinition({ isco }: { isco: string | null }) {
  const g = isco ? iscoGroup(isco) : undefined;
  if (!g?.description) return null;
  const first = g.description.split(/\n\s*\n|Tasks include/)[0]!.trim();
  return (
    <section aria-labelledby="official-heading" className="card space-y-2 border-l-4 border-l-teal-500 p-5">
      <h2 id="official-heading" className="flex items-center gap-2 text-xl font-extrabold">
        <BookOpenCheck aria-hidden="true" size={20} className="text-teal-700" /> Official definition
      </h2>
      <p>{first}</p>
      <Provenance>
        ISCO-08 unit group {g.code}, <Link href={`/occupations/isco/${g.code}`}>{g.title}</Link>. {attributions.esco}
      </Provenance>
    </section>
  );
}

/**
 * Pay for one career: the location's own benchmarks (most specific first), or for the
 * global page, the US and UK ranges as clearly labelled international references.
 */
export function CareerPayCard({ career, title, isco, location, countryName }: { career: string; title: string; isco: string | null; location: string; countryName: string | null }) {
  const soc = careerEvidence(career, title)?.onet?.code ?? null;
  const global = location === "global";
  const items = global
    ? [usPayBenchmark({ soc, isco, title }), ukPayBenchmark(isco)].filter((b): b is PayBenchmark => Boolean(b))
    : payBenchmarks({ country: location, isco, soc, career, title });
  if (!items.length) return null;
  return (
    <section aria-labelledby="pay-heading" className="card space-y-3 p-5">
      <h2 id="pay-heading" className="flex items-center gap-2 font-display text-lg font-bold">
        <DollarSign aria-hidden="true" size={18} className="text-teal-700" /> {global ? "Pay benchmarks (US and UK)" : `Pay in ${countryName ?? location.toUpperCase()}`}
      </h2>
      {global && <p className="text-sm text-ink-muted">Pick a country for local figures. These are the two countries with official pay ranges by occupation.</p>}
      <PayBenchmarks items={items} />
    </section>
  );
}
