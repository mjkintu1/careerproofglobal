/**
 * Pay benchmarks by country, most specific first, each saying exactly what it covers.
 * Sources: Uganda public-service salary structure (entry scales), BLS OEWS (US, by occupation),
 * ONS ASHE (UK, by SOC 2020 unit group), ILOSTAT (any country, ISCO major group).
 * Percentiles are ranges of current pay, never labelled as starting pay; only published
 * entry scales are.
 */
import bls from "./snapshots/bls-oews-us.json";
import ashe from "./snapshots/ons-ashe-uk.json";
import crosswalk from "./snapshots/esco-onet-crosswalk.json";
import ugPay from "./ug-public-pay.json";
import keWages from "./ke-minimum-wages.json";
import wbg from "./snapshots/wbg-salary-scales.json";
import icsc from "./snapshots/icsc-un-pay.json";
import minWage from "./snapshots/ilostat-minimum-wage.json";
import iloEarnings from "./snapshots/ilostat-earnings.json";
import caWages from "./snapshots/canada-wages.json";
import auEarnings from "./snapshots/australia-earnings.json";
import { iscoGroup } from "./catalogue";
import zaDpsa from "./snapshots/za-dpsa-scales.json";
import { earningsFor } from "./earnings";

export type PayGranularity = "occupation" | "occupation-group" | "major-group" | "public-scale" | "legal-minimum";

export interface PayBenchmark {
  country: string;
  currency: string;
  period: "hour" | "week" | "month" | "year";
  /** What the figure covers, e.g. "Registered Nurses (US SOC 29-1141)". */
  covers: string;
  granularity: PayGranularity;
  median?: number;
  mean?: number;
  p10?: number;
  p25?: number;
  p75?: number;
  p90?: number;
  /** Public-sector scale: lowest and highest notch. */
  scaleMin?: number;
  scaleMax?: number;
  /** True when the figure is the published pay on entry to the post. */
  isEntry?: boolean;
  /** Entry requirement stated with the scale. */
  entryRequirement?: string;
  /** Legal minimum by area (lowest and highest rate across the matched occupations). */
  areas?: { area: string; min: number; max: number }[];
  /** Sector the figure covers. */
  sector: "all" | "public";
  year: string;
  note?: string;
  source: string;
  attribution: string;
  url: string;
}

type BlsRow = { year: string; employment?: number; meanAnnual?: number; p10Annual?: number; p25Annual?: number; medianAnnual?: number; p75Annual?: number; p90Annual?: number };
const blsBySoc = bls.bySoc as Record<string, BlsRow>;
const xmap = crosswalk.map as Record<string, string[]>;

/** US: BLS OEWS for an O*NET-SOC code ("29-1141.00") or, failing that, an ISCO code via the crosswalk. */
export function usPayBenchmark(opts: { soc?: string | null; isco?: string | null; title?: string }): PayBenchmark | null {
  const socFromIsco = opts.isco ? (xmap[opts.isco] ?? Object.entries(xmap).find(([k]) => k.startsWith(opts.isco!))?.[1])?.[0] : undefined;
  const soc = (opts.soc ?? socFromIsco)?.slice(0, 7);
  const row = soc ? blsBySoc[soc.replace("-", "")] : undefined;
  if (!soc || !row?.medianAnnual) return null;
  return {
    country: "US", currency: "USD", period: "year", granularity: "occupation", sector: "all",
    covers: `${opts.title ? `${opts.title}, ` : ""}US SOC ${soc}`,
    median: row.medianAnnual, mean: row.meanAnnual, p10: row.p10Annual, p25: row.p25Annual, p75: row.p75Annual, p90: row.p90Annual,
    year: `May ${row.year}`,
    note: row.employment ? `${row.employment.toLocaleString("en")} people employed` : undefined,
    source: "U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics", attribution: bls.meta.attribution, url: bls.meta.url,
  };
}

