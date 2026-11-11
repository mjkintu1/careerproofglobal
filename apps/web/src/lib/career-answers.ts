import type { Localised, Occupation } from "@careerproof/career-graph";
import { formatYears, withArticle } from "@/lib/careers";

export interface Answer {
  question: string;
  answer: string;
}

/**
 * Short, direct answers to the questions people ask search and AI assistants about a career.
 * Built only from data already shown on the career page, so the visible text and the FAQPage
 * structured data always match (search engines require that).
 */
export function careerAnswers(o: Occupation, local: Localised): Answer[] {
  const a = withArticle(o.title);
  const where = local.location ? ` in ${local.location.name}` : "";
  const out: Answer[] = [{ question: `What does ${a} do?`, answer: o.summary }];
  if (o.routes.length) {
    const ways = o.routes.map((r) => (r.years > 0 ? `${r.title} (${formatYears(r.years)})` : r.title));
    out.push({
      question: `How do you become ${a}${where}?`,
      answer: `Common ways in: ${ways.join("; ")}. Routes and durations vary by country and person.`,
    });
  }
  if (o.subjects.length) {
    out.push({ question: `Which school subjects help you become ${a}?`, answer: `${o.subjects.join(", ")}.` });
  }
  if (local.location && local.regulator) {
    out.push({
      question: `Who regulates ${o.title.toLowerCase()}s${where}?`,
      answer: `Registration or licensing body${where}: ${local.regulator}.`,
    });
  }
  return out;
}
