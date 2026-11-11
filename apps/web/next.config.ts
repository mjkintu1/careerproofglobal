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

const isDev = process.env.NODE_ENV === "development";
/** Vercel's preview toolbar (preview deployments only) needs vercel.live. */
const isPreview = process.env.VERCEL_ENV === "preview";
const live = isPreview ? " https://vercel.live" : "";

/**
 * Content Security Policy without nonces (pages are statically prerendered, and nonces would force
 * dynamic rendering). The site loads no third-party scripts, images, fonts or frames.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${live}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data:${live}${isPreview ? " https://vercel.com" : ""}`,
  `font-src 'self'${live}`,
  `connect-src 'self'${isPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  `frame-src ${isPreview ? "https://vercel.live" : "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Data endpoints are not pages: keep them out of search results.
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
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
