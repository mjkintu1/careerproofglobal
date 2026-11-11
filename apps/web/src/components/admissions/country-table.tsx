"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CountryFilterInput, matchesCountry } from "@/components/country-search";

export interface CountryRow {
  code: string;
  name: string;
  regulators: { name: string; website?: string }[];
  secondaryExams?: string;
  /** School-leaving qualification giving direct access to tertiary, from the UNESCO ISCED mapping. */
  leaving: string | null;
  institutions: number;
  /** "2 years from age 17" (UNESCO UIS). */
  upperSecondary: string | null;
  /** "34.4% (2025)" (UNESCO UIS). */
  tertiaryGer: string | null;
  calculators: { name: string; href: string | null; status: string }[];
}

/** Uganda and Kenya have their own pages; every other country uses /admissions/[country]. */
const DEDICATED: Record<string, string> = { UG: "/admissions/uganda", KE: "/admissions/kenya" };
const href = (code: string) => DEDICATED[code] ?? `/admissions/${code.toLowerCase()}`;

export function CountryTable({ rows }: { rows: CountryRow[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => rows.filter((r) => matchesCountry(r, query)), [rows, query]);
  return (
    <div className="space-y-4">
      <CountryFilterInput label="Find a country" value={query} onChange={setQuery} count={shown.length} total={rows.length} />
      <div className="card relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Admission information by country</caption>
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Country</th>
              <th scope="col" className="px-4 py-3">Higher-education regulator</th>
              <th scope="col" className="px-4 py-3">School-leaving qualification</th>
              <th scope="col" className="px-4 py-3">Upper secondary</th>
              <th scope="col" className="px-4 py-3">Tertiary enrolment</th>
              <th scope="col" className="px-4 py-3">Admission tools</th>
              <th scope="col" className="px-4 py-3">Institutions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => (
              <tr key={r.code}>
                <th scope="row" className="px-4 py-2 font-semibold"><Link href={href(r.code)}>{r.name}</Link></th>
                <td className="px-4 py-2">{r.regulators.length ? r.regulators.map((g) => (g.website ? <a key={g.name} href={g.website} className="block">{g.name}</a> : <span key={g.name} className="block">{g.name}</span>)) : <span className="text-ink-muted">Not yet recorded</span>}</td>
                <td className="px-4 py-2">{r.leaving ? <>{r.leaving} <span className="chip ml-1 bg-teal-50 px-2 py-0.5 text-xs text-teal-800">UNESCO</span></> : r.secondaryExams ? <>{r.secondaryExams} <span className="chip ml-1 bg-gold-50 px-2 py-0.5 text-xs text-gold-800">To be verified</span></> : <span className="text-ink-muted">Not yet recorded</span>}</td>
                <td className="whitespace-nowrap px-4 py-2">{r.upperSecondary ?? <span className="text-ink-muted">No data</span>}</td>
                <td className="whitespace-nowrap px-4 py-2">{r.tertiaryGer ?? <span className="text-ink-muted">No data</span>}</td>
                <td className="px-4 py-2">{r.calculators.length ? r.calculators.map((c) => (
                  <Link key={c.name} href={c.href ?? `/admissions/calculators?country=${r.code.toLowerCase()}`} className="block">{c.name}{c.status === "illustrative" ? " (illustrative)" : ""}</Link>
                )) : <span className="text-ink-muted">Minimum requirements</span>}</td>
                <td className="px-4 py-2">{r.institutions ? <Link href={`/institutions/${r.code.toLowerCase()}`}>{r.institutions.toLocaleString("en")}</Link> : <span className="text-ink-muted">0</span>}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-ink-muted">No country matches that search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
