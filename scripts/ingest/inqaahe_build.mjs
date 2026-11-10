// Build the QA-agency snapshot from data-raw/inqaahe/members.json.
// Keeps INQAAHE "Full member" organisations (quality assurance / accreditation agencies) and maps countries to ISO2.
// Usage: node scripts/ingest/inqaahe_build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const raw = JSON.parse(readFileSync(join(ROOT, "data-raw", "inqaahe", "members.json"), "utf8"));
const OUT = join(ROOT, "packages", "reference-data", "src", "snapshots", "qa-agencies-inqaahe.json");

const ALIASES = { "united states of america": "US", usa: "US", "hong kong": "HK", "hong kong sar": "HK", "hong kong, china": "HK", macau: "MO", macao: "MO",
  "republic of korea": "KR", "south korea": "KR", korea: "KR", "russian federation": "RU", "viet nam": "VN", vietnam: "VN", "taiwan, china": "TW",
  "chinese taipei": "TW", "united kingdom of great britain and northern ireland": "GB", uk: "GB", "the netherlands": "NL", "iran (islamic republic of)": "IR",
  "kingdom of saudi arabia": "SA", "uae": "AE", "republic of moldova": "MD", "palestine": "PS", "state of palestine": "PS", "turkey": "TR", "türkiye": "TR",
  "kyrgyz republic": "KG", "lao pdr": "LA", "côte d'ivoire": "CI", "cote d'ivoire": "CI", "ivory coast": "CI", "democratic republic of the congo": "CD",
  "bosnia and herzegovina": "BA", "north macedonia": "MK", "czech republic": "CZ", "brunei darussalam": "BN", "syrian arab republic": "SY", "eswatini": "SZ",
  "antigua and barbuda": "AG", "holy see": "VA", "holy see, the": "VA", "trinidad and tobago": "TT", "korea, rep.": "KR", "the bahamas": "BS", myanmar: "MM",
  "slovak republic": "SK", "egypt, arab rep.": "EG", "netherlands antilles": "CW" };
const dn = new Intl.DisplayNames(["en"], { type: "region" });
const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
const byName = new Map();
// Only real ISO 3166-1 codes (the site's 250 countries): Intl also names reserved codes such as "UK".
const ISO_CODES = JSON.parse(readFileSync(new URL("../../packages/sample-data/src/careers/countries.json", import.meta.url), "utf8")).map((c) => c.code);
for (const code of ISO_CODES) {
  const name = dn.of(code);
  if (name && name !== code) byName.set(norm(name), code);
}
const aliasNorm = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));
const iso = (country) => aliasNorm.get(norm(country)) ?? byName.get(norm(country)) ?? null;

const agencies = [];
const unmapped = new Set();
for (const m of raw.members.filter((x) => x.type === "Full member")) {
  // A few entries have no country; fall back to the website's country-code domain (e.g. .eg -> EG).
  const tld = (m.website ?? "").match(/\.([a-z]{2})(\/|$)/i)?.[1]?.toUpperCase();
  const code = iso(m.country) ?? (!m.country && tld && dn.of(tld) !== tld ? tld : null);
  if (!code) { unmapped.add(m.country); continue; }
  agencies.push({ country: code, name: m.name, website: m.website || undefined, profile: m.profile || undefined, region: m.region || undefined });
}
const networks = raw.members.filter((x) => x.type === "QA network").map((m) => ({ name: m.name, region: m.region, website: m.website || undefined }));
writeFileSync(OUT, JSON.stringify({
  meta: {
    source: "INQAAHE (International Network for Quality Assurance Agencies in Higher Education), members database",
    url: "https://www.inqaahe.org/membership/members-database/",
    retrievedAt: raw.fetchedAt.slice(0, 10),
    note: "Full members are quality assurance or accreditation agencies. Membership is not government recognition: some are national regulators, others are private accreditors. Confirm a body's legal role with the country's ministry or regulator.",
    unmapped: [...unmapped],
  },
  agencies,
  networks,
}, null, 1));
console.log("agencies", agencies.length, "countries", new Set(agencies.map((a) => a.country)).size, "networks", networks.length, "| unmapped:", [...unmapped].join(", ") || "none");
