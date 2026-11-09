import joinShares from "./snapshots/world-bank-join-occupation-shares.json";
import blsSnap from "./snapshots/bls-oews-us.json";
import heRegulators from "./higher-education-regulators.json";
import crosswalkForBls from "./snapshots/esco-onet-crosswalk.json";
import rorSnap from "./snapshots/ror-education.json";
import certSnap from "./certifications.json";

/** ISCO-08 major groups (1-digit). */
export const iscoMajorGroups: Record<string, string> = {
  "1": "Managers",
  "2": "Professionals",
  "3": "Technicians and associate professionals",
  "4": "Clerical support workers",
  "5": "Service and sales workers",
  "6": "Skilled agricultural, forestry and fishery workers",
  "7": "Craft and related trades workers",
  "8": "Plant and machine operators and assemblers",
  "9": "Elementary occupations",
  "0": "Armed forces occupations",
};

export interface WorkforceShare {
  /** ISCO-08 major group digit. */
  group: string;
  groupName: string;
  /** Percent of employed people aged 15-64. */
  value: number;
  period: string;
  attribution: string;
  sourceUrl: string;
}

type Snapshot = {
  attribution: string;
  source: string;
  unit: string;
  fetchedAt: string;
  byCountry: Record<string, Record<string, { value: number; period: string }>>;
};
const snapshot = joinShares as Snapshot;

/** Share of workers in an ISCO major group for a country (latest year available), or null. */
export function workforceShare(countryCode: string, isco: string | null): WorkforceShare | null {
  if (!isco) return null;
  const group = isco.charAt(0);
  const entry = snapshot.byCountry[countryCode.toUpperCase()]?.[group];
  if (!entry) return null;
  return {
    group,
    groupName: iscoMajorGroups[group] ?? group,
    value: entry.value,
    period: entry.period,
    attribution: snapshot.attribution,
    sourceUrl: snapshot.source,
  };
}

export const joinSnapshotFetchedAt = snapshot.fetchedAt;

export * from "./catalogue";

export interface UsPay { soc: string; year: string; medianAnnual?: number; employment?: number; attribution: string; sourceUrl: string }

/** US median pay and employment (BLS OEWS) for an ISCO unit group, via the official crosswalk to O*NET-SOC. */
export function usPayForIsco(isco: string | null): UsPay | null {
  if (!isco) return null;
  const soc = (crosswalkForBls.map as Record<string, string[]>)[isco]?.[0]?.slice(0, 7).replace("-", "");
  const d = soc ? (blsSnap.bySoc as Record<string, { year: string; medianAnnual?: number; employment?: number }>)[soc] : undefined;
  if (!soc || !d) return null;
  return { soc, ...d, attribution: blsSnap.meta.attribution, sourceUrl: blsSnap.meta.url };
}

export interface HeRegulator { country: string; name: string; scope: string; status: string; website?: string; caution?: string; note?: string }
/** Higher-education regulators listed by AfriQAN for a country (unverified until confirmed on official sites). */
export function higherEducationRegulators(countryCode: string): { regulators: HeRegulator[]; source: string; sourceUrl: string } {
  return {
    regulators: (heRegulators.regulators as HeRegulator[]).filter((r) => r.country === countryCode.toUpperCase()),
    source: heRegulators.meta.source,
    sourceUrl: heRegulators.meta.url,
  };
}

export interface Institution { rorId: string; name: string; acronym: string; city: string; website: string; established: string }
type RorRow = [string, string, string, string, string, string];
const rorByCountry = rorSnap.byCountry as unknown as Record<string, RorRow[]>;

export const institutionAttribution = { text: rorSnap.meta.attribution, url: rorSnap.meta.url, source: rorSnap.meta.source };

/** Active education institutions in a country (ROR, CC0). Server-side data. */
export function institutionsIn(countryCode: string): Institution[] {
  return (rorByCountry[countryCode.toUpperCase()] ?? []).map(([rorId, name, acronym, city, website, established]) => ({ rorId, name, acronym, city, website, established }));
}

/** Country code -> number of education institutions. */
export const institutionCounts: Record<string, number> = Object.fromEntries(Object.entries(rorByCountry).map(([cc, rows]) => [cc, rows.length]));
export const institutionTotal = Object.values(institutionCounts).reduce((a, b) => a + b, 0);

/** US median pay and employment (BLS OEWS) for an O*NET-SOC code such as "29-1141.00". */
export function usPayForSoc(onetSoc: string): UsPay | null {
  const soc = onetSoc.slice(0, 7).replace("-", "");
  const d = (blsSnap.bySoc as Record<string, { year: string; medianAnnual?: number; employment?: number }>)[soc];
  return d ? { soc, ...d, attribution: blsSnap.meta.attribution, sourceUrl: blsSnap.meta.url } : null;
}

export interface Certification {
  slug: string; name: string; issuer: string; category: string; level: string; url: string;
  summary: string; facts: string[]; careers: string[];
}
export const certifications = certSnap.certifications as Certification[];
export const certificationsCheckedAt = certSnap.meta.checkedAt;
export const certificationsPending = certSnap.pending;
export const certificationMethod = certSnap.meta.method;
export const certification = (slug: string) => certifications.find((c) => c.slug === slug);
export const certificationsForCareer = (careerSlug: string) => certifications.filter((c) => c.careers.includes(careerSlug));

// Admission systems and calculators.
import admissionSnap from "./admission-systems.json";
import ucasSnap from "./snapshots/ucas-tariff.json";

export type AdmissionTier = "points" | "explainer" | "eligibility";
export type AdmissionStatus = "verified" | "illustrative" | "pending";
export interface AdmissionSystem {
  id: string;
  countries: string[];
  tier: AdmissionTier;
  name: string;
  body: string;
  status: AdmissionStatus;
  cycle?: string;
  href: string | null;
  summary: string;
  facts: string[];
  source: { name: string; url: string } | null;
}
export const admissionSystems = admissionSnap.systems as AdmissionSystem[];
export const admissionSystemsPending = admissionSnap.pending;
export const admissionMeta = admissionSnap.meta;
export const admissionTiers = admissionSnap.tiers as Record<AdmissionTier, string>;
export const admissionSystemsFor = (countryCode: string) =>
  admissionSystems.filter((s) => s.countries.includes(countryCode.toUpperCase()));

export interface TariffQualification { id: string; label: string; group: string; officialTitle: string; sizeBand: string; grades: { grade: string; points: number }[] }
export const ucasTariff = {
  source: ucasSnap.source,
  url: ucasSnap.url,
  cycle: ucasSnap.cycle,
  checkedAt: ucasSnap.checkedAt,
  notes: ucasSnap.notes,
  qualifications: ucasSnap.qualifications as TariffQualification[],
};
