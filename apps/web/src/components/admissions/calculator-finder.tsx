"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdmissionSystem, EducationStructure } from "@careerproof/reference-data";
import { CountrySearch, type CountryOption } from "@/components/country-search";
import { EducationStructureCard } from "./education-structure";
import { SystemCard } from "./system-card";

export interface CountryInfo {
  regulators: { name: string; website?: string }[];
  institutions: number;
  structure: EducationStructure | null;
}

interface Props {
  countries: CountryOption[];
  systems: AdmissionSystem[];
  info: Record<string, CountryInfo>;
  uis: { attribution: string; licenceUrl: string };
}

/** Country search, then what admission tools exist for that country. */
export function CalculatorFinder({ countries, systems, info, uis }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const code = params.get("country")?.toUpperCase() ?? "";
  const country = countries.find((c) => c.code === code);

  function onSelect(next: string) {
    router.replace(`${pathname}?country=${next.toLowerCase()}`, { scroll: false });
  }

  const own = country ? systems.filter((s) => s.countries.includes(country.code)) : [];
  const ucas = systems.find((s) => s.id === "ucas-tariff");
  const details = country ? info[country.code] : undefined;

  return (
    <section aria-labelledby="finder" className="card space-y-5 p-5 sm:p-6">
      <div>
        <h2 id="finder" className="text-xl font-extrabold">What can I calculate for my country?</h2>
        <p className="text-ink-muted">Search any of {countries.length} countries and territories.</p>
      </div>
      <CountrySearch options={countries} current={country?.code} onSelect={onSelect} label="Country" />
      <div aria-live="polite" className="space-y-5">
        {country && (
          <>
            <h3 className="text-lg font-extrabold">{country.name}</h3>
            {own.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">{own.map((s) => <SystemCard key={s.id} s={s} />)}</div>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-line bg-surface-muted p-4">
                <p className="font-bold">No published admission formula recorded yet</p>
                <p className="text-ink-muted">Entry depends on each institution&apos;s minimum requirements. Check them with the regulator or the institution.</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-bold">Higher-education regulator</h4>
                {details?.regulators.length ? (
                  <ul className="space-y-1">{details.regulators.map((g) => <li key={g.name}>{g.website ? <a href={g.website}>{g.name}</a> : g.name}</li>)}</ul>
                ) : <p className="text-ink-muted">Not yet recorded.</p>}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold">Institutions</h4>
                {details?.institutions ? (
                  <Link href={`/institutions/${country.code.toLowerCase()}`}>{details.institutions.toLocaleString("en")} universities and colleges</Link>
                ) : <p className="text-ink-muted">None listed yet.</p>}
              </div>
            </div>
            <EducationStructureCard s={details?.structure ?? null} attribution={uis.attribution} licenceUrl={uis.licenceUrl} />
            <p><Link href={({ UG: "/admissions/uganda", KE: "/admissions/kenya" } as Record<string, string>)[country.code] ?? `/admissions/${country.code.toLowerCase()}`} className="font-semibold">Official entry requirements for {country.name}</Link></p>
            {ucas && !own.includes(ucas) && (
              <p className="text-sm text-ink-muted">
                Applying to the UK? The <Link href={ucas.href ?? "#"}>UCAS Tariff calculator</Link> covers A levels and IB Diploma components, which many schools outside the UK offer.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
