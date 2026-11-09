// Career-graph part of the seed. Reads packages/sample-data/src/careers.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "packages", "sample-data", "src", "careers");
const read = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

/** Every country, with extra detail (currency, exams) where recorded. */
const details = new Map(read("locations.json").map((l) => [l.code, l]));
export const locations = read("countries.json").map((c) => ({ ...c, ...(details.get(c.code) ?? {}), name: c.name }));

export function careerSeed(q) {
  const out = ["-- Career graph (illustrative)"];
  const clusters = read("clusters.json");
  const skills = read("skills.json");
  const occupations = readdirSync(dir).filter((f) => f.startsWith("occ-") && f.endsWith(".json")).flatMap(read);
  const transitions = [...read("transitions-1.json"), ...read("transitions-2.json")];
  const regulators = read("regulators.json");

  out.push("insert into public.career_clusters (slug, name, description, sort_order) values");
  out.push(clusters.map((c, i) => `  (${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${i})`).join(",\n") + ";");

  out.push("insert into public.skills (slug, name) values");
  out.push(Object.entries(skills).map(([slug, name]) => `  (${q(slug)}, ${q(name)})`).join(",\n") + ";");

  const arr = (xs) => `array[${xs.map(q).join(", ")}]::text[]`;
  const occId = (slug) => `(select id from public.occupations where slug = ${q(slug)})`;
  for (const o of occupations) {
    out.push(
      `insert into public.occupations (slug, title, isco_code, cluster_id, summary, tasks, typical_level, riasec, school_subjects, status) values (${q(o.slug)}, ${q(o.title)}, ${q(o.isco)}, (select id from public.career_clusters where slug = ${q(o.cluster)}), ${q(o.summary)}, ${arr(o.tasks)}, ${q(o.level)}, ${q(o.riasec)}, ${arr(o.subjects)}, 'illustrative');`,
    );
    out.push("insert into public.occupation_skills (occupation_id, skill_id) values");
    out.push(o.skills.map((s) => `  (${occId(o.slug)}, (select id from public.skills where slug = ${q(s)}))`).join(",\n") + ";");
    out.push("insert into public.qualification_routes (occupation_id, route_type, title, typical_years, sort_order) values");
    out.push(o.routes.map((r, i) => `  (${occId(o.slug)}, ${q(r.type)}, ${q(r.title)}, ${r.years}, ${i})`).join(",\n") + ";");
  }

  out.push("insert into public.occupation_transitions (from_occupation_id, to_occupation_id, kind, typical_years, via) values");
  out.push(transitions.map(([a, b, kind, years, via]) => `  (${occId(a)}, ${occId(b)}, ${q(kind)}, ${years}, ${q(via)})`).join(",\n") + ";");

  const locs = [];
  for (const [slug, byCountry] of Object.entries(regulators)) {
    if (slug.startsWith("_")) continue;
    for (const [code, regulator] of Object.entries(byCountry)) {
      locs.push(`  (${occId(slug)}, (select id from public.regions where iso_code = ${q(code)}), ${q(regulator)}, true)`);
    }
  }
  out.push("insert into public.occupation_localisations (occupation_id, region_id, regulator, is_illustrative) values");
  out.push(locs.join(",\n") + ";");
  return out;
}
