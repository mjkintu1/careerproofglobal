// Global subjects + links to careers and to national exam subjects.
// Uses packages/sample-data/src/careers/subjects.json, the same rules as the website.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "packages", "sample-data", "src", "careers");
const read = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

/** National exam subject name -> global subject name, where they differ. */
const NATIONAL_ALIASES = {
  "History and Government": "History",
  "Christian Religious Education": "Divinity",
  "Business Studies": "Entrepreneurship",
  "Subsidiary ICT": "Computer Studies",
  "Subsidiary Mathematics": "Mathematics",
};

export function subjectSeed(q) {
  const rules = read("subjects.json");
  const generic = new Set(rules.generic);
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const parse = (phrase) => {
    if (generic.has(phrase.toLowerCase())) return [];
    const parts = phrase.split(/\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
    return parts.map((p) => ({ name: rules.aliases[p] ?? p, required: parts.length === 1 }));
  };

  const occupations = readdirSync(dir).filter((f) => f.startsWith("occ-") && f.endsWith(".json")).flatMap(read);
  const subjects = new Map();
  const links = [];
  for (const o of occupations) {
    const seen = new Set();
    for (const phrase of o.subjects) {
      for (const { name, required } of parse(phrase)) {
        const slug = slugify(name);
        subjects.set(slug, name);
        if (seen.has(slug)) continue;
        seen.add(slug);
        links.push([o.slug, slug, required ? "required" : "option"]);
      }
    }
  }

  const out = ["-- Global subjects (illustrative descriptions)"];
  out.push("insert into public.global_subjects (slug, name, description) values");
  out.push([...subjects].map(([slug, name]) => `  (${q(slug)}, ${q(name)}, ${q(rules.about[name] ?? `How ${name} connects to careers.`)})`).join(",\n") + ";");
  out.push("insert into public.occupation_subjects (occupation_id, global_subject_id, requirement) values");
  out.push(links.map(([occ, sub, req]) =>
    `  ((select id from public.occupations where slug = ${q(occ)}), (select id from public.global_subjects where slug = ${q(sub)}), ${q(req)})`).join(",\n") + ";");
  out.push("-- Map national exam subjects onto global subjects (by name, plus known aliases)");
  out.push("update public.subjects s set global_subject_id = g.id from public.global_subjects g where lower(g.name) = lower(s.name);");
  for (const [national, global] of Object.entries(NATIONAL_ALIASES)) {
    out.push(`update public.subjects s set global_subject_id = g.id from public.global_subjects g where s.name = ${q(national)} and g.name = ${q(global)};`);
  }
  return out;
}
