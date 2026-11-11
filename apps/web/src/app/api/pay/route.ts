import { NextResponse, type NextRequest } from "next/server";
import { careerCard, nodeId } from "@/lib/path-network";

/** GET /api/pay?career=<slug or O*NET code>&country=UG : official pay benchmarks for one occupation in one country. */
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const country = /^[A-Za-z]{2}$/.test(q.get("country") ?? "") ? q.get("country")!.toUpperCase() : null;
  const card = careerCard(nodeId(q.get("career") ?? ""), country);
  if (!card || !country) return NextResponse.json({ error: "Choose an occupation and a country" }, { status: 400 });
  return NextResponse.json({ title: card.title, country, pay: card.pay });
}
