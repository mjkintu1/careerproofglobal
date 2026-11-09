import { Users } from "lucide-react";
import { workforceShare } from "@careerproof/reference-data";

/** Real, cited labour-market figure (World Bank JOIN) for the career's ISCO major group in a country. */
export function WorkforceShare({ countryCode, countryName, isco }: { countryCode: string; countryName: string; isco: string | null }) {
  const share = workforceShare(countryCode, isco);
  if (!share) {
    return (
      <div>
        <dt className="flex items-center gap-1 font-semibold"><Users aria-hidden="true" size={16} /> Workforce</dt>
        <dd className="text-ink-muted">No official occupation data for {countryName} yet.</dd>
      </div>
    );
  }
  const stale = Number(share.period) <= 2016;
  return (
    <div>
      <dt className="flex items-center gap-1 font-semibold"><Users aria-hidden="true" size={16} /> Workforce</dt>
      <dd className="space-y-1">
        <p>
          <span className="font-display text-2xl font-extrabold text-teal-800">{share.value.toFixed(1)}%</span>{" "}
          <span className="text-ink-muted">of workers in {countryName} are {share.groupName.toLowerCase()} ({share.period})</span>
        </p>
        {stale && <p className="text-xs font-semibold text-gold-800">Latest official figure is 10 or more years old.</p>}
        <p className="text-xs text-ink-muted">
          ISCO-08 major group {share.group}. <a href={share.sourceUrl}>{share.attribution}</a>
        </p>
      </dd>
    </div>
  );
}
