import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { OPERATOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What CareerProof Global collects (very little), why, who processes it, how long it is kept, and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <LegalPage title="Privacy policy" intro="We built this site to work without knowing who you are. Here is exactly what is collected, and what is not.">
      <section>
        <h2>Who we are</h2>
        <p>{OPERATOR.name} ({OPERATOR.address}) runs this website and is responsible for the information described here. Contact us at <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> about anything in this policy.</p>
      </section>

      <section>
        <h2>What we do not collect</h2>
        <ul>
          <li>No accounts, sign-ups or passwords.</li>
          <li>No cookies, visitor analytics, advertising or cross-site tracking (see <Link href="/cookies">Cookies</Link>).</li>
          <li>No forms that ask for your name, contact details, grades or career plans. The tools on the site (path planner, calculators, searches, salary checker) do not store what you enter against you.</li>
          <li>The CV builder keeps your CV in your own browser&rsquo;s local storage. It is never uploaded to us; you can delete it with the builder&rsquo;s Clear button.</li>
        </ul>
      </section>

      <section>
        <h2>What is collected, and why</h2>
        <ul>
          <li><strong>Server logs.</strong> Like any website, our hosting provider receives technical information needed to deliver pages and keep the service secure, such as IP address, time of request and browser type. These logs are used for operations and security, not profiling.</li>
          <li><strong>Messages you send us.</strong> If you email us, we receive your email address and what you write, and use them only to reply and act on your request (for example, correcting data). We keep messages for up to 24 months, unless we need them longer to handle a request or meet a legal duty.</li>
        </ul>
      </section>

      <section>
        <h2>Who processes the information</h2>
        <ul>
          <li><strong>Our hosting provider</strong>: delivers the website and keeps the server logs described above. We will name the provider here once hosting is finalised.</li>
          <li><strong>Supabase</strong>: our database of career and education reference data. It holds no information about visitors.</li>
          <li><strong>Google</strong> (Gmail): our email, if you write to us.</li>
        </ul>
        <p>These providers may process information outside your country, including in the United States. We use providers that commit to protecting it, and we do not sell or share information with anyone else.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>Depending on where you live, data protection laws give you rights over personal information about you, including to ask what we hold, to have it corrected or deleted, and to object to its use. These include the Data Protection and Privacy Act, 2019 (Uganda), the Data Protection Act, 2019 (Kenya), the Protection of Personal Information Act (South Africa), and the UK and EU General Data Protection Regulation. As the site collects almost nothing that identifies you, most requests will concern messages you have sent us.</p>
        <p>To use your rights, email <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>; we reply within 30 days. You can also complain to your data protection authority; in Uganda this is the Personal Data Protection Office.</p>
      </section>

      <section>
        <h2>Children and students</h2>
        <p>Many visitors are school students. Because the site needs no account and collects no personal details, students can use it without giving any information about themselves. Please do not send us personal information about a child; if you are a parent or guardian and think a child has, contact us and we will delete it.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we add features that need personal information, such as accounts, CVs saved online or a contact form, we will update this policy before they go live and show the date at the top.</p>
      </section>
    </LegalPage>
  );
}
