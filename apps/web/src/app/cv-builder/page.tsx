import type { Metadata } from "next";
import Link from "next/link";
import { CitedFact, Guidance } from "@/components/cited";
import { Container } from "@/components/container";
import { CvBuilderLoader } from "@/components/cv/cv-builder-loader";
import { PageBand } from "@/components/page-band";
import { cvCareers } from "@/lib/cv-careers";

export const metadata: Metadata = {
  title: "Free CV and résumé builder",
  description: "Build a clear CV or US-style résumé in your browser, with skills suggested for your target career. Nothing is uploaded: print it, save it as PDF or download it for Word.",
  alternates: { canonical: "/cv-builder" },
};

const ukFacts = [
  { text: "A CV should have your contact details, a short introduction, your education, your work history and, if you want, a references section.", source: "ncs-cv" },
  { text: "Leave out your age, date of birth, marital status and nationality.", source: "ncs-cv" },
  { text: "Put education first if you are early in your career; put work history first if you have a lot of experience. List the most recent experience first, with 2 to 3 lines on what you did.", source: "ncs-cv" },
  { text: "Do not put a referee's contact details on your CV; 'references available on request' is enough.", source: "ncs-cv" },
  { text: "The STAR method (Situation, Task, Action, Result) is a way to describe what you did and what came of it.", source: "ncs-cv" },
];
const usFacts = [
  { text: "US law makes it illegal for employers to discriminate against applicants because of race, colour, religion, sex, national origin, age (40 or older), disability or genetic information.", source: "eeoc-practices" },
];
const euFacts = [
  { text: "Europass is the EU's free CV builder, a format familiar to employers and education institutions across Europe.", source: "europass" },
];

export default function Page() {
  return (
    <>
      <PageBand kicker="Career Tools" title="CV and résumé builder"
        intro="Write a clear, one-column CV that people and applicant-tracking systems can read. It stays in your browser: nothing is uploaded, and you can print it, save it as a PDF or download it for Word." />
      <Container className="space-y-12 py-10">
        <CvBuilderLoader careers={cvCareers()} />

        <section aria-labelledby="conventions" className="space-y-6 print:hidden">
          <h2 id="conventions" className="text-2xl font-extrabold">What goes on a CV, by region</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="card space-y-2 p-5">
              <h3 className="font-display text-lg font-bold">UK</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">{ukFacts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
            </article>
            <article className="card space-y-2 p-5">
              <h3 className="font-display text-lg font-bold">United States</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">{usFacts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
              <Guidance>Because of these rules, US employers generally do not want a photo, date of birth or marital status on a résumé. Keep it to what shows you can do the job.</Guidance>
            </article>
            <article className="card space-y-2 p-5">
              <h3 className="font-display text-lg font-bold">Europe</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">{euFacts.map((f) => <CitedFact key={f.text} {...f} />)}</ul>
              <p className="text-sm"><a href="https://europass.europa.eu/en/create-europass-cv">Create a Europass CV</a></p>
            </article>
          </div>
          <Guidance>
            In Uganda, Kenya and much of Africa, CVs sometimes include a photo, date of birth or marital status, but no law requires them. We leave them out of this builder: they take space, can lead to unfair treatment, and say nothing about whether you can do the job. Follow an employer&apos;s instructions if it asks for something specific.
            Match your CV to each job: use the words from the job advert for skills you really have, and back each one with an example.
          </Guidance>
          <p className="text-sm">Next: <Link href="/negotiate-salary">negotiating pay when a range is posted</Link> and <Link href="/job-market">finding work safely</Link>.</p>
        </section>
      </Container>
    </>
  );
}
