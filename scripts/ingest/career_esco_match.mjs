// Match guided careers (sample-data) to ESCO occupations by exact title or alternative label.
// Writes packages/reference-data/src/career-esco.json; manual entries in that file are kept.
// Usage: node scripts/ingest/career_esco_match.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const dir = join(ROOT, "packages", "sample-data", "src", "careers");
const careers = readdirSync(dir).filter((f) => f.startsWith("occ-")).flatMap((f) => {
  const j = JSON.parse(readFileSync(join(dir, f), "utf8"));
  return Array.isArray(j) ? j : j.occupations;
});
const esco = JSON.parse(readFileSync(join(ROOT, "packages", "reference-data", "src", "snapshots", "esco-occupations.json"), "utf8")).occupations;
const OUT = join(ROOT, "packages", "reference-data", "src", "career-esco.json");
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")).links : {};

const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const links = {};
const unmatched = [];
for (const c of careers) {
  if (prev[c.slug]?.match === "manual") { links[c.slug] = prev[c.slug]; continue; }
  const t = norm(c.title);
  const pref = esco.filter((e) => norm(e.title) === t);
  const alt = esco.filter((e) => e.altLabels.some((a) => norm(a) === t));
  const pick = (list) => list.find((e) => c.isco && e.isco === c.isco) ?? list[0];
  const hit = pref.length ? { e: pick(pref), match: "title" } : alt.length ? { e: pick(alt), match: "alt-label" } : null;
  if (hit) links[c.slug] = { esco: hit.e.code, escoTitle: hit.e.title, isco: hit.e.isco, match: hit.match, iscoAgrees: c.isco ? c.isco === hit.e.isco : null };
  else unmatched.push(`${c.slug} (${c.title}, isco ${c.isco})`);
}
writeFileSync(OUT, JSON.stringify({
  meta: { method: "Exact match of the career title to an ESCO preferred or alternative label (lower-case, letters only), preferring the career's ISCO group. 'manual' entries were chosen by a person and are never overwritten." },
  links,
}, null, 1));
const n = Object.keys(links).length;
console.log(`matched ${n}/${careers.length}; ISCO disagrees: ${Object.entries(links).filter(([, l]) => l.iscoAgrees === false).map(([s, l]) => `${s}->${l.isco} (${l.escoTitle})`).join("; ") || "none"}`);
console.log("unmatched:", unmatched.join("; "));
