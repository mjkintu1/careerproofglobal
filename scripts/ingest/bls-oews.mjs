// US wages and employment by occupation from the BLS Public Data API (OEWS national estimates).
// BLS data is US government work (public domain). API v1 without a key: 25 requests/day, 25 series each.
// Set BLS_API_KEY (free registration) for v2: 500 requests/day, 50 series each.
// Usage: node scripts/ingest/bls-oews.mjs            (SOC codes linked to curated careers)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const SNAP = join(ROOT, "packages", "reference-data", "src", "snapshots");
const OUT = join(SNAP, "bls-oews-us.json");
/** Reads BLS_API_KEY from the environment or from .env.local (git-ignored). Never printed. */
function loadKey() {
  if (process.env.BLS_API_KEY) return process.env.BLS_API_KEY.trim();
  const file = join(ROOT, ".env.local");
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8").split(String.fromCharCode(10)).map((l) => l.trim()).find((l) => l.startsWith("BLS_API_KEY="));
  return line ? line.slice("BLS_API_KEY=".length).trim().replace(/^["']|["']$/g, "") : undefined;
}
const KEY = loadKey();
const ALL = process.argv.includes("--all");
const API = KEY ? "https://api.bls.gov/publicAPI/v2/timeseries/data/" : "https://api.bls.gov/publicAPI/v1/timeseries/data/";
const PER = KEY ? 50 : 25;
/** OEWS data types: employment, annual mean, and annual wage percentiles (10th, 25th, median, 75th, 90th). */
const DATATYPES = { "01": "employment", "04": "meanAnnual", "11": "p10Annual", "12": "p25Annual", "13": "medianAnnual", "14": "p75Annual", "15": "p90Annual" };

// Curated careers -> ISCO unit group -> O*NET-SOC (official crosswalk), first match per career.
const xwalk = JSON.parse(readFileSync(join(SNAP, "esco-onet-crosswalk.json"), "utf8")).map;
const careersDir = join(ROOT, "packages", "sample-data", "src", "careers");
const { readdirSync } = await import("node:fs");
const careers = readdirSync(careersDir).filter((f) => f.startsWith("occ-")).flatMap((f) => JSON.parse(readFileSync(join(careersDir, f), "utf8")));
const socs = new Set();
for (const c of careers) if (c.isco && xwalk[c.isco]?.[0]) socs.add(xwalk[c.isco][0].slice(0, 7).replace("-", ""));
if (ALL) {
  // Every O*NET-SOC occupation (6-digit SOC; OEWS publishes at that level).
  const onet = JSON.parse(readFileSync(join(SNAP, "onet-occupations.json"), "utf8")).occupations;
  for (const code of Object.keys(onet)) socs.add(code.slice(0, 7).replace("-", ""));
}
console.log(`Mode: ${ALL ? "all O*NET occupations" : "curated careers"}; API ${KEY ? "v2 (key loaded)" : "v1 (no key)"}`);

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { bySoc: {} };
// Fetch only the fields not yet stored (a field BLS suppresses is retried on the next run).
const series = [...socs].flatMap((s) => Object.entries(DATATYPES).filter(([, f]) => existing.bySoc[s]?.[f] === undefined).map(([d]) => `OEUN0000000000000${s}${d}`));
console.log(`${socs.size} SOC codes; ${series.length} series to fetch in ${Math.ceil(series.length / PER)} requests`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const bySoc = existing.bySoc;
for (let i = 0; i < series.length; i += PER) {
  const body = { seriesid: series.slice(i, i + PER), latest: true, ...(KEY ? { registrationkey: KEY } : {}) };
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (json.status !== "REQUEST_SUCCEEDED") { console.error("BLS:", json.status, json.message); break; }
  if (i % (PER * 10) === 0) console.log(`  ${i}/${series.length}`);
  for (const s of json.Results.series) {
    const soc = s.seriesID.slice(17, 23);
    const field = DATATYPES[s.seriesID.slice(23)];
    const d = s.data?.[0];
    if (!d || !field) continue;
    const value = Number(String(d.value).replace(/,/g, ""));
    if (!Number.isFinite(value)) continue; // "-" or "*" = suppressed
    const row = (bySoc[soc] ??= { year: d.year });
    if (row.year !== d.year && field !== "employment") row.year = d.year;
    row[field] = value;
  }
  await sleep(1000);
}
writeFileSync(OUT, JSON.stringify({
  meta: {
    source: "U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), national estimates, via the BLS Public Data API",
    attribution: "Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics.",
    url: "https://www.bls.gov/oes/", licence: "Public domain (U.S. government work)", fetchedAt: new Date().toISOString(),
  },
  bySoc,
}));
console.log(`Saved ${Object.keys(bySoc).length} occupations with US wage data`);
