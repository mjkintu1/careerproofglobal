import { NextResponse, type NextRequest } from "next/server";
import { searchCareers } from "@/lib/search-index";

/** GET /api/search?q=systems+engineer&location=ug : careers and occupations matching a job title. */
export function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const loc = req.nextUrl.searchParams.get("location") ?? "global";
  const location = /^([a-z]{2}|global)$/i.test(loc) ? loc.toLowerCase() : "global";
  if (q.length < 2 || q.length > 100) return NextResponse.json({ results: [] });
  return NextResponse.json(
    { results: searchCareers(q, location) },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
