import type { MetadataRoute } from "next";
import { certifications, curricula, educationStructure, escoOccupations, iscedMapping, iscoGroups, institutionCounts } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { canonicalLocation, GLOBAL, locationCodes } from "@/lib/careers";
import { SITE_URL } from "@/lib/site";
import { subjects } from "@/lib/subjects";

/** Only canonical URLs: country career pages without local detail canonicalise to the global page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string, priority = 0.5): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, priority });
  const localities = locationCodes.filter((l) => canonicalLocation(l) === l);
  const careers = careerGraphData.occupations;
  return [
    url("/", 1),
    url("/careers/global", 0.9),
    url("/occupations", 0.8),
    url("/subjects", 0.8),
    url("/institutions", 0.8),
    url("/admissions", 0.8),
    url("/admissions/calculators", 0.8),
    url("/paths", 0.9),
    url("/pay-coverage", 0.6),
    url("/disclaimer", 0.3),
    url("/privacy", 0.3),
    url("/terms", 0.3),
    url("/cookies", 0.3),
    url("/faqs", 0.6),
    url("/curricula", 0.8),
    url("/cv-builder", 0.8),
    url("/negotiate-salary", 0.8),
    url("/job-market", 0.7),
    url("/data-licences", 0.3),
    url("/admissions/calculators/ucas-tariff", 0.7),
    url("/admissions/uganda", 0.8),
    url("/admissions/kenya", 0.7),
    url("/certifications", 0.8),
    url("/grow", 0.6),
    url("/simulator", 0.4),
    ...localities.filter((l) => l !== GLOBAL).map((l) => url(`/careers/${l}`, 0.6)),
    ...localities.flatMap((l) => careers.map((o) => url(`/careers/${l}/${o.slug}`, l === GLOBAL ? 0.8 : 0.6))),
    ...localities.flatMap((l) => careerGraphData.clusters.map((c) => url(`/careers/${l}/field/${c.slug}`, 0.6))),
    ...subjects.map((s) => url(`/subjects/${s.slug}`, 0.6)),
    ...iscoGroups.map((g) => url(`/occupations/isco/${g.code}`, 0.5)),
    ...escoOccupations.map((o) => url(`/occupations/${o.code}`, 0.5)),
    ...Object.keys(institutionCounts).map((cc) => url(`/institutions/${cc.toLowerCase()}`, 0.5)),
    ...certifications.map((c) => url(`/certifications/${c.slug}`, 0.6)),
    ...curricula.map((c) => url(`/curricula/${c.slug}`, 0.7)),
    ...careerGraphData.locations
      .filter((l) => !["UG", "KE"].includes(l.code) && (iscedMapping(l.code) || educationStructure(l.code)))
      .map((l) => url(`/admissions/${l.code.toLowerCase()}`, 0.6)),
  ];
}
