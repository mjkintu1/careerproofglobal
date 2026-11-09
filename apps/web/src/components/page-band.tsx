import { Container } from "./container";

/** Navy title band used at the top of section pages. */
export function PageBand({ kicker, title, intro, children }: { kicker?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white">
      <Container className="space-y-4 py-10 sm:py-12">
        {kicker && <p className="chip bg-navy-800 text-teal-500">{kicker}</p>}
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {intro && <p className="max-w-3xl text-lg text-slate-300">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
