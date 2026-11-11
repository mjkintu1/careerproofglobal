import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import { dataSources, type DataSource } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";

export const metadata: Metadata = seo("/data-licences", {
  title: "Copyright and data licences",
  description: "Copyright in CareerProof Global's content, and every official data source the site uses, with its licence and required attribution.",
});

const link = (href: string | null, text: string) => (href ? <a href={href} rel="noopener">{text}</a> : <>{text}</>);

function SourceTable({ rows }: { rows: DataSource[] }) {
  return (
    <div className="card relative overflow-x-auto p-0">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 text-left">
          <tr><th scope="col" className="px-3 py-2">Source</th><th scope="col" className="px-3 py-2">Licence</th><th scope="col" className="px-3 py-2">Attribution</th></tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.slug} className="border-t border-border align-top">
              <th scope="row" className="px-3 py-2 text-left font-semibold">{link(s.url, s.name)}<span className="block text-xs font-normal text-ink-muted">{s.publisher}</span></th>
              <td className="px-3 py-2">{link(s.licence_url, s.licence)}</td>
              <td className="px-3 py-2 text-ink-muted">{s.attribution}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const by = (st: DataSource["status"]) => dataSources.filter((s) => s.status === st).sort((a, b) => a.name.localeCompare(b.name));
  const active = by("active");
  const h2 = "font-display text-xl font-bold text-ink";
  return (
    <>
      <PageBand kicker="Legal" title="Copyright and data licences" intro="Who owns what on this site, and every official data source we use, with its licence and the credit it requires." />
      <Container className="space-y-10 py-10 text-ink">
        <section className="max-w-3xl space-y-2">
          <h2 className={h2}>Our content</h2>
          <p>Text, design, career guides, route rankings and the software on this site are © 2026 CareerProof Global. You may link to any page and quote short extracts with a link back. Please ask before republishing larger parts.</p>
          <p>Data from the sources below remains under its own licence. Where a licence allows reuse (for example CC BY 4.0 or the Open Government Licence), you may reuse that data from the original source on the same terms, with the credit shown.</p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>Data sources in use ({active.length})</h2>
          <p className="max-w-3xl text-sm text-ink-muted">Each figure on the site also names its source and date where it appears. Government publications without a stated open licence are reproduced as facts with attribution.</p>
          <SourceTable rows={active} />
        </section>

        <details className="space-y-3">
          <summary className="cursor-pointer font-display text-lg font-bold">Planned sources, and sources reviewed and not used ({by("planned").length + by("retired").length})</summary>
          <div className="mt-3 space-y-6">
            <div className="space-y-2"><h3 className="font-bold">Planned</h3><SourceTable rows={by("planned")} /></div>
            <div className="space-y-2"><h3 className="font-bold">Reviewed and not used, or retired</h3><SourceTable rows={by("retired")} /></div>
          </div>
        </details>
      </Container>
    </>
  );
}
