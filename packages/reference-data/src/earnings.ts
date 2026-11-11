import ilo from "./snapshots/ilostat-earnings.json";
import isco from "./snapshots/isco-08.json";

interface IloFigure { value: number; women: number | null; men: number | null; year: number; source: string; notes?: string[] }
interface IloCountry { currency: string | null; groups: Record<string, IloFigure> }
const byCountry = ilo.byCountry as Record<string, IloCountry>;
const majorTitle = new Map((isco.groups as { code: string; level: number; title: string }[]).filter((g) => g.level === 1).map((g) => [g.code, g.title]));

/**
 * ISCO-08 skill level of each major group, and the education it usually implies
 * (ILO, ISCO-08 Volume I, Table 1 and Table 2: skill levels mapped to ISCED-97 levels).
 */
export const iscoSkillLevels: Record<string, { levels: number[]; education: string }> = {
  "1": { levels: [3, 4], education: "Short-cycle tertiary to first degree or higher" },
  "2": { levels: [4], education: "First university degree or higher" },
  "3": { levels: [3], education: "Short-cycle tertiary (diploma, 1 to 3 years after secondary)" },
  "4": { levels: [2], education: "Completed secondary, sometimes with vocational training" },
  "5": { levels: [2], education: "Completed secondary, sometimes with vocational training" },
  "6": { levels: [2], education: "Completed secondary, sometimes with vocational training" },
  "7": { levels: [2], education: "Completed secondary, sometimes with vocational training" },
  "8": { levels: [2], education: "Completed secondary, sometimes with vocational training" },
  "9": { levels: [1], education: "Primary education" },
  "0": { levels: [1, 2, 4], education: "Varies by rank" },
};

export interface CountryEarnings {
  country: string;
  currency: string | null;
  /** ISCO-08 major group the figure covers, e.g. "2". */
  group: string;
  groupTitle: string;
  /** Average monthly earnings of employees, local currency, nominal. */
  monthly: number;
  women: number | null;
  men: number | null;
  /** Average for all employees in the country, same source when available. */
  allEmployees: number | null;
  /** monthly / allEmployees, rounded to 2 decimals. */
  ratioToAll: number | null;
  year: number;
  source: string;
  notes: string[];
  attribution: string;
  sourceUrl: string;
}

/**
 * ILOSTAT average monthly earnings for the major group of an ISCO-08 code in a country.
 * ILOSTAT publishes earnings by major group only, so this is the group average, not the
 * figure for one occupation. Returns null when the country has no published figure.
 */
export function earningsFor(iscoCode: string | null | undefined, country: string): CountryEarnings | null {
  if (!iscoCode) return null;
  const c = byCountry[country.toUpperCase()];
  const group = iscoCode[0];
  const g = c?.groups[group];
  if (!c || !g) return null;
  const all = c.groups.TOTAL ?? null;
  return {
    country: country.toUpperCase(),
    currency: c.currency,
    group,
    groupTitle: majorTitle.get(group) ?? `ISCO major group ${group}`,
    monthly: g.value,
    women: g.women,
    men: g.men,
    allEmployees: all?.value ?? null,
    ratioToAll: all ? Math.round((g.value / all.value) * 100) / 100 : null,
    year: g.year,
    source: g.source,
    notes: g.notes ?? [],
    attribution: ilo.meta.attribution,
    sourceUrl: ilo.meta.url,
  };
}

export const earningsCountries = (): string[] => Object.keys(byCountry);
export const earningsMeta = ilo.meta;

import crosswalk from "./snapshots/esco-onet-crosswalk.json";

const iscoByOnet = new Map<string, string>();
for (const [key, socs] of Object.entries(crosswalk.map as Record<string, string[]>)) {
  const isco = key.match(/^\d{1,4}/)?.[0];
  if (!isco) continue;
  for (const soc of socs) {
    const prev = iscoByOnet.get(soc);
    // Prefer the most specific ISCO code the crosswalk gives.
    if (!prev || isco.length > prev.length) iscoByOnet.set(soc, isco);
  }
}

/** ISCO-08 code for an O*NET-SOC occupation, via the official ESCO-O*NET crosswalk. */
export const iscoForOnet = (soc: string): string | null => iscoByOnet.get(soc) ?? null;

/**
 * Specific Vocational Preparation (SVP) for each O*NET Job Zone, as O*NET states it
 * (Job Zone Reference), with the time each SVP level means (U.S. Department of Labor,
 * Dictionary of Occupational Titles, Appendix C). O*NET 31 merges zones 1 and 2.
 */
export const jobZonePreparation: Record<number, { svp: string; time: string; minYears: number }> = {
  2: { svp: "below 6.0", time: "up to 1 year", minYears: 0.5 },
  3: { svp: "6.0 to < 7.0", time: "1 to 2 years", minYears: 1 },
  4: { svp: "7.0 to < 8.0", time: "2 to 4 years", minYears: 2 },
  5: { svp: "8.0 and above", time: "4 to 10 years", minYears: 4 },
};
