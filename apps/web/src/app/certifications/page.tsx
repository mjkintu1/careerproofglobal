import type { Metadata } from "next";
import Link from "next/link";
import { Award, BadgeCheck, Building2, Coins, Scale, Search } from "lucide-react";
import { certificationMethod, certifications, certificationsCheckedAt, certificationsPending } from "@careerproof/reference-data";
import { Container } from "@/components/container";
import { PageBand } from "@/components/page-band";

export const metadata: Metadata = {
  title: "Certifications and accreditation: a guide",
  description: "How to judge a certification or accreditation, and verified facts on professional certifications such as ACCA, CFA, PMP, CISSP, CCNA and AWS.",
};

const checks = [
  { Icon: Building2, title: "Who issues it?", body: "A professional body, a technology company, a university or a training provider. Professional bodies and major vendors usually carry the most weight with employers." },
  { Icon: Scale, title: "Is it required to practise?", body: "Some careers need a licence or registration from a national body, for example nursing, medicine, engineering and law. A certificate does not replace that licence." },
  { Icon: BadgeCheck, title: "Is the provider recognised?", body: "Education providers are accredited by national regulators. Private accreditation bodies are not always recognised by governments or employers, so check the regulator in your country." },
  { Icon: Search, title: "Do employers ask for it?", body: "Look at real job adverts in your country for the role you want. If the certification appears often, it is worth considering." },
  { Icon: Coins, title: "What is the full cost?", body: "Count exam fees, study materials, membership, renewal fees and continuing education, not just the course price." },
  { Icon: Award, title: "Can it be verified?", body: "Genuine issuers let employers check a credential, for example through a member register or a digital badge." },
];

export default function CertificationsPage() {
  const categories = [...new Set(certifications.map((c) => c.category))];
  return (
    <>
      <PageBand kicker="Your journey" title="Certifications and accreditation"
        intro="Professional qualifications and certifications can open doors, change fields or speed up a promotion. Here is how to judge one, with verified facts on widely used certifications." />
      <Container className="space-y-12 py-10">
        <section aria-labelledby="guide-heading" className="space-y-5">
          <h2 id="guide-heading" className="text-2xl font-extrabold">How to judge a certification</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map(({ Icon, title, body }) => (
              <li key={title} className="card space-y-2 p-5">
                <Icon aria-hidden="true" size={24} className="text-teal-700" />
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="text-ink-muted">{body}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm"><Link href="/institutions">Find universities and colleges, and the regulator in your country</Link></p>
        </section>
        {categories.map((cat) => (
          <section key={cat} aria-labelledby={`cat-${cat}`} className="space-y-4">
            <h2 id={`cat-${cat}`} className="text-xl font-extrabold">{cat}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.filter((c) => c.category === cat).map((c) => (
                <li key={c.slug}>
                  <Link href={`/certifications/${c.slug}`} className="card card-link flex h-full flex-col gap-2 p-5 text-ink no-underline hover:text-ink">
                    <span className="chip self-start bg-teal-50 text-teal-800">{c.level}</span>
                    <span className="font-display text-lg font-bold">{c.name}</span>
                    <span className="text-sm text-ink-muted">{c.issuer}</span>
                    <span className="text-sm">{c.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <aside aria-label="About this information" className="space-y-2 rounded-[var(--radius-card)] border border-line bg-white p-4 text-xs text-ink-muted">
          <p><span className="font-semibold text-ink">How we compile this.</span> {certificationMethod} Last checked {certificationsCheckedAt}.</p>
          <p>Being added after checking with the issuer: {certificationsPending.join(", ")}.</p>
        </aside>
      </Container>
    </>
  );
}
