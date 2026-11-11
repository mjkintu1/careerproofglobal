// Average monthly earnings of employees by occupation (ISCO-08 major group), every country,
// from the ILOSTAT SDMX API (dataflow DF_EAR_EMTA_SEX_OCU_NB). Public and keyless; ILOSTAT data
// is licensed CC BY 4.0. Values are in local currency, nominal, as published.
// Usage: node scripts/ingest/ilostat-earnings.mjs
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const OUT = join(ROOT, "packages", "reference-data", "src", "snapshots", "ilostat-earnings.json");
const FLOW = "DF_EAR_EMTA_SEX_OCU_NB";
const GROUPS = ["TOTAL", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const OCU = GROUPS.map((g) => `OCU_ISCO08_${g}`).join("+");
const URL = `https://sdmx.ilo.org/rest/data/ILO,${FLOW}/.A.EAR_EMTA_NB.SEX_T+SEX_F+SEX_M.${OCU}?format=csv&startPeriod=2010`;

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

// ISO3 -> ISO2 via the World Bank country list, restricted to our ISO country list.
const ours = new Set(JSON.parse(readFileSync(join(ROOT, "packages", "sample-data", "src", "careers", "countries.json"), "utf8")).map((c) => c.code));
const wb = (await (await fetch("https://api.worldbank.org/v2/country?format=json&per_page=400")).json())[1];
const ISO2 = new Map(wb.filter((c) => ours.has(c.iso2Code)).map((c) => [c.id, c.iso2Code]));

// The API rejects a key with an empty first slot, so ask for countries in named batches.
const iso3 = [...ISO2.keys()].sort();
const HEADERS = { "User-Agent": "CareerProofGlobal data import (ILOSTAT SDMX API)", "Accept-Language": "en", Accept: "text/csv" };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let header = null;
const rows = [];
const skipped = [];
/** Fetch a batch; if the server refuses it, split it so one refused code does not lose the rest. */
async function fetchBatch(codes) {
  await pause(1000);
  const url = URL.replace("/.A.", `/${codes.join("+")}.A.`);
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) return; // no data for these countries
  if (!res.ok) {
    if (codes.length === 1) { skipped.push(`${codes[0]} (${res.status})`); return; }
    const mid = Math.ceil(codes.length / 2);
    await fetchBatch(codes.slice(0, mid));
    await fetchBatch(codes.slice(mid));
    return;
  }
  const [h, ...r] = parseCsv(await res.text());
  header ??= h;
  rows.push(...r);
}
for (let i = 0; i < iso3.length; i += 30) {
  await fetchBatch(iso3.slice(i, i + 30));
  console.log(`batch ${i / 30 + 1}: ${rows.length} rows so far`);
}
if (skipped.length) console.log(`Refused by the API: ${skipped.join(", ")}`);
const col = Object.fromEntries(header.map((h, i) => [h, i]));

// Survey preference when one year has several sources: establishment surveys measure
// earnings directly; labour force and household surveys come next.
const rank = (src) => (/^ES\b/.test(src) ? 0 : /^LFS\b/.test(src) ? 1 : /^HIES\b/.test(src) ? 2 : 3);

const series = new Map(); // "UG|2" -> { year, source, currency, T, F, M }
for (const r of rows) {
  if (r.length < header.length) continue;
  const iso2 = ISO2.get(r[col.REF_AREA]);
  const value = Number(r[col.OBS_VALUE]);
  if (!iso2 || !Number.isFinite(value) || r[col.UNIT_MEASURE] !== "LC") continue;
  const group = r[col.OCU].replace("OCU_ISCO08_", "");
  const year = Number(r[col.TIME_PERIOD]);
  const source = r[col.SOURCE];
  const notes = [r[col.NOTE_SOURCE], r[col.NOTE_INDICATOR], r[col.NOTE_CLASSIF]].join(" | ");
  const currency = notes.match(/\b([A-Z]{3}): /)?.[1] ?? null;
  const key = `${iso2}|${group}|${year}|${source}`;
  const e = series.get(key) ?? { iso2, group, year, source, currency, notes: new Set() };
  e[r[col.SEX].replace("SEX_", "")] = Math.round(value * 100) / 100;
  for (const n of notes.split(" | ")) if (n && !/^[A-Z]{3}: /.test(n) && !/^Repository/.test(n)) e.notes.add(n);
  series.set(key, e);
}

const byCountry = {};
for (const e of series.values()) {
  if (e.T === undefined) continue;
  const c = (byCountry[e.iso2] ??= { currency: e.currency, groups: {} });
  const cur = c.groups[e.group];
  if (!cur || e.year > cur.year || (e.year === cur.year && rank(e.source) < rank(cur.source))) {
    c.groups[e.group] = { value: e.T, women: e.F ?? null, men: e.M ?? null, year: e.year, source: e.source, ...(e.notes.size ? { notes: [...e.notes] } : {}) };
    c.currency ??= e.currency;
  }
}

const snapshot = {
  meta: {
    source: "International Labour Organization, ILOSTAT: Average monthly earnings of employees by sex and occupation (ISCO-08 major groups)",
    attribution: "Source: ILOSTAT, International Labour Organization.",
    url: "https://ilostat.ilo.org/data/",
    api: URL.replace("/.A.", "/{ISO3 list}.A."),
    licence: "CC BY 4.0 as stated on ILO publications; the ILOSTAT terms page refused automated access, so confirm before commercial reuse",
    refused: skipped,
    unit: "Local currency, nominal, per month",
    fetchedAt: new Date().toISOString(),
  },
  byCountry: Object.fromEntries(Object.entries(byCountry).sort()),
};
writeFileSync(OUT, JSON.stringify(snapshot) + "\n");
console.log(`ILOSTAT earnings: ${Object.keys(byCountry).length} countries, ${Object.values(byCountry).reduce((s, c) => s + Object.keys(c.groups).length, 0)} country-group figures -> ${OUT}`);
