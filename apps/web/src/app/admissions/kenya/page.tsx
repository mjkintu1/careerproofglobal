import type { Metadata } from "next";
import Link from "next/link";
import { educationStructure, higherEducationRegulators, institutionCounts, kenya, uisMeta } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { EducationStructureCard } from "@/components/admissions/education-structure";
import { RegulatorList } from "@/components/admissions/regulator-list";

export const metadata: Metadata = {
  title: "Kenya university admission: KCSE, KUCCPS and the education system",
  description: "How Kenya's education system and university placement work, from UNESCO IICBA's country brief and the official bodies (KNEC, KUCCPS, CUE).",
};

const sourceOf = (id: string) => kenya.meta.sources.find((s) => s.id === id)!;

function Facts({ items }: { items: { fact: string; source: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((f) => (
        <li key={f.fact} className="card p-4">
          <p>{f.fact}</p>
          <p className="mt-1 text-xs text-ink-muted">Source: <a href={sourceOf(f.source).url}>{sourceOf(f.source).name}</a></p>
        </li>
      ))}
    </ul>
  );
}

export default function KenyaAdmissionsPage() {
  const regulators = higherEducationRegulators("KE");
  const institutions = institutionCounts.KE ?? 0;
  return (
    <>
      <PageBand kicker="Admission standards" title="Kenya: how admission works"
        intro="The education system, national examinations and university placement, from official and UNESCO sources." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="pending" className="card space-y-2 border-l-4 border-l-gold-400 p-6">
          <h2 id="pending" className="text-xl font-extrabold">{kenya.pending.what}: coming next</h2>
          <p>{kenya.pending.why}</p>
          <ul className="list-disc space-y-1 pl-5 text-ink-muted">{kenya.pending.route.map((r) => <li key={r}>{r}</li>)}</ul>
          <p className="text-sm">Until then, check cluster subjects and cut-offs on the official <a href={sourceOf("kuccps").url}>KUCCPS student portal</a>.</p>
        </section>

        <section aria-labelledby="system" className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <h2 id="system" className="text-2xl font-extrabold">The education system</h2>
            <Facts items={kenya.system} />
          </div>
          <div className="space-y-3">
            <EducationStructureCard s={educationStructure("KE")} attribution={uisMeta.attribution} licenceUrl={uisMeta.licenceUrl} />
            <p className="text-xs text-ink-muted">UNESCO reports the structure Kenya classifies in its latest return, which may still reflect the system before the competency-based curriculum.</p>
          </div>
        </section>

        <section aria-labelledby="placement" className="space-y-4">
          <h2 id="placement" className="text-2xl font-extrabold">University placement</h2>
          <Facts items={kenya.placement} />
        </section>

        <section aria-labelledby="where" className="grid gap-4 md:grid-cols-2">
          <div className="card space-y-2 p-5">
            <h2 id="where" className="text-lg font-bold">Higher-education regulators</h2>
            <RegulatorList regulators={regulators.regulators} sources={regulators.sources} />
          </div>
          <div className="card space-y-2 p-5">
            <h2 className="text-lg font-bold">Universities and colleges</h2>
            <p><Link href="/institutions/ke">{institutions.toLocaleString("en")} institutions in Kenya</Link> (Research Organization Registry).</p>
            <p className="text-sm text-ink-muted">Listing is not accreditation: check with the Commission for University Education.</p>
          </div>
        </section>

        <p className="text-sm text-ink-muted">Checked {kenya.meta.checkedAt}. <Link href="/admissions/calculators?country=ke">All admission tools for Kenya</Link></p>
      </Container>
    </>
  );
}
