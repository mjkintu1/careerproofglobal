// World Bank Group salary scales FY27 (published 7 July 2026), by country and grade: minimum,
// midpoint and maximum annual salary in local currency or USD.
// Source PDF (public): https://thedocs.worldbank.org/en/doc/0f839f2120471a88529a3f5176b50bcf-0220012026/original/FY27-WBG-Salary-Scales.pdf
// Input: pdftotext -table -enc UTF-8 output (data-raw/wbg-pay/wbg-table.txt).
// Usage: node scripts/ingest/wbg_scales_build.mjs <wbg-table.txt> <out.json>
import { readFileSync, writeFileSync } from "node:fs";

const [src, out] = process.argv.slice(2);
const ROW = /^(\S.*?)\s{2,}(G[A-K1-9])\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)\s+([A-Z]{3})\s*$/;
const wb = (await (await fetch("https://api.worldbank.org/v2/country?format=json&per_page=400")).json())[1];
const byName = new Map(wb.map((c) => [c.name, c.iso2Code]));
// Names in the PDF that differ from the World Bank API list.
const extra = { "Micronesia": "FM", "Sint Maarten": "SX", "Kosovo": "XK", "West Bank and Gaza": "PS", "Congo, Democratic Republic of": "CD", "Congo, Republic of": "CG", "Egypt, Arab Republic of": "EG", "North Macedonia, Republic of": "MK", "Korea, Republic of": "KR", "Cote d'Ivoire": "CI", "Türkiye": "TR", "São Tomé and Príncipe": "ST" };
const n = (v) => Number(v.replace(/,/g, ""));

const byCountry = {};
const unmatched = new Set();
for (const line of readFileSync(src, "utf8").split(/\r?\n/)) {
  const m = ROW.exec(line);
  if (!m) continue;
  const [, rawName, grade, min, mid, max, currency] = m;
  const [name, location] = rawName.replace(/\s+/g, " ").split(" - ");
  const iso = byName.get(name) ?? extra[name];
  if (!iso) { unmatched.add(name); continue; }
  const key = location ? `${iso}:${location}` : iso;
  (byCountry[key] ??= { country: iso, name, ...(location ? { location } : {}), currency, grades: [] }).grades.push({ grade, min: n(min), mid: n(mid), max: n(max) });
}
writeFileSync(out, JSON.stringify({
  meta: {
    source: "World Bank Group, FY27 World Bank Group Salary Scale (published 7 July 2026)",
    attribution: "Source: World Bank Group, FY27 World Bank Group Salary Scale.",
    url: "https://thedocs.worldbank.org/en/doc/0f839f2120471a88529a3f5176b50bcf-0220012026/original/FY27-WBG-Salary-Scales.pdf",
    unit: "Annual salary range by grade (minimum, midpoint, maximum), local currency or USD as published",
    note: "Salary scales for World Bank Group staff by duty-station country. Grades run from G1/GA (lowest) upward; GI-GK appear only for the United States.",
  },
  byCountry: Object.fromEntries(Object.entries(byCountry).sort()),
}));
console.log(`WBG scales: ${Object.keys(byCountry).length} duty stations; unmatched names: ${[...unmatched].join(", ") || "none"}`);
