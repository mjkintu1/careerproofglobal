import { CareerNetwork, type NetworkEdge } from "@careerproof/career-graph";
import {
  allOnetOccupations, careerEvidence, earningsFor, iscoForOnet, iscoSkillLevels, jobZonePreparation, onetOccupation, payBenchmarks,
  ukPayBenchmark, usPayBenchmark, usPayForSoc, type CountryEarnings, type PayBenchmark, type UsPay,
} from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { graph } from "./careers";

/** Pseudo-node for "I'm at school / starting out". */
export const START = "start";

/** Steps that follow a qualification (internships, supervised practice), so they are not a way in on their own. */
const AFTER_QUALIFYING = /supervised|internship|pre-registration|before appointment/i;

/**
 * Ways in that take time. A licence or registration (0 years) is an extra step, and
 * internships or supervised practice follow a degree, so neither is a way in.
 */
const waysIn = (slug: string) =>
  (graph.get(slug)?.routes ?? []).filter((r) => r.years > 0 && r.type !== "licence" && !(r.type === "experience" && AFTER_QUALIFYING.test(r.title)));

/**
 * Conservative cost of moving into a career when no source gives the time: the length of
 * its main (longest) qualification. Routes in our data mix alternatives and sequential
 * steps, so the longest single route is a floor for retraining, not a guess at a shortcut.
 */
export const mainQualificationYears = (slug: string) => Math.max(0, ...waysIn(slug).map((r) => r.years)) || 3;

/**
 * Skill overlap weighted by rarity (inverse document frequency): sharing "patient care"
 * says far more than sharing "communication", which 21 of 68 careers list.
 */
function skillPivots(minOverlap = 0.3) {
  const occ = careerGraphData.occupations;
  const freq = new Map<string, number>();
  for (const o of occ) for (const s of o.skills) freq.set(s, (freq.get(s) ?? 0) + 1);
  const w = (s: string) => Math.log(occ.length / (freq.get(s) ?? 1));
  const out: { from: string; to: string; overlap: number; shared: string[] }[] = [];
  for (const a of occ) {
    const mine = new Set(a.skills);
    for (const b of occ) {
      if (a.slug === b.slug) continue;
      const shared = b.skills.filter((s) => mine.has(s));
      // At least two shared skills that are not near-universal.
      if (shared.filter((s) => (freq.get(s) ?? 0) <= occ.length / 7).length < 2) continue;
      const union = new Set([...a.skills, ...b.skills]);
      const overlap = shared.reduce((t, s) => t + w(s), 0) / [...union].reduce((t, s) => t + w(s), 0);
      if (overlap >= minOverlap) out.push({ from: a.slug, to: b.slug, overlap, shared: shared.sort((x, y) => w(y) - w(x)) });
    }
  }
  return out;
}

/** O*NET code -> guided career slug, for the guided careers that map to O*NET. */
const guidedByOnet = new Map<string, string>();
const onetByGuided = new Map<string, string>();
for (const o of careerGraphData.occupations) {
  const code = careerEvidence(o.slug, o.title)?.onet?.code;
  if (!code) continue;
  onetByGuided.set(o.slug, code);
  if (!guidedByOnet.has(code)) guidedByOnet.set(code, o.slug);
}
/** Network node id: the guided career slug when there is one, else the O*NET-SOC code. */
export const nodeId = (onetCode: string) => guidedByOnet.get(onetCode) ?? onetCode;

/**
 * All moves between the guided careers, from three kinds of evidence:
 * - curated moves (typical years recorded in our career data),
 * - O*NET "Related Occupations" between all ~1,000 O*NET occupations (CC BY 4.0; time not published),
 * - shared skills of 30% or more, weighted by rarity (time not published).
 * Plus entry routes from START into every career.
 * Moves without published time are ranked as the target's main qualification (guided
 * careers) or the minimum of O*NET's preparation time for its Job Zone, and the UI says so.
 */
function buildEdges(): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  const has = new Set<string>();
  const add = (e: NetworkEdge) => {
    const k = `${e.from}>${e.to}${e.kind === "entry" ? `:${e.via}` : ""}`;
    if (has.has(k)) return;
    has.add(k);
    edges.push(e);
  };
  const retrain = mainQualificationYears;

  for (const t of careerGraphData.transitions) {
    add({ from: t.from, to: t.to, kind: t.kind, years: t.years, weight: t.years, via: t.via, evidence: "curated" });
  }

  // Every O*NET occupation is a node; a guided career absorbs the O*NET occupation it maps to.
  const onetPrep = (code: string) => jobZonePreparation[onetOccupation(code)?.jobZone ?? 0] ?? null;
  const moveCost = (id: string) => (graph.get(id) ? retrain(id) : (onetPrep(id)?.minYears ?? 2));
  for (const o of allOnetOccupations()) {
    const from = nodeId(o.code);
    for (const rel of o.related ?? []) {
      const to = nodeId(rel);
      const title = onetOccupation(rel)?.title;
      if (to === from || !title) continue;
      add({ from, to, kind: "related", years: null, weight: moveCost(to), via: `O*NET lists ${title} as a related occupation`, evidence: "onet-related" });
    }
    // From starting out: O*NET's usual education and preparation for the occupation.
    const prep = onetPrep(o.code);
    if (!graph.get(from) && prep) {
      add({ from: START, to: from, kind: "entry", years: null, weight: prep.minYears, via: `${o.education ?? "Preparation"}, then ${prep.time} of specific preparation (O*NET Job Zone ${o.jobZone})`, evidence: "entry-route" });
    }
  }

  for (const p of skillPivots()) {
    const shared = p.shared.slice(0, 3).map((x) => graph.skillName(x).toLowerCase()).join(", ");
    add({ from: p.from, to: p.to, kind: "pivot", years: null, weight: retrain(p.to), via: `${Math.round(p.overlap * 100)}% shared skills (weighted by rarity): ${shared}`, evidence: "shared-skills" });
  }

  // Every way into every career, from starting out. The planner also offers these from
  // the user's current career, as "retrain directly".
  for (const o of careerGraphData.occupations) {
    // Postgraduate routes need a first degree, so they are not a way in from school.
    for (const r of waysIn(o.slug).filter((x) => !/\b(master|postgraduate|phd|doctoral)/i.test(x.title))) add({ from: START, to: o.slug, kind: "entry", years: r.years, weight: r.years, via: r.title, evidence: "entry-route" });
  }
  return edges;
}

