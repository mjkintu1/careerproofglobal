import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = { title: "Page not found" };

const links = [
  { href: "/careers/global", label: "Explore careers" },
  { href: "/paths", label: "Plan a path" },
  { href: "/subjects", label: "School subjects" },
  { href: "/faqs", label: "Frequently asked questions" },
];

/** Branded 404. Next.js returns a 404 status and adds noindex automatically. */
export default function NotFound() {
  return (
    <Container className="py-20">
      <p className="font-semibold text-teal-700">404</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-xl text-ink-muted">The link may be old or mistyped. These are good places to start:</p>
      <ul className="mt-6 flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="btn-primary">{l.label}</Link></li>
        ))}
      </ul>
    </Container>
  );
}
