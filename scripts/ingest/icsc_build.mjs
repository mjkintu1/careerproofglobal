// UN common system pay (International Civil Service Commission, ICSC):
//  - Salary scale for the Professional and higher categories (base/floor), USD per year, gross and net
//    by grade and step (sal<yyyymm>.xml from icsc.un.org/Home/DataSalaryScales).
//  - Post adjustment multipliers by duty station (pac_DSID_xml.xml from icsc.un.org/Home/DataPostAdjustment).
// Net pay at a duty station = net base salary x (1 + multiplier / 100), ICSC's published formula.
// Usage: node scripts/ingest/icsc_build.mjs <sal.xml> <pa.xml> <out.json>
import { readFileSync, writeFileSync } from "node:fs";

const [salFile, paFile, out] = process.argv.slice(2);
const attr = (s, k) => s.match(new RegExp(`${k}="([^"]*)"`))?.[1]?.trim() ?? "";
const tag = (s, k) => s.match(new RegExp(`<${k}>([\\s\\S]*?)</${k}>`))?.[1]?.trim() ?? "";

// Salary scale: one row per category/grade/step.
const scale = {};
const special = {};
let effective = "";
for (const d of readFileSync(salFile, "utf8").match(/<Detail [^>]*\/>/g) ?? []) {
  const cat = attr(d, "CATEGORY_ID"), grade = attr(d, "GRADE_ID").replace(/^-$/, "");
  const id = grade ? `${cat}-${grade}` : cat; // P-2, D-1, ASG, USG
  effective = `${attr(d, "YEAR")}-${attr(d, "MONTH").padStart(2, "0")}`;
  const step = attr(d, "STEP");
  // Regular steps are numbered; "PP" steps are special steps outside the regular range.
  if (!/^\d+$/.test(step)) { (special[id] ??= []).push(step); continue; }
  (scale[id] ??= []).push({ step: Number(step), gross: Math.round(Number(attr(d, "GROSS_SAL"))), net: Math.round(Number(attr(d, "NET_SAL"))) });
}
for (const steps of Object.values(scale)) steps.sort((a, b) => a.step - b.step);
const ORDER = ["P-1", "P-2", "P-3", "P-4", "P-5", "D-1", "D-2", "ASG", "USG"];
const grades = ORDER.filter((g) => scale[g]).map((g) => ({ grade: g, steps: scale[g].length, first: scale[g][0], last: scale[g].at(-1), ...(special[g] ? { specialSteps: special[g] } : {}) }));

// Post adjustment: one record per duty station.
const wb = (await (await fetch("https://api.worldbank.org/v2/country?format=json&per_page=400")).json())[1];
const byName = new Map(wb.map((c) => [c.name.toLowerCase(), c.iso2Code]));
const extra = { "united republic of tanzania": "TZ", "democratic republic of the congo": "CD", "congo": "CG", "iran (islamic republic of)": "IR", "republic of korea": "KR", "democratic people's republic of korea": "KP", "lao people's democratic republic": "LA", "venezuela (bolivarian republic of)": "VE", "bolivia (plurinational state of)": "BO", "syrian arab republic": "SY", "republic of moldova": "MD", "micronesia (federated states of)": "FM", "viet nam": "VN", "egypt": "EG", "yemen": "YE", "gambia": "GM", "bahamas": "BS", "kyrgyzstan": "KG", "slovakia": "SK", "türkiye": "TR", "turkey": "TR", "czechia": "CZ", "cote d'ivoire": "CI", "côte d'ivoire": "CI", "state of palestine": "PS", "occupied palestinian territory": "PS", "saint lucia": "LC", "saint kitts and nevis": "KN", "saint vincent and the grenadines": "VC", "hong kong": "HK", "macao": "MO", "kosovo": "XK", "curacao": "CW", "curaçao": "CW", "sint maarten": "SX", "north macedonia": "MK", "russian federation": "RU", "united kingdom of great britain and northern ireland": "GB", "united states of america": "US", "netherlands (kingdom of the)": "NL", "somalia": "SO", "sao tome and principe": "ST", "democratic republic of congo": "CD", "eswatini": "SZ", "cabo verde": "CV",
  // ICSC spellings.
  "anguilla": "AI", "antigua": "AG", "bonaire": "BQ", "bosnia-herzegovina": "BA", "central african rep.": "CF", "czech republic": "CZ", "cook islands": "CK", "croatia, republic of": "HR", "cape verde": "CV", "korea, dem. peo. of": "KP", "french guiana": "GF", "hong kong, china (sar)": "HK", "iran": "IR", "lao peo. dem. rep.": "LA", "libyan arab jamahiriya": "LY", "macao, china (sar)": "MO", "macedonia (fyrom)": "MK", "micronesia": "FM", "naoero, republic of": "NR", "west bank & the gaza strip,the": "PS", "puerto rico": "PR", "korea, republic of": "KR", "russian federation, the": "RU", "saint helena": "SH", "st.vincent-grenadines": "VC", "trinidad/tobago": "TT", "tanzania, u. republic": "TZ", "usa": "US", "venezuela": "VE", "vietnam": "VN", "congo, dem. rep. of": "CD" };
/** Not a country: kept out of country lookups. */
const NOT_COUNTRY = new Set(["jerusalem"]);
const decode = (t) => t.replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const stations = {};
const unmatched = [];
for (const r of readFileSync(paFile, "utf8").match(/<dataXML>[\s\S]*?<\/dataXML>/g) ?? []) {
  const name = decode(tag(r, "country"));
  if (NOT_COUNTRY.has(name.toLowerCase())) continue;
  const iso = byName.get(name.toLowerCase()) ?? extra[name.toLowerCase()];
  if (!iso) { unmatched.push(name); continue; }
  // Several duty stations in one country: keep the main one (ICSC code ending 001), else the first.
  if (stations[iso] && (stations[iso].dsid.endsWith("001") || !tag(r, "dsid").endsWith("001"))) continue;
  const m = Number(tag(r, "Multiplier"));
  if (!Number.isFinite(m)) continue;
  stations[iso] = { dsid: tag(r, "dsid"), name, multiplier: m, asOf: tag(r, "asofdate"), effective: tag(r, "eff_date"), exchangeRate: Number(tag(r, "exch")) || null };
}
writeFileSync(out, JSON.stringify({
  meta: {
    source: "International Civil Service Commission (ICSC): salary scale for the Professional and higher categories, and post adjustment classifications",
    attribution: "Source: International Civil Service Commission, United Nations common system.",
    url: "https://icsc.un.org/Home/DataSalaryScales",
    postAdjustmentUrl: "https://icsc.un.org/Home/DataPostAdjustment",
    scaleEffective: effective,
    unit: "USD per year; net = after staff assessment",
    formula: "Net pay at a duty station = net base salary x (1 + post adjustment multiplier / 100)",
    note: "Post adjustment is for each country's main duty station (ICSC code ending 001). Professional staff are paid this worldwide scale plus post adjustment; General Service staff have local scales (not included).",
    unmatched,
  },
  grades,
  postAdjustment: Object.fromEntries(Object.entries(stations).sort()),
}, null, 1));
console.log(`ICSC: ${grades.length} grades (scale ${effective}); ${Object.keys(stations).length} duty-station countries; unmatched: ${unmatched.join(", ") || "none"}`);
