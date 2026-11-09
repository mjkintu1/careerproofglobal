// Fetches the ISCO-08 hierarchy and ESCO occupations from the ESCO Web Services API (v1.2.x).
// Polite: one request at a time, a pause between requests, retries with back-off.
// Resumable: progress is appended to data-raw/esco/*.jsonl and skipped on rerun.
// Licence: ESCO (c) European Union; reuse authorised provided the source is acknowledged (Decision 2011/833/EU).
// Usage: node scripts/ingest/esco.mjs
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const OUT = join(ROOT, "data-raw", "esco");
const API = "https://ec.europa.eu/esco/api";
const PAUSE_MS = 200;
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const readJsonl = (f) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const en = (v) => v?.en?.literal ?? v?.["en-us"]?.literal ?? "";

const failFile = join(OUT, "failures.jsonl");
async function get(path) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    await sleep(PAUSE_MS);
    try {
      const res = await fetch(`${API}${path}`, { headers: { "User-Agent": "CareerProof-ingest/1.0", Accept: "application/json" } });
      if (res.ok) return res.json();
      if (res.status === 404) return null;
      const body = await res.text();
      // ESCO returns 500 + an application exception for a few malformed records: permanent, so log and skip.
      if (res.status === 500 && body.includes("Exception")) {
        appendFileSync(failFile, JSON.stringify({ path, status: res.status, body: body.slice(0, 300), at: new Date().toISOString() }) + String.fromCharCode(10));
        return null;
      }
      await sleep(2000 * attempt);
    } catch {
      await sleep(2000 * attempt);
    }
  }
  throw new Error(`Failed after retries: ${path}`);
}

// ---------- Phase A: ISCO-08 hierarchy ----------
const iscoFile = join(OUT, "isco.jsonl");
const iscoDone = new Map(readJsonl(iscoFile).map((g) => [g.uri, g]));
const occSeeds = [];
const queue = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((c) => `http://data.europa.eu/esco/isco/C${c}`);
while (queue.length) {
  const uri = queue.shift();
  let g = iscoDone.get(uri);
  if (!g) {
    const c = await get(`/resource/concept?uri=${encodeURIComponent(uri)}&language=en`);
    if (!c) continue;
    g = {
      uri,
      code: c.code,
      level: String(c.code).length,
      title: c.title,
      description: en(c.description),
      parent: c._links?.broaderConcept?.[0]?.uri ?? null,
      children: (c._links?.narrowerConcept ?? []).map((x) => x.uri),
      occupations: (c._links?.narrowerOccupation ?? []).map((x) => x.uri),
    };
    appendFileSync(iscoFile, JSON.stringify(g) + "\n");
    iscoDone.set(uri, g);
    if (iscoDone.size % 50 === 0) console.log(`ISCO groups: ${iscoDone.size}`);
  }
  queue.push(...g.children);
  occSeeds.push(...g.occupations);
}
console.log(`ISCO-08 done: ${iscoDone.size} groups`);

// ---------- Phase B: ESCO occupations (including nested ones) ----------
const occFile = join(OUT, "occupations.jsonl");
const occDone = new Map(readJsonl(occFile).map((o) => [o.uri, o]));
const occQueue = [...new Set(occSeeds)];
const seen = new Set(occQueue);
while (occQueue.length) {
  const uri = occQueue.shift();
  let o = occDone.get(uri);
  if (!o) {
    const r = await get(`/resource/occupation?uri=${encodeURIComponent(uri)}&language=en`);
    if (!r) continue;
    o = {
      uri,
      code: r.code,
      title: r.title,
      description: en(r.description),
      altLabels: (r.alternativeLabel?.en ?? []).slice(0, 10),
      iscoGroup: r._links?.broaderIscoGroup?.[0]?.uri ?? null,
      broaderOccupation: r._links?.broaderOccupation?.[0]?.uri ?? null,
      regulated: (r._links?.regulatedProfessionNote?.uri ?? "").endsWith("/regulated"),
      essentialSkills: (r._links?.hasEssentialSkill ?? []).map((s) => s.title).slice(0, 25),
      optionalSkillCount: (r._links?.hasOptionalSkill ?? []).length,
      narrower: (r._links?.narrowerOccupation ?? []).map((x) => x.uri),
    };
    appendFileSync(occFile, JSON.stringify(o) + "\n");
    occDone.set(uri, o);
    if (occDone.size % 100 === 0) console.log(`ESCO occupations: ${occDone.size}`);
  }
  for (const n of o.narrower) if (!seen.has(n)) { seen.add(n); occQueue.push(n); }
}
console.log(`ESCO done: ${occDone.size} occupations`);
