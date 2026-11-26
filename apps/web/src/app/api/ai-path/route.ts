import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { generatePath, matchRequest, normaliseQuery } from "@/lib/ai-path";

const MIN_LEN = 3;
const MAX_LEN = 200;
/** Per visitor, per server instance (best effort; the Vercel Firewall rule on /api/ai-path is the real limit). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** POST /api/ai-path { q, country? } : an AI-written career path, with official pay attached where we hold it. */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI career search is not switched on yet." }, { status: 503 });
  }
  let body: { q?: unknown; country?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Send JSON." }, { status: 400 }); }
  const q = typeof body.q === "string" ? normaliseQuery(body.q) : "";
  if (q.length < MIN_LEN || q.length > MAX_LEN) {
    return NextResponse.json({ error: `Write between ${MIN_LEN} and ${MAX_LEN} characters.` }, { status: 400 });
  }
  const given = typeof body.country === "string" && /^[A-Za-z]{2}$/.test(body.country) ? body.country.toUpperCase() : null;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many questions in a short time. Please try again in a few minutes." }, { status: 429 });
  }

  // A country named in the question ("…in Kenya") counts when none was chosen.
  const { country } = matchRequest(q, given);
  try {
    const result = await generatePath(q, country);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The AI service is busy. Please try again in a minute." }, { status: 503 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("ai-path API error", err.status, err.message);
      return NextResponse.json({ error: "The AI service is unavailable right now." }, { status: 502 });
    }
    console.error("ai-path failed", err);
    return NextResponse.json({ error: "We couldn't build that path. Try naming the career differently." }, { status: 502 });
  }
}
