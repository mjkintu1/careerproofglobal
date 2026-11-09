# studenthub.ug: framework study and what it means for Career Proof

Studied: 2026-11-09, by browsing the public site (home, career fields, a career page, a course page, institutions, subjects, interviews, jobs, career survey, subject selector, course calculator). No forms were submitted and no content was copied; this is an analysis of structure only.

Branch: `career-paths-first`. Direction: career paths become the core of the platform; the admission simulator becomes an optional tool.

---

## 1. How Student Hub is structured

### Audiences and lifecycle
Segments on the home page: schools, graduates, adult learners, job seekers, parents, counsellors/educators. Programmes by stage: primary (self-concept and career role play), secondary (subject, course and university selection), after school (work readiness, job search, upskilling). Distribution is largely **offline**: careers days, symposiums and school visits, with a claim of 20,114 students reached since 2015.

### Content model (inferred from pages and URLs)

| Entity | URL pattern | What it holds |
|---|---|---|
| Career field / cluster | `/career-fields/{id}/{slug}` | Description + list of careers. Clusters follow the US National Career Clusters framework (e.g. STEM has 103 careers) |
| Career | `/careers/{id}/{slug}` | Prose: what it is, daily tasks, main activities, skills. Tabs: courses that lead to it, companies that hire, news, video interviews, similar careers, online training, opportunities. View counts. Favourites |
| Course | `/courses/{id}/{slug}` | **One degree at one institution.** Cut-offs by sponsorship (government, private day, private evening) with a chart over years; essential (x3), relevant (x2), desirable (x1) subjects; duration; relevance and objectives; career paths; interviews; where graduates work; scholarships |
| Subject | `/subjects/{id}/{slug}` | Prose on why it is taught (curriculum-style) and a free-text list of related career fields |
| Institution | `/institutions/{id}/{slug}` | Contact, apply link, list of courses (Makerere: 94) |
| Interview | `/interviews/{id}/{slug}` | Short bio + embedded video; linked to careers and courses |
| Opportunities, jobs, events, activities | various | News-style posts (scholarships, competitions), a jobs feed, school events |

The core path is **Subject -> Course -> Career -> Career field**, with interviews hanging off careers and courses.

### Tools
- **Career survey:** a 42-item "tick what appeals to you" checklist; the items fit the Holland RIASEC model (7 per interest type).
- **Subject selector:** type a dream career, get the subjects to take (a reverse walk of career -> course -> requirements).
- **Course calculator:** O-level and A-level weight calculator against cut-offs. *This already overlaps our admission simulator.*
- **Course compare.**

### Business model
Consultations, school programmes, advertising, a resources shop, partnerships (e.g. an international career-counsellor certification), and sister platforms (Career Spaces for graduates, GradePlus, Open School and others).

### Technology (observed)
Server-rendered PHP (the forms carry a Yii2-style CSRF token), Highcharts 4.2.2 for cut-off charts, numeric id + slug URLs, page titles written for search intent ("How to become an Industrial Chemist in Uganda").

---

## 2. Critical assessment

### What works (worth learning from)
1. **Career-first, search-led pages.** Titles match what people type into Google. View counts show real demand (e.g. Civil Engineer about 29.7k views; Advanced Diploma in Anaesthesia about 50k).
2. **The full chain is linked.** Subject, course, career and field connect both ways, so a student can start from any end.
3. **Local context.** Career pages name Ugandan employers and sectors.
4. **Lifecycle thinking.** They speak to primary pupils through to job seekers and parents.
5. **Real people.** Interviews give role models, which is the same instinct as our Venturers.
6. **Offline distribution.** School events are a moat that pure software lacks.

### Where it falls short (our opportunities)
1. **Uganda is hard-wired.** "in Uganda" is in titles and copy; UACE weights and the three sponsorship cut-off types are fixed fields on the course. There is no way to add Kenya without a second site.
2. **Course = degree at one institution.** The same degree at five universities is five unrelated records; comparison needs a separate tool.
3. **Shallow relationships.**
   - "Similar careers" is simply every career in the same cluster, and includes the career itself.
   - "Companies that hire" and "Online training" were empty on the page studied.
   - Subject -> career field is free text, not a link.
4. **Unstructured content.** Skills and tasks are prose bullets, not a taxonomy, so nothing can be matched, compared or computed. No salary ranges, no outlook, no qualification level.
5. **Only the degree route.** Little on diplomas, TVET, apprenticeships, professional certifications, or moving between careers, even though job seekers and adult learners are named audiences.
6. **Freshness and trust.** Every Makerere course shows "Admitting Now"; the jobs feed was 11 months old; "trending" scholarships were 2 years old; some cut-offs read "to be updated". No sources or "last reviewed" dates are shown.
7. **Interviews are not data.** A bio and a video cannot answer "how did people get from X to Y?"
8. **Ads and consultation prompts** compete with the content.

