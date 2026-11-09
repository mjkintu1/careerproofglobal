"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CountryFilterInput, matchesCountry } from "@/components/country-search";

export function CountryGrid({ countries }: { countries: { code: string; name: string; count: number }[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => countries.filter((c) => matchesCountry(c, query)), [countries, query]);
  return (
    <div className="space-y-4">
      <CountryFilterInput label="Find a country" value={query} onChange={setQuery} count={shown.length} total={countries.length} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((c) => (
          <li key={c.code}>
            <Link href={`/institutions/${c.code.toLowerCase()}`} className="card card-link flex items-center justify-between gap-2 p-4 text-ink no-underline hover:text-ink">
              <span className="font-semibold">{c.name}</span>
              <span className="chip bg-teal-50 text-teal-800">{c.count.toLocaleString("en")}</span>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="text-ink-muted">No country matches that search.</p>}
    </div>
  );
}