type AsheRow = { title: string; jobsThousands?: number; median?: number; mean?: number; p10?: number; p25?: number; p75?: number; p90?: number };
const asheBySoc = ashe.bySoc as Record<string, AsheRow>;
const asheIsco = ashe.iscoToSoc as unknown as Record<string, [string, number, number][]>;

/** UK: ONS ASHE for the SOC 2020 unit group that holds most of this ISCO group's job titles. */
export function ukPayBenchmark(isco: string | null | undefined): PayBenchmark | null {
  if (!isco || isco.length < 4) return null;
  const match = (asheIsco[isco.slice(0, 4)] ?? []).find(([soc]) => asheBySoc[soc]?.median);
  if (!match) return null;
  const [soc, , share] = match;
  const r = asheBySoc[soc]!;
  return {
    country: "GB", currency: "GBP", period: "year", granularity: "occupation-group", sector: "all",
    covers: `${r.title}, UK SOC 2020 ${soc}`,
    median: r.median, mean: r.mean, p10: r.p10, p25: r.p25, p75: r.p75, p90: r.p90,
    year: ashe.meta.year,
    note: `Full-time employees. Matched from ISCO-08 ${isco.slice(0, 4)} through the ONS coding index (${Math.round(share * 100)}% of its job titles).`,
    source: "Office for National Statistics, Annual Survey of Hours and Earnings, Table 14.7a", attribution: ashe.meta.attribution, url: ashe.meta.url,
  };
}

interface UgScale { id: string; designation: string; scale: string; schedule: string; page: number; monthly: { min: number; max: number }; entry: string; careers: string[]; careerNote?: string }

/** Word-overlap score between two titles ("Registered nurses" vs "Nurse"), for picking among several matches. */
function titleScore(a: string, b: string): number {
  const words = (t: string) => new Set(t.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length > 2).map((w) => w.replace(/(ies|es|s)$/, "")));
  const wb = words(b);
  return [...words(a)].filter((w) => wb.has(w)).length;
}

type CaRow = { title: string; period: "hour" | "year"; low?: number; q1?: number; median?: number; q3?: number; high?: number; mean?: number; reference?: string; dataSource?: string };
const caByNoc = caWages.byNoc as Record<string, CaRow>;
const caIsco = caWages.iscoToNoc as Record<string, { noc: string; partial: boolean }[]>;

/** Canada: Job Bank wages for the NOC 2021 occupation that best matches the title, among those linked to the ISCO group. */
export function caPayBenchmark(opts: { isco?: string | null; title?: string }): PayBenchmark | null {
  const isco = opts.isco?.slice(0, 4);
  if (!isco || isco.length < 4) return null;
  const cands = (caIsco[isco] ?? []).filter((c) => caByNoc[c.noc]);
  if (!cands.length) return null;
  const want = opts.title ?? iscoGroup(isco)?.title ?? "";
  const best = [...cands].sort((a, b) => titleScore(caByNoc[b.noc]!.title, want) - titleScore(caByNoc[a.noc]!.title, want) || Number(a.partial) - Number(b.partial))[0]!;
  const r = caByNoc[best.noc]!;
  return {
    country: "CA", currency: "CAD", period: r.period, granularity: "occupation", sector: "all",
    covers: `${r.title}, NOC 2021 ${best.noc}`,
    median: r.median, mean: r.mean, p10: r.low, p25: r.q1, p75: r.q3, p90: r.high,
    year: r.reference ?? "2025 release",
    note: `${r.dataSource ? `${r.dataSource}. ` : ""}Low and high are Job Bank's 10th and 90th percentiles. Linked from ISCO-08 ${isco} through Statistics Canada concordances (NOC 2021 to 2016 to ISCO-08)${best.partial ? "; partial match" : ""}.`,
    source: "Employment and Social Development Canada, Job Bank wages", attribution: caWages.meta.attribution, url: caWages.meta.url,
  };
}

type AuRow = { title: string; weeklyMean: number; rse: number };
const auByAnzsco = auEarnings.byAnzsco as Record<string, AuRow>;
const auIsco = auEarnings.iscoToAnzsco as unknown as Record<string, [string, number][]>;

