import Link from "next/link";

interface Module {
  id: string;
  title: string;
  body: string;
  href?: string;
}

const modules: Module[] = [
  {
    id: "simulator",
    title: "Admission simulator",
    body: "Enter your results to see your points and which programmes you are likely to get. Works for Uganda and Kenya.",
    href: "/simulator",
  },
  {
    id: "sandbox",
    title: "Subject what-if",
    body: "Change your subjects and see which degrees open up or close, and why.",
    href: "/simulator#closed-heading",
  },
  {
    id: "scholarships",
    title: "Scholarships",
    body: "Find scholarships and check which ones your results and chosen field may qualify you for.",
  },
  {
    id: "internships",
    title: "Verified internships",
    body: "Browse internships from organisations we have verified, linked to the programmes and careers they suit.",
  },
  {
    id: "pathways",
    title: "Career pathways",
    body: "Follow subjects through degrees to careers, and see real people who took each path.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight">
          Plan your next step with real admission data
        </h1>
        <p className="max-w-prose text-lg text-ink-muted">
          Career Proof shows how your results, subjects and choices connect to
          university programmes and careers across Africa, starting with Uganda.
        </p>
        <p>
          <Link
            href="/simulator"
            className="inline-flex min-h-11 items-center bg-teal-700 px-4 font-bold text-white no-underline hover:bg-teal-800 hover:text-white"
          >
            Try the admission simulator
          </Link>
        </p>
      </section>

      <section aria-labelledby="tools-heading" className="space-y-4">
        <h2 id="tools-heading" className="text-xl font-bold">
          Tools
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {modules.map((m) => (
            <li key={m.id} className="border-2 border-border p-4">
              <h3 className="text-lg font-bold">
                {m.href ? <Link href={m.href}>{m.title}</Link> : m.title}
              </h3>
              <p className="mt-2 text-ink-muted">{m.body}</p>
              <p className={`mt-3 text-sm font-semibold ${m.href ? "text-zone-safe" : "text-gold-800"}`}>
                {m.href ? "Demo available" : "Coming soon"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
