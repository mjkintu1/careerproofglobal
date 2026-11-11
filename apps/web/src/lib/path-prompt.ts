/**
 * Reads a plain-words request such as "I'm a nurse in Uganda and want to become a data
 * scientist" into a start, a goal and a country. Deterministic matching against our own
 * career titles and country names; it never invents a career or a figure.
 */
export interface PromptCareer { slug: string; title: string }
export interface PromptCountry { code: string; name: string }
export interface ParsedPrompt { from: string | null; to: string | null; country: string | null }

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const START_WORDS = /\b(student|school|pupil|graduate|graduating|leaver|starting out|beginner|no experience|from scratch|just finished)\b/;
const GOAL_SPLIT = /\b(want to be|want to become|wants to be|become|becoming|be a|be an|move into|switch to|change to|get into|into|to)\b/;

/** Plural and short forms people type. */
const ALIASES: Record<string, string[]> = {
  "medical-doctor": ["doctor", "physician", "medic"],
  "nurse": ["nurse", "nursing"],
  "software-developer": ["programmer", "coder", "software engineer", "developer"],
  "lawyer": ["advocate", "attorney", "solicitor", "barrister"],
};

/** One-word parts too general to identify an occupation ("Prepress Technicians and Workers"). */
const GENERIC = /^(workers?|operators?|helpers?|assistants?|specialists?|technicians?|managers?|clerks?|aides?|laborers?|occupations?|others?|teachers?|engineers?|scientists?)$/i;

function findCareers(text: string, careers: PromptCareer[]) {
  const hits: { slug: string; at: number; len: number; rank: number }[] = [];
  // Ties at one place: guided careers first, then the most general (shortest) title.
  const rankOf = (c: PromptCareer) => (/\d/.test(c.slug) ? 1000 : 0) + c.title.length;
  for (const c of careers) {
    // O*NET titles are plural and often "Head, qualifier" ("Cooks, Restaurant"): also try
    // the singular and the head noun on its own.
    const singular = (t: string) => t.split(/\s+/).map((w) => (/[^s]s$/i.test(w) ? w.slice(0, -1) : w)).join(" ");
    // Each part of "A and B" / "Head, qualifier", and its last two words ("truck driver").
    const parts = c.title.split(/,| and | or /i).map((x) => x.trim()).filter((x) => x && !/^(all other|except)/i.test(x))
      // A one-word part counts only if it names people ("Cooks", "Auditors"), not "Farm".
      .filter((x) => x.includes(" ") || (/(er|ist|or|ian|ant|ent|s)$/i.test(x) && !GENERIC.test(x)));
    const tails = parts.map((x) => singular(x).split(" ")).filter((w) => w.length >= 3).map((w) => w.slice(-2).join(" "));
    const variants = [c.title, singular(c.title), ...parts, ...parts.map(singular), ...tails, ...(ALIASES[c.slug] ?? [])];
    for (const name of new Set(variants)) {
      const n = norm(name);
      const at = ` ${text} `.indexOf(` ${n} `);
      if (at >= 0) hits.push({ slug: c.slug, at, len: n.length, rank: rankOf(c) });
      else if (n.endsWith("er") || n.endsWith("ist") || n.endsWith("or")) {
        const p = ` ${text} `.indexOf(` ${n}s `);
        if (p >= 0) hits.push({ slug: c.slug, at: p, len: n.length, rank: rankOf(c) });
      }
    }
  }
  // Keep the longest match at each place ("data scientist" over "scientist").
  hits.sort((a, b) => a.at - b.at || b.len - a.len || a.rank - b.rank);
  const out: typeof hits = [];
  for (const h of hits) {
    const prev = out[out.length - 1];
    if (prev && h.at < prev.at + prev.len) continue;
    if (!out.some((o) => o.slug === h.slug)) out.push(h);
  }
  return out;
}

export function parsePrompt(raw: string, careers: PromptCareer[], countries: PromptCountry[]): ParsedPrompt {
  const text = norm(raw);
  const country = countries
    .filter((c) => ` ${text} `.includes(` ${norm(c.name)} `))
    .sort((a, b) => b.name.length - a.name.length)[0]?.code ?? null;

  const split = text.search(GOAL_SPLIT);
  const hits = findCareers(text, careers);
  let from: string | null = null;
  let to: string | null = null;
  if (hits.length >= 2) {
    from = hits[0]!.slug;
    to = hits[hits.length - 1]!.slug;
  } else if (hits.length === 1) {
    // One career named: it is the goal if it comes after "become" / "to", else the start.
    to = split >= 0 && hits[0]!.at >= split ? hits[0]!.slug : null;
    from = to ? null : hits[0]!.slug;
  }
  if (!from && START_WORDS.test(text)) from = "start";
  return { from, to, country };
}
