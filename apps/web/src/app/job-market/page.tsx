import type { Metadata } from "next";
import Link from "next/link";
import { CitedFact, Guidance } from "@/components/cited";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";

export const metadata: Metadata = {
  title: "Finding work safely: the job market guide",
  description: "Official rules on recruitment fees and job scams, official job services, and checking recruitment agencies before you work abroad, with guides for a first job, a career change and working abroad.",
  alternates: { canonical: "/job-market" },
};

const noFees = [
  { where: "Worldwide (ILO)", facts: [{ text: "The ILO Private Employment Agencies Convention, 1997 (No. 181), Article 7(1), says private employment agencies shall not charge workers any fees or related costs, directly or indirectly. Countries that ratify it may allow limited exceptions.", source: "ilo-recruitment-fees" }] },
  { where: "South Africa", facts: [
    { text: "Under the Employment Services Act, no one may charge a work seeker a fee for employment services, and a private employment agency may not deduct placement costs from a worker's pay.", source: "za-dol-no-fees" },
    { text: "The Department of Employment and Labour provides public employment services free of charge, including registering work seekers and job vacancies.", source: "za-dol-no-fees" },
  ] },
  { where: "United Kingdom", facts: [{ text: "Recruitment agencies cannot charge you a fee for finding or trying to find you work. They may charge for optional services such as CV writing or training, but cannot make you use them to get work.", source: "uk-agency-fees" }] },
  { where: "United States", facts: [{ text: "Honest employers, including the federal government, never ask you to pay to get a job, and honest placement firms do not usually charge job seekers. Report job scams at ReportFraud.ftc.gov.", source: "ftc-job-scams" }] },
];

const services = [
  { where: "Uganda: jobs abroad", facts: [
    { text: "Recruitment of Ugandans for work abroad must go through labour export companies licensed by the Ministry of Gender, Labour and Social Development; its External Employment Unit enforces the rules.", source: "ug-mglsd-external-employment" },
    { text: "The ministry's EEMIS portal lists jobs abroad and recruitment companies that it has vetted and approved.", source: "ug-mglsd-external-employment" },
  ], link: { href: "https://eemis.mglsd.go.ug/", label: "Check a company on EEMIS" } },
  { where: "United Kingdom", facts: [{ text: "GOV.UK Find a job is the government's service for finding and applying for jobs in England, Scotland and Wales.", source: "uk-find-a-job" }], link: { href: "https://www.gov.uk/find-a-job", label: "GOV.UK Find a job" } },
  { where: "South Africa", facts: [{ text: "The Department of Employment and Labour registers work seekers and vacancies free of charge through its labour centres.", source: "za-dol-no-fees" }], link: { href: "https://www.labour.gov.za/", label: "Department of Employment and Labour" } },
];

const stages = [
  { title: "Your first job", points: [
    ["Know what employers in the field ask for", "/careers/global", "Read the ways in and skills on the career pages"],
    ["Write a CV for each application", "/cv-builder", "Build your CV"],
    ["Use official job services first", "#services", "Official job services"],
  ] },
  { title: "Changing career", points: [
    ["See routes from your current job, with the qualifications in between", "/paths", "Plan a route"],
    ["Check pay in the new field before you commit", "/pay-coverage", "Pay data by country"],
    ["Short certifications can bridge some moves", "/certifications", "Certifications"],
  ] },
  { title: "Working abroad", points: [
    ["Check how your qualifications are recognised there", "/curricula#recognition", "Recognition by country"],
    ["Use only licensed recruiters, and never pay a recruiter for a job", "#fees", "Recruitment fee rules"],
    ["Check what the job pays against official figures", "/negotiate-salary", "Check a pay offer"],
  ] },
];

function FactCards({ items }: { items: { where: string; facts: { text: string; source: string }[]; link?: { href: string; label: string } }[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((x) => (
        <article key={x.where} className="card space-y-2 p-5">
          <h3 className="font-display text-lg font-bold">{x.where}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{x.facts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
          {x.link && <p className="text-sm font-semibold"><a href={x.link.href}>{x.link.label} &rarr;</a></p>}
        </article>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PageBand kicker="Your Journey" title="Finding work safely"
        intro="Where to look for work, what the law says about recruitment fees, and how to spot a fake job offer, from official sources." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="stages" className="space-y-4">
          <h2 id="stages" className="text-2xl font-extrabold">Where are you starting from?</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {stages.map((s) => (
              <article key={s.title} className="card space-y-3 p-5">
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <ul className="space-y-2 text-sm">{s.points.map(([t, href, label]) => <li key={t}>{t}. <Link href={href!} className="font-semibold">{label} &rarr;</Link></li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section id="fees" aria-labelledby="fees-h" className="space-y-4">
          <h2 id="fees-h" className="text-2xl font-extrabold">Never pay to get a job</h2>
          <FactCards items={noFees} />
          <Guidance>Warning signs of a fake job: a fee for the job, training, a medical or a visa paid to a recruiter; an offer without an interview; pressure to decide fast; contact only through a messaging app; or a request for your ID or bank details before any offer. Check the company with the official body in your country, and talk it over with someone you trust before you pay or travel.</Guidance>
        </section>

        <section id="services" aria-labelledby="services-h" className="space-y-4">
          <h2 id="services-h" className="text-2xl font-extrabold">Official job services and recruiter checks</h2>
          <FactCards items={services} />
          <p className="text-sm text-ink-muted">Kenya: we could not read the National Employment Authority&apos;s website when we checked (11 November 2026), so we have not added its services yet.</p>
        </section>
      </Container>
    </>
  );
}
