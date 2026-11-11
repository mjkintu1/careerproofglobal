import type { Metadata } from "next";
import { seo } from "@/lib/seo";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { GOVERNING_LAW, OPERATOR } from "@/lib/site";

export const metadata: Metadata = seo("/terms", {
  title: "Terms of use",
  description: "The terms for using CareerProof Global: a free information service, used fairly, with sourced data under its own licences.",
});

export default function Page() {
  return (
    <LegalPage title="Terms of use" intro="The terms for using this website. By using it, you agree to them.">
      <section>
        <h2>The service</h2>
        <p>{OPERATOR.name} provides free information about careers, education, admissions and pay, with tools such as the path planner and admission calculators. No account is needed. We may change, add or remove features at any time.</p>
      </section>
      <section>
        <h2>Information, not a decision</h2>
        <p>The site gives general guidance built on cited official data. It is not professional advice and does not decide anything about you; universities, employers, licensing bodies and governments do. The <Link href="/disclaimer">disclaimer</Link> forms part of these terms.</p>
      </section>
      <section>
        <h2>Using the site fairly</h2>
        <ul>
          <li>Use the site lawfully, and do not try to disrupt it, break its security or get around limits on it.</li>
          <li>Automated access must follow our robots.txt and must not put an unreasonable load on the service.</li>
          <li>Do not present our guidance as an official decision or as advice from an official body.</li>
        </ul>
      </section>
      <section>
        <h2>Content and data</h2>
        <p>Our text, design, guides and software are protected by copyright. Data from official sources stays under its own licence and is credited on each page and on <Link href="/data-licences">Copyright and data licences</Link>. You may link to any page and quote short extracts with a link back.</p>
      </section>
      <section>
        <h2>Links to other websites</h2>
        <p>We link to official bodies and other sites for reference. Their content and terms are theirs, and we are not responsible for them.</p>
      </section>
      <section>
        <h2>Availability and liability</h2>
        <p>We aim to keep the site available and accurate but provide it &ldquo;as is&rdquo;, without guarantees. To the extent the law allows, we are not liable for loss arising from using the site or relying on its information. Nothing in these terms limits rights that cannot be limited under the law that applies to you.</p>
      </section>
      <section>
        <h2>Governing law and disputes</h2>
        <p>These terms are governed by {GOVERNING_LAW}. If a disagreement arises, please contact us first so we can try to resolve it informally. If you use the site as a consumer, you keep any protections given by the mandatory law of the country where you live.</p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>We may update these terms; the date at the top shows the latest version. Continuing to use the site means you accept the updated terms.</p>
      </section>
    </LegalPage>
  );
}
