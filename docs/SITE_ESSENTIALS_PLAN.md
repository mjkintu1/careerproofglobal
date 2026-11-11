# Site essentials and new features: plan (Nov 2026)

Fourteen requests, grouped into six phases and ordered so each phase unblocks the next.
Same rules as the rest of the site: official sources only, cited and dated; our own words, never copied text;
nothing that needs an account or personal data unless it has to.

## Phase 0: quick fixes (hours, no decisions needed)

| Item | What | Notes |
|---|---|---|
| Logo in browser tab | Replace the template favicon with the brand icon: app/icon.svg (from public/brand/careerproof-global-icon.svg), apple-icon.png, and a 32px favicon.ico | Next.js picks these up automatically; also used for bookmarks and phone home screens |
| Footer legal row | Links to Privacy, Terms, Disclaimer, Cookies, Copyright and data licences, About, Contact, FAQs | Pages land in phases 1 and 2 |
| Organization structured data | Organization JSON-LD with logo and sameAs social links | Social links added once the accounts exist |

## Status (11 Nov 2026)

- Phase 0 done: brand icons (tab, Apple, manifest), /disclaimer, /data-licences, footer legal row, Organization JSON-LD.
- Phase 1 done as drafts: /privacy, /terms, /cookies.
  Operator details in apps/web/src/lib/site.ts (OPERATOR, GOVERNING_LAW, LEGAL_UPDATED).
  - Governing law is set to Uganda: "international law" cannot govern website terms (there is no single
    international law courts apply to them); visitors keep their own country's mandatory consumer protections.
  - No visitor analytics: the site will move off Vercel, so Vercel Web Analytics was removed. The privacy page
    names the host generically; name the new provider there once chosen. If analytics are wanted later,
    pick a cookieless tool on the new host (or add a consent banner) and update /privacy and /cookies first.
  - Owner actions: have a lawyer review the legal pages; check whether registration with Uganda's
    Personal Data Protection Office is required.
- Phase 2 (FAQs only, for now): /faqs with 14 questions in 6 topics, data in apps/web/src/lib/faqs.ts.
  Sourced facts cite slugs in data-sources.json (build fails on an unknown slug); our advice is labelled
  "CareerProof guidance"; FAQPage structured data; footer link and sitemap entry. About and Contact deferred.
- Phase 3 done (first pass, 11 Nov 2026): /curricula and 10 pages under /curricula/[slug]; data in
  packages/reference-data/src/curricula.json (+ curricula.ts, 6 tests); 10 new entries in data-sources.json.
  - International: Cambridge IGCSE, Cambridge International AS & A Level (with syllabus codes), Pearson Edexcel
    International GCSE and International AS/A Level, IB Diploma, AP and SAT. National: UCE/UACE, KCSE and CBC, WASSCE, NSC.
  - Subjects mapped to the 32 global subjects; subject pages now list where each is offered, with syllabus codes.
  - Recognition routes: Uganda (UNEB equating, fees), Kenya (KNQA), South Africa (USAf Matriculation Board),
    Nigeria (Federal Ministry of Education), UK (universities via UCAS).
  - Finding: Cambridge International AS & A Levels have no UCAS Tariff points; UK universities accept them grade for grade.
  - Gaps, left out rather than guessed: IB facts only from UCAS (ibo.org refused automated access); WASSCE grade
    scale (no reachable WAEC page states it); KCSE grade scale and cluster formula; Pearson subject lists and ages;
    AP subject list. Next: these gaps, then French Baccalaureate, Indian CBSE/ISC and Ghana's and Nigeria's own recognition routes.
