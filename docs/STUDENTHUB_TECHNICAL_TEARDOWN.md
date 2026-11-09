# studenthub.ug: technical teardown

**Date:** 2026-11-09. **Purpose:** understand the architecture, data model and data flows of studenthub.ug so Career Proof can adopt what works and avoid what doesn't. Companion to `STUDENTHUB_ANALYSIS.md` (product view).

## Method and boundaries

Passive, public-surface analysis only, at a gentle request rate (about 10 requests in total):
- `robots.txt` (no restrictions; it only points to the sitemap) and the public `sitemap.xml`
- two fetches of one public career page and one course page, as an ordinary visitor
- the public JavaScript bundles the site serves to every visitor (read, not executed against the site)
- response headers

Not done: no login, no form submissions, no calls to the interactive endpoints, no probing of unlisted paths, no admin URLs opened, no bulk download. No StudentHub content is reproduced here or copied into Career Proof; this document records structure and counts only. The REA toolkit in `Desktop/rea reverse engineering` was read for methodology but not installed or run.

---

## 1. Headline finding: the live site is a frozen static snapshot

| Evidence | What it shows |
|---|---|
| No `Set-Cookie` on any page | A live Yii2 app sets session and CSRF cookies |
| `csrf-token` meta tag is **identical across requests** | Yii2 issues a fresh masked token per request; this one is frozen |
| Asset URLs rewritten from `?v=123` to `_v-123.js`, relative `../../` paths | Typical output of a site-mirroring crawler |
| Sitemap paths like `_page-2`, `view_id-5`, `index_php/...` | Query strings flattened into file names by the same crawler |
| `Last-Modified: Tue, 10 Feb 2026`, Cloudflare `cf-cache-status: HIT` | Static files served from cache |
| Only Cloudflare's email obfuscation differs between two fetches | Everything else is byte-identical |

**Implication:** the original PHP application is not what visitors reach. The interactive tools (course calculator, subject selector, career survey, follow, feedback) cannot work against a static copy, and content is frozen at the snapshot date. This explains the stale jobs, the "Admitting Now" label on every course and the two-year-old "trending" scholarships.

## 2. Original application stack (reconstructed)

| Layer | Evidence | Inference |
|---|---|---|
| Framework | `yii.js`, `yii.activeForm.js`, `yii.validation.js`, `_frontendCSRF` param, `/assets/{hash}/` bundles | **Yii2 (PHP)**, advanced template (frontend app) |
| Admin / RBAC | sitemap lists `/admin/.../assignment/view?id=N` | A standard Yii2 role-management module |
| UI | Bootstrap 3, jQuery, LayerSlider, Owl Carousel, Fancybox, Font Awesome 4 and 6 | Purchased HTML theme from about 2015 to 2019, extended over time |
| Widgets | `kv-widgets`, `typeahead-kv` | Kartik Yii2 extensions (search typeahead, form widgets) |
| Charts | Highcharts 4.2.2 | Cut-off history rendered from inline JSON |
| Search | Google Custom Search script | Site search delegated to Google |
| E-learning link | commented-out Moodle `webservice/rest/server.php` call | Earlier integration with sister learning platforms |
| Hosting | Cloudflare in front | CDN and cache; static origin now |
| Asset versions | newest asset timestamp 2025-01-16; most from 2019 | Front end largely unchanged since 2019 |

Page weight: about 280 KB of HTML per career page, about 40 script files and 22 stylesheets, mostly loaded on every page.

## 3. Content inventory (from the public sitemap, 5,930 URLs)

| Entity | Distinct records | Notes |
|---|---|---|
| Careers | 1,126 | IDs up to 1414; 1,364 URLs, so some careers have several URLs after slug changes |
| Courses (degree at one institution) | 944 | IDs up to 1653 |
| Online courses | about 716 URLs | upskilling listings |
| News / opportunities | about 690 | IDs up to 604 |
| Interviews | 137 | linked to careers and courses |
| Institutions | 92 | IDs up to 210 |
| Subjects | 28 | O-level and A-level subjects |
| Career fields | 16 | US-style clusters |
| Blog, events, activities, products, Q&A | a few hundred | marketing and outreach |

The career catalogue is large (about 1,100) but mostly prose. That is the main asset to match, with structure that StudentHub lacks.

## 4. Route map

| Pattern | Page |
|---|---|
| `/careers/{id}/{slug}` | Career detail (tabs: what, how, firms, news, video, similar, upskilling, opportunities) |
| `/career-fields/{id}/{slug}` (+ `?page=N`, `/scholarships`) | Cluster list |
| `/courses/{id}/{slug}` | Course detail (tabs: relevance, entry requirements, career paths, interviews, work places, scholarships) |
| `/courses/finder`, `/courses/compare` | Calculator and comparison tools |
| `/subjects`, `/subjects/{id}/{slug}`, `/subjects/selector` | Subjects and "dream career -> subjects" |
| `/institutions/{id}/{slug}` | Institution and its courses |
| `/interviews/{id}/{slug}` | Interview (bio + video) |
| `/career-survey` | Interest checklist |
| `/news/{id}/{slug}`, `/events/...`, `/activities/...` | Opportunities and outreach |
| `/site/login`, `/site/signup`, `/site/request-password-reset` | Accounts (not visited) |

Numeric id + slug URLs: the id is the real key, the slug is decorative, which is why renamed careers leave duplicate URLs.

## 5. Interaction surface (from the public JavaScript)

