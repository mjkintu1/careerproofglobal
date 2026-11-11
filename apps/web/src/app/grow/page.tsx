import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Quote, Sparkles } from "lucide-react";
import { allProfessionals } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";
import { graph } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Grow your career: habits and real career stories",
  description: "Habits that help careers grow, and real stories from professionals who share how they got where they are.",
};

/** In our own words, adapted from CASE's list (credited below); grouped into ten themes. */
const HABITS: { title: string; body: string }[] = [
  { title: "Plan for the next role", body: "Find out which skills your next job needs and start building them now." },
  { title: "Speak up", body: "Share ideas and questions in meetings; people notice those who contribute." },
  { title: "Learn from people you admire", body: "Watch how respected professionals communicate, prepare and carry themselves, and adapt what works." },
  { title: "Take ownership", body: "Look for problems you can help solve instead of waiting to be asked; that is how leaders start." },
  { title: "Be dependable", body: "Meet deadlines, reply on time, arrive on time and stay out of gossip." },
  { title: "Keep a record of your wins", body: "Write down what you achieve and bring it to performance reviews and interviews." },
  { title: "Keep learning", body: "Make professional development a habit, and listen to feedback with an open mind." },
  { title: "Improve how things work", body: "Notice where time or money is wasted and suggest a better way." },
  { title: "Own mistakes and ask for help", body: "Admit errors early, fix them, and ask for support when you need it; stay positive." },
  { title: "Protect your best work", body: "Learn to say no to what distracts you, and ask for the tools and time that help you do well." },
];

const STORY_PARTS = [
  ["Background", "Where they started: school, subjects, first steps."],
  ["Turning point", "The decision or event that changed their path."],
  ["Steps", "What they did: study, certifications, jobs, moves."],
  ["Result", "Where they are now."],
  ["Lesson", "One piece of advice for students."],
] as const;

export default function GrowPage() {
  const stories = allProfessionals();
  return (
    <>
      <PageBand kicker="Your journey" title="Grow your career"
        intro="Habits that help careers grow, and real stories from professionals who share how they got where they are." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="habits" className="space-y-4">
          <h2 id="habits" className="flex items-center gap-2 text-2xl font-extrabold"><Sparkles aria-hidden="true" size={24} className="text-teal-700" /> Habits that help careers grow</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HABITS.map((h, i) => (
              <li key={h.title} className="card flex gap-3 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-50 font-bold text-gold-800">{i + 1}</span>
                <div><p className="font-bold">{h.title}</p><p className="text-ink-muted">{h.body}</p></div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-ink-muted">
            Adapted in our own words from <a href="https://www.case.org/resources/15-habits-successful-professionals">CASE, &quot;15 Habits of Successful Professionals&quot;</a> (26 February 2024).
          </p>
        </section>

        <section aria-labelledby="stories" className="space-y-4">
          <h2 id="stories" className="flex items-center gap-2 text-2xl font-extrabold"><BookOpen aria-hidden="true" size={24} className="text-teal-700" /> Real career stories</h2>
          <p className="max-w-3xl text-ink-muted">
            Each story is told by the professional, with their consent and a link to their own LinkedIn profile. We do not retell other
            websites&apos; stories or collect anything from LinkedIn.
          </p>
          <ol className="flex flex-wrap gap-2">
            {STORY_PARTS.map(([t, d], i) => <li key={t} className="chip bg-surface-muted text-ink" title={d}>{i + 1}. {t}</li>)}
          </ol>
          {stories.length ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {stories.map((p) => (
                <li key={p.linkedin} className="card space-y-2 p-5">
                  <p className="font-display text-lg font-bold"><a href={p.linkedin} rel="noopener" target="_blank">{p.name}</a></p>
                  <p className="text-sm text-ink-muted">{p.headline} · <Link href={`/careers/global/${p.career}`}>{graph.get(p.career)?.title ?? p.career}</Link></p>
                  {p.background && <p><span className="font-semibold">Background: </span>{p.background}</p>}
                  {p.turningPoint && <p><span className="font-semibold">Turning point: </span>{p.turningPoint}</p>}
                  {p.steps?.length ? <ul className="list-disc pl-5">{p.steps.map((s) => <li key={s}>{s}</li>)}</ul> : null}
                  {p.result && <p><span className="font-semibold">Now: </span>{p.result}</p>}
                  {p.lesson && <p className="flex gap-2 border-l-4 border-teal-500 pl-3 italic"><Quote aria-hidden="true" size={16} className="shrink-0 text-teal-700" />{p.lesson}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="card p-5">
              <p className="font-bold">The first stories are being collected.</p>
              <p className="text-ink-muted">We are inviting professionals in Uganda and across Africa to share how they chose their subjects, studies and first jobs.</p>
            </div>
          )}
        </section>

        <section aria-labelledby="next" className="grid gap-4 md:grid-cols-2">
          <Link href="/certifications" className="card card-link p-5 text-ink no-underline hover:text-ink">
            <h2 id="next" className="text-lg font-bold">Certifications that move careers</h2>
            <p className="text-ink-muted">How to judge one, and issuer-checked facts on ACCA, CFA, PMP and more.</p>
          </Link>
          <Link href="/paths" className="card card-link p-5 text-ink no-underline hover:text-ink">
            <h2 className="text-lg font-bold">Plan your next move</h2>
            <p className="text-ink-muted">Find the quickest known route from your career today to the one you want.</p>
          </Link>
        </section>
      </Container>
    </>
  );
}
