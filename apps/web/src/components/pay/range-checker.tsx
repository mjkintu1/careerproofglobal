"use client";

import type { PayBenchmark } from "@careerproof/reference-data";
import { benchmarkPoints, rangePosition, type Period } from "@careerproof/reference-data/pay-range";
import { useEffect, useId, useState } from "react";
import { CountrySearch } from "@/components/country-search";

const PERIODS: { id: Period; label: string }[] = [
  { id: "year", label: "a year" }, { id: "month", label: "a month" }, { id: "week", label: "a week" }, { id: "hour", label: "an hour" },
];
const num = (s: string) => { const v = Number(s.replace(/[,\s]/g, "")); return Number.isFinite(v) && v > 0 ? v : null; };
const fmt = (v: number, c: string) => `${c.toUpperCase()} ${v < 100 ? v.toFixed(2) : Math.round(v).toLocaleString("en")}`;
const pct = (p: number) => `${Math.round(p * 100)}%`;

interface PayResult { title: string; country: string; pay: PayBenchmark[] }

/** Posted range, optional offer, and where both sit against official pay for the same occupation and country. */
export function RangeChecker({ occupations, countries }: { occupations: { code: string; name: string }[]; countries: { code: string; name: string }[] }) {
  const [career, setCareer] = useState("");
  const [country, setCountry] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [offer, setOffer] = useState("");
  const [currency, setCurrency] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<PayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!career || !country) return;
    let live = true;
    fetch(`/api/pay?career=${encodeURIComponent(career)}&country=${country}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No pay data"))))
      .then((d: PayResult) => { if (live) { setData(d); setError(null); } })
      .catch(() => { if (live) { setData(null); setError("Could not load pay figures for that choice."); } });
    return () => { live = false; };
  }, [career, country]);

  const lo = num(min), hi = num(max), off = num(offer);
  const cur = currency.trim() || data?.pay[0]?.currency || "";
  const valid = lo !== null && hi !== null && hi >= lo;
  const shown = data && career && country ? data : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <CountrySearch options={occupations} current={career} onSelect={setCareer} label="Job (occupation)" noun="occupation" showCodes={false} maxShown={60} />
        <CountrySearch options={countries} current={country} onSelect={setCountry} label="Country" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Num label="Posted range: from" value={min} onChange={setMin} />
        <Num label="Posted range: to" value={max} onChange={setMax} />
        <Num label="Offer (optional)" value={offer} onChange={setOffer} />
        <label className="space-y-1 text-sm font-semibold">Currency
          <input className="field w-full font-normal" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder={data?.pay[0]?.currency ?? "e.g. UGX"} maxLength={3} />
        </label>
        <label className="space-y-1 text-sm font-semibold">Pay period
          <select className="field w-full font-normal" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="space-y-4">
        {min && max && !valid && <p className="text-sm text-red-700">Enter the range as two numbers, lowest first.</p>}
        {valid && (
          <div className="card space-y-2 p-5">
            <p className="font-display text-lg font-bold">Posted range: {fmt(lo, cur)} to {fmt(hi, cur)} {PERIODS.find((p) => p.id === period)!.label}</p>
            <p className="text-sm">Midpoint: {fmt((lo + hi) / 2, cur)}. The top of the range is {pct((hi - lo) / lo)} above the bottom.</p>
            {off !== null && <OfferLine off={off} lo={lo} hi={hi} cur={cur} />}
          </div>
        )}
        {error && <p className="text-sm text-ink-muted">{error}</p>}
        {shown && valid && <Comparison data={shown} lo={lo} hi={hi} off={off} cur={cur} period={period} />}
      </div>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <input id={id} className="field w-full" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function OfferLine({ off, lo, hi, cur }: { off: number; lo: number; hi: number; cur: string }) {
  const p = rangePosition(off, lo, hi);
  const where = off < lo ? `${fmt(lo - off, cur)} below the bottom of the posted range` : off > hi ? `above the posted range` : `${pct(p)} of the way up the posted range`;
  return <p className="text-sm"><strong>Your offer ({fmt(off, cur)})</strong> is {where}.</p>;
}

const GRAN: Record<PayBenchmark["granularity"], string> = {
  "public-scale": "Public-sector pay scale", occupation: "This occupation", "occupation-group": "Close occupation group",
  "major-group": "Broad occupation group average", "legal-minimum": "Legal minimum pay",
};

function Comparison({ data, lo, hi, off, cur, period }: { data: PayResult; lo: number; hi: number; off: number | null; cur: string; period: Period }) {
  if (!data.pay.length) return <p className="text-sm text-ink-muted">We have no official pay figures for {data.title} in this country yet.</p>;
  const placed = data.pay.map((b) => ({ b, points: benchmarkPoints(b, cur, period) }));
  const floor = placed.find((x) => x.b.granularity === "legal-minimum")?.points[0];
  return (
    <section aria-labelledby="cmp" className="space-y-3">
      <h3 id="cmp" className="font-display text-lg font-bold">Official pay for {data.title}</h3>
      {floor && lo < floor.value && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">The bottom of this range is below the legal minimum we hold ({fmt(floor.value, cur)}). Check which minimum applies to this job and area.</p>
      )}
      <ul className="space-y-3">
        {placed.map(({ b, points }, i) => (
          <li key={i} className="card space-y-2 p-4 text-sm">
            <p className="font-semibold">{GRAN[b.granularity]}: {b.covers} <span className="font-normal text-ink-muted">({b.year})</span></p>
            {points.length ? (
              <ul className="space-y-1">
                {points.map((p) => (
                  <li key={p.label} className="flex flex-wrap justify-between gap-2">
                    <span>{p.label}: <strong>{fmt(p.value, cur)}</strong></span>
                    <span className="text-ink-muted">{p.value < lo ? "below the posted range" : p.value > hi ? "above the posted range" : `${pct(rangePosition(p.value, lo, hi))} up the posted range`}{off !== null && b.granularity !== "legal-minimum" && ` · offer is ${off >= p.value ? pct(off / p.value - 1) + " above" : pct(1 - off / p.value) + " below"}`}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted">Published in {b.currency} {b.period === "hour" ? "per hour" : `per ${b.period}`}, so it is not placed on your range{b.currency.toUpperCase() !== cur.toUpperCase() ? " (different currency; we do not convert currencies)" : " (hourly pay is not converted)"}.</p>
            )}
            {b.note && <p className="text-xs text-ink-muted">{b.note}</p>}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-muted">Most figures cover everyone in the job, at every level of experience; only scales marked as entry pay show starting pay. Figures stay in the currency and year their source published.</p>
    </section>
  );
}
