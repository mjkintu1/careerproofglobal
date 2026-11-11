/**
 * Multi-route search over a career network: every loopless route from one point to
 * another, best first (Yen's k-shortest paths on top of Dijkstra). No limit on moves.
 */

export type EdgeKind = "entry" | "progression" | "specialisation" | "pivot" | "related";
export type EdgeEvidence = "curated" | "onet-related" | "shared-skills" | "entry-route";

export interface NetworkEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** Typical years when a source gives them; null when not published. */
  years: number | null;
  /** Cost used for ranking (years, or a stated estimate when years are unknown). */
  weight: number;
  /** What the move takes, e.g. "Bachelor of Medicine (5 yrs)" or "Shared skills: data analysis". */
  via: string;
  evidence: EdgeEvidence;
}

export interface NetworkRoute {
  edges: NetworkEdge[];
  weight: number;
  /** Sum of published years only. */
  knownYears: number;
  /** Moves whose time is not published. */
  unknownMoves: number;
}

export class CareerNetwork {
  private out = new Map<string, NetworkEdge[]>();

  constructor(readonly edges: NetworkEdge[]) {
    for (const e of edges) this.out.set(e.from, [...(this.out.get(e.from) ?? []), e]);
  }

  /** Per-query edges (e.g. "retrain directly" from the user's start), set by routes(). */
  private extra = new Map<string, NetworkEdge[]>();

  outgoing(node: string): NetworkEdge[] {
    const base = this.out.get(node) ?? [];
    const more = this.extra.get(node);
    return more ? [...base, ...more] : base;
  }

  /** Most moves without published time allowed in one route (Infinity = no limit). Set by routes(). */
  private maxUnpublished = Infinity;

  /**
   * Cheapest route avoiding the given nodes and edges, using at most `budget` moves without
   * published time (Dijkstra over node + moves used, with a binary heap).
   */
  private shortest(from: string, to: string, bannedNodes: Set<string>, bannedEdges: Set<NetworkEdge>, budget: number): NetworkEdge[] | null {
    const label = (n: string, u: number) => `${n}|${u}`;
    const dist = new Map<string, number>([[label(from, 0), 0]]);
    const prev = new Map<string, { edge: NetworkEdge; at: string }>();
    const heap = new MinHeap();
    heap.push(0, label(from, 0));
    let goal: string | null = null;
    while (heap.size) {
      const [d, lu] = heap.pop()!;
      if (d > (dist.get(lu) ?? Infinity)) continue;
      const cut = lu.lastIndexOf("|");
      const u = lu.slice(0, cut);
      const used = Number(lu.slice(cut + 1));
      if (u === to) { goal = lu; break; }
      for (const e of this.outgoing(u)) {
        if (bannedEdges.has(e) || bannedNodes.has(e.to)) continue;
        const nu = used + (e.years === null && e.kind !== "entry" ? 1 : 0);
        if (nu > budget) continue;
        const lv = label(e.to, nu);
        const nd = d + this.cost(e);
        if (nd < (dist.get(lv) ?? Infinity)) {
          dist.set(lv, nd);
          prev.set(lv, { edge: e, at: lu });
          heap.push(nd, lv);
        }
      }
    }
    if (!goal) return null;
    const path: NetworkEdge[] = [];
    for (let l = goal; prev.has(l); l = prev.get(l)!.at) path.unshift(prev.get(l)!.edge);
    return path;
  }

  /**
   * Ranking cost added per move between jobs (not to entry routes). Set by routes(); a
   * ranking rule only, so returned weights stay the sum of edge weights.
   */
  private perMove = 0;
  private cost(e: NetworkEdge) {
    return e.weight + (e.kind === "entry" ? 0 : this.perMove);
  }

  routes(from: string, to: string, k = 5, extra: NetworkEdge[] = [], perMove = 0, maxUnpublished = Infinity): NetworkRoute[] {
    this.perMove = perMove;
    this.maxUnpublished = maxUnpublished;
    this.extra = new Map();
    for (const e of extra) this.extra.set(e.from, [...(this.extra.get(e.from) ?? []), e]);
    try {
      return this.search(from, to, k);
    } finally {
      this.extra = new Map();
    }
  }

  private search(from: string, to: string, k: number): NetworkRoute[] {
    if (from === to) return [];
    const unpublished = (p: NetworkEdge[]) => p.filter((e) => e.years === null && e.kind !== "entry").length;
    const first = this.shortest(from, to, new Set(), new Set(), this.maxUnpublished);
    if (!first) return [];
    const found: NetworkEdge[][] = [first];
    const candidates: NetworkEdge[][] = [];
    const cost = (p: NetworkEdge[]) => p.reduce((s, e) => s + this.cost(e), 0);
    const key = (p: NetworkEdge[]) => p.map((e) => `${e.from}>${e.to}:${e.kind}:${e.via}`).join("|");
    const seen = new Set([key(first)]);

    while (found.length < k) {
      const last = found[found.length - 1]!;
      for (let i = 0; i < last.length; i++) {
        const spurNode = last[i]!.from;
        const root = last.slice(0, i);
        const bannedEdges = new Set<NetworkEdge>();
        for (const p of found) {
          if (p.length > i && root.every((e, j) => p[j] === e)) bannedEdges.add(p[i]!);
        }
        const bannedNodes = new Set(root.map((e) => e.from));
        const spur = this.shortest(spurNode, to, bannedNodes, bannedEdges, this.maxUnpublished - unpublished(root));
        if (!spur) continue;
        const total = [...root, ...spur];
        const kk = key(total);
        if (!seen.has(kk)) { seen.add(kk); candidates.push(total); }
      }
      if (!candidates.length) break;
      candidates.sort((a, b) => cost(a) - cost(b) || a.length - b.length);
      found.push(candidates.shift()!);
    }

    return found.map((edges) => ({
      edges,
      weight: Math.round(edges.reduce((s, e) => s + e.weight, 0) * 10) / 10,
      knownYears: Math.round(edges.reduce((s, e) => s + (e.years ?? 0), 0) * 10) / 10,
      unknownMoves: edges.filter((e) => e.years === null).length,
    }));
  }
}

/** Small binary min-heap keyed by number. */
class MinHeap {
  private items: [number, string][] = [];
  get size() { return this.items.length; }
  push(key: number, value: string) {
    const a = this.items;
    a.push([key, value]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]![0] <= a[i]![0]) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): [number, string] | undefined {
    const a = this.items;
    if (!a.length) return undefined;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l]![0] < a[m]![0]) m = l;
        if (r < a.length && a[r]![0] < a[m]![0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}