/** Australia: ABS average weekly cash earnings for the ANZSCO 4-digit occupation that best matches. */
export function auPayBenchmark(opts: { isco?: string | null; title?: string }): PayBenchmark | null {
  const isco = opts.isco?.slice(0, 4);
  if (!isco || isco.length < 4) return null;
  const cands = auIsco[isco] ?? [];
  if (!cands.length) return null;
  const want = opts.title ?? iscoGroup(isco)?.title ?? "";
  const [code] = [...cands].sort((a, b) => titleScore(auByAnzsco[b[0]]!.title, want) - titleScore(auByAnzsco[a[0]]!.title, want) || b[1] - a[1])[0]!;
  const r = auByAnzsco[code]!;
  return {
    country: "AU", currency: "AUD", period: "week", granularity: "occupation-group", sector: "all",
    covers: `${r.title}, ANZSCO ${code}`,
    mean: r.weeklyMean, year: "May 2025",
    note: `Average weekly total cash earnings, all employees including part-time, so lower than full-time pay. Linked from ISCO-08 ${isco} through the ABS ANZSCO 2021 correspondence.`,
    source: "Australian Bureau of Statistics, Employee Earnings and Hours", attribution: auEarnings.meta.attribution, url: auEarnings.meta.url,
  };
}

interface ZaPost { schedule: string; post: string; entry: number }

/** South Africa: DPSA public-service entry notches (Circular 15 of 2026) for a guided career. */
export function zaPublicScales(career: string | null | undefined): PayBenchmark[] {
  const posts = career ? (zaDpsa.careers as Record<string, ZaPost[]>)[career] : undefined;
  if (!posts) return [];
  return posts.map((p) => ({
    country: "ZA", currency: "ZAR", period: "year" as const, granularity: "public-scale" as const, sector: "public" as const, isEntry: true,
    covers: p.post, scaleMin: p.entry, scaleMax: p.entry, year: "From 1 April 2026",
    note: `${p.schedule.replace(/^[A-Z] - /, "")} schedule: entry notch of the post. Which post applies depends on the vacancy.`,
    source: "DPSA Circular 15 of 2026, Annexures A-H", attribution: zaDpsa.meta.attribution, url: zaDpsa.meta.url,
  }));
}

/** South Africa: the general public-service salary levels 1 to 12 (full ranges). */
export const zaSalaryLevels = (): { level: number; min: number; max: number; notches: number }[] => zaDpsa.generalLevels;

/** Uganda: public-service entry scales for a guided career (CSI No. 6 of 2026). */
export function ugPublicScales(career: string | null | undefined): PayBenchmark[] {
  if (!career) return [];
  return (ugPay.scales as UgScale[]).filter((s) => s.careers.includes(career)).map((s) => ({
    country: "UG", currency: "UGX", period: "month", granularity: "public-scale", sector: "public", isEntry: true,
    covers: `${s.designation} (${s.scale})`,
    scaleMin: s.monthly.min, scaleMax: s.monthly.max, entryRequirement: s.entry,
    year: `FY ${ugPay.meta.financialYear}`,
    note: `${s.careerNote ? `${s.careerNote}. ` : ""}Schedule ${s.schedule}, page ${s.page}. Which scale applies depends on the post.`,
    source: "Ministry of Public Service, Uganda, CSI No. 6 of 2026", attribution: ugPay.meta.attribution, url: ugPay.meta.url,
  }));
}

interface KeRow { no: number; occupation: string; isco: string[]; careers: string[]; areas: { area: string; monthly: number }[] }

/**
 * Kenya: statutory minimum monthly wage (Legal Notice 108 of 2026) for the occupations in the
 * Schedule that match this career or ISCO-08 unit group. A legal floor, not typical pay.
 */
