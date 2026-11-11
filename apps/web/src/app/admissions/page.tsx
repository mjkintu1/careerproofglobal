import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, GraduationCap, Layers } from "lucide-react";
import { admissionSystemsFor, educationStructure, higherEducationRegulators, iscedCountryCount, iscedMapping, iscedMeta, institutionCounts, uisMeta } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CountryTable, type CountryRow } from "@/components/admissions/country-table";
import { stage } from "@/components/admissions/education-structure";

export const metadata: Metadata = {
  title: "Admission standards worldwide",
  description: "How university admission works across countries: the ISCED 2011 levels, international recognition of qualifications, and each country's regulator and institutions.",
};

const ISCED = [
  ["0", "Early childhood education"], ["1", "Primary education"], ["2", "Lower secondary education"],
  ["3", "Upper secondary education"], ["4", "Post-secondary non-tertiary education"], ["5", "Short-cycle tertiary education"],
  ["6", "Bachelor's or equivalent level"], ["7", "Master's or equivalent level"], ["8", "Doctoral or equivalent level"],
];
const MANUAL = "https://uis.unesco.org/sites/default/files/documents/isced-2011-operational-manual-guidelines-for-classifying-national-education-programmes-and-related-qualifications-2015-en_1.pdf";

export default function AdmissionsPage() {
  const rows: CountryRow[] = careerGraphData.locations.map((l) => ({
    code: l.code,
    name: l.name,
    secondaryExams: l.secondaryExams,
    leaving: [...new Set((iscedMapping(l.code)?.upperSecondary ?? []).map((p) => p.a).filter((a) => a && a.toLowerCase() !== "na"))].join("; ") || null,
    regulators: higherEducationRegulators(l.code).regulators.map(({ name, website }) => ({ name, website })),
    institutions: institutionCounts[l.code] ?? 0,
    calculators: admissionSystemsFor(l.code).map(({ name, href, status }) => ({ name, href, status })),
    ...(() => {
      const s = educationStructure(l.code);
      return {
        upperSecondary: s ? stage(s.upperSecondaryEntryAge, s.upperSecondaryYears) : null,
        tertiaryGer: s?.tertiaryGer ? `${s.tertiaryGer.value}% (${s.tertiaryGer.year})` : null,
      };
    })(),
  }));
  return (
    <>
      <PageBand kicker="Where to study" title="Admission standards worldwide"
        intro="Every country sets its own admission rules, but they sit on shared international standards. Start with the global picture, then check your country." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="isced" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            <h2 id="isced" className="flex items-center gap-2 text-2xl font-extrabold"><Layers aria-hidden="true" size={24} className="text-teal-700" /> One scale for every education system</h2>
            <p>The <strong>International Standard Classification of Education (ISCED 2011)</strong>, adopted by UNESCO in November 2011, places every national programme on nine levels so qualifications can be compared across countries. Tertiary education covers levels 5 to 8.</p>
            <p>Entry to tertiary programmes usually follows completion of upper secondary education (level 3), with each country setting its own subject and grade requirements.</p>
            <p className="text-xs text-ink-muted">Source: <a href={MANUAL}>ISCED 2011 Operational Manual, UNESCO Institute for Statistics, OECD and Eurostat</a>.</p>
          </div>
          <ol className="card divide-y divide-line">
            {ISCED.map(([n, name]) => (
              <li key={n} className={`flex items-center gap-4 px-5 py-3 ${Number(n) >= 5 ? "bg-teal-50" : ""}`}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display font-bold text-white">{n}</span>
                <span className="font-semibold">{name}</span>
                {n === "5" && <span className="chip ml-auto bg-white text-teal-800">Tertiary: levels 5 to 8</span>}
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="recognition" className="card space-y-3 border-l-4 border-l-teal-500 p-6">
          <h2 id="recognition" className="flex items-center gap-2 text-2xl font-extrabold"><Globe2 aria-hidden="true" size={24} className="text-teal-700" /> Recognition across borders</h2>
          <p>The <strong>Global Convention on the Recognition of Qualifications concerning Higher Education</strong> was adopted by UNESCO in November 2019 and entered into force on 5 March 2023. It had 42 States Parties as of July 2026. It sets principles for fair, transparent and non-discriminatory recognition of qualifications, including recognition of refugees&apos; qualifications when documents are missing. Five UNESCO regional conventions complement it.</p>
          <p className="text-xs text-ink-muted">Source: <a href="https://www.unesco.org/en/higher-education/global-convention">UNESCO, Global Convention on Higher Education</a>.</p>
          <p>Studied Cambridge, Pearson Edexcel, the IB or AP? See <Link href="/curricula">school curricula</Link> for how each is graded and <Link href="/curricula#recognition">how Uganda, Kenya, South Africa, Nigeria and the UK recognise foreign results</Link>.</p>
        </section>
        <section aria-labelledby="countries" className="space-y-4">
          <h2 id="countries" className="flex items-center gap-2 text-2xl font-extrabold"><GraduationCap aria-hidden="true" size={24} className="text-teal-700" /> Country by country</h2>
          <p className="text-ink-muted">Choose a country for its official entry requirements. Regulators and quality-assurance agencies are as listed by AfriQAN and INQAAHE (membership is not government recognition). Upper-secondary durations and tertiary gross enrolment ratios come from UNESCO; institution counts from the Research Organization Registry (CC0).</p>
          <CountryTable rows={rows} />
          <p className="text-xs text-ink-muted">
            School-leaving qualifications marked UNESCO, and each country&apos;s entry requirements ({iscedCountryCount} countries), come from <a href={iscedMeta.url}>{iscedMeta.source}</a> (<a href={iscedMeta.licenceUrl}>{iscedMeta.licence}</a>). {uisMeta.attribution} <a href={uisMeta.licenceUrl}>Licence</a>.
          </p>
        </section>
        <section aria-labelledby="calc" className="card flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-gold-400 p-6">
          <div className="max-w-2xl space-y-1">
            <h2 id="calc" className="text-xl font-extrabold">Admission calculators</h2>
            <p className="text-ink-muted">Points calculators are published only where an admissions body publishes its formula, such as the UCAS Tariff (UK, 2027 entry). Where admission has no formula, we explain how it works and link to the official portal. No calculator here predicts your chance of admission.</p>
          </div>
          <Link href="/admissions/calculators" className="btn-primary">Find a calculator</Link>
        </section>
      </Container>
    </>
  );
}
