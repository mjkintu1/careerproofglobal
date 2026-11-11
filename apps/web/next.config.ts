import type { NextConfig } from "next";

/** Canonical origin; keep in step with src/lib/site.ts. */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://careerproofglobal.com").replace(/\/$/, "");

/**
 * Old hostnames to send permanently to SITE_URL, comma-separated, e.g.
 * "careerproofglobal.vercel.app,www.careerproofglobal.com". Off unless set, so the old address keeps
 * working until the new domain is live. See docs/DOMAIN_HANDOVER.md.
 */
const REDIRECT_FROM_HOSTS = (process.env.REDIRECT_FROM_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  async redirects() {
    return REDIRECT_FROM_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
    }));
  },
  transpilePackages: ["@careerproof/reference-data", "@careerproof/career-graph", "@careerproof/rules-engine", "@careerproof/db", "@careerproof/sample-data"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
