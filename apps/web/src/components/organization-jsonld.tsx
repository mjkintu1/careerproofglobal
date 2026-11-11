import { OPERATOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_PROFILES } from "@/lib/site";

/** Organization and WebSite structured data for search engines (name, logo, social profiles). */
export function OrganizationJsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description: SITE_DESCRIPTION,
      email: OPERATOR.email,
      address: { "@type": "PostalAddress", streetAddress: "Plot 4, Pilkington Road", addressLocality: "Kampala", addressCountry: "UG" },
      contactPoint: { "@type": "ContactPoint", email: OPERATOR.email, contactType: "customer support", availableLanguage: ["English"] },
      ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES.map((p) => p.url) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ];
  // Escape "<" so the JSON can never close the script tag early.
  const json = JSON.stringify(data).replace(/</g, "\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
