import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Every crawler, including AI answer engines (OAI-SearchBot, PerplexityBot, Claude-SearchBot,
 * Google), may read the public pages: being cited by them is part of how students find us.
 * API endpoints and the programme simulator's result lists are not pages, so they stay out.
 * To opt out of AI *training* only, add groups for GPTBot, ClaudeBot, CCBot and Google-Extended
 * with `disallow: "/"`; that does not affect search or answer-engine citations.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/simulator/programmes"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
