import { allOnetOccupations, escoOccupations } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { clusterName } from "./careers";
import { network } from "./path-network";
import { scoreLabel } from "./search-match";

export type SearchKind = "guide" | "occupation" | "route";
export interface SearchResult {
  title: string;
  href: string;
  kind: SearchKind;
  /** Why it matched when the title itself does not show it, e.g. "also called systems engineer". */
  note: string | null;
}

interface Entry { label: string; title: string; kind: SearchKind; target: string; boost: number; alt: boolean }

/** Words people type for some guided careers (kept in step with the planner's prompt reader). */
const ALIASES: Record<string, string[]> = {
  "medical-doctor": ["doctor", "physician", "medic"],
  "software-developer": ["programmer", "coder", "software engineer"],
  lawyer: ["advocate", "attorney", "solicitor", "barrister"],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
let entries: Entry[] | null = null;

/** Built once per server instance: about 20,000 names for about 4,000 occupations. */
function build(): Entry[] {
  const out: Entry[] = [];
  for (const o of careerGraphData.occupations) {
    const base = { title: o.title, kind: "guide" as const, target: o.slug, boost: 30 };
    out.push({ ...base, label: o.title, alt: false });
    for (const a of ALIASES[o.slug] ?? []) out.push({ ...base, label: a, alt: true });
  }
  for (const o of escoOccupations) {
    const base = { title: cap(o.title), kind: "occupation" as const, target: o.code, boost: 10 };
    out.push({ ...base, label: o.title, alt: false });
    for (const a of o.altLabels) out.push({ ...base, label: a, alt: true });
  }
  const inNetwork = new Set(network.edges.flatMap((e) => [e.from, e.to]));
  for (const o of allOnetOccupations()) {
    if (!inNetwork.has(o.code)) continue;
    const base = { title: o.title, kind: "route" as const, target: o.code, boost: 5 };
    out.push({ ...base, label: o.title, alt: false });
    for (const a of o.reportedTitles) out.push({ ...base, label: a, alt: true });
  }
  return out;
}

function hrefFor(e: Entry, location: string): string {
  if (e.kind === "guide") return `/careers/${location}/${e.target}`;
  if (e.kind === "occupation") return `/occupations/${encodeURIComponent(e.target)}`;
  const base = location === "global" ? "/paths" : `/paths/${location}`;
  return `${base}?${new URLSearchParams({ from: "start", to: e.target })}`;
}

/** Best matches across guided careers, ESCO occupations and route-map occupations. */
export function searchCareers(query: string, location: string, limit = 10): SearchResult[] {
  entries ??= build();
  const best = new Map<string, { score: number; entry: Entry }>();
  for (const e of entries) {
    const s = scoreLabel(query, e.label);
    if (!s) continue;
    // Other names can be broad ("systems engineer" is a reported title for logistics engineers),
    // so they never outrank an occupation whose own title matches.
    const score = (e.alt ? Math.min(s, 70) - 4 : s) + e.boost;
    const key = `${e.kind}:${e.target}`;
    const prev = best.get(key);
    if (!prev || score > prev.score) best.set(key, { score, entry: e });
  }
  const seenTitles = new Set<string>();
  const results: SearchResult[] = [];
  for (const { entry: e } of [...best.values()].sort((a, b) => b.score - a.score)) {
    const t = e.title.toLowerCase();
    if (seenTitles.has(t)) continue; // same name from two sources: keep the higher-ranked one
    seenTitles.add(t);
    results.push({
      title: e.title,
      href: hrefFor(e, location),
      kind: e.kind,
      note: e.alt ? `also called ${e.label.toLowerCase().replace(/\s+/g, " ")}` : e.kind === "guide" ? clusterName(careerGraphData.occupations.find((o) => o.slug === e.target)!.cluster) : null,
    });
    if (results.length >= limit) break;
  }
  return results;
}
