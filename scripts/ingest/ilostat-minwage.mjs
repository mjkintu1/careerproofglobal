// National statutory minimum wage, every country, from the ILOSTAT SDMX API
// (dataflow DF_EAR_INEE_NOC_NB, "Monthly minimum wage"), local currency, latest year since 2015.
// ILOSTAT data: CC BY 4.0 as stated on ILO publications.
// Usage: node scripts/ingest/ilostat-minwage.mjs
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const OUT = join(ROOT, "packages", "reference-data", "src", "snapshots", "ilostat-minimum-wage.json");
const FLOW = "DF_EAR_INEE_NOC_NB";
const HEADERS = { "User-Agent": "CareerProofGlobal data import (ILOSTAT SDMX API)", "Accept-Language": "en", Accept: "text/csv" };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Minimal RFC 4180 parser (quoted fields may hold commas). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const ours = new Set(JSON.parse(readFileSync(join(ROOT, "packages", "sample-data", "src", "careers", "countries.json"), "utf8")).map((c) => c.code));
const wb = (await (await fetch("https://api.worldbank.org/v2/country?format=json&per_page=400")).json())[1];
const ISO2 = new Map(wb.filter((c) => ours.has(c.iso2Code)).map((c) => [c.id, c.iso2Code]));
const iso3 = [...ISO2.keys()].sort();

let header = null;
const rows = [];
const refused = [];
async function batch(codes) {
  await pause(1000);
  const url = `https://sdmx.ilo.org/rest/data/ILO,${FLOW}/${codes.join("+")}..?format=csv&startPeriod=2015`;
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) return;
  if (!res.ok) {
    if (codes.length === 1) { refused.push(`${codes[0]} (${res.status})`); return; }
    const mid = Math.ceil(codes.length / 2);
    await batch(codes.slice(0, mid));
    await batch(codes.slice(mid));
    return;
  }
  const [h, ...r] = parseCsv(await res.text());
  header ??= h;
  rows.push(...r);
}
for (let i = 0; i < iso3.length; i += 30) await batch(iso3.slice(i, i + 30));
const col = Object.fromEntries(header.map((h, i) => [h, i]));

const byCountry = {};
for (const r of rows) {
  if (r.length < header.length || r[col.UNIT_MEASURE] !== "LC") continue;
  const iso2 = ISO2.get(r[col.REF_AREA]);
  const value = Number(r[col.OBS_VALUE]);
  const year = Number(r[col.TIME_PERIOD]);
  if (!iso2 || !Number.isFinite(value)) continue;
  const notes = [r[col.NOTE_SOURCE], r[col.NOTE_INDICATOR], r[col.NOTE_CLASSIF]].join(" | ");
  const currency = notes.match(/\b([A-Z]{3}): /)?.[1] ?? null;
  const type = notes.match(/Type of minimum wage: ([^|]+)/)?.[1]?.trim() ?? null;
  const ref = notes.match(/Data reference period: ([^|]+)/)?.[1]?.trim() ?? null;
  const prev = byCountry[iso2];
  if (prev && prev.year >= year) continue;
  byCountry[iso2] = { monthly: value, currency, year, type, referencePeriod: ref, source: r[col.SOURCE] };
}

writeFileSync(OUT, JSON.stringify({
  meta: {
    source: "International Labour Organization, ILOSTAT: Monthly minimum wage (statutory, national), local currency",
    attribution: "Source: ILOSTAT, International Labour Organization.",
    url: "https://ilostat.ilo.org/topics/wages/",
    api: `https://sdmx.ilo.org/rest/data/ILO,${FLOW}/{ISO3 list}..?format=csv&startPeriod=2015`,
    licence: "CC BY 4.0 as stated on ILO publications",
    note: "Latest year per country. Where a country sets several minimums (by sector or occupation), ILOSTAT reports one reference rate; see 'type'.",
    refused,
    fetchedAt: new Date().toISOString(),
  },
  byCountry: Object.fromEntries(Object.entries(byCountry).sort()),
}) + "\n");
console.log(`ILOSTAT minimum wage: ${Object.keys(byCountry).length} countries${refused.length ? `; refused: ${refused.join(", ")}` : ""}`);
