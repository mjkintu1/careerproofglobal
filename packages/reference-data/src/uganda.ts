/**
 * Uganda public-university admission: the official weighting system and real
 * Makerere University programmes and cut-off points, from published PDFs.
 * Sources are recorded on every programme. No sample or made-up values.
 */
import type { Cutoff, Programme, RuleSet } from "@careerproof/rules-engine";
import cutoffSnap from "./snapshots/ug-cutoffs.json";
import reqs from "./ug-programme-requirements.json";
import rules from "./ug-rules-2026.json";

const NOTES = reqs.meta;

/** Official weighting system: Notes to Schools 2026/2027, sections 3 to 5 ("all subjects done are weighed" at O-level). */
export const ugandaRuleSet = rules as RuleSet;

type Row = (typeof cutoffSnap.threeYear)[number] & { code?: string | null };

/** "2025/2026" -> 2025 (the intake year). */
const intake = (y: string) => Number(y.slice(0, 4));

function cutoffsFor(code: string): Cutoff[] {
  const row = (cutoffSnap.threeYear as Row[]).find((r) => r.university === "Makerere University" && r.code === code);
  if (!row) return [];
  return row.cutoffs.flatMap((c) => {
    const year = intake(c.year);
    const out: Cutoff[] = [];
    if ("all" in c && c.all != null) out.push({ year, points: c.all, sex: "any" });
    if ("female" in c && c.female != null) out.push({ year, points: c.female, sex: "F" });
    if ("male" in c && c.male != null) out.push({ year, points: c.male, sex: "M" });
    return out;
  });
}

export const ugandaProgrammes: Programme[] = reqs.programmes.map((p) => ({
  id: `ug-mak-${p.code.toLowerCase()}`,
  code: p.code,
  title: p.title,
  institution: "Makerere University",
  institutionType: "public",
  field: p.field,
  requirements: {
    essential: p.essential,
    relevant: p.relevant,
    desirable: p.desirable,
    ...("essentialFixed" in p ? { essentialFixed: p.essentialFixed } : {}),
    ...("picks" in p ? { picks: p.picks } : {}),
  },
  cutoffs: cutoffsFor(p.code),
  notes: "notes" in p ? p.notes : undefined,
  source: { name: NOTES.source, url: NOTES.url },
}));

export const ugandaAdmissionSources = cutoffSnap.meta.sources;
export const ugandaCutoffNotes = cutoffSnap.meta.notes;
export const ugandaCutoffs = cutoffSnap.threeYear as Row[];
export const makerere2025 = cutoffSnap.makerere2025;

