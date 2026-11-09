// Imports World Bank JOIN employment shares by ISCO-08 major group for every country.
//   node scripts/ingest/world-bank-join.mjs            -> snapshot JSON only
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest/world-bank-join.mjs
//                                                      -> snapshot + database (labour_indicators), with an ingestion run
// Source: World Bank, Global Jobs Indicators Database (JOIN), API source=86. Attribution required.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const API = "https://api.worldbank.org/v2";
const SOURCE_SLUG = "world-bank-join";
const ATTRIBUTION = "Source: World Bank, Global Jobs Indicators Database (JOIN).";
/** JOIN occupation-group series -> ISCO-08 major group. */
const SERIES = {
  "JI.EMP.SEOF.ZS": "1", "JI.EMP.PROF.ZS": "2", "JI.EMP.TECH.ZS": "3", "JI.EMP.CLRK.ZS": "4", "JI.EMP.SVMK.ZS": "5",
  "JI.EMP.SKAG.ZS": "6", "JI.EMP.CRFT.ZS": "7", "JI.EMP.MACH.ZS": "8", "JI.EMP.ELEM.ZS": "9", "JI.EMP.ARFC.ZS": "0",
};
const UNIT = "% of employed population aged 15-64";

const countries = new Set(JSON.parse(readFileSync(join(ROOT, "packages/sample-data/src/careers/countries.json"), "utf8")).map((c) => c.code));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "CareerProof-ingest/1.0" } });
    if (res.ok) return res.json();
    await sleep(1000 * attempt);
  }
  throw new Error(`Failed after retries: ${url}`);
}

/** World Bank ids are ISO3 (UGA); map them to ISO2 (UG). Aggregates have no iso2Code match. */
async function iso3ToIso2() {
  const [, list] = await getJson(`${API}/country?format=json&per_page=400`);
  return new Map(list.map((c) => [c.id, c.iso2Code]));
}
const ISO2 = await iso3ToIso2();

/**
 * Full history for all countries in one request (the bulk "mrnev" option returns an error),
 * then keep each country's most recent non-empty year. JOIN stores shares as fractions (0.04 = 4%).
 */
async function fetchSeries(code) {
  const latest = new Map();
  let page = 1, pages = 1, name = code;
  do {
    const [meta, data] = await getJson(`${API}/country/all/indicator/${code}?source=86&format=json&date=1990:2030&per_page=20000&page=${page}`);
    pages = meta.pages;
    for (const d of data ?? []) {
      name = d.indicator?.value ?? name;
      const iso2 = ISO2.get(d.country?.id);
      if (d.value === null || !countries.has(iso2)) continue; // skip aggregates and missing values
      const prev = latest.get(iso2);
      if (!prev || Number(d.date) > Number(prev.period)) {
        latest.set(iso2, { iso2, period: String(d.date), value: Math.round(d.value * 10000) / 100 });
      }
    }
    page++;
    await sleep(300); // be polite
  } while (page <= pages);
  return { name, rows: [...latest.values()] };
}

async function db(path, init = {}) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${path}: ${res.status} ${body}`);
  return body ? JSON.parse(body) : null; // 201/204 with return=minimal have no body
}

const useDb = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let sourceId, runId, regionIds;
if (useDb) {
  [{ id: sourceId }] = await db(`data_sources?slug=eq.${SOURCE_SLUG}&select=id`);
  [{ id: runId }] = await db("ingestion_runs", { method: "POST", body: JSON.stringify({ source_id: sourceId, params: { series: Object.keys(SERIES), rule: "latest non-empty year per country" } }) });
  regionIds = new Map((await db("regions?select=id,iso_code")).map((r) => [r.iso_code, r.id]));
}

const snapshot = { attribution: ATTRIBUTION, source: "https://databank.worldbank.org/source/global-jobs-indicators-database-(join)", unit: UNIT, fetchedAt: new Date().toISOString(), byCountry: {} };
let read = 0, written = 0;
try {
  for (const [code, isco] of Object.entries(SERIES)) {
    const { name, rows } = await fetchSeries(code);
    read += rows.length;
    for (const r of rows) {
      (snapshot.byCountry[r.iso2] ??= {})[isco] = { value: r.value, period: r.period };
    }
    if (useDb) {
      const payload = rows.filter((r) => regionIds.has(r.iso2)).map((r) => ({
        source_id: sourceId, ingestion_run_id: runId, indicator_code: code, indicator_name: name,
        region_id: regionIds.get(r.iso2), isco_code: isco, period: r.period, value: r.value, unit: UNIT,
      }));
      if (payload.length) {
        await db("labour_indicators?on_conflict=source_id,indicator_code,region_id,isco_code,sex,age_group,education_level,urbanisation,period",
          { method: "POST", body: JSON.stringify(payload), headers: { Prefer: "resolution=merge-duplicates,return=minimal" } });
        written += payload.length;
      }
    }
    console.log(`${code} (ISCO ${isco}): ${rows.length} countries`);
  }
  writeFileSync(join(ROOT, "packages/reference-data/src/snapshots/world-bank-join-occupation-shares.json"), JSON.stringify(snapshot) + "\n");
  if (useDb) {
    await db(`ingestion_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "succeeded", finished_at: new Date().toISOString(), rows_read: read, rows_written: written }) });
    await db(`data_sources?id=eq.${sourceId}`, { method: "PATCH", body: JSON.stringify({ status: "active", last_checked_at: new Date().toISOString() }) });
  }
  console.log(`Done: ${read} values read, ${written} written to the database, ${Object.keys(snapshot.byCountry).length} countries in the snapshot.`);
} catch (err) {
  if (useDb && runId) await db(`ingestion_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", finished_at: new Date().toISOString(), rows_read: read, rows_written: written, error: String(err) }) });
  throw err;
}
