import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookies",
  description: "CareerProof Global sets no cookies and uses no tracking.",
  alternates: { canonical: "/cookies" },
};

export default function Page() {
  return (
    <LegalPage title="Cookies" intro="This site sets no cookies, so there is nothing to accept or decline.">
      <section>
        <h2>Cookies</h2>
        <p>CareerProof Global does not set cookies: none for advertising, none for tracking, and none for remembering you between visits. Because no non-essential cookies are used, we do not show a cookie banner.</p>
      </section>
      <section>
        <h2>No visitor tracking</h2>
        <p>We do not use analytics or tracking tools. If we add visitor statistics later, we will choose a tool that works without cookies, or ask for your consent first, and update this page and our <Link href="/privacy">privacy policy</Link> before it goes live.</p>
      </section>
      <section>
        <h2>Storage in your browser</h2>
        <p>Only one tool stores anything: the <Link href="/cv-builder">CV builder</Link> saves what you type in your browser&rsquo;s local storage, so your CV is still there when you come back. It stays on your device and is never sent to us. Use the builder&rsquo;s Clear button, or clear this site&rsquo;s data in your browser settings, to delete it. This is not a cookie and is not used to track you.</p>
      </section>
      <section>
        <h2>Other websites</h2>
        <p>Links to official bodies and other sites take you to websites with their own cookie policies, which we do not control.</p>
      </section>
    </LegalPage>
  );
}
