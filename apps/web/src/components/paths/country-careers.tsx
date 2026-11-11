"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CareerCard } from "@/lib/path-network";
import { money } from "./money";
import { headlineMonthly } from "@/components/pay/pay-benchmarks";
import type { PayBenchmark } from "@careerproof/reference-data";

const LEVEL: Record<PayBenchmark["granularity"], string> = { "public-scale": "public entry pay", occupation: "this occupation", "occupation-group": "occupation group", "major-group": "broad group average", "legal-minimum": "legal minimum, cities" };
const best = (c: CareerCard) => c.pay.find((b) => !(b.granularity === "legal-minimum" && !b.areas)) ?? null;
/** Lowest and highest public entry pay when a career has several scales (by qualification or subject). */
function publicSpan(c: CareerCard): { min: number; max: number; currency: string; year: string; several: boolean } | null {
  const scales = c.pay.filter((b) => b.granularity === "public-scale" && b.scaleMin !== undefined && !/trial/i.test(b.covers));
  if (!scales.length) return null;
  // Per month, like every other figure in the table (annual scales divided by 12).
  const monthly = (b: PayBenchmark, v: number) => (b.period === "year" ? v / 12 : v);
  return { min: Math.min(...scales.map((b) => monthly(b, b.scaleMin!))), max: Math.max(...scales.map((b) => monthly(b, b.scaleMax!))), currency: scales[0]!.currency, year: scales[0]!.year, several: scales.length > 1 };
}

type SortKey = "pay" | "entry" | "title";
/** Ways in that take time: not a licence (0 years) or a post-qualification internship. */
const waysIn = (c: CareerCard) => c.routes.filter((r) => r.years > 0 && r.type !== "licence" && !(r.type === "experience" && /supervised|internship|pre-registration|before appointment/i.test(r.title)));
const shortest = (c: CareerCard) => (waysIn(c).length ? Math.min(...waysIn(c).map((r) => r.years)) : Infinity);

/** Every guided career in one country, sortable by official pay and by time to enter. */
export function CountryCareers({ cards, countryName, basePath }: { cards: CareerCard[]; countryName: string | null; basePath: string }) {
  const [sort, setSort] = useState<SortKey>(countryName ? "pay" : "entry");
  const rows = useMemo(() => {
    const r = [...cards];
    // Sort key: [unit rank, value]. Monthly-comparable figures first, then hourly ones by their
    // own value (hours worked vary, so hourly pay is not converted), then careers without a figure.
    const v = (c: CareerCard): [number, number] => {
      const span = publicSpan(c);
      if (span) return [2, span.min];
      const b = best(c);
      if (!b) return [0, 0];
      const m = headlineMonthly(b);
      return m !== null ? [2, m] : [1, b.median ?? b.mean ?? 0];
    };
    if (sort === "pay") r.sort((a, b) => { const [ra, va] = v(a), [rb, vb] = v(b); return rb - ra || vb - va || a.title.localeCompare(b.title); });
    if (sort === "entry") r.sort((a, b) => shortest(a) - shortest(b) || a.title.localeCompare(b.title));
    if (sort === "title") r.sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [cards, sort]);
  const withPay = cards.filter((c) => best(c)).length;
  // The national minimum is the same for every career: shown once, above the table.
  const national = cards.flatMap((c) => c.pay).find((b) => b.granularity === "legal-minimum" && !b.areas) ?? null;
  const detailed = cards.filter((c) => best(c) && best(c)!.granularity !== "major-group").length;

  const th = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort === key ? (key === "pay" ? "descending" : "ascending") : "none"} className="px-3 py-2 text-left">
      <button type="button" onClick={() => setSort(key)} className={`font-bold ${sort === key ? "text-teal-800 underline" : ""}`}>{label}</button>
    </th>
  );

  return (
    <section aria-labelledby="country-careers" className="space-y-3">
      <h2 id="country-careers" className="font-display text-xl font-extrabold">Careers{countryName ? ` in ${countryName}` : ""} by pay and entry level</h2>
      <p className="text-sm text-ink-muted">
        {countryName
          ? `Official pay for ${withPay} of ${cards.length} careers; ${detailed} with a figure for the occupation itself or a public entry scale, the rest with the ILOSTAT average for the whole occupation group (careers in one group share that figure). Public entry pay is shown as a span when it depends on the post or stage (for example qualification, subject, or intern and community-service years), and sorted by the lower figure; other figures are converted to a month.`
          : "Pick a country above to add official pay figures."}
      </p>
      {national && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          National minimum wage: <strong>{national.period === "hour" ? `${national.currency} ${national.scaleMin!.toFixed(2)}` : money(national.scaleMin!, national.currency, false)}</strong> {national.period === "hour" ? "an hour" : "a month"} ({national.year}). {national.note} <a href={national.url} rel="noopener">{national.attribution}</a>
        </p>
      )}
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50">
            <tr>{th("title", "Career")}{th("entry", "Quickest way in")}<th scope="col" className="px-3 py-2 text-left">Usual education</th>{th("pay", "Pay a month (most specific figure)")}<th className="px-3 py-2"><span className="sr-only">Plan</span></th></tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const quick = waysIn(c).length ? waysIn(c).reduce((a, b) => (b.years < a.years ? b : a)) : null;
              return (
                <tr key={c.slug} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 text-left font-semibold">{c.title}</th>
                  <td className="px-3 py-2">{quick ? `${quick.title} (${quick.years} yr${quick.years === 1 ? "" : "s"})` : "Not recorded"}</td>
                  <td className="px-3 py-2 text-ink-muted">{c.entryEducation ?? "Not recorded"}</td>
                  <td className="px-3 py-2">{(() => {
                    const span = publicSpan(c);
                    if (span) return <><strong>{money(span.min, span.currency)}{span.max !== span.min ? `–${money(span.max, span.currency).replace(/^[A-Z]{3}\s?/, "")}` : ""}</strong> <span className="text-ink-muted">public entry pay, {span.year}{span.max === span.min ? "" : span.several ? "; depends on the post or stage" : "; rises by salary notch"}</span></>;
                    const b = best(c);
                    if (!b) return <span className="text-ink-muted">{countryName ? "No official figure" : "Pick a country"}</span>;
                    const m = headlineMonthly(b);
                    if (m === null) {
                      const v = b.median ?? b.mean ?? b.scaleMin!;
                      return <><strong>{b.currency} {v.toFixed(2)}</strong> <span className="text-ink-muted">an hour, {b.median === undefined ? "average, " : "median, "}{LEVEL[b.granularity]}, {b.year}</span></>;
                    }
                    const ranged = b.scaleMin !== undefined && b.scaleMax !== b.scaleMin;
                    const floor = c.pay.find((x) => x.granularity === "legal-minimum" && x !== b && x.areas);
                    const floorLine = floor ? <span className="block text-xs text-amber-800">Legal minimum from {money(Math.min(...floor.areas!.map((a) => a.min)), floor.currency)} (by area)</span> : null;
                    return <><strong>{money(m, b.currency)}{ranged ? `–${money(b.scaleMax!, b.currency).replace(/^[A-Z]{3}\s?/, "")}` : ""}</strong> <span className="text-ink-muted">{b.median === undefined && b.mean !== undefined && b.granularity !== "major-group" ? "average, " : ""}{LEVEL[b.granularity]}, {b.year}</span>{floorLine}</>;
                  })()}</td>
                  <td className="px-3 py-2 text-right"><Link href={`${basePath}?from=start&to=${c.slug}#planner`} className="font-semibold">Plan a path</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
