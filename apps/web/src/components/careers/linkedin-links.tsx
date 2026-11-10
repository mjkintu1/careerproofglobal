import { BriefcaseBusiness, ExternalLink, UserRound } from "lucide-react";
import { professionalsFor } from "@careerproof/reference-data";

/** Outbound links to LinkedIn's own public search. Nothing is fetched or stored from LinkedIn. */
export function LinkedInCard({ career, title, countryName }: { career: string; title: string; countryName: string | null }) {
  const jobs = new URL("https://www.linkedin.com/jobs/search/");
  jobs.searchParams.set("keywords", title);
  if (countryName) jobs.searchParams.set("location", countryName);
  const people = new URL("https://www.linkedin.com/search/results/people/");
  people.searchParams.set("keywords", title);
  const featured = professionalsFor(career);
  return (
    <div className="card space-y-3 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold"><BriefcaseBusiness aria-hidden="true" size={18} className="text-teal-700" /> {title}s on LinkedIn</h2>
      <ul className="space-y-2">
        <li>
          <a href={jobs.toString()} rel="noopener nofollow" target="_blank" className="inline-flex items-center gap-1">
            {title} jobs{countryName ? ` in ${countryName}` : ""} <ExternalLink aria-hidden="true" size={14} /><span className="sr-only">(opens LinkedIn in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={people.toString()} rel="noopener nofollow" target="_blank" className="inline-flex items-center gap-1">
            People working as {title.toLowerCase()}s <ExternalLink aria-hidden="true" size={14} /><span className="sr-only">(opens LinkedIn in a new tab)</span>
          </a>
          <span className="block text-xs text-ink-muted">LinkedIn asks you to sign in to search people.</span>
        </li>
      </ul>
      <div className="border-t border-line pt-3">
        <h3 className="flex items-center gap-2 font-bold"><UserRound aria-hidden="true" size={16} className="text-teal-700" /> Featured professionals</h3>
        {featured.length ? (
          <ul className="mt-2 space-y-3">
            {featured.map((p) => (
              <li key={p.linkedin}>
                <a href={p.linkedin} rel="noopener" target="_blank" className="font-semibold">{p.name}</a>
                <p className="text-sm text-ink-muted">{p.headline}</p>
                {p.story && <p className="mt-1 text-sm">{p.story}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-muted">Coming soon. We only feature professionals who agree to share their journey, with a link to their own LinkedIn profile.</p>
        )}
      </div>
    </div>
  );
}
