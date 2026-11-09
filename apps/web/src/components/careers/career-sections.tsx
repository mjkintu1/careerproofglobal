import Link from "next/link";
import { BadgeCheck, GraduationCap, MapPin } from "lucide-react";
import type { Localised, Occupation, RelatedCareer } from "@careerproof/career-graph";
import { careerHref, formatYears, graph } from "@/lib/careers";
import { higherEducationRegulators } from "@careerproof/reference-data";
import { WorkforceShare } from "./workforce-share";

const routeLabel: Record<string, string> = {
  degree: "Degree", diploma: "Diploma", certificate: "Certificate", apprenticeship: "Apprenticeship",
  certification: "Certification", licence: "Licence", experience: "Experience",
};

export function WaysIn({ o, note }: { o: Occupation; note?: string }) {
  return (
    <section aria-labelledby="ways-heading" className="space-y-3">
      <h2 id="ways-heading" className="text-xl font-extrabold">Ways in</h2>
      {note && <p className="text-xs text-ink-muted">{note}</p>}
      <ol className="relative space-y-3 border-l-2 border-teal-100 pl-6">
        {o.routes.map((r, i) => (
          <li key={i} className="relative">
            <span aria-hidden="true" className="absolute -left-[33px] top-3 size-4 rounded-full border-4 border-white bg-teal-500 shadow" />
            <div className="card p-4">
              <p className="text-sm font-semibold text-teal-800">
                {routeLabel[r.type] ?? r.type}{r.years > 0 ? ` · ${formatYears(r.years)}` : ""}
              </p>
              <p className="font-medium">{r.title}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Country overlay card for the sidebar. */
export function LocalDetail({ local, isco }: { local: Localised; isco: string | null }) {
  if (!local.location) {
    return (
      <div className="card space-y-2 p-5">
        <p className="flex items-center gap-2 font-display font-bold"><MapPin aria-hidden="true" size={18} className="text-teal-700" /> Local detail</p>
        <p className="text-sm text-ink-muted">Choose a location to see that country&apos;s school exams, licensing body and official workforce data.</p>
      </div>
    );
  }
  return (
    <div className="card space-y-4 p-5">
      <p className="flex items-center gap-2 font-display font-bold"><MapPin aria-hidden="true" size={18} className="text-teal-700" /> In {local.location.name}</p>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="flex items-center gap-1 font-semibold"><GraduationCap aria-hidden="true" size={16} /> School exams</dt>
          <dd className="text-ink-muted">{local.location.secondaryExams ?? "Not recorded for this country yet."}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 font-semibold"><BadgeCheck aria-hidden="true" size={16} /> Licensing or registration</dt>
          <dd className="text-ink-muted">
            {local.regulator ? (<>{local.regulator} <span className="chip ml-1 bg-gold-50 px-2 py-0.5 text-xs text-gold-800">To be verified</span></>) : "None recorded for this career here yet."}
          </dd>
        </div>
        <WorkforceShare countryCode={local.location.code} countryName={local.location.name} isco={isco} />
        <HeRegulatorList countryCode={local.location.code} />
      </dl>
    </div>
  );
}

export function TagList({ id, title, items, tone = "teal" }: { id: string; title: string; items: string[]; tone?: "teal" | "plain" }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-3">
      <h2 id={`${id}-heading`} className="text-xl font-extrabold">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className={`chip ${tone === "teal" ? "bg-teal-50 text-teal-800" : "border border-line bg-white text-ink"}`}>{s}</li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedCareers({ related, location }: { related: RelatedCareer[]; location: string }) {
  return (
    <section aria-labelledby="related-heading" className="space-y-3">
      <h2 id="related-heading" className="text-xl font-extrabold">Careers with similar skills</h2>
      {related.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <li key={r.occupation.slug}>
              <Link href={careerHref(location, r.occupation.slug)} className="card card-link block h-full p-4 text-ink no-underline hover:text-ink">
                <span className="font-display font-bold">{r.occupation.title}</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  Shares {r.sharedSkills.map((s) => graph.skillName(s).toLowerCase()).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted">No close matches in the sample data.</p>
      )}
    </section>
  );
}

/** National higher-education regulators listed by AfriQAN (shown as listed, not yet verified). */
function HeRegulatorList({ countryCode }: { countryCode: string }) {
  const { regulators, source, sourceUrl } = higherEducationRegulators(countryCode);
  if (regulators.length === 0) return null;
  return (
    <div>
      <dt className="flex items-center gap-1 font-semibold"><BadgeCheck aria-hidden="true" size={16} /> Higher education regulator</dt>
      <dd className="space-y-1 text-ink-muted">
        {regulators.map((r) => <p key={r.name}>{r.website ? <a href={r.website}>{r.name}</a> : r.name}{r.caution ? ` (${r.caution})` : ""}</p>)}
        {regulators.some((r) => r.status === "listed") && <p className="text-xs">As listed by <a href={sourceUrl}>{source}</a>; confirm on the regulator&apos;s website.</p>}
        {regulators.some((r) => r.website) && <p className="text-xs">Linked names go to the regulator&apos;s official website.</p>}
      </dd>
    </div>
  );
}
