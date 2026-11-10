import type { EducationStructure } from "@careerproof/reference-data";

/** "2 years from age 17" */
export function stage(entry?: { value: number }, years?: { value: number }) {
  if (!entry && !years) return null;
  return [years ? `${years.value} year${years.value === 1 ? "" : "s"}` : null, entry ? `from age ${entry.value}` : null].filter(Boolean).join(" ");
}

/** School structure and tertiary enrolment from UNESCO UIS, with the required attribution. */
export function EducationStructureCard({ s, attribution, licenceUrl }: { s: EducationStructure | null; attribution: string; licenceUrl: string }) {
  if (!s) return null;
  const rows: [string, string | null][] = [
    ["Primary", stage(s.primaryEntryAge, s.primaryYears)],
    ["Lower secondary", stage(s.lowerSecondaryEntryAge, s.lowerSecondaryYears)],
    ["Upper secondary", stage(s.upperSecondaryEntryAge, s.upperSecondaryYears)],
    ["Compulsory education", s.compulsoryYears ? `${s.compulsoryYears.value} years` : null],
    ["Tertiary enrolment (gross)", s.tertiaryGer ? `${s.tertiaryGer.value}% (${s.tertiaryGer.year})` : null],
  ];
  const latest = Math.max(...Object.values(s).map((v) => (v as { year: number }).year));
  return (
    <div className="card space-y-3 p-5">
      <h3 className="text-lg font-bold">School system (official durations)</h3>
      <dl className="divide-y divide-line">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-baseline justify-between gap-x-3 py-1.5">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-ink-muted">
        Data year {latest}. {attribution} <a href={licenceUrl}>Licence</a>.
      </p>
    </div>
  );
}
