import type { Metadata } from "next";
import { Suspense } from "react";
import { admissionMeta, admissionSystems, admissionSystemsPending, admissionTiers, higherEducationRegulators, institutionCounts, type AdmissionTier } from "@careerproof/reference-data";
import { careerGraphData } from "@careerproof/sample-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CalculatorFinder, type CountryInfo } from "@/components/admissions/calculator-finder";
import { SystemCard } from "@/components/admissions/system-card";

export const metadata: Metadata = {
  title: "Admission calculators by country",
  description: "Points calculators where an admissions body publishes its formula, such as the UCAS Tariff, and plain explanations where admission has no formula.",
};

const TIER_TITLES: Record<Exclude<AdmissionTier, "eligibility">, string> = {
  points: "Points calculators",
  explainer: "How admission works (no formula)",
};

export default function CalculatorsPage() {
  const countries = careerGraphData.locations.map((l) => ({ code: l.code, name: l.name }));
  const info: Record<string, CountryInfo> = Object.fromEntries(
    careerGraphData.locations.map((l) => [l.code, {
      regulators: higherEducationRegulators(l.code).regulators.map(({ name, website }) => ({ name, website })),
      institutions: institutionCounts[l.code] ?? 0,
    }]),
  );
  return (
    <>
      <PageBand kicker="Career tools" title="Admission calculators"
        intro="Every country admits students differently. We only calculate where an admissions body publishes its formula, and say so when a result is illustrative." />
      <Container className="space-y-12 py-10">
        <Suspense fallback={<div className="card h-48 animate-pulse" aria-hidden="true" />}>
          <CalculatorFinder countries={countries} systems={admissionSystems} info={info} />
        </Suspense>
        {(Object.keys(TIER_TITLES) as (keyof typeof TIER_TITLES)[]).map((tier) => (
          <section key={tier} aria-labelledby={`tier-${tier}`} className="space-y-4">
            <div>
              <h2 id={`tier-${tier}`} className="text-2xl font-extrabold">{TIER_TITLES[tier]}</h2>
              <p className="text-ink-muted">{admissionTiers[tier]}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {admissionSystems.filter((s) => s.tier === tier).map((s) => <SystemCard key={s.id} s={s} />)}
            </div>
          </section>
        ))}
        <section aria-labelledby="everywhere" className="card space-y-2 border-l-4 border-l-teal-500 p-6">
          <h2 id="everywhere" className="text-xl font-extrabold">Everywhere else: minimum requirements</h2>
          <p>{admissionTiers.eligibility} Search your country above to see its regulator and institutions.</p>
        </section>
        <section aria-labelledby="coming" className="space-y-3">
          <h2 id="coming" className="text-xl font-extrabold">Being confirmed</h2>
          <ul className="card divide-y divide-line">
            {admissionSystemsPending.map((p) => (
              <li key={p.name} className="px-5 py-3"><span className="font-semibold">{p.name}.</span> <span className="text-ink-muted">{p.reason}</span></li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted"><strong>How we decide:</strong> {admissionMeta.method}</p>
        </section>
      </Container>
    </>
  );
}
