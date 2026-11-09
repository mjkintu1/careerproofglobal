import type { CareerGraphData, CareerPath, Location, Occupation, PathStep, Transition } from "./types";

export interface RelatedCareer {
  occupation: Occupation;
  /** Jaccard overlap of skills, 0 to 1. */
  overlap: number;
  sharedSkills: string[];
}

export interface Localised {
  location: Location | null;
  regulator: string | null;
}

/** Indexed, read-only view over the career graph data. */
export class CareerGraph {
  readonly data: CareerGraphData;
  private bySlug = new Map<string, Occupation>();
  private out = new Map<string, Transition[]>();
  private inc = new Map<string, Transition[]>();

  constructor(data: CareerGraphData) {
    this.data = data;
    for (const o of data.occupations) {
      if (this.bySlug.has(o.slug)) throw new Error(`Duplicate occupation slug: ${o.slug}`);
      this.bySlug.set(o.slug, o);
    }
    for (const t of data.transitions) {
      if (!this.bySlug.has(t.from) || !this.bySlug.has(t.to)) {
        throw new Error(`Transition references unknown occupation: ${t.from} -> ${t.to}`);
      }
      this.out.set(t.from, [...(this.out.get(t.from) ?? []), t]);
      this.inc.set(t.to, [...(this.inc.get(t.to) ?? []), t]);
    }
  }

  get(slug: string): Occupation | undefined {
    return this.bySlug.get(slug);
  }

  occupations(): Occupation[] {
    return [...this.data.occupations].sort((a, b) => a.title.localeCompare(b.title));
  }

  inCluster(cluster: string): Occupation[] {
    return this.occupations().filter((o) => o.cluster === cluster);
  }

  /** Where this career can lead. */
  nextMoves(slug: string): { transition: Transition; occupation: Occupation }[] {
    return (this.out.get(slug) ?? []).map((t) => ({ transition: t, occupation: this.bySlug.get(t.to)! }));
  }

  /** Careers people move into this one from. */
  previousMoves(slug: string): { transition: Transition; occupation: Occupation }[] {
    return (this.inc.get(slug) ?? []).map((t) => ({ transition: t, occupation: this.bySlug.get(t.from)! }));
  }

  /**
   * Related careers by shared skills (Jaccard overlap), excluding the career itself.
   * Unlike "same cluster", this finds neighbours across fields.
   */
  related(slug: string, limit = 6, minOverlap = 0.2): RelatedCareer[] {
    const me = this.bySlug.get(slug);
    if (!me) return [];
    const mine = new Set(me.skills);
    return this.data.occupations
      .filter((o) => o.slug !== slug)
      .map((o) => {
        const shared = o.skills.filter((s) => mine.has(s));
        const union = new Set([...o.skills, ...me.skills]).size;
        return { occupation: o, overlap: union === 0 ? 0 : shared.length / union, sharedSkills: shared };
      })
      .filter((r) => r.overlap >= minOverlap)
      .sort((a, b) => b.overlap - a.overlap || a.occupation.title.localeCompare(b.occupation.title))
      .slice(0, limit);
  }

  /**
   * Quickest known route from one career to another (fewest typical years,
   * then fewest moves), following transitions in their direction.
   */
  findPath(fromSlug: string, toSlug: string, maxSteps = 4): CareerPath | null {
    if (!this.bySlug.has(fromSlug) || !this.bySlug.has(toSlug)) return null;
    if (fromSlug === toSlug) return { steps: [], totalYears: 0 };

    // Dijkstra on years; small graph, so a sorted array queue is fine.
    type Entry = { slug: string; years: number; path: Transition[] };
    const best = new Map<string, { years: number; steps: number }>([[fromSlug, { years: 0, steps: 0 }]]);
    const queue: Entry[] = [{ slug: fromSlug, years: 0, path: [] }];

    while (queue.length > 0) {
      queue.sort((a, b) => a.years - b.years || a.path.length - b.path.length);
      const current = queue.shift()!;
      if (current.slug === toSlug) return this.toPath(current.path);
      if (current.path.length >= maxSteps) continue;
      for (const t of this.out.get(current.slug) ?? []) {
        const years = current.years + t.years;
        const steps = current.path.length + 1;
        const seen = best.get(t.to);
        // Skip only if an earlier route is at least as quick AND as short;
        // otherwise a longer-but-quicker route could hide a valid shorter one.
        if (seen && seen.years <= years && seen.steps <= steps) continue;
        best.set(t.to, { years, steps });
        queue.push({ slug: t.to, years, path: [...current.path, t] });
      }
    }
    return null;
  }

  private toPath(transitions: Transition[]): CareerPath {
    const steps: PathStep[] = transitions.map((t) => ({
      from: this.bySlug.get(t.from)!,
      to: this.bySlug.get(t.to)!,
      transition: t,
    }));
    const totalYears = Math.round(transitions.reduce((s, t) => s + t.years, 0) * 10) / 10;
    return { steps, totalYears };
  }

  /** Country overlay. Location code "global" (or unknown) returns no local detail. */
  localise(slug: string, locationCode: string): Localised {
    const location = this.data.locations.find((l) => l.code === locationCode.toUpperCase()) ?? null;
    const regulator = location ? (this.data.regulators[slug]?.[location.code] ?? null) : null;
    return { location, regulator };
  }

  skillName(slug: string): string {
    return this.data.skills[slug] ?? slug;
  }
}
