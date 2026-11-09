"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CountryFilterInput, matchesCountry } from "@/components/country-search";

export interface CountryRow {
  code: string;
  name: string;
  regulators: { name: string; website?: string }[];
  secondaryExams?: string;
  institutions: number;
  calculators: { name: string; href: string | null; status: string }[];
}

export function CountryTable({ rows }: { rows: CountryRow[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => rows.filter((r) => matchesCountry(r, query)), [rows, query]);
  return (
    <div className="space-y-4">
      <CountryFilterInput label="Find a country" value={query} onChange={setQuery} count={shown.length} total={rows.length} />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Admission information by country</caption>
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Country</th>
              <th scope="col" className="px-4 py-3">Higher-education regulator</th>
              <th scope="col" className="px-4 py-3">School-leaving exams</th>
              <th scope="col" className="px-4 py-3">Admission tools</th>
              <th scope="col" className="px-4 py-3">Institutions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((r) => (
              <tr key={r.code}>
                <th scope="row" className="px-4 py-2 font-semibold">{r.name}</th>
                <td className="px-4 py-2">{r.regulators.length ? r.regulators.map((g) => (g.website ? <a key={g.name} href={g.website} className="block">{g.name}</a> : <span key={g.name} className="block">{g.name}</span>)) : <span className="text-ink-muted">Not yet recorded</span>}</td>
                <td className="px-4 py-2">{r.secondaryExams ? <>{r.secondaryExams} <span className="chip ml-1 bg-gold-50 px-2 py-0.5 text-xs text-gold-800">To be verified</span></> : <span className="text-ink-muted">Not yet recorded</span>}</td>
                <td className="px-4 py-2">{r.calculators.length ? r.calculators.map((c) => (
                  <Link key={c.name} href={c.href ?? `/admissions/calculators?country=${r.code.toLowerCase()}`} className="block">{c.name}{c.status === "illustrative" ? " (illustrative)" : ""}</Link>
                )) : <span className="text-ink-muted">Minimum requirements</span>}</td>
                <td className="px-4 py-2">{r.institutions ? <Link href={`/institutions/${r.code.toLowerCase()}`}>{r.institutions.toLocaleString("en")}</Link> : <span className="text-ink-muted">0</span>}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-muted">No country matches that search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
