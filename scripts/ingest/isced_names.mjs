// Map UIS ISCED mapping file names to ISO 3166-1 alpha-2 codes.
// Usage: node scripts/ingest/isced_names.mjs data-raw/isced/files.txt data-raw/isced/names.json
import { readFileSync, writeFileSync } from "node:fs";

const [, , listPath, outPath] = process.argv;
const keys = readFileSync(listPath, "utf8").split(/\r?\n/).filter(Boolean)
  .map((f) => decodeURIComponent(f).replace(/^ISCED_2011_[Mm]apping_|\.xlsx$/g, ""));

// File names that are abbreviations, French, or differ from English short names.
const ALIASES = {
  Kor: "KR", Cri: "CR", Cuw: "CW", Ecu: "EC", Gib: "GI", Som: "SO", Algerie: "DZ", Mauritanie: "MR",
  Saudiarabia: "SA", "Template Fr Tunisie": "TN", "Template Fr Guinee": "GN", "Template Fr Cote Divoire": "CI",
  "Template Fr Republique Democratique Du Congo": "CD", "Template En Syrian Arab Republic": "SY",
  Belgium: "BE", Belgium_Flemish: "BE", Iran: "IR", Brunei: "BN", "Lao Pdr": "LA", Timor_Leste: "TL", Viet_Nam: "VN",
  Bolivia: "BO", "Venezuela Bolivarian Republic of": "VE", Turks_and_Caicos: "TC", British_Virgin_Islands: "VG",
  "State of Palestine": "PS", Turkiye: "TR", Republic_of_Moldova: "MD", "Russian Federation": "RU",
  "Micronesia (Federated States of)": "FM", United_Republic_of_Tanzania: "TZ", Congo: "CG", Cabo_Verde: "CV",
  "Saotome And Principe": "ST", Eswatini: "SZ", Czechia: "CZ", "China, Hong Kong Special Administrative Region": "HK",
  "China, Macao Special Administrative Region": "MO", United_States_of_America: "US", United_Kingdom: "GB",
  "Bosnia And Herzegovina": "BA", "North Macedonia": "MK", Guinea_Bissau: "GW",
  "Antigua and Barbuda": "AG", Saint_Lucia: "LC", Saint_Vincent_and_the_Grenadines: "VC",
};

const dn = new Intl.DisplayNames(["en"], { type: "region" });
const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
const byName = new Map();
// Only real ISO 3166-1 codes (the site's 250 countries): Intl also names reserved codes such as "UK".
const ISO_CODES = JSON.parse(readFileSync(new URL("../../packages/sample-data/src/careers/countries.json", import.meta.url), "utf8")).map((c) => c.code);
for (const code of ISO_CODES) {
  const name = dn.of(code);
  if (name && name !== code) byName.set(norm(name), code);
}

const out = {};
const missing = [];
for (const k of keys) {
  const code = ALIASES[k] ?? byName.get(norm(k.replace(/_/g, " ")));
  if (code) out[k] = code; else missing.push(k);
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log("mapped", Object.keys(out).length, "of", keys.length, missing.length ? "| missing: " + missing.join(", ") : "");
