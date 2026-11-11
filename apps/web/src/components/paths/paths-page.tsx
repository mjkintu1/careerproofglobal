import { Suspense } from "react";
import { earningsMeta, payCoverage } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { careerCard, networkStats, nodeOptions, type CareerCard } from "@/lib/path-network";
import { CountryCareers } from "./country-careers";
import { PathStudio } from "./path-studio";
import { WbgScaleTable } from "@/components/pay/wbg-scale-table";


export function countryOptions(all: { code: string; name: string }[]): { code: string; name: string }[] {
  // Any official pay source counts: occupation-level data, public scales, minimum wage,
  // ILOSTAT averages, or World Bank / UN scales.
  const has = (code: string) => { const c = payCoverage(code); return Boolean(c.occupationLevel || c.publicScales || c.legalMinimum || c.groupAverages || c.worldBank || c.unitedNations); };
  return all.filter((c) => has(c.code)).map((c) => ({ code: c.code, name: c.name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function PathsPage({ country, countries }: { country: string | null; countries: { code: string; name: string }[] }) {
  const countryName = country ? (countries.find((c) => c.code === country)?.name ?? country) : null;
  const cards: Record<string, CareerCard> = {};
  for (const o of careerGraphData.occupations) cards[o.slug] = careerCard(o.slug, country)!;
  const stats = networkStats();
  const basePath = country ? `/paths/${country.toLowerCase()}` : "/paths";

  return (
    <>
      <PageBand kicker="Path planner" title={`Plan a path to any career${countryName ? ` in ${countryName}` : ""}`}
        intro="Start from where you are, school or any career, and see every route to your goal: steps up, changes of field and the qualifications in between. No limit on the number of moves." />
      <Container className="space-y-12 py-10">
        <div id="planner">
          <Suspense fallback={<div className="card h-[620px] animate-pulse" />}>
            <PathStudio nodes={nodeOptions()} countries={countries} country={country} countryName={countryName} />
          </Suspense>
        </div>
        <CountryCareers cards={Object.values(cards)} countryName={countryName} basePath={basePath} />
        {country && countryName && <WbgScaleTable country={country} countryName={countryName} />}
        <section className="space-y-2 text-sm text-ink-muted">
          <h2 className="font-display text-base font-bold text-ink">Where this comes from</h2>
          <p>
            {stats.total.toLocaleString("en")} moves connect {stats.nodes.toLocaleString("en")} occupations ({careerGraphData.occupations.length} guided careers plus O*NET occupations): {stats.curated} known moves with typical years from our career data,
            {" "}{stats.onet.toLocaleString("en")} from O*NET&rsquo;s Related Occupations (O*NET 31.0, U.S. Department of Labor, CC BY 4.0), {stats.skills} between careers sharing 30% or more of their skills (rare skills count more than common ones such as communication),
            and {stats.entry} entry routes. When a source gives no time for a move, we rank it as the length of the new career&rsquo;s main qualification (for O*NET occupations, the minimum preparation time O*NET gives for its Job Zone) and say so. Ranking also counts one year for each change of job, so a direct route beats hopping through many similar jobs; times shown are never changed by this. A route uses at most three similarity links (moves with no published time), because chains of &ldquo;similar&rdquo; jobs drift; known moves are unlimited. Retraining directly for the goal is always shown as an option.
          </p>
          <p>Pay: {earningsMeta.source}. {earningsMeta.attribution} Nominal local currency; latest year since 2010 for each country. Usual education follows the ISCO-08 skill levels (ILO).</p>
        </section>
      </Container>
    </>
  );
}