export function keMinimumWage(opts: { career?: string | null; isco?: string | null }): PayBenchmark | null {
  const isco4 = opts.isco?.slice(0, 4);
  const rows = (keWages.rows as KeRow[]).filter((r) => (opts.career && r.careers.includes(opts.career)) || (isco4 && isco4.length === 4 && r.isco.includes(isco4)));
  if (!rows.length) return null;
  const areas = rows[0]!.areas.map((a, i) => {
    const vals = rows.map((r) => r.areas[i]!.monthly);
    return { area: a.area, min: Math.min(...vals), max: Math.max(...vals) };
  });
  return {
    country: "KE", currency: "KES", period: "month", granularity: "legal-minimum", sector: "all",
    covers: rows.length === 1 ? rows[0]!.occupation : `${rows.map((r) => r.occupation).join("; ")}`,
    scaleMin: areas[0]!.min, scaleMax: areas[0]!.max, areas,
    year: "From 1 May 2026",
    note: `Legal minimum basic pay, excluding housing allowance; employers may pay more. Matched to the Schedule's occupations by CareerProof Global${rows.length > 1 ? `; ${rows.length} rows (e.g. artisan grades)` : ""}.`,
    source: "Regulation of Wages (General) (Amendment) Order, 2026", attribution: keWages.meta.attribution, url: keWages.meta.url,
  };
}

export interface WbgScale { country: string; name: string; location?: string; currency: string; grades: { grade: string; min: number; mid: number; max: number }[] }
/** World Bank Group FY27 salary scale for staff based in a country (not tied to occupations). */
export function wbgSalaryScale(country: string): WbgScale | null {
  return (wbg.byCountry as Record<string, WbgScale>)[country.toUpperCase()] ?? null;
}
export const wbgMeta = wbg.meta;

interface MinWageRow { monthly: number; currency: string | null; year: number; type: string | null; referencePeriod: string | null; source: string }
const minByCountry = minWage.byCountry as Record<string, MinWageRow>;

/** Newer official national rates, taken from the country's own gazette, that replace ILOSTAT's. */
const NATIONAL_MINIMUM_OVERRIDES: Record<string, PayBenchmark> = {
  NG: {
    country: "NG", currency: "NGN", period: "month", granularity: "legal-minimum", sector: "all",
    covers: "National minimum wage (National Minimum Wage Act 2024)",
    scaleMin: 70000, scaleMax: 70000, year: "2024 Act",
    note: "Signed into law in July 2024, replacing NGN 30,000; the federal government said it would be reviewed after three years. Employers may pay more.",
    source: "President Bola Ahmed Tinubu, national broadcast of 4 August 2024 (Federal Ministry of Information and National Orientation)",
    attribution: "Source: Federal Republic of Nigeria, National Minimum Wage Act 2024, as announced by the President on 4 August 2024.",
    url: "https://fmino.gov.ng/broadcast-by-his-excellency-bola-ahmed-tinubu-president-and-commander-in-chief-of-the-armed-forces-of-the-federal-republic-of-nigeria-on-the-nationwide-protest/",
  },
  ZA: {
    country: "ZA", currency: "ZAR", period: "hour", granularity: "legal-minimum", sector: "all",
    covers: "National minimum wage, each ordinary hour worked (farm and domestic workers included)",
    scaleMin: 30.23, scaleMax: 30.23, year: "From 1 March 2026",
    note: "Expanded public works programme workers: R16.62 an hour. Excludes allowances, payments in kind, tips and bonuses. Employers may pay more.",
    source: "National Minimum Wage Act: amendment, Government Gazette No. 54075 (notice R.7083), 2026",
    attribution: "Source: Department of Employment and Labour, Republic of South Africa, National Minimum Wage amendment, Government Gazette No. 54075.",
    url: "https://www.gov.za/sites/default/files/gcis_document/202602/54075rg11941gon7083.pdf",
  },
};

