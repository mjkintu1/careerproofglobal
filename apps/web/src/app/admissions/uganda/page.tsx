import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { educationStructure, nche, uisMeta, ugandaAdmissionSources, ugandaCutoffNotes, ugandaCutoffs, ugandaProgrammes } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { CutoffTable, InstitutionTable } from "@/components/admissions/uganda-tables";
import { EducationStructureCard } from "@/components/admissions/education-structure";

export const metadata: Metadata = seo("/admissions/uganda", {
  title: "Uganda university admission: cut-off points and accredited programmes",
  description: "Official cut-off points for six Ugandan public universities (2023/24 to 2025/26), the national weighting system, and every programme accredited by the National Council for Higher Education.",
});

export default function UgandaAdmissionsPage() {
  const active = nche.programmes.filter((p) => p.s === "Active");
  const byLevel = Object.entries(active.reduce<Record<string, number>>((m, p) => ({ ...m, [p.l]: (m[p.l] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]);
  const universities = new Set(ugandaCutoffs.map((r) => r.university)).size;
  const stats: [string, string][] = [
    [nche.institutions.length.toLocaleString("en"), "institutions registered by NCHE"],
    [active.length.toLocaleString("en"), "active accredited programmes"],
    [ugandaCutoffs.length.toLocaleString("en"), `programmes with 3 years of cut-offs (${universities} universities)`],
    [String(ugandaProgrammes.length), "Makerere programmes in the points calculator"],
  ];
  return (
    <>
      <PageBand kicker="Admission standards" title="Uganda: university admission data"
        intro="Published cut-off points, the national weighting system and every accredited programme, taken from official sources." />
      <Container className="space-y-12 py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([n, label]) => (
            <li key={label} className="card p-5"><p className="font-display text-3xl font-extrabold text-teal-800">{n}</p><p className="text-ink-muted">{label}</p></li>
          ))}
        </ul>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="calc" className="card flex flex-wrap content-start items-center justify-between gap-4 border-l-4 border-l-teal-500 p-6">
          <div className="max-w-2xl space-y-1">
            <h2 id="calc" className="text-xl font-extrabold">Work out your weighted points</h2>
            <p className="text-ink-muted">The calculator applies the official weighting system (essential x3, relevant x2, desirable x1, O-level weight, 1.5 points for female candidates) and compares your points with Makerere&apos;s last three cut-offs.</p>
          </div>
          <Link href="/simulator" className="btn-primary">Open the calculator</Link>
        </section>
        <EducationStructureCard s={educationStructure("UG")} attribution={uisMeta.attribution} licenceUrl={uisMeta.licenceUrl} />
        </div>

        <section aria-labelledby="cutoffs" className="space-y-4">
          <div>
            <h2 id="cutoffs" className="text-2xl font-extrabold">Government-sponsorship cut-off points</h2>
            <p className="text-ink-muted">The lowest weighted points admitted on government sponsorship. F and M are the separate female and male cut-offs used for STEM programmes.</p>
          </div>
          <CutoffTable rows={ugandaCutoffs} />
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">{ugandaCutoffNotes.map((n) => <li key={n}>{n}</li>)}</ul>
        </section>

        <section aria-labelledby="accredited" className="space-y-4">
          <div>
            <h2 id="accredited" className="text-2xl font-extrabold">Accredited institutions and programmes</h2>
            <p className="text-ink-muted">From the National Council for Higher Education. Check a programme&apos;s accreditation before you apply: it can expire.</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {byLevel.map(([level, n]) => <li key={level} className="chip bg-teal-50 text-teal-800">{level}: {n.toLocaleString("en")}</li>)}
          </ul>
          <InstitutionTable rows={nche.institutions.map(({ name, category, status, district, programmes }) => ({ name, category, status, district, programmes }))} />
          <p className="text-sm">Search all programmes on the <a href={nche.meta.programmesUrl}>NCHE programme register</a>.</p>
        </section>

        <section aria-labelledby="sources" className="space-y-2 text-sm">
          <h2 id="sources" className="text-lg font-bold">Sources (checked {nche.meta.checkedAt})</h2>
          <ul className="list-disc space-y-1 pl-5">
            {ugandaAdmissionSources.map((s) => <li key={s.url}><a href={s.url}>{s.name}</a></li>)}
            <li><a href={nche.meta.institutionsUrl}>{nche.meta.source}: registered institutions</a> and <a href={nche.meta.programmesUrl}>accredited programmes</a></li>
          </ul>
        </section>
      </Container>
    </>
  );
}
