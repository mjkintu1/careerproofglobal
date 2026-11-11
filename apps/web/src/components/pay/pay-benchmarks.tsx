import type { PayBenchmark, PayGranularity } from "@careerproof/reference-data";

const GRANULARITY: Record<PayGranularity, { label: string; tone: string }> = {
  "public-scale": { label: "Public-sector entry pay", tone: "bg-violet-100 text-violet-900" },
  occupation: { label: "This occupation", tone: "bg-emerald-100 text-emerald-900" },
  "occupation-group": { label: "Close occupation group", tone: "bg-teal-100 text-teal-900" },
  "major-group": { label: "Broad group average", tone: "bg-slate-100 text-slate-800" },
  "legal-minimum": { label: "Legal minimum pay", tone: "bg-amber-100 text-amber-900" },
};

/** Hourly figures keep cents; larger figures are rounded to whole units. */
const fmt = (v: number, currency: string) => `${currency} ${v < 100 ? v.toFixed(2) : Math.round(v).toLocaleString("en")}`;
const PER: Record<PayBenchmark["period"], string> = { hour: "an hour", week: "a week", month: "a month", year: "a year" };

/** Monthly figure used for sorting and headline display. */
export function headlineMonthly(b: PayBenchmark): number | null {
  const v = b.median ?? b.scaleMin ?? b.mean ?? null;
  if (v === null || b.period === "hour") return null; // hours worked vary, so no monthly figure
  return b.period === "year" ? v / 12 : b.period === "week" ? (v * 52) / 12 : v;
}

function RangeBar({ b }: { b: PayBenchmark }) {
  if (b.p10 === undefined || b.p90 === undefined || b.median === undefined) return null;
  const lo = b.p10, hi = b.p90, span = hi - lo || 1;
  const pos = (v: number) => `${((v - lo) / span) * 100}%`;
  return (
    <div className="space-y-1">
      <div className="relative h-3 rounded-full bg-slate-200" aria-hidden>
        {b.p25 !== undefined && b.p75 !== undefined && (
          <span className="absolute inset-y-0 rounded-full bg-teal-300" style={{ left: pos(b.p25), width: `calc(${pos(b.p75)} - ${pos(b.p25)})` }} />
        )}
        <span className="absolute -inset-y-1 w-1 -translate-x-1/2 rounded bg-teal-900" style={{ left: pos(b.median) }} />
      </div>
      <div className="flex justify-between text-xs text-ink-muted">
        <span>Lowest 10%: under {fmt(lo, b.currency)}</span>
        <span>Top 10%: over {fmt(hi, b.currency)}</span>
      </div>
      {b.p25 !== undefined && b.p75 !== undefined && (
        <p className="text-xs text-ink-muted">Middle half earn {fmt(b.p25, b.currency)} to {fmt(b.p75, b.currency)}.</p>
      )}
    </div>
  );
}

export function PayBenchmarkItem({ b }: { b: PayBenchmark }) {
  const g = GRANULARITY[b.granularity];
  const per = PER[b.period];
  return (
    <li className="space-y-2 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${g.tone}`}>{g.label}</span>
        <span className="text-xs text-ink-muted">{b.year}</span>
      </div>
      <p className="text-sm font-semibold">{b.covers}</p>
      {b.scaleMin !== undefined ? (
        <p>
          <strong className="font-display text-xl text-teal-800">
            {b.scaleMin === b.scaleMax ? fmt(b.scaleMin, b.currency) : `${fmt(b.scaleMin, b.currency)} to ${Math.round(b.scaleMax!).toLocaleString("en")}`}
          </strong>{" "}
          <span className="text-sm text-ink-muted">{per}{b.isEntry ? ", on entry" : ""}{b.granularity === "legal-minimum" ? ", minimum in the main cities" : ""}</span>
        </p>
      ) : b.median !== undefined ? (
        <p><strong className="font-display text-xl text-teal-800">{fmt(b.median, b.currency)}</strong> <span className="text-sm text-ink-muted">median, {per}</span></p>
      ) : b.mean !== undefined ? (
        <p><strong className="font-display text-xl text-teal-800">{fmt(b.mean, b.currency)}</strong> <span className="text-sm text-ink-muted">average, {per}</span></p>
      ) : null}
      <RangeBar b={b} />
      {b.areas && (
        <ul className="space-y-0.5 text-xs">
          {b.areas.map((a) => (
            <li key={a.area} className="flex justify-between gap-3"><span className="text-ink-muted">{a.area}</span><span className="whitespace-nowrap font-semibold">{a.min === a.max ? fmt(a.min, b.currency) : `${fmt(a.min, b.currency)}–${Math.round(a.max).toLocaleString("en")}`}</span></li>
          ))}
        </ul>
      )}
      {b.entryRequirement && <p className="text-sm">Entry: {b.entryRequirement}</p>}
      {b.note && <p className="text-xs text-ink-muted">{b.note}</p>}
      <p className="text-xs text-ink-muted"><a href={b.url} rel="noopener" title={b.source}>{b.attribution}</a></p>
    </li>
  );
}

/** Pay benchmarks, most specific first. */
export function PayBenchmarks({ items, empty }: { items: PayBenchmark[]; empty?: string }) {
  if (!items.length) return empty ? <p className="text-sm text-ink-muted">{empty}</p> : null;
  return <ul className="space-y-3">{items.map((b, i) => <PayBenchmarkItem key={`${b.country}-${b.covers}-${i}`} b={b} />)}</ul>;
}
