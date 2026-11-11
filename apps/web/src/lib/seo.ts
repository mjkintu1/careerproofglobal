import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/**
 * Page metadata with a canonical URL and matching Open Graph / Twitter tags.
 *
 * Next.js merges metadata shallowly: a page that sets only `title` and `description` keeps the
 * root layout's `openGraph`, so every shared link would preview as the home page. This helper
 * gives each page its own preview title, description and URL. The site-wide Open Graph image
 * (app/opengraph-image.tsx) still applies.
 */
export function seo(path: string, meta: Metadata = {}): Metadata {
  const title = typeof meta.title === "string" ? meta.title : undefined;
  const description = meta.description ?? SITE_DESCRIPTION;
  const shareTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: career paths for every country`;
  return {
    ...meta,
    description,
    alternates: { canonical: path, ...meta.alternates },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en", url: path, title: shareTitle, description, ...meta.openGraph },
    twitter: { card: "summary_large_image", title: shareTitle, description, ...meta.twitter },
  };
}