---

## 3. Bringing the same architecture to a global platform

Keep Student Hub's chain (subject -> qualification -> career -> field, with real people attached), but split it into three layers so one codebase serves any country.

### Layer 1: global career graph (same in every country)
- **Occupations** keyed to **ISCO-08** (the ILO standard that African statistics offices already use), so a "Civil Engineer" means the same thing in Kampala, Nairobi and Kigali.
- **Skills and knowledge** from an open taxonomy such as **ESCO** (mapped to ISCO), with **O*NET** as a source of task detail and RIASEC interest codes. All three are published for reuse; confirm each licence and attribution terms before importing.
- **Career clusters** as our own browsing groups (similar to Student Hub's), each occupation tagged with one primary cluster.
- **Related careers computed, not typed:** skill overlap between occupations plus real moves recorded in Venturer journeys. This fixes Student Hub's "same cluster = similar" shortcut.

### Layer 2: country overlay (one per region)
- Local title aliases and a short local context paragraph.
- Salary **bands** in local currency, with source and year.
- **Entry routes** per country, not just degrees: degree programmes, diplomas, TVET/apprenticeships, professional certifications and licensing bodies, each mapped to occupations.
- Admission rules (our existing rule sets) stay here, so the simulator plugs in where data exists and stays hidden where it does not.
- Employers and demand signals for that country.

### Layer 3: evidence (what makes us trustworthy)
- **Venturer journeys as structured steps** (subject, qualification, job, certification, pivot), so the platform can answer "who went from X to Y, and how long did it take?" Interviews and videos attach to those steps.
- **Every fact carries a source and a last-reviewed date;** opportunities expire automatically at their deadline.

### How the pieces map onto what we already built

| Student Hub | Career Proof equivalent | Status |
|---|---|---|
| Career field | `career_clusters` | new |
| Career | `occupations` (global) + `occupation_localisations` (per country) | new; replaces the planned `careers` table |
| Skills prose | `skills` + `occupation_skills` | new |
| Course (degree at institution) | `degrees` + `programmes` (already separate) | built |
| Entry requirements | `programme_requirements` + rule sets | built |
| Course -> career paths | `qualification_routes` (degree, diploma, TVET, certification -> occupation) | new |
| Similar careers | computed from skill overlap + `pathway_edges` | planned |
| Interviews | `venturers` + `venturer_steps` + media | planned |
| Career survey | interest quiz using RIASEC codes on occupations | new |
| Subject selector | "I want to become X": walk occupation -> routes -> programmes -> subjects, per country | new, uses existing data |
| Course calculator | admission simulator (optional module) | built |

### Pages and URLs
- `/{country}/careers/{slug}`, e.g. `/ug/careers/industrial-chemist`, titled "How to become an Industrial Chemist in Uganda" (keeping Student Hub's search-friendly pattern, generated per country), with `/careers/{slug}` as the global version and hreflang links between them.
- Career page sections: what the job is, typical tasks, skills, where people work, **ways in** (all routes, by country), subjects that keep the door open, salary band, related careers, real journeys, opportunities.
- Cluster pages, institution pages and a site-wide search.

---

## 4. Positioning

Student Hub is a direct Uganda competitor with roughly ten years of content, search traffic and school relationships. Copying its approach in Uganda alone would be a weak strategy. Our edge:
1. **Multi-country by design** (one graph, country overlays).
2. **Structured and computable** (skills, routes, related careers, journeys).
3. **All routes, all ages** (TVET, certifications, pivots, not only degrees).
4. **Verified and fresh** (sources, review dates, verification tiers, expiry).

Also worth considering: **partnership rather than head-on competition** in Uganda (their outreach and content, our structured platform), for example data or content licensing. Do not reuse their content without a written agreement.

---

## 5. Suggested build order on this branch

1. **Schema:** migration for clusters, occupations (ISCO codes), localisations, skills, qualification routes, interest codes, and source / last-reviewed fields.
2. **Seed:** about 20 occupations across 5 clusters for Uganda and Kenya, clearly labelled as sample content.
3. **Career and cluster pages** (server-rendered, search-friendly), with search.
4. **"I want to become..." reverse path:** career -> ways in -> programmes -> subjects, per country.
5. **Interest quiz** mapped to RIASEC codes.
6. **Navigation:** Careers first; the admission simulator moves under "Tools".

**Effect on the HBS application:** the narrative shifts from "admission simulator" to "career pathways across Africa, with admissions as one tool". The live demo still shows the engine; career pages would strengthen it if any are ready before 12 November.
