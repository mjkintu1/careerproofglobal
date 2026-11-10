import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { admissionSystemsFor, educationStructure, higherEducationRegulators, iscedMapping, iscedMeta, institutionCounts, uisMeta } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { EducationStructureCard } from "@/components/admissions/education-structure";
import { IscedEntryCard } from "@/components/admissions/isced-entry";
import { SystemCard } from "@/components/admissions/system-card";
import { RegulatorList } from "@/components/admissions/regulator-list";
import { findLocation } from "@/lib/careers";

/** Countries with their own admissions page. */
const DEDICATED: Record<string, string> = { UG: "/admissions/uganda", KE: "/admissions/kenya" };

export function generateStaticParams() {
  return [{ country: "ng" }];
}

export async function generateMetadata({ params }: PageProps<"/admissions/[country]">): Promise<Metadata> {
  const loc = findLocation((await params).country);
  return loc
    ? { title: `University admission in ${loc.name}: entry requirements`, description: `Official minimum entry requirements, school system and higher-education regulator for ${loc.name}, from UNESCO and national sources.` }
    : {};
}

async function CountryAdmission({ params }: Pick<PageProps<"/admissions/[country]">, "params">) {
  const loc = findLocation((await params).country);
  if (!loc) notFound();
  if (DEDICATED[loc.code]) redirect(DEDICATED[loc.code]!);
  const entry = iscedMapping(loc.code);
  const structure = educationStructure(loc.code);
  const systems = admissionSystemsFor(loc.code);
  const { regulators, sources } = higherEducationRegulators(loc.code);
  const institutions = institutionCounts[loc.code] ?? 0;
  return (
    <>
      <PageBand kicker="Admission standards" title={`University admission in ${loc.name}`}
        intro="Official minimum entry requirements and the school system, from the country's UNESCO classification and national sources." />
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {systems.length > 0 && (
            <section aria-labelledby="tools" className="space-y-3">
              <h2 id="tools" className="text-xl font-extrabold">Admission tools and guides</h2>
              <div className="grid gap-4 md:grid-cols-2">{systems.map((s) => <SystemCard key={s.id} s={s} />)}</div>
            </section>
          )}
          {entry ? <IscedEntryCard entry={entry} meta={iscedMeta} /> : (
            <div className="card p-5">
              <h3 className="text-lg font-bold">Official entry requirements</h3>
              <p className="text-ink-muted">UNESCO has not published an ISCED mapping for {loc.name}. Check with the regulator below.</p>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <EducationStructureCard s={structure} attribution={uisMeta.attribution} licenceUrl={uisMeta.licenceUrl} />
          <div className="card space-y-2 p-5">
            <h3 className="text-lg font-bold">Regulators and quality agencies</h3>
            <RegulatorList regulators={regulators} sources={sources} />
          </div>
          <div className="card space-y-1 p-5">
            <h3 className="text-lg font-bold">Universities and colleges</h3>
            {institutions ? <Link href={`/institutions/${loc.code.toLowerCase()}`}>{institutions.toLocaleString("en")} institutions in {loc.name}</Link> : <p className="text-ink-muted">None listed yet.</p>}
          </div>
          <p className="text-sm"><Link href="/admissions">All countries</Link></p>
        </aside>
      </Container>
    </>
  );
}

export default function CountryAdmissionPage({ params }: PageProps<"/admissions/[country]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading...</p></Container>}>
      <CountryAdmission params={params} />
    </Suspense>
  );
}
