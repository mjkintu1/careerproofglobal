// Education-system structure for every country from the UNESCO Institute for Statistics (UIS) Data API.
// The API is public and keyless; data licensed CC BY-SA 4.0 (attribution, share-alike).
// We use the API, not the uis.unesco.org website, whose robots.txt disallows ClaudeBot.
// Usage: node scripts/ingest/uis-structure.mjs
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.uis.unesco.org/api/public";
const OUT = join(import.meta.dirname, "..", "..", "packages", "reference-data", "src", "snapshots", "uis-education-structure.json");
const START = 2015;
const END = 2025;

/** Our field name -> UIS indicator code (definitions from /definitions/indicators). */
const INDICATORS = {
  primaryEntryAge: "299905",
  primaryYears: "299932",
  lowerSecondaryEntryAge: "999975",
  lowerSecondaryYears: "999976",
  upperSecondaryEntryAge: "999977",
  upperSecondaryYears: "999978",
  compulsoryYears: "400",
  tertiaryGer: "GER.5T8",
};

const get = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": "CareerProofGlobal data import (UIS public API)" } });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
};

async function iso3ToIso2() {
  const [, list] = await get("https://api.worldbank.org/v2/country?format=json&per_page=400");
  // Territories missing from the World Bank list (ISO 3166-1).
  const extra = { AIA: "AI", COK: "CK", ESH: "EH", FLK: "FK", GLP: "GP", GUF: "GF", MSR: "MS", MTQ: "MQ", NFK: "NF", NIU: "NU", REU: "RE", SHN: "SH", SPM: "PM", TKL: "TK" };
  return new Map([...list.map((c) => [c.id, c.iso2Code]), ...Object.entries(extra)]);
}

const version = (await get(`${API}/versions`))[0];
const ISO2 = await iso3ToIso2();
const byCountry = {};
const unmapped = new Set();

for (const [field, code] of Object.entries(INDICATORS)) {
  const { records } = await get(`${API}/data/indicators?indicator=${encodeURIComponent(code)}&geoUnitType=NATIONAL&start=${START}&end=${END}`);
  for (const r of records) {
    if (r.value === null || r.value === undefined) continue;
    const iso2 = ISO2.get(r.geoUnit);
    if (!iso2) { unmapped.add(r.geoUnit); continue; }
    const row = (byCountry[iso2] ??= {});
    if (!row[field] || r.year > row[field].year) row[field] = { value: Math.round(r.value * 10) / 10, year: r.year };
  }
  console.log(field, code, records.length, "records");
}

const snapshot = {
  meta: {
    source: "UNESCO Institute for Statistics (UIS), UIS Data API",
    url: `${API}`,
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    attribution: `Source: UNESCO Institute for Statistics (UIS), ${API}, extracted ${new Date().toISOString().slice(0, 10)}. Licensed CC BY-SA 4.0.`,
    dataVersion: version?.version,
    dataRelease: version?.themeDataStatus?.find((t) => t.theme === "EDUCATION")?.description,
    extractedAt: new Date().toISOString().slice(0, 10),
    years: `${START}-${END} (latest available per country and indicator)`,
    indicators: INDICATORS,
    unmappedGeoUnits: [...unmapped].sort(),
  },
  byCountry,
};
writeFileSync(OUT, JSON.stringify(snapshot));
console.log("countries:", Object.keys(byCountry).length, "| unmapped UIS units:", [...unmapped].sort().join(" "));
