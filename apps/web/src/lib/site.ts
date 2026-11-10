/** Public site origin, used for absolute URLs (canonical, sitemap, Open Graph). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://careerproofglobal.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "CareerProof Global";
export const SITE_TAGLINE = "Map your path. Prove your future.";
export const SITE_DESCRIPTION =
  "Career paths for every country, built on international standards: what each career involves, the subjects and qualifications that open it, and where to study.";
