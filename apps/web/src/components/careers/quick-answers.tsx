import type { Answer } from "@/lib/career-answers";

/** Answer-first summary near the top of a career page; mirrored in the page's FAQPage data. */
export function QuickAnswers({ answers }: { answers: Answer[] }) {
  if (!answers.length) return null;
  return (
    <section aria-labelledby="quick-answers-heading" className="card space-y-4 p-5">
      <h2 id="quick-answers-heading" className="text-lg font-extrabold">Quick answers</h2>
      <dl className="space-y-3">
        {answers.map((x) => (
          <div key={x.question}>
            <dt className="font-semibold">{x.question}</dt>
            <dd className="text-ink-muted">{x.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
