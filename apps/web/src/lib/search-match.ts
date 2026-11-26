/**
 * Forgiving matching for job-title search: any word order, plurals, word starts ("engin"),
 * and one typo in longer words ("enginer"). Pure functions, shared by the server index.
 */
export const normalise = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/** Rough singular: "engineers" -> "engineer", "nurses" -> "nurse", "analyses" left alone. */
const singular = (w: string) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("is") ? w.slice(0, -1) : w);

export const tokens = (s: string) => normalise(s).split(" ").filter(Boolean).map(singular);

/** True when a and b differ by at most one insertion, deletion or substitution. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** How well one query word matches one label word: 3 exact, 2 word start, 1 one typo, 0 none. */
function wordMatch(q: string, w: string, last: boolean): number {
  if (q === w) return 3;
  if ((last || q.length >= 4) && w.startsWith(q) && q.length >= 2) return 2;
  if (q.length >= 5 && withinOneEdit(q, w)) return 1;
  return 0;
}

/**
 * Score a label against a query (0 = no match). Every query word must match a different
 * label word. Exact phrases score highest, then labels that start with the query, then
 * labels where all words match in any order; shorter labels win ties.
 */
export function scoreLabel(query: string, label: string): number {
  const q = tokens(query);
  const l = tokens(label);
  if (!q.length || !l.length) return 0;
  const qn = q.join(" ");
  const ln = l.join(" ");
  if (qn === ln) return 100;
  const used = new Set<number>();
  let quality = 0;
  for (let k = 0; k < q.length; k++) {
    let best = 0;
    let at = -1;
    for (let m = 0; m < l.length; m++) {
      if (used.has(m)) continue;
      const s = wordMatch(q[k]!, l[m]!, k === q.length - 1);
      if (s > best) { best = s; at = m; }
    }
    if (!best) return 0;
    used.add(at);
    quality += best;
  }
  const coverage = q.length / l.length;
  const start = ln.startsWith(qn) ? 15 : 0;
  return Math.round(40 + (quality / (3 * q.length)) * 25 + coverage * 15 + start);
}
