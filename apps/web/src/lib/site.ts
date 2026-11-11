/** Public site origin, used for absolute URLs (canonical, sitemap, Open Graph). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://careerproofglobal.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "CareerProof Global";
export const SITE_TAGLINE = "Map your path. Prove your future.";
export const SITE_DESCRIPTION =
  "Career paths for every country, built on international standards: what each career involves, the subjects and qualifications that open it, and where to study.";

/**
 * Official social media profiles. Empty until the accounts exist (the owner creates them; see
 * docs/SITE_ESSENTIALS_PLAN.md, phase 5). Used in the footer and in the Organization structured data.
 */
export const SOCIAL_PROFILES: { network: "LinkedIn" | "Facebook" | "Instagram" | "YouTube"; url: string }[] = [];

/** Operator and contact details used on the legal pages and in structured data. */
export const OPERATOR = {
  name: "CareerProof Global",
  email: "careerproofglobal@gmail.com",
  address: "Plot 4, Pilkington Road, Kampala, Uganda",
  country: "Uganda",
} as const;

/** Law governing the terms of use (a single national law is needed; the operator is based in Uganda). */
export const GOVERNING_LAW = "the laws of the Republic of Uganda";
/** Date the legal pages were last changed. */
export const LEGAL_UPDATED = "11 November 2026";
