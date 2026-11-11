import { NextResponse, type NextRequest } from "next/server";
import { careerCard, directEdges, network, nodeId, START, type CareerCard } from "@/lib/path-network";

const MAX_ROUTES = 12;
/**
 * Similarity links (O*NET related occupations, shared skills) have no published time and
 * drift in meaning when chained, so a route may use at most this many. Known moves and
 * entry routes are unlimited.
 */
const MAX_UNPUBLISHED = 3;
/** Ranking rule: each change of job also counts one year (finding and settling into a role). */
const PER_MOVE_YEARS = 1;

/** GET /api/paths?from=start|<id>&to=<id>&country=UG : ranked routes plus a card for every node on them. */
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  // O*NET codes merged into a guided career resolve to that career.
  const from = nodeId(q.get("from") ?? START);
  const to = nodeId(q.get("to") ?? "");
  const country = /^[A-Za-z]{2}$/.test(q.get("country") ?? "") ? q.get("country")!.toUpperCase() : null;
  if (!to || (from !== START && !careerCard(from, null)) || !careerCard(to, null)) {
    return NextResponse.json({ error: "Unknown start or goal" }, { status: 400 });
  }
  const routes = network.routes(from, to, MAX_ROUTES, directEdges(from, to), PER_MOVE_YEARS, MAX_UNPUBLISHED);
  const ids = new Set([to, ...routes.flatMap((r) => r.edges.flatMap((e) => [e.from, e.to]))]);
  if (from !== START) ids.add(from);
  ids.delete(START);
  const cards: Record<string, CareerCard> = {};
  for (const id of ids) {
    const c = careerCard(id, country);
    if (c) cards[id] = c;
  }
  return NextResponse.json({ routes, cards }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