- Phase 4 done (first pass, 11 Nov 2026): /cv-builder, /negotiate-salary, /job-market; 12 new entries in data-sources.json (72).
  - CV builder: browser-only (localStorage key careerproof-cv-v1), CV or US resume format, education-first option,
    skills suggested from the target career, print/save as PDF (print CSS shows only the CV) and a Word-compatible .doc.
    No photo or date-of-birth fields. Conventions cited: National Careers Service (UK), EEOC (US), Europass (EU).
    Privacy, cookies and the FAQ now describe the local storage.
  - Salary negotiation: range checker (GET /api/pay; maths in reference-data pay-range.ts, 4 tests) placing a posted range
    and offer against official benchmarks in the same currency (no currency conversion; hourly not converted; legal-minimum
    warning). Laws cited: EU Directive 2023/970 (Art. 5, transposition 7 June 2026), California Labor Code 432.3,
    New York Labor Law 194-b. Colorado left out: its labour department site returned 403 to automated requests.
  - Job market: no-fee rules (ILO C181 Art. 7, South Africa Employment Services Act, UK agencies, US FTC), Uganda
    external employment (MGLSD EEU, EEMIS register), GOV.UK Find a job, guides by stage linking the other tools.
    Kenya's National Employment Authority site could not be read (server error / certificate), so Kenya is pending.
    CareerOneStop (US DOL) disallows Claude in robots.txt, so it was not read.
  - career.io and gecd.co.uk: used as feature references only; not linked (owner's call).

- Navigation and tab icon (branch fix/navigation, 11 Nov 2026):
  - Mobile menu: full-height scrollable panel, one group open at a time (current section first), "Plan my path"
    button, focus moves in, page behind does not scroll. Previously the menu was 1,419 px tall in an 812 px
    viewport and the lower groups could not be reached.
  - Desktop dropdowns: hover with a short delay as well as click; fade and slide in and out (opacity, translate and
    visibility, 200 ms; none with reduced motion); close on Escape (focus returns), outside click or tabbing away.
  - Less crowded: groups rebalanced to 6, 6 and 4 links (Certifications moved to Where to Study); two-column panels;
    one-line descriptions. Panels went from about 450 px to 190 to 256 px tall and fit a 1024 px window.
  - Current page marked (aria-current) and its section highlighted. In-page links land below the sticky header
    (scroll-padding-top) with smooth scrolling; only the main bar is sticky (73 px instead of 109 px).
  - Tab icon: the official mark redrawn on 16 and 32 px grids (public/brand/careerproof-global-icon-16.svg, -32.svg) for icon.svg and favicon.ico, so it is sharp and identical in design to the app icon
    (16/32/48 px); the detailed mark stays for Apple and manifest icons. Regenerate with node scripts/brand-icons.mjs.
  - Not yet tested on a physical phone.
- Next: About and Contact (phase 2), social accounts (phase 5, owner), security headers and a custom 404 page
  (see CRITICAL_REVIEW.md), and the gaps listed under phases 3 and 4.

## Phase 1: trust and legal pages (1 to 2 days, needs your decisions)

| Page | Content | Basis |
|---|---|---|
| Privacy policy | What we collect (today nothing personal, server logs only), what later features would collect (contact form, saved CVs), rights, retention, contact | Uganda Data Protection and Privacy Act 2019; Kenya Data Protection Act 2019; South Africa POPIA; UK and EU GDPR for visitors there |
| Terms of use | Acceptable use, no guarantee of admission or pay, our content and third-party data, governing law | Your chosen jurisdiction |
| Disclaimer | Guidance, not professional or legal advice; official bodies decide admissions, licensing and pay; figures are dated and sourced | Expands the footer note already on every page |
| Copyright and data licences | Copyright in our content; one generated table of every data source with its licence and attribution (from data-sources.json, 50 entries) | Meets the CC BY and Open Government Licence attribution duties in one place |
| Cookies | Today the site sets no non-essential cookies: a short notice, no banner. If analytics come later, pick a cookieless tool or add a consent banner that declines by default | EU ePrivacy and UK PECR for visitors there |

These are drafts for a lawyer to check before launch, and will be marked as such.

**Decisions needed:** the operator's legal name (person or company) and country of registration; a contact email and
postal address for privacy requests; governing law; whether to use analytics.

## Phase 2: About, Contact, FAQs (1 to 2 days)

- **About:** mission, the Africa-first approach, how data is chosen (official only, cited, dated), who is behind it,
  and readable versions of the methods already in docs/ (pay benchmarks, path planner, admissions).
- **Contact:** a form saved to Supabase (insert-only for the public, row-level security), spam protection without
  tracking (hidden honeypot field and rate limit), and an email alert. Or just an email address if you prefer.
  Topics: data correction, partnership, press, privacy request.
- **FAQs from verified sources, answered by us:**
  - Questions are chosen from real, recurring needs seen in official FAQ pages and guidance (UCAS, NCHE, KUCCPS,
    ministries of education and labour, ILO). We never copy their text; we write our own answers.
  - Each answer cites the official source it relies on and shows a "last checked" date. Our own advice is
    labelled as CareerProof guidance, kept apart from sourced facts.
  - FAQPage structured data for search.
  - Topics: choosing subjects, university entry and equivalence, pay figures, changing career, using the planner, data and privacy.

## Phase 3: international curricula (3 to 5 days)

Pages and data for school-leaving qualifications studied across countries, linked to subjects, entry requirements and the admissions calculators.

| Curriculum | What we can add | Official sources |
|---|---|---|
| Cambridge (IGCSE, International AS and A Level) | Subjects offered, grading, recognition by country | Cambridge International syllabus lists and recognition pages; UCAS Tariff (already holds A-level points) |
| International Baccalaureate (Diploma, Career-related) | Already in the UCAS Tariff calculator; add structure and subject groups | IBO (its site blocked automated access earlier; use PDFs you supply, or UCAS) |
| Pearson Edexcel International | Subjects and grading | Pearson qualification specifications |
| US high school diploma, AP, SAT/ACT | Structure and how universities abroad read them | College Board and ACT published material |
| National curricula already covered | UCE/UACE (Uganda), KCSE/CBC (Kenya), WASSCE, NSC (South Africa) | UNEB, KNEC, WAEC, DBE |
| Equivalence | How a foreign qualification is recognised in Uganda, Kenya, the UK and others | NCHE and UNEB (Uganda), KNQA and KNEC (Kenya), UK ENIC (paid service, link only), UNESCO ISCED mappings (already imported) |

Each curriculum page: structure, subjects mapped to our 32 global subjects (ISCED-F), grading, how universities use it,
and links to the calculators. Each source's terms and robots rules are checked before anything is imported.

## Phase 4: career tools and guides (1 to 2 weeks)

**CV and résumé builder**
- Private by design: everything stays in the browser (local storage), no account; export to PDF (print layout) and a Word-compatible file.
- Layouts that applicant-tracking systems can read (plain structure, no tables or images in the body).
- Country conventions: UK CV vs US résumé; photo and personal details (common in parts of Africa and Europe, discouraged in the UK and US).
- Uses our data: choose a target career to get suggested skills and keywords from ESCO and O*NET, and the qualifications from its entry routes.
- Later, optional: save to an account (needs the privacy policy and sign-in first).

**Negotiating salary when a range is posted**
- A guide plus a small tool: enter the posted range and your offer, and see where it sits against the range and against
  our official benchmarks for the same occupation and country (median, percentiles, public entry scale).
- Facts from official sources on pay-transparency rules (EU Pay Transparency Directive 2023/970; US state laws such as
  Colorado, California and New York) and what a posted range means where they apply; the rest is our guidance, labelled so.

**Navigating the job and career market**
- Guides by stage (first job, changing career, working abroad) built on official sources: national employment
  services and job portals, lists of licensed recruitment agencies, official warnings about recruitment scams and fake job offers
  (for example Uganda's Ministry of Gender, Labour and Social Development list of licensed external recruitment companies),
  and the work-permit pages of destination countries.
- Linked from the path planner and career pages.

**The two sites you sent**
- career.io: commercial AI career services (résumé builder, career-advice articles). A feature reference for the
  résumé builder and advice section; its articles are its copyright, so no text is reused.
- gecd.co.uk (Global Education and Career Development, UK): a training provider; a reference for how career-development
  content is structured. Same rule on content.
- Neither is an official source, so neither feeds data. Whether to link to them is your call.

## Phase 5: social media (ongoing)

- LinkedIn company page, Facebook, Instagram and YouTube, ideally one handle everywhere (for example careerproofglobal;
  check availability). You create and own the accounts; I cannot create accounts.
- Then: footer and About links, sameAs in structured data, and Open Graph images per page so shared links look right.
- Content drawn from the site: a career path of the week (node map image), official pay facts with sources, admissions dates.

## Order and effort

| Phase | Effort | Blocked by |
|---|---|---|
| 0 Quick fixes | Hours | Nothing |
| 1 Legal and trust | 1 to 2 days | Operator name, jurisdiction, contact details, analytics choice |
| 2 About, Contact, FAQs | 1 to 2 days | Phase 1 (privacy policy before the contact form) |
| 3 International curricula | 3 to 5 days | Source checks for each curriculum |
| 4 CV builder, salary negotiation, job market | 1 to 2 weeks (first pass done) | Phase 1 for any stored data |
| 5 Social media | Ongoing | You creating the accounts |
