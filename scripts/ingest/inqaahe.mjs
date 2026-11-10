// INQAAHE members database -> data-raw/inqaahe/members.json (all members; filtering happens in the build step).
// robots.txt (checked 2026-11-10): "User-agent: * Disallow:" (everything allowed). One page every 1.5 s.
// Usage: node scripts/ingest/inqaahe.mjs
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dirname, "..", "..", "data-raw", "inqaahe", "members.json");
const BASE = "https://www.inqaahe.org/membership/members-database/";
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#0?39;|&#8217;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;/g, "-").replace(/\s+/g, " ").trim();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const members = [];
for (let page = 1; page < 200; page++) {
  const url = page === 1 ? BASE : `${BASE}page/${page}/`;
  const res = await fetch(url, { headers: { "User-Agent": "CareerProofGlobal data import" } });
  if (res.status === 404) break;
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const html = await res.text();
  const cards = html.split('<div class="item-membership">').slice(1);
  if (!cards.length) break;
  for (const c of cards) {
    const name = decode((c.match(/<h4 class="nombre">([\s\S]*?)<\/h4>/) ?? [])[1] ?? "");
    const field = (label) => decode((c.match(new RegExp(`<p>${label}:\s*([^<]*)</p>`)) ?? [])[1] ?? "");
    const website = (c.match(/<a href="([^"]+)"[^>]*>Visit website<\/a>/) ?? [])[1] ?? null;
    const profile = (c.match(/<a href="(https:\/\/www\.inqaahe\.org\/member\/[^"]+)"/) ?? [])[1] ?? null;
    if (name) members.push({ name, type: field("Type"), country: field("Country"), region: field("World region"), website, profile });
  }
  console.log("page", page, "members so far", members.length);
  await pause(1500);
}
writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), source: BASE, members }, null, 1));
const types = {};
for (const m of members) types[m.type] = (types[m.type] ?? 0) + 1;
console.log("total", members.length, types);
