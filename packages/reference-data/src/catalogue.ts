/**
 * Global occupation catalogue: ISCO-08 hierarchy + ESCO occupations (European Commission)
 * + O*NET detail (USDOL/ETA), joined by the official ESCO <-> O*NET crosswalk.
 * Server-side data (several MB); do not import into client components.
 */
import crosswalk from "./snapshots/esco-onet-crosswalk.json";
import escoSnap from "./snapshots/esco-occupations.json";
import iscoSnap from "./snapshots/isco-08.json";
import onetSnap from "./snapshots/onet-occupations.json";

export interface IscoGroup { code: string; level: number; title: string; description: string; parent: string | null }
export interface EscoOccupation {
  code: string; uri: string; title: string; description: string; altLabels: string[];
  isco: string; broader: string | null; regulated: boolean; skills: string[];
}
export interface OnetOccupation {
  code: string; title: string; description: string; tasks: string[]; skills: string[];
  riasec: string | null; education: string | null; jobZone: number | null; reportedTitles: string[]; related: string[];
}

export const attributions = {
  esco: escoSnap.meta.attribution,
  escoUrl: escoSnap.meta.url,
  onet: onetSnap.meta.attribution,
  onetUrl: onetSnap.meta.url,
};

export const iscoGroups = iscoSnap.groups as IscoGroup[];
export const escoOccupations = escoSnap.occupations as EscoOccupation[];
const onet = onetSnap.occupations as Record<string, OnetOccupation>;
const xmap = crosswalk.map as Record<string, string[]>;

const groupByCode = new Map(iscoGroups.map((g) => [g.code, g]));
const childrenOf = new Map<string, IscoGroup[]>();
for (const g of iscoGroups) if (g.parent) childrenOf.set(g.parent, [...(childrenOf.get(g.parent) ?? []), g]);
const escoByCodeMap = new Map(escoOccupations.map((o) => [o.code, o]));
const escoByIsco = new Map<string, EscoOccupation[]>();
for (const o of escoOccupations) escoByIsco.set(o.isco, [...(escoByIsco.get(o.isco) ?? []), o]);

export const majorGroups = iscoGroups.filter((g) => g.level === 1);
export const iscoGroup = (code: string) => groupByCode.get(code);
export const iscoChildren = (code: string) => childrenOf.get(code) ?? [];

export function iscoAncestors(code: string): IscoGroup[] {
  const out: IscoGroup[] = [];
  let g = groupByCode.get(code);
  while (g?.parent) { g = groupByCode.get(g.parent); if (g) out.unshift(g); }
  return out;
}

/** Number of ESCO occupations anywhere under an ISCO group. */
export function escoCountUnder(code: string): number {
  return escoOccupations.filter((o) => o.isco.startsWith(code)).length;
}

export const escoOccupation = (code: string) => escoByCodeMap.get(code);
/** ESCO occupations in an ISCO unit group (top-level ones first). */
export const escoInUnitGroup = (isco: string) =>
  [...(escoByIsco.get(isco) ?? [])].sort((a, b) => Number(Boolean(a.broader)) - Number(Boolean(b.broader)) || a.title.localeCompare(b.title));
export const escoNarrower = (code: string) => escoOccupations.filter((o) => o.broader === code);

/** O*NET occupations linked to an ESCO occupation (or ISCO group code) by the official crosswalk. */
export function onetFor(escoOrIscoCode: string): OnetOccupation[] {
  return (xmap[escoOrIscoCode] ?? []).map((c) => onet[c]).filter((o): o is OnetOccupation => Boolean(o));
}
export const onetOccupation = (soc: string) => onet[soc];
export const allOnetOccupations = (): OnetOccupation[] => Object.values(onet);

/** A few everyday words O*NET titles phrase differently ("doctor" -> "physician"). */
const SYNONYMS: Record<string, string> = { doctor: "physician", medical: "medicine", lawyer: "attorney", programmer: "developer" };
const words = (t: string) => new Set(t.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w.length > 2)
  .map((w) => w.replace(/s$/, "")).map((w) => SYNONYMS[w] ?? w));
/**
 * The crosswalk often links one ESCO occupation to several O*NET occupations. Pick the one whose
 * title shares the most words with the given title (ties keep the crosswalk's order).
 */
export function bestOnetFor(escoOrIscoCode: string, title: string, tieBreakTitle?: string, prefer?: (o: OnetOccupation) => boolean): OnetOccupation | null {
  const list = onetFor(escoOrIscoCode);
  if (list.length < 2) return list[0] ?? null;
  const target = words(title);
  const second = words(tieBreakTitle ?? "");
  const score = (o: OnetOccupation) => {
    const w = [...words(o.title)];
    return (prefer?.(o) ? 1000 : 0) + w.filter((x) => target.has(x)).length * 10 + w.filter((x) => second.has(x)).length;
  };
  return list.reduce((best, o) => (score(o) > score(best) ? o : best), list[0]!);
}

/** Compact list for client-side search. */
export const occupationSearchItems = escoOccupations.map((o) => ({
  slug: o.code,
  title: o.title.charAt(0).toUpperCase() + o.title.slice(1),
  cluster: groupByCode.get(o.isco)?.title ?? "",
}));

export const catalogueCounts = {
  iscoGroups: iscoGroups.length,
  unitGroups: iscoGroups.filter((g) => g.level === 4).length,
  escoOccupations: escoOccupations.length,
  onetOccupations: Object.keys(onet).length,
};