export const network = new CareerNetwork(buildEdges());

export interface CareerCard {
  /** Node id: guided career slug or O*NET-SOC code. */
  slug: string;
  title: string;
  /** "guided" careers have full CareerProof guides; "onet" nodes come from O*NET only. */
  kind: "guided" | "onet";
  onet: string | null;
  isco: string | null;
  cluster: string | null;
  summary: string;
  routes: { type: string; title: string; years: number }[];
  /** Usual education: ISCO-08 skill level (guided) or O*NET's education and Job Zone. */
  entryEducation: string | null;
  earnings: CountryEarnings | null;
  /** US median pay (BLS OEWS), shown when the country is the US or no country is chosen. */
  usPay: UsPay | null;
  /** Pay benchmarks for the chosen country, most specific first; US and UK references when global. */
  pay: PayBenchmark[];
  regulator: string | null;
}

function payFor(country: string | null, opts: { isco: string | null; soc: string | null; career: string | null; title: string }): PayBenchmark[] {
  if (country) return payBenchmarks({ country, ...opts });
  return [usPayBenchmark(opts), ukPayBenchmark(opts.isco)].filter((b): b is PayBenchmark => Boolean(b));
}

const clip = (t: string, n = 280) => (t.length > n ? `${t.slice(0, t.lastIndexOf(" ", n))}…` : t);

/** Everything the canvas shows about one node, for one country (or global). */
export function careerCard(id: string, country: string | null): CareerCard | null {
  const cc = country?.toUpperCase() ?? null;
  const showUs = !cc || cc === "US";
  const o = graph.get(id);
  if (o) {
    const onet = onetByGuided.get(o.slug) ?? null;
    return {
      slug: o.slug, title: o.title, kind: "guided", onet, isco: o.isco, cluster: o.cluster, summary: o.summary, routes: o.routes,
      entryEducation: o.isco ? (iscoSkillLevels[o.isco[0]!]?.education ?? null) : null,
      earnings: cc ? earningsFor(o.isco, cc) : null,
      usPay: showUs && onet ? usPayForSoc(onet) : null,
      pay: payFor(cc, { isco: o.isco, soc: onet, career: o.slug, title: o.title }),
      regulator: cc ? (careerGraphData.regulators[o.slug]?.[cc] ?? null) : null,
    };
  }
  const n = onetOccupation(id);
  if (!n) return null;
  const isco = iscoForOnet(n.code);
  const prep = jobZonePreparation[n.jobZone ?? 0];
  return {
    slug: n.code, title: n.title, kind: "onet", onet: n.code, isco, cluster: null, summary: clip(n.description), routes: [],
    entryEducation: [n.education && `${n.education} (most common, O*NET)`, prep && `Job Zone ${n.jobZone}: ${prep.time} of specific preparation`].filter(Boolean).join("; ") || null,
    earnings: cc ? earningsFor(isco, cc) : null,
    usPay: showUs ? usPayForSoc(n.code) : null,
    pay: payFor(cc, { isco, soc: n.code, career: null, title: n.title }),
    regulator: null,
  };
}

/** Every node, for the start and goal pickers and the prompt. */
export function nodeOptions(): { code: string; name: string }[] {
  const guided = careerGraphData.occupations.map((o) => ({ code: o.slug, name: o.title }));
  const inNetwork = new Set(network.edges.flatMap((e) => [e.from, e.to]));
  const onet = allOnetOccupations().filter((o) => !guidedByOnet.has(o.code) && inNetwork.has(o.code))
    .map((o) => ({ code: o.code, name: o.title }));
  return [...guided, ...onet].sort((a, b) => a.name.localeCompare(b.name));
}

/** Retrain directly: the goal's own ways in, from wherever the user starts. */
export function directEdges(from: string, to: string): NetworkEdge[] {
  if (from === START) return [];
  const own = network.outgoing(START).filter((e) => e.to === to);
  const post = (graph.get(to)?.routes ?? []).filter((r) => r.years > 0 && /\b(master|postgraduate|phd|doctoral)/i.test(r.title))
    .map((r): NetworkEdge => ({ from: START, to, kind: "entry", years: r.years, weight: r.years, via: `${r.title}, if you already hold a degree`, evidence: "entry-route" }));
  return [...own, ...post].map((e) => ({ ...e, from }));
}

export function networkStats() {
  const by = (ev: string) => network.edges.filter((e) => e.evidence === ev).length;
  const nodes = new Set(network.edges.flatMap((e) => [e.from, e.to]));
  nodes.delete(START);
  return { curated: by("curated"), onet: by("onet-related"), skills: by("shared-skills"), entry: by("entry-route"), total: network.edges.length, nodes: nodes.size };
}