/** National statutory minimum wage: the country's own newer gazette where we hold it, else ILOSTAT's reference rate. */
export function nationalMinimumWage(country: string): PayBenchmark | null {
  const override = NATIONAL_MINIMUM_OVERRIDES[country.toUpperCase()];
  if (override) return override;
  const m = minByCountry[country.toUpperCase()];
  if (!m?.currency) return null;
  return {
    country: country.toUpperCase(), currency: m.currency, period: "month", granularity: "legal-minimum", sector: "all",
    covers: "National minimum wage (reference rate for the whole country)",
    scaleMin: m.monthly, scaleMax: m.monthly, year: String(m.year),
    note: [m.type ? `Type: ${m.type.toLowerCase()}` : null, "As reported to ILOSTAT; a newer rate may have been announced since", "Employers may pay more"].filter(Boolean).join(". ") + ".",
    source: "ILOSTAT, International Labour Organization: monthly minimum wage", attribution: minWage.meta.attribution, url: minWage.meta.url,
  };
}
export const minimumWageMeta = minWage.meta;
export const minimumWageCountries = (): string[] => Object.keys(minByCountry);

export interface UnGradePay {
  grade: string;
  steps: number;
  /** Net base salary (USD a year) at step 1 and the top regular step. */
  baseNetMin: number;
  baseNetMax: number;
  /** Net pay at this country's main duty station: base x (1 + multiplier / 100). */
  netMin: number;
  netMax: number;
}
export interface UnCountryPay { country: string; dutyStation: string; multiplier: number; asOf: string; scaleEffective: string; grades: UnGradePay[] }

/**
 * UN common system pay for Professional and higher staff at a country's main duty station
 * (ICSC salary scale plus post adjustment). USD a year, net of staff assessment.
 * Grades are not tied to occupations.
 */
export function unProfessionalPay(country: string): UnCountryPay | null {
  const pa = (icsc.postAdjustment as Record<string, { dsid: string; multiplier: number; asOf: string }>)[country.toUpperCase()];
  if (!pa) return null;
  const k = 1 + pa.multiplier / 100;
  return {
    country: country.toUpperCase(), dutyStation: pa.dsid, multiplier: pa.multiplier, asOf: pa.asOf, scaleEffective: icsc.meta.scaleEffective,
    grades: (icsc.grades as { grade: string; steps: number; first: { net: number }; last: { net: number } }[]).map((g) => ({
      grade: g.grade, steps: g.steps, baseNetMin: g.first.net, baseNetMax: g.last.net,
      netMin: Math.round(g.first.net * k), netMax: Math.round(g.last.net * k),
    })),
  };
}
export const icscMeta = icsc.meta;

/** ILOSTAT average for the ISCO major group, any country. */
export function groupPayBenchmark(isco: string | null | undefined, country: string): PayBenchmark | null {
  const e = earningsFor(isco, country);
  if (!e) return null;
  return {
    country: e.country, currency: e.currency ?? "", period: "month", granularity: "major-group", sector: "all",
    covers: `All ${e.groupTitle.toLowerCase()} (ISCO-08 group ${e.group})`,
    mean: e.monthly, year: String(e.year),
    note: [e.women !== null && e.men !== null ? `Women ${Math.round(e.women).toLocaleString("en")}, men ${Math.round(e.men).toLocaleString("en")}` : null, e.ratioToAll !== null ? `${e.ratioToAll}x the average for all employees` : null, e.source].filter(Boolean).join(". "),
    source: "ILOSTAT, International Labour Organization", attribution: e.attribution, url: e.sourceUrl,
  };
}

/**
 * Every benchmark for one career in one country, most specific first: public entry scales,
 * occupation-level ranges (US, UK), the ILOSTAT group average, then any legal minimum.
 */
