import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, ExternalLink, MapPin } from "lucide-react";
import { higherEducationRegulators, institutionAttribution, institutionsIn } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { findLocation } from "@/lib/careers";

export function generateStaticParams() {
  return [{ country: "ug" }];
}

export async function generateMetadata({ params }: PageProps<"/institutions/[country]">): Promise<Metadata> {
  const loc = findLocation((await params).country);
  return loc ? { title: `Universities and colleges in ${loc.name}`, description: `Education institutions in ${loc.name}, with websites and the national regulator.` } : {};
}

async function CountryContent({ params }: Pick<PageProps<"/institutions/[country]">, "params">) {
  const code = (await params).country;
  const loc = findLocation(code);
  if (!loc) notFound();
  const list = institutionsIn(loc.code);
  const { regulators, source, sourceUrl } = higherEducationRegulators(loc.code);
  return (
    <>
      <PageBand kicker="Where to study" title={`Universities and colleges in ${loc.name}`}
        intro={`${list.length.toLocaleString("en")} education institutions listed in the Research Organization Registry.`}>
        <p><Link href={`/careers/${loc.code.toLowerCase()}`} className="text-white">Explore career paths in {loc.name}</Link></p>
      </PageBand>
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="list-heading" className="space-y-3">
          <h2 id="list-heading" className="text-xl font-extrabold">Institutions ({list.length})</h2>
          {list.length === 0 ? <p className="text-ink-muted">None listed for {loc.name} yet.</p> : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {list.map((i) => (
                <li key={i.rorId} className="card space-y-1 p-4">
                  <p className="font-display font-bold">{i.name}{i.acronym ? ` (${i.acronym})` : ""}</p>
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                    {i.city && <span className="inline-flex items-center gap-1"><MapPin aria-hidden="true" size={14} /> {i.city}</span>}
                    {i.established && <span>Founded {i.established}</span>}
                  </p>
                  <p className="flex flex-wrap gap-x-4 text-sm">
                    {i.website && <a href={i.website} rel="noopener noreferrer" className="inline-flex items-center gap-1">Website <ExternalLink aria-hidden="true" size={12} /></a>}
                    <a href={`https://ror.org/${i.rorId}`} rel="noopener noreferrer">ROR record</a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="space-y-5" aria-label="Recognition">
          <div className="card space-y-2 p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><BadgeCheck aria-hidden="true" size={18} className="text-teal-700" /> Recognition</h2>
            <p className="text-sm">Being listed here is not accreditation. Check that an institution and programme are recognised by the national regulator.</p>
            {regulators.length > 0 && (
              <>
                <ul className="space-y-1 text-sm font-semibold">{regulators.map((r) => <li key={r.name}>{r.website ? <a href={r.website}>{r.name}</a> : r.name}</li>)}</ul>
                {regulators.some((r) => r.status === "listed") && <p className="text-xs text-ink-muted">As listed by <a href={sourceUrl}>{source}</a>; confirm on the regulator&apos;s website.</p>}
              </>
            )}
          </div>
          <p className="text-xs text-ink-muted">{institutionAttribution.source}. <a href={institutionAttribution.url}>{institutionAttribution.text}</a></p>
        </aside>
      </Container>
    </>
  );
}

export default function CountryInstitutionsPage({ params }: PageProps<"/institutions/[country]">) {
  return (
    <Suspense fallback={<Container className="py-10"><p className="text-ink-muted">Loading institutions...</p></Container>}>
      <CountryContent params={params} />
    </Suspense>
  );
}
