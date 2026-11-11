import { careerGraphData } from "@careerproof/sample-data";
import { graph } from "@/lib/careers";

/** Compact career data for the CV builder: skills to suggest and the qualifications on the main routes in. */
export interface CvCareer { slug: string; title: string; skills: string[]; qualifications: string[] }

export function cvCareers(): CvCareer[] {
  return careerGraphData.occupations
    .map((o) => ({
      slug: o.slug,
      title: o.title,
      skills: o.skills.map((s) => graph.skillName(s)),
      qualifications: [...new Set(o.routes.map((r) => r.title))],
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