All calls are jQuery requests to the PHP app that send an id and receive an **HTML fragment**, not JSON. There is no public JSON API.

| Call | Method and parameters | Purpose |
|---|---|---|
| `/careers/follow` | GET `id` | Follow / favourite a career |
| `/courses/follow` | GET `id` | Follow / "apply" to a course |
| `/courses/applicantconfirmation` | GET | Confirm interest in applying |
| `/careers/feedbackyes`, `/careers/feedbackno` | GET `career` | "Did this page help?" |
| `/courses/feedbackyes`, `/courses/feedbackno` | GET `course` | Same, for courses |
| `/career-survey/updatefeedback` | GET `id` | Survey result feedback |
| `/adverts/advertmileage` | GET `id` | Advert impression tracking |
| `ajax/ajax.php` | POST `follow` / `Unfollow` | Legacy follow handler |

None of these were called. On the static snapshot they cannot succeed.

Third parties seen on the page: Google Analytics, Hotjar (session recording), Facebook, an AI chat widget (Neexa), Mailchimp newsletter form, a Flutterwave hosted checkout form (paid services), WhatsApp share links, Google Custom Search, an external science RSS feed.

## 6. Data model (reconstructed)

```
CareerField (16) 1--* Career (1,126) *--* Course (944) *--1 Institution (92)
                         |                  |
                         *                  *-- EntryRequirement (subject, weight 3/2/1)
                      Interview (137)       *-- CutoffHistory (year x {government, private day, private evening})
                         |
                         *-- also linked to Course
Subject (28) -- related career fields as free text (not linked)
Career -- "similar" = same CareerField (computed, not curated)
User -- follows careers/courses, page feedback, survey results
News/Opportunity, OnlineCourse, Event, Activity, Advert, Product
```

### Cut-off data shape
Inline Highcharts JSON per course:
- `categories`: academic years, e.g. `2015/2016` to `2019/2020`
- `series`: `Government`, `Private Day`, `Private Evening`, each an array of points, with `0` used for a **missing** year

The course studied had **2015/16 to 2019/20 only**; the "current" government cut-off shown on the page is the 2019/20 value.

## 7. Quality, security and privacy findings

**Data quality**
1. Content frozen at the snapshot (about Feb 2026); tools non-functional.
2. Cut-off history ends at 2019/20 and uses `0` for missing values, which a chart shows as a real zero.
3. Duplicate URLs for the same career after slug changes; no canonical tags were observed doing the de-duplication.
4. "Similar careers" is the whole cluster, including the career itself.
5. No structured data (no JSON-LD), so search engines get no machine-readable career or course facts.

**Security and privacy (worth telling StudentHub, privately)**
1. The public sitemap lists about 43 admin URLs (role-assignment pages keyed by user id). They probably require login, but they should not be advertised.
2. A CSRF token is baked into static HTML for every visitor.
3. Session recording (Hotjar) and an AI chat widget load for all visitors, including minors, with no consent prompt seen.

If you have a contact there, a short private note about point 1 would be a good-faith way to open a partnership conversation.

---

## 8. What Career Proof adopts, and how

| StudentHub concept | Career Proof implementation | Status |
|---|---|---|
| Career catalogue at scale (about 1,100) | `occupations` keyed to ISCO-08, with structured tasks, skills, routes and moves. Scale up from 68 using open taxonomies (ESCO/O*NET, licences to confirm) instead of hand-written prose | schema built; data to grow |
| Career field | `career_clusters` | built |
| Course = degree at institution | `degrees` + `programmes` kept separate, so one degree compares across institutions | built |
| Entry requirements x3/x2/x1 | `programme_requirements` + versioned rule sets | built |
| Cut-offs by sponsorship (government, private day, private evening) | `historical_cutoffs.scheme`, with **null for missing years** (never 0), source required | built; add the three scheme values to the docs and admin UI |
| Career <-> course links | `qualification_routes.degree_id` (route to a real degree) | column built; data to add |
| Similar careers | skill overlap + recorded moves (`related`, `findPath`) | built |
| Interviews | `venturers` + `venturer_steps` + media, so journeys are data | planned |
| Subjects page | `subjects` with description and links to occupations via `school_subjects` and requirements | partly built; add subject pages |
| Subject selector (career -> subjects) | walk occupation -> routes -> programmes -> requirements, per country | data in place; page to build |
| Course compare | same degree across institutions: requirements, cut-off history, fees band | to build |
| Follow / favourite | `saved_items` (careers, programmes, paths) for signed-in users | to add |
| "Did this page help?" | `page_feedback` (page, helpful yes/no, optional comment, no personal data) | to add |
| Interest survey | quiz scored against `occupations.riasec` | to build |
| Opportunities feed | `scholarships` / `internships` with deadlines and auto-expiry (planned in v0.2) | planned |

**What we deliberately do differently**
- Live, not frozen: every fact carries `source_url` and `last_reviewed_at`; listings expire.
- Structured, not prose: tasks, skills, routes and moves are rows, so they can be compared and searched.
- Search-friendly by design: add schema.org `Occupation` and `EducationalOccupationalProgram` JSON-LD to career and programme pages.
- Light pages: our career pages are server-rendered with a small script budget, against about 40 scripts per page there.
- Consent first: no session recording; analytics without personal data.
- Global: location is a dimension of the data, not hard-coded into copy.

**What we do not take:** their written content, their compiled cut-off figures (stale in any case) or their media. Our data comes from official and open sources, cited row by row.