export function payBenchmarks(opts: { country: string; isco?: string | null; soc?: string | null; career?: string | null; title?: string }): PayBenchmark[] {
  const cc = opts.country.toUpperCase();
  const out: PayBenchmark[] = [];
  if (cc === "UG") out.push(...ugPublicScales(opts.career));
  if (cc === "ZA") out.push(...zaPublicScales(opts.career));
  if (cc === "US") { const b = usPayBenchmark(opts); if (b) out.push(b); }
  if (cc === "GB") { const b = ukPayBenchmark(opts.isco); if (b) out.push(b); }
  if (cc === "CA") { const b = caPayBenchmark(opts); if (b) out.push(b); }
  if (cc === "AU") { const b = auPayBenchmark(opts); if (b) out.push(b); }
  const g = groupPayBenchmark(opts.isco, cc);
  if (g) out.push(g);
  // A legal floor comes after the averages, so it never stands in for typical pay. An
  // occupation-specific national order (Kenya) takes precedence over the ILOSTAT national rate.
  if (cc !== "KE") { const n = nationalMinimumWage(cc); if (n) out.push(n); }
  if (cc === "KE") {
    const floor = keMinimumWage(opts);
    if (floor) {
      const lowestFloor = Math.min(...floor.areas!.map((a) => a.min));
      if (g?.mean !== undefined && g.mean < lowestFloor) {
        g.note = `${g.note ? `${g.note}. ` : ""}This ${g.year} survey average is below today's legal minimum: household surveys count all employees, including informal and part-time jobs, and it predates later wage orders.`;
      }
      out.push(floor);
    }
  }
  return out;
}

/** Countries with pay finer than the ILOSTAT group average. */
export const detailedPayCountries = [
  { code: "US", what: "Pay ranges for about 800 occupations (BLS OEWS)" },
  { code: "GB", what: "Pay ranges for 362 occupation groups (ONS ASHE)" },
  { code: "CA", what: "Pay ranges for 515 occupations (Job Bank wages)" },
  { code: "AU", what: "Average weekly earnings for 317 occupations (ABS)" },
  { code: "UG", what: "Public-service entry pay by grade (Ministry of Public Service)" },
  { code: "ZA", what: "Public-service entry notches by post, 2026/27 (DPSA), and the 2026 national minimum wage" },
  { code: "KE", what: "Statutory minimum wages by occupation and area (Legal Notice 108 of 2026)" },
];
export const ugPublicPayMeta = ugPay.meta;

export interface PayCoverage {
  country: string;
  /** Pay ranges for individual occupations (BLS, ONS). */
  occupationLevel: string | null;
  /** Published public-service entry scales. */
  publicScales: string | null;
  /** Legal minimum: occupation-specific order, or the ILOSTAT national rate. */
  legalMinimum: { kind: "by occupation" | "national"; year: string } | null;
  /** Latest year of ILOSTAT group averages. */
  groupAverages: number | null;
  worldBank: boolean;
  unitedNations: boolean;
}

const OCCUPATION_LEVEL: Record<string, string> = { US: "BLS OEWS, May 2025", GB: "ONS ASHE, 2026 provisional", CA: "Job Bank wages, 2025 release", AU: "ABS EEH, May 2025" };
const PUBLIC_SCALES: Record<string, string> = { UG: "Ministry of Public Service, FY 2026/27", ZA: "DPSA Circular 15 of 2026" };

/** Which pay tiers a country has, for the coverage page. */
export function payCoverage(country: string): PayCoverage {
  const cc = country.toUpperCase();
  const groups = (iloEarnings.byCountry as Record<string, { groups: Record<string, { year: number }> }>)[cc]?.groups;
  const groupYear = groups ? Math.max(...Object.values(groups).map((g) => g.year)) : null;
  const nat = minByCountry[cc];
  return {
    country: cc,
    occupationLevel: OCCUPATION_LEVEL[cc] ?? null,
    publicScales: PUBLIC_SCALES[cc] ?? null,
    legalMinimum: cc === "KE" ? { kind: "by occupation", year: "2026" } : NATIONAL_MINIMUM_OVERRIDES[cc] ? { kind: "national", year: NATIONAL_MINIMUM_OVERRIDES[cc]!.year.replace(/\D*(\d{4}).*/, "$1") } : nat?.currency ? { kind: "national", year: String(nat.year) } : null,
    groupAverages: groupYear,
    worldBank: Boolean(wbgSalaryScale(cc)),
    unitedNations: Boolean((icsc.postAdjustment as Record<string, unknown>)[cc]),
  };
}
