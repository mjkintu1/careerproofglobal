import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { cacheLife } from "next/cache";
import { payBenchmarks, type PayBenchmark } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { AiPathSchema, type AiPath } from "./ai-path-schema";
import { careerCard, nodeOptions } from "./path-network";
import { parsePrompt } from "./path-prompt";

/** Model behind the AI career search (chosen by the founders, 26 Nov 2026). */
export const AI_MODEL = "claude-sonnet-5-5";

/** Fixed system prompt: kept byte-identical between requests so it is served from the prompt cache. */
const SYSTEM = `You write career paths for CareerProof Global, a career guidance website used mostly by secondary-school and university students, many of them in Africa.

Given what a person writes (for example "I want to become an investment banker") and a country, set out a realistic step-by-step path from where they are to that career. Assume they are a student about to start university unless they say otherwise.

Rules:
- Use the education system, qualifications, exams, licences and job titles of the given country. Name real bodies (regulators, professional institutes, exam boards) only when you are confident they exist.
- 4 to 8 stages, in order. For each: typical years, what to study, experience to gain, certifications or licences.
- payEstimate: typical pay at that stage in the country's own currency, prefixed with "about". It is shown to students as an AI estimate, so stay conservative. If you are not reasonably confident, use an empty string.
- If official figures are supplied in the request, treat them as correct and keep your estimates consistent with them. Never claim a figure is official.
- branches: other common ways into the career (with the stage they join at) and common moves out of it.
- bodiesToCheck: the official bodies a student should confirm requirements with.
- Plain English, short phrases, no marketing language.
- If the request is not about a career, study or work path, or asks for something harmful, set recognised to false, explain briefly in message, and leave the other lists empty.`;

export interface OfficialPay {
  /** Where the figures come from: one of our careers, or the ILO occupation group the AI identified. */
  basis: string;
  pay: PayBenchmark[];
  regulator: string | null;
}

export interface AiPathResult {
  path: AiPath;
  official: OfficialPay | null;
  /** Our own career page for the goal, when the request matched one. */
  matched: { slug: string; title: string } | null;
  model: string;
  generatedAt: string;
}

const countries = careerGraphData.locations.map((l) => ({ code: l.code, name: l.name }));
const countryName = (cc: string | null) => (cc ? (countries.find((c) => c.code === cc)?.name ?? cc) : null);

/** Lower-case, single-spaced, trimmed: the cache key for a question. */
export function normaliseQuery(q: string): string {
  return q.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").replace(/[?.!]+$/, "").trim();
}

/** The goal career and country we can recognise ourselves, before asking the model. */
export function matchRequest(query: string, country: string | null) {
  const nodes = nodeOptions();
  const p = parsePrompt(query, nodes.map((n) => ({ slug: n.code, title: n.name })), countries);
  const cc = (country ?? p.country)?.toUpperCase() ?? null;
  const goal = p.to ? careerCard(p.to, cc) : null;
  return { country: cc, goal };
}

/**
 * Ask the model for a path, attach official pay and regulator data, and cache the answer.
 * Repeat questions (same wording and country) are served from the cache and cost nothing.
 */
export async function generatePath(query: string, country: string | null): Promise<AiPathResult> {
  "use cache: remote";
  cacheLife("weeks");

  const { goal } = matchRequest(query, country);
  const where = countryName(country) ?? "Global (no specific country)";
  const known = goal
    ? `\n\nOfficial data CareerProof Global holds for "${goal.title}"${country ? ` in ${where}` : ""}:\n${JSON.stringify({
        regulator: goal.regulator,
        pay: goal.pay.slice(0, 4),
      })}`
    : "";

  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: AI_MODEL,
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(AiPathSchema) },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `Request: ${query}\nCountry: ${where}${known}` }],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(response.stop_reason === "refusal" ? "refused" : `unparsed (${response.stop_reason})`);
  }
  const path = response.parsed_output;

  // Legal minimum wages say little about a specific career's pay, so they are left out here.
  const useful = (b: PayBenchmark[]) => b.filter((x) => x.granularity !== "legal-minimum");
  let official: OfficialPay | null = null;
  if (goal) {
    official = { basis: goal.title, pay: useful(goal.pay), regulator: goal.regulator };
  } else if (country && /^\d{4}$/.test(path.isco)) {
    const pay = useful(payBenchmarks({ country, isco: path.isco, title: path.career }));
    if (pay.length) official = { basis: `ISCO-08 occupation group ${path.isco}`, pay, regulator: null };
  }
  return {
    path,
    official,
    matched: goal?.kind === "guided" ? { slug: goal.slug, title: goal.title } : null,
    model: response.model,
    generatedAt: new Date().toISOString(),
  };
}
