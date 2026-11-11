"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import type { PayCoverage } from "@careerproof/reference-data";
import { CountryFilterInput, matchesCountry } from "@/components/country-search";

export interface CoverageRow extends PayCoverage { code: string; name: string; tiers: number }

const Yes = ({ text }: { text?: string | null }) => (
  <span className="inline-flex items-center gap-1 text-emerald-800"><Check aria-hidden className="h-4 w-4" />{text ? <span className="text-xs">{text}</span> : <span className="sr-only">Yes</span>}</span>
);
const No = () => <span className="text-ink-muted"><Minus aria-hidden className="h-4 w-4" /><span className="sr-only">Not yet</span></span>;

/** Every country with the pay data tiers it has. */
export function CoverageTable({ rows }: { rows: CoverageRow[] }) {
  const [q, setQ] = useState("");
  const [onlyGaps, setOnlyGaps] = useState(false);
  const shown = useMemo(() => rows.filter((r) => matchesCountry(r, q) && (!onlyGaps || r.tiers <= 2)), [rows, q, onlyGaps]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1"><CountryFilterInput value={q} onChange={setQ} label="Find a country" count={shown.length} total={rows.length} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyGaps} onChange={(e) => setOnlyGaps(e.target.checked)} /> Only countries with two sources or fewer</label>
      </div>
      <div className="card relative overflow-x-auto p-0">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th scope="col" className="px-3 py-2">Country</th>
              <th scope="col" className="px-3 py-2">Pay by occupation</th>
              <th scope="col" className="px-3 py-2">Public entry scales</th>
              <th scope="col" className="px-3 py-2">Legal minimum</th>
              <th scope="col" className="px-3 py-2">Group averages (ILOSTAT)</th>
              <th scope="col" className="px-3 py-2">World Bank</th>
              <th scope="col" className="px-3 py-2">UN</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.country} className="border-t border-border">
                <th scope="row" className="px-3 py-2 text-left font-semibold"><Link href={`/paths/${r.country.toLowerCase()}`}>{r.name}</Link></th>
                <td className="px-3 py-2">{r.occupationLevel ? <Yes text={r.occupationLevel} /> : <No />}</td>
                <td className="px-3 py-2">{r.publicScales ? <Yes text={r.publicScales} /> : <No />}</td>
                <td className="px-3 py-2">{r.legalMinimum ? <Yes text={`${r.legalMinimum.kind}, ${r.legalMinimum.year}`} /> : <No />}</td>
                <td className="px-3 py-2">{r.groupAverages ? <Yes text={String(r.groupAverages)} /> : <No />}</td>
                <td className="px-3 py-2">{r.worldBank ? <Yes /> : <No />}</td>
                <td className="px-3 py-2">{r.unitedNations ? <Yes /> : <No />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
