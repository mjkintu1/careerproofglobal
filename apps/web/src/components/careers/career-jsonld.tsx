import type { Localised, Occupation } from "@careerproof/career-graph";
import { careerHref, careerPageTitle, clusterName, graph, levelLabel } from "@/lib/careers";
import type { Answer } from "@/lib/career-answers";
import { SITE_URL as SITE } from "@/lib/site";

/** schema.org Occupation + BreadcrumbList, so search engines get machine-readable career facts. */
export function CareerJsonLd({ o, location, local, answers = [] }: { o: Occupation; location: string; local: Localised; answers?: Answer[] }) {
  const url = `${SITE}${careerHref(location, o.slug)}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Occupation",
      name: o.title,
      description: o.summary,
      url,
      ...(o.isco ? { occupationalCategory: { "@type": "CategoryCode", codeValue: o.isco, inCodeSet: "ISCO-08" } } : {}),
      skills: o.skills.map((s) => graph.skillName(s)).join(", "),
      responsibilities: o.tasks.join(". "),
      educationRequirements: { "@type": "EducationalOccupationalCredential", credentialCategory: levelLabel[o.level] },
      ...(local.location ? { occupationLocation: { "@type": "Country", name: local.location.name } } : {}),
      ...(local.regulator ? { qualifications: `Registration or licensing: ${local.regulator}` } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE}/careers/${location}` },
        { "@type": "ListItem", position: 3, name: clusterName(o.cluster), item: `${SITE}/careers/${location}/field/${o.cluster}` },
        { "@type": "ListItem", position: 4, name: careerPageTitle(o, location), item: url },
      ],
    },
    ...(answers.length
      ? [{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: answers.map((x) => ({ "@type": "Question", name: x.question, acceptedAnswer: { "@type": "Answer", text: x.answer } })),
        }]
      : []),
  ];
  // Escape "<" so the JSON can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, String.fromCharCode(92) + "u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
