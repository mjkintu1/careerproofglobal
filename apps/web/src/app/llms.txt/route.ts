import { catalogueCounts, curricula, institutionCounts, institutionTotal } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { networkStats } from "@/lib/path-network";
import { OPERATOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * /llms.txt: a plain-language map of the site for AI assistants and answer engines
 * (the llms.txt convention). Counts come from the same data the pages use.
 */
export function GET() {
  const n = (x: number) => x.toLocaleString("en");
  const u = (path: string) => `${SITE_URL}${path}`;
  const net = networkStats();
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION} Every figure links to the official source it comes from (ILO, UNESCO, EU ESCO, O*NET, national statistics offices, ministries, regulators and exam boards). We show official rules and past results; we never predict an individual's chance of admission.

## Careers and routes
- [Career guides](${u("/careers/global")}): ${n(careerGraphData.occupations.length)} in-depth guides: what the work involves, ways in, school subjects, the licensing body by country, and where each career leads.
- [Career path planner](${u("/paths")}): every route from school or any job to any of ${n(net.nodes)} careers (${n(net.total)} links), with the qualifications in between and official pay by country.
- [Occupation directory](${u("/occupations")}): ${n(catalogueCounts.escoOccupations)} occupations on the ILO ISCO-08 standard, with skills and tasks (from EU ESCO).
- [School subjects](${u("/subjects")}): which careers each subject keeps open.

## Study and admission
- [Universities and colleges](${u("/institutions")}): ${n(institutionTotal)} institutions in ${n(Object.keys(institutionCounts).length)} countries and territories (Research Organization Registry).
- [Admission standards](${u("/admissions")}): entry requirements, school systems and regulators by country.
- [Uganda university admission](${u("/admissions/uganda")}): official cut-off points and accredited programmes.
- [Admission calculators](${u("/admissions/calculators")}): points calculators that follow each body's published formula, such as the UCAS Tariff.
- [School curricula](${u("/curricula")}): how ${n(curricula.length)} curricula (Cambridge, IB, AP, national exams) are graded and used for university entry.
- [Certifications](${u("/certifications")}): how to judge a certification, with verified facts on common ones.

## Pay and work
- [Pay data coverage](${u("/pay-coverage")}): which official pay sources exist for each country.
- [Negotiating pay](${u("/negotiate-salary")}): check a posted salary range against official pay.
- [CV builder](${u("/cv-builder")}): a CV or résumé built in the browser; nothing is uploaded.
- [Finding work safely](${u("/job-market")}): official rules on recruitment fees and job scams.

## Reference
- [Frequently asked questions](${u("/faqs")}): cited answers on subjects, admission, recognition abroad, pay and changing career.
- [Data sources and licences](${u("/data-licences")}): every source with its licence and required attribution.
- [Disclaimer](${u("/disclaimer")}): guidance built on official data, not professional advice or an official decision.

## Citing this site
Cite the page URL and, for a figure, the official publisher named beside it. Data keeps its original licence (see Data sources and licences). Contact: ${OPERATOR.email}.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
