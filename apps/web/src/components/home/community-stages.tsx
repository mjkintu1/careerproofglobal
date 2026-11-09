import Link from "next/link";
import { ArrowRight, Backpack, BookOpen, Briefcase, GraduationCap, HeartHandshake, School, Search, UserRoundCog, Users } from "lucide-react";
import { GLOBAL } from "@/lib/careers";
import { audiences } from "@/lib/site-nav";
import { SectionHeading } from "./section-heading";

const audienceIcons = [Backpack, GraduationCap, Search, BookOpen, HeartHandshake, UserRoundCog];

export function Community() {
  return (
    <section aria-labelledby="community-heading" className="space-y-6">
      <SectionHeading id="community-heading" kicker="Our community" title="I am a..." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((a, i) => {
          const Icon = audienceIcons[i] ?? Users;
          return (
            <li key={a.label}>
              <Link href={a.href} className="card card-link flex h-full items-center gap-4 p-5 text-ink no-underline hover:text-ink">
                <span className="rounded-2xl bg-teal-50 p-3 text-teal-800"><Icon aria-hidden="true" size={26} /></span>
                <span>
                  <span className="block font-display text-lg font-bold">{a.label}</span>
                  <span className="text-sm text-ink-muted">{a.body}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const stages = [
  { Icon: School, title: "At school", body: "Choose subjects that keep your dream careers open, then the courses that lead to them.", href: "/subjects", cta: "Explore subjects" },
  { Icon: GraduationCap, title: "After school", body: "Compare every way in: degrees, diplomas, apprenticeships and certifications.", href: `/careers/${GLOBAL}`, cta: "Explore careers" },
  { Icon: Briefcase, title: "At work", body: "See where your career can lead next, including moves into a new field.", href: `/careers/${GLOBAL}#path-finder-heading`, cta: "Find a path" },
];

export function Stages() {
  return (
    <section aria-labelledby="stages-heading" className="space-y-6">
      <SectionHeading id="stages-heading" kicker="Your journey" title="Guidance for every stage" />
      <ul className="grid gap-4 md:grid-cols-3">
        {stages.map(({ Icon, title, body, href, cta }) => (
          <li key={title} className="card flex flex-col gap-3 border-t-4 border-t-teal-500 p-6">
            <Icon aria-hidden="true" size={28} className="text-teal-700" />
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <p className="text-ink-muted">{body}</p>
            <Link href={href} className="mt-auto inline-flex items-center gap-1 font-semibold">{cta} <ArrowRight aria-hidden="true" size={16} /></Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
