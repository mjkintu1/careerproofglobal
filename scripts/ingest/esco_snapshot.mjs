// Builds compact, cited ESCO/ISCO snapshots for the website from data-raw/esco/*.jsonl.
// Usage: node scripts/ingest/esco_snapshot.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const RAW = join(ROOT, "data-raw", "esco");
const OUT = join(ROOT, "packages", "reference-data", "src", "snapshots");
const readJsonl = (f) => readFileSync(join(RAW, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const trim = (s, n) => (s && s.length > n ? s.slice(0, s.lastIndexOf(" ", n)) + "..." : s || "");

const meta = {
  source: "ESCO v1.2 (European Skills, Competences, Qualifications and Occupations), via the ESCO Web Services API",
  attribution: "Contains ESCO data. (c) European Union. Reuse authorised provided the source is acknowledged (Commission Decision 2011/833/EU). ISCO-08 is the International Standard Classification of Occupations of the International Labour Organization.",
  url: "https://esco.ec.europa.eu/",
  fetchedAt: new Date().toISOString(),
};

const groups = readJsonl("isco.jsonl");
const codeByUri = new Map(groups.map((g) => [g.uri, String(g.code)]));
const isco = groups
  .map((g) => ({ code: String(g.code), level: String(g.code).length, title: g.title, description: g.description, parent: g.parent ? codeByUri.get(g.parent) ?? null : null }))
  .sort((a, b) => a.code.localeCompare(b.code));

const raw = readJsonl("occupations.jsonl");
const occCodeByUri = new Map(raw.map((o) => [o.uri, o.code]));
const occByUri = new Map(raw.map((o) => [o.uri, o]));
// Narrower ESCO occupations link to a broader occupation instead of an ISCO group: inherit it.
function iscoGroupOf(o, seen = new Set()) {
  if (o.iscoGroup) return o.iscoGroup;
  if (!o.broaderOccupation || seen.has(o.uri)) return null;
  seen.add(o.uri);
  const parent = occByUri.get(o.broaderOccupation);
  return parent ? iscoGroupOf(parent, seen) : null;
}
for (const o of raw) o.iscoGroup = iscoGroupOf(o);
const occupations = raw
  .filter((o) => o.code && o.iscoGroup && codeByUri.has(o.iscoGroup))
  .map((o) => ({
    code: o.code,
    uri: o.uri,
    title: o.title,
    description: trim(o.description, 900),
    altLabels: o.altLabels.slice(0, 6),
    isco: codeByUri.get(o.iscoGroup),
    broader: o.broaderOccupation ? occCodeByUri.get(o.broaderOccupation) ?? null : null,
    regulated: o.regulated,
    skills: o.essentialSkills.slice(0, 12),
  }))
  .sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));

writeFileSync(join(OUT, "isco-08.json"), JSON.stringify({ meta, groups: isco }));
writeFileSync(join(OUT, "esco-occupations.json"), JSON.stringify({ meta, occupations }));
const byLevel = [1, 2, 3, 4].map((l) => isco.filter((g) => g.level === l).length);
console.log(`ISCO-08 groups by level: ${byLevel.join(" / ")} (total ${isco.length})`);
console.log(`ESCO occupations: ${occupations.length} (raw ${raw.length}; narrower ${occupations.filter((o) => o.broader).length}); regulated: ${occupations.filter((o) => o.regulated).length}`);
