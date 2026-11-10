import Link from "next/link";
import { BookOpenCheck, DollarSign } from "lucide-react";
import { attributions, iscoGroup, usPayForIsco } from "@careerproof/reference-data";

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

/** US pay benchmark from BLS OEWS (public domain), linked via the O*NET crosswalk. */
export function UsPayBenchmark({ isco, label }: { isco: string | null; label: string }) {
  const pay = usPayForIsco(isco);
  if (!pay?.medianAnnual) return null;
  return (
    <div className="card space-y-2 p-5">
      <p className="flex items-center gap-2 font-display font-bold"><DollarSign aria-hidden="true" size={18} className="text-teal-700" /> {label}</p>
      <p>
        <span className="font-display text-2xl font-extrabold text-teal-800">US${pay.medianAnnual.toLocaleString("en")}</span>{" "}
        <span className="text-sm text-ink-muted">median annual pay ({pay.year})</span>
      </p>
      {pay.employment && <p className="text-sm text-ink-muted">{pay.employment.toLocaleString("en")} people employed in the United States</p>}
      <Provenance>SOC {pay.soc.slice(0, 2)}-{pay.soc.slice(2)}. <a href={pay.sourceUrl}>{pay.attribution}</a></Provenance>
    </div>
  );
}
