// Writes packages/sample-data/src/careers/countries.json: every ISO 3166-1 country/territory
// (plus Kosovo, XK), with English names from the CLDR data built into Node's Intl.
// Usage: node scripts/generate-countries.mjs
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// CLDR knows extra region codes that are not current ISO 3166-1 countries.
const EXCLUDE = new Set([
  "AA", "AC", "AN", "BU", "CP", "CQ", "CS", "DD", "DG", "DY", "EA", "EU", "EZ", "FX", "HV", "IC", "NH", "NT", "QO",
  "RH", "SU", "TA", "TP", "UK", "UN", "VD", "XA", "XB", "YD", "YU", "ZR", "ZZ",
]);

const names = new Intl.DisplayNames(["en"], { type: "region", fallback: "none" });
const countries = [];
for (let a = 65; a <= 90; a++) {
  for (let b = 65; b <= 90; b++) {
    const code = String.fromCharCode(a, b);
    if (EXCLUDE.has(code)) continue;
    const name = names.of(code);
    if (name && name !== code) countries.push({ code, name });
  }
}
countries.sort((x, y) => x.name.localeCompare(y.name, "en"));
const target = join(import.meta.dirname, "..", "packages", "sample-data", "src", "careers", "countries.json");
writeFileSync(target, JSON.stringify(countries, null, 1) + "\n");
console.log(`Wrote ${countries.length} countries to ${target}`);
