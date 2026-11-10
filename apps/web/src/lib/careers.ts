import { CareerGraph, type Location, type Occupation, type TransitionKind } from "@careerproof/career-graph";
import { careerGraphData } from "@careerproof/sample-data";

/** One shared, indexed graph (data is static and bundled). */
export const graph = new CareerGraph(careerGraphData);

export const GLOBAL = "global";

/** URL codes for the location dropdown: "global" plus lower-case ISO codes. */
export const locationCodes = [GLOBAL, ...careerGraphData.locations.map((l) => l.code.toLowerCase())];

export function findLocation(code: string): Location | null {
  return careerGraphData.locations.find((l) => l.code.toLowerCase() === code.toLowerCase()) ?? null;
}

export function isLocationCode(code: string): boolean {
  return locationCodes.includes(code.toLowerCase());
}

export function locationName(code: string): string {
  return findLocation(code)?.name ?? "Global";
}

/**
 * Countries with their own local detail (school exams, licensing bodies). Other
 * country pages repeat the global content, so their canonical URL is the global page.
 */
export function hasLocalDetail(location: string): boolean {
  return location === GLOBAL || Boolean(findLocation(location)?.secondaryExams);
}

/** Location to use in canonical URLs and the sitemap. */
export function canonicalLocation(location: string): string {
  return hasLocalDetail(location) ? location.toLowerCase() : GLOBAL;
}

export function careerHref(location: string, slug: string): string {
  return `/careers/${location}/${slug}`;
}

export function clusterName(slug: string): string {
  return careerGraphData.clusters.find((c) => c.slug === slug)?.name ?? slug;
}

/** "a Civil Engineer" / "an Accountant". */
export function withArticle(title: string): string {
  return `${/^[AEIOU]/i.test(title) ? "an" : "a"} ${title}`;
}

export function careerPageTitle(o: Occupation, location: string): string {
  const where = findLocation(location);
  return `How to become ${withArticle(o.title)}${where ? ` in ${where.name}` : ""}`;
}

export const kindLabel: Record<TransitionKind, string> = {
  progression: "Step up",
  specialisation: "Specialise",
  pivot: "Change field",
};

export const levelLabel: Record<Occupation["level"], string> = {
  none: "No formal qualification required",
  certificate: "Certificate or vocational training",
  diploma: "Diploma",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  doctorate: "Doctorate",
};

export function formatYears(years: number): string {
  if (years === 0) return "no extra time";
  if (years < 1) return `about ${Math.round(years * 12)} months`;
  return `about ${years} year${years === 1 ? "" : "s"}`;
}

/** Options for the location dropdown. */
export const locationOptions = locationCodes.map((code) => ({ code, name: locationName(code) }));

/** Small list for the client-side search (keeps the full graph off the client). */
export const searchItems = careerGraphData.occupations
  .map((o) => ({ slug: o.slug, title: o.title, cluster: clusterName(o.cluster) }))
  .sort((a, b) => a.title.localeCompare(b.title));
