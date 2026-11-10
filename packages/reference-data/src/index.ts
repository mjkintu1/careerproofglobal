import joinShares from "./snapshots/world-bank-join-occupation-shares.json";
import blsSnap from "./snapshots/bls-oews-us.json";
import heRegulators from "./higher-education-regulators.json";
import qaAgencies from "./snapshots/qa-agencies-inqaahe.json";
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

export interface HeRegulator {
  country: string;
  name: string;
  scope: string;
  status: string;
  website?: string;
  caution?: string;
  note?: string;
  /** Network or register that lists this body. */
  listedBy: { name: string; url: string };
  /** INQAAHE profile page, when listed there. */
  profile?: string;
}

const AFRIQAN = { name: "AfriQAN", url: heRegulators.meta.url };
const INQAAHE = { name: "INQAAHE", url: qaAgencies.meta.url };
const normName = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z]/g, "");

/**
 * Higher-education regulators and quality-assurance agencies for a country:
 * AfriQAN's African list (curated) plus INQAAHE full members. Listing is not proof of legal
 * status; bodies are marked "official-site-checked" only after we check their own site.
 */
export function higherEducationRegulators(countryCode: string): { regulators: HeRegulator[]; source: string; sourceUrl: string; sources: { name: string; url: string }[] } {
  const cc = countryCode.toUpperCase();
  const afriqan: HeRegulator[] = (heRegulators.regulators as Omit<HeRegulator, "listedBy">[])
    .filter((r) => r.country === cc)
    .map((r) => ({ ...r, listedBy: AFRIQAN }));
  const seen = new Set(afriqan.map((r) => normName(r.name)));
  const inq: HeRegulator[] = qaAgencies.agencies
    .filter((a) => a.country === cc && !seen.has(normName(a.name)))
    .map((a) => ({
      country: a.country,
      name: a.name,
      scope: "quality-assurance",
      status: "listed",
      website: a.website ? (a.website.startsWith("http") ? a.website : `https://${a.website}`) : undefined,
      listedBy: INQAAHE,
      profile: a.profile,
    }));
  const regulators = [...afriqan, ...inq];
  const sources = [...new Map(regulators.map((r) => [r.listedBy.name, r.listedBy])).values()];
  return {
    regulators,
    source: sources.length ? sources.map((x) => x.name).join(" and ") : "AfriQAN and INQAAHE",
    sourceUrl: (sources[0] ?? AFRIQAN).url,
    sources,
  };
}
export const qaAgencyMeta = qaAgencies.meta;
export const qaNetworks = qaAgencies.networks;
export const regulatorCountryCount = new Set([
  ...(heRegulators.regulators as { country: string }[]).map((r) => r.country),
  ...qaAgencies.agencies.map((a) => a.country),
]).size;

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

// Uganda: NCHE accreditation (server-side; large) and the official admission data.
import ncheSnap from "./snapshots/ug-nche.json";
export * from "./uganda";
export interface NcheProgramme { i: string; p: string; l: string; d: string; a: string; e: string; s: string }
export const nche = {
  meta: ncheSnap.meta,
  institutions: ncheSnap.institutions,
  programmes: ncheSnap.programmes as NcheProgramme[],
};

// Kenya: system facts (UNESCO IICBA brief) and placement bodies; calculator pending official data.
import kenyaSnap from "./kenya.json";
export const kenya = kenyaSnap;

// Education-system structure for every country (UNESCO UIS Data API, CC BY-SA 4.0).
import uisSnap from "./snapshots/uis-education-structure.json";
type UisValue = { value: number; year: number };
export interface EducationStructure {
  primaryEntryAge?: UisValue;
  primaryYears?: UisValue;
  lowerSecondaryEntryAge?: UisValue;
  lowerSecondaryYears?: UisValue;
  upperSecondaryEntryAge?: UisValue;
  upperSecondaryYears?: UisValue;
  compulsoryYears?: UisValue;
  /** Gross enrolment ratio for tertiary education, both sexes (%). */
  tertiaryGer?: UisValue;
}
export const uisMeta = uisSnap.meta;
export const educationStructure = (countryCode: string): EducationStructure | null =>
  (uisSnap.byCountry as Record<string, EducationStructure>)[countryCode.toUpperCase()] ?? null;

// UNESCO UIS ISCED 2011 mappings: minimum entrance requirements per national programme (server-side).
import iscedSnap from "./snapshots/isced-mappings.json";
export interface IscedProgramme { n: string; q: string; a: string; age: number | null; y: number | null; l: number; c: string; x: string }
interface IscedCountry { year: number | null; english: boolean; programmes: IscedProgramme[]; file: string; variants?: (IscedCountry & { variant: string })[] }
export const iscedMeta = iscedSnap.meta;
export const iscedCountryCount = Object.keys(iscedSnap.byCountry).length;
/**
 * Entry route to higher education from the ISCED mapping:
 * - upperSecondary: ISCED-P 344 (general) or 354 (vocational) = completion with direct access to tertiary
 * - firstDegree: ISCED level 6 codes ending 5 or 6 = first or long first degree
 */
export function iscedMapping(countryCode: string) {
  const c = (iscedSnap.byCountry as Record<string, IscedCountry>)[countryCode.toUpperCase()];
  if (!c) return null;
  const access = c.programmes.filter((p) => p.c === "344" || p.c === "354");
  return {
    year: c.year,
    english: c.english,
    file: c.file,
    upperSecondary: access.some((p) => p.c === "344") ? access.filter((p) => p.c === "344") : access,
    shortCycle: c.programmes.filter((p) => p.l === 5),
    firstDegree: c.programmes.filter((p) => p.l === 6 && (p.c.endsWith("5") || p.c.endsWith("6"))),
    programmes: c.programmes,
    variants: (c.variants ?? []).map((v) => v.variant),
  };
}
export type IscedEntry = NonNullable<ReturnType<typeof iscedMapping>>;

// Featured professionals (consent-based; empty until people opt in).
import professionalsSnap from "./professionals.json";
export interface Professional {
  career: string; name: string; headline: string; country: string; linkedin: string; story?: string; consentRecordedAt: string; checkedBy: string;
  background?: string; turningPoint?: string; steps?: string[]; result?: string; lesson?: string;
}
/** All featured professionals with consent (for the Grow your career page). */
export const allProfessionals = (): Professional[] =>
  (professionalsSnap.professionals as Professional[]).filter((p) => p.consentRecordedAt && p.linkedin.startsWith("https://www.linkedin.com/in/"));
export const professionalsMeta = professionalsSnap.meta;
export const professionalsFor = (career: string): Professional[] =>
  (professionalsSnap.professionals as Professional[]).filter((p) => p.career === career && p.consentRecordedAt && p.linkedin.startsWith("https://www.linkedin.com/in/"));
export * from "./subjects";
