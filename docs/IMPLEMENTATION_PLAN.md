# Career Proof — Implementation Plan (Uganda Pilot, v0.2)

Companion to `master_strategy_technical_blueprint.md`. This turns the blueprint into a buildable plan, fixes the gaps found in review, and records the decisions made so far.

**v0.2 (2026-11-08):** aligned with the PDF *Global Master Strategy & Blueprint* (same content as the markdown blueprint, plus scholarships, verified internships, Lucide/Heroicons and no heavy shadows). Decisions from that review are in §2.

**Status (11 Nov 2026):** the product direction has moved on from this plan. The live site is career-paths-first and
global (path planner, pay by country, curricula, CV and salary tools, cited admission data for Uganda and the UK),
not simulator-first. Scholarships, verified internships, Venturer profiles and accounts below are still **not built**.
Current status lives in `SITE_ESSENTIALS_PLAN.md`, `CRITICAL_REVIEW.md`, `CAREER_PATH_PLANNER.md` and `PAY_BENCHMARKS.md`;
this document is kept for the original reasoning.

---

## 1. MVP scope (agreed)

The blueprint describes five modules. Building all five at once is the main risk to the pilot. The MVP should prove one thing well: **“A Ugandan S6 student can see, in under two minutes, which public-university programmes they qualify for and how safe each one is.”**

| Module | MVP (Phase 1) | Later |
|---|---|---|
| B. Admission Simulator (UACE → public universities) | **Yes — core** | Private universities, diploma entry, mature-age entry |
| A. What-If Sandbox (A-level combination → blocked degrees) | **Yes** (reuses the same rules engine) | O-level → A-level combination guidance |
| D. Pathway Explorer | **Read-only list + simple graph** for ~30 careers | Full React Flow mind-map, pivot edges |
| E. Venturer Profiles | **Tier 1 + Tier 2** (self-reported, LinkedIn/work email) | Tier 3 document verification |
| F. Scholarships | **Yes** — searchable list + eligibility check against the student’s results, field, region and sex | Application tracking, deadline reminders |
| G. Verified internships | **Yes** — listings from verified organisations, linked to programmes and careers | Matching, in-app applications |
| C. Professional Pivot Node | **No** — data model only | Phase 2 |

Why this cut: A and B share one engine and one dataset (subject requirements + cut-offs). That is the hardest and most valuable data to build, and nobody else presents it well. C needs salary and certification data that doesn’t exist yet in a usable form. Scholarships (F) reuse the same eligibility engine, so they fit the first release; internships (G) give early-career users a reason to use the platform from day one.

---

## 2. Decisions

**Decided (2026-11-08):**
- **Rules engine:** rules stored as versioned JSON in Postgres, calculated by a shared TypeScript package (not Postgres RPC). See §4.
- **Launch order:** students first — Simulator, Sandbox, Scholarships, Internships, Venturer profiles and Explorer v1 in the pilot; Professional Pivot Node after the pilot.
- **Verified badge:** teal check icon + text. Gold stays for highlights, warnings and the Borderline zone.
- **Scholarships and verified internships:** in the first release.

**Still open (defaults in bold):**

1. **Launch institutions:** **Makerere + Kyambogo + MUST + Gulu + Busitema (public, PUJAB)** — or Makerere only for a narrower first release.
2. **Low-end devices:** **Mobile web, list-first, < 150 KB JS on the simulator page; no USSD in Phase 1** — or add a USSD/SMS channel (needs a telco/aggregator partner such as Africa’s Talking).
3. **Sign-in required for the simulator?** **No.** Anonymous use; sign-in only to save results or submit a Venturer profile. (Also reduces how much data about minors you hold.)
4. **Team / timeline:** plan below assumes **1–2 developers, ~16 weeks**. Adjust if different.
5. **Data partners:** who can supply historical cut-offs and scholarship listings, and help verify the rules? (Candidates: university admissions offices, careers teachers, education NGOs.)

---

## 3. Architecture

```
Next.js (App Router, TypeScript)  ── deployed on Vercel (or Cloudflare)
 ├─ /simulator, /sandbox      → static shell + client-side rules engine (works on slow 3G, cacheable)
 ├─ /pathways, /venturers     → server-rendered for SEO
 └─ /admin                    → data entry & review for rules, programmes, cut-offs, Venturers
packages/rules-engine         → pure TS, zero dependencies, fully unit-tested
Supabase
 ├─ Postgres (+ RLS)          → reference data, rules JSON, users, Venturers
 ├─ Auth                      → magic link, Google, LinkedIn (OIDC)
 └─ Storage                   → NOT used for Tier 3 docs in MVP
```

- **Monorepo:** pnpm workspaces — `apps/web`, `packages/rules-engine`, `packages/db` (types generated from Supabase), `supabase/` (migrations + seed).
- **UI:** shadcn/ui + Radix (as blueprint). React Flow loaded **only** on the Pathway Explorer graph view, lazily, with a list view as the default on small screens.
- **Offline / slow networks:** reference data for the simulator (programmes, requirements, cut-offs for Uganda) is published as one versioned, gzipped JSON file (a few hundred KB) cached by a service worker. After the first load, the simulator works offline.
- **Analytics:** privacy-friendly (Plausible, or PostHog with no PII); metrics in §10.

---

## 4. The rules engine

### 4.1 Decided: TypeScript evaluator + JSON rules in Postgres

The blueprint puts the rules in Postgres stored procedures. I recommend keeping the **rules as data in Postgres** (so adding a country is still a data change, not a deploy) but **evaluating them in a shared TypeScript package**:

- The What-If Sandbox needs instant feedback on every tap; a server round-trip per change is slow on 3G.
- Pure functions in TS are far easier to unit-test against official worked examples than PL/pgSQL.
- The same package runs server-side for SEO pages and for any API.
- Postgres functions are still used for what they do well: filtering/searching programmes and aggregating cut-off history.
- Scholarship eligibility uses the same condition format and evaluator as admission rules.

### 4.2 Rules are versioned

`rule_sets(id, framework_id, version, valid_from_intake, json, status[draft|published], source_url, verified_by, verified_at)`. Every simulation result records the rule-set version it used. Rules change (e.g. the new lower-secondary competency-based curriculum changes O-level grading for later cohorts), so old and new rule sets must coexist.

### 4.3 Shape of a Uganda PUJAB rule set (illustrative — every value must be verified against the official PUJAB / university guidelines before launch)

```json
{
  "framework": "UG-UACE",
  "version": "2026.1",
  "grades": { "principal": { "A": 6, "B": 5, "C": 4, "D": 3, "E": 2, "O": 1, "F": 0 },
              "subsidiary": { "pass": 1, "fail": 0 } },
  "minimum_entry": { "principal_passes": 2, "uce_passes": 5 },
  "weighting": {
    "essential": { "count": 2, "weight": 3 },
    "relevant":  { "count": 1, "weight": 2 },
    "desirable": { "subjects": ["GP", "SUB_MATH", "SUB_ICT"], "weight": 1 }
  },
  "uce_bonus": { "distinction": 0.3, "credit": 0.2, "pass": 0.1 },
  "adjustments": [
    { "id": "female_bonus", "applies_to": "public", "points": 1.5, "condition": { "field": "sex", "equals": "F" } }
  ],
  "schemes": ["merit", "district_quota", "disability", "sports"]
}
```

Programme-specific requirements live per programme (`programme_requirements`): which subjects are essential/relevant for that course, plus any mandatory subject or minimum grade (e.g. “must have Chemistry at C or better”).

### 4.4 Engine API

```ts
evaluate(ruleSet, programme, applicant) → {
  eligible: boolean, blockedBy: Reason[],      // used by the Sandbox
  weightedPoints: number, breakdown: Line[],   // shown to the user — show the working
  zone: "safe" | "borderline" | "danger" | "no_data",
  cutoffHistory: { year, points, scheme }[]
}
suggestAlternatives(...) → Programme[]         // same field, lower cut-off, still eligible
```

### 4.5 Zone logic (v1, deliberately simple and explainable)

Using the last 3–5 years of cut-offs for the same programme, institution and scheme:
- **Safe:** points ≥ the highest cut-off in the window + a margin (e.g. +1.0)
- **Borderline:** points within the min–max range of past cut-offs
- **Danger:** points below the lowest past cut-off
- **No data:** fewer than 2 years of cut-offs — say so plainly; never guess

Always show the actual cut-off history next to the zone. Do not present it as a “probability %” in v1 — the data will not support that claim.

### 4.6 Testing

- A **golden test file** of worked examples (from official guidelines, admissions offices, careers teachers) — the engine must reproduce every one exactly.
- Property tests: dropping a subject never *increases* eligibility; raising a grade never *lowers* points.
- A rule set can only move to `published` after passing the golden suite.

---

## 5. Database schema v1

Fixes the gaps from the review: adds users/consent, requirement mappings, relational career edges, verification records and rule versioning.

**Localisation & frameworks**
- `regions(id, iso_code, name, currency, locale)`
- `education_frameworks(id, region_id, code, name, level[secondary|tertiary|professional])` — e.g. UCE, UACE
- `rule_sets` — see §4.2

**Academic**
- `subjects(id, framework_id, code, name, kind[principal|subsidiary|uce])`
- `combinations(id, framework_id, code, subject_ids[])` — e.g. PCM, BCM, HEG
- `institutions(id, region_id, name, type[public|private], website)`
- `degrees(id, name, field_id, level)` — the abstract degree, e.g. “BSc Civil Engineering”
- `programmes(id, institution_id, degree_id, national_code, duration_years, fees_band, active)` — the blueprint’s `national_programs`
- `programme_requirements(programme_id, rule_set_id, subject_id, role[essential|relevant|desirable|mandatory], min_grade)`
- `historical_cutoffs(programme_id, intake_year, scheme, sex, points, source_url, entered_by)`

**Labour market**
- `fields(id, name)` · `industries(id, name)`
- `careers(id, title, industry_id, description)`
- `salary_bands(id, career_id, region_id, seniority, band_low, band_high, currency, source, year)` — brackets only
- `certifications(id, name, issuer, cost_band, typical_months, region_scope)`
- `pathway_edges(id, from_type, from_id, to_type, to_id, kind[direct|pivot], evidence_count)` — powers the Explorer; `kind = pivot` renders dashed

**People**
- `profiles(user_id → auth.users, display_name, region_id, birth_year, role[student|professional|admin], created_at)`
- `consents(user_id, purpose, version, granted_at, withdrawn_at)`
- `venturers(id, user_id, headline, current_career_id, salary_band_id, visibility, verification_tier)`
- `venturer_steps(id, venturer_id, seq, step_type[subject|degree|cert|job|bootcamp|side_hustle], ref_id, start_year, end_year, note)` — relational, so the Explorer can query “who went from X to Y”
- `verifications(id, venturer_id, tier, method[linkedin|work_email|document], verified_at, reviewer_id)` — stores the outcome only, never the document
- `saved_simulations(id, user_id, rule_set_id, inputs_json, results_json, created_at)`

**Opportunities (scholarships & internships)**
- `organisations(id, name, type[employer|scholarship_provider|ngo|government|university], email_domain, website, verified_at, verified_by)`
- `organisation_members(organisation_id, user_id, role[owner|editor])` — verified through the organisation’s email domain
- `scholarships(id, organisation_id, region_id, name, level[a_level|undergraduate|postgraduate|professional], field_ids[], eligibility_json, coverage[full|partial|stipend], value_band, opens_on, deadline, apply_url, source_url, status[draft|published|expired], last_checked_at)`
- `scholarship_programmes(scholarship_id, programme_id)` — when a scholarship is tied to specific programmes
- `internships(id, organisation_id, region_id, title, career_id, field_ids[], location, mode[onsite|remote|hybrid], paid, stipend_band, starts_on, duration_weeks, deadline, apply_url, status[draft|published|expired], verified_by)`
- `saved_opportunities(user_id, opportunity_type[scholarship|internship], opportunity_id, created_at)`

**RLS summary:** reference data — public read, admin write. `profiles`, `consents`, `saved_simulations` — owner only. `venturers` / `venturer_steps` — public read when `visibility = public` and approved; owner write. Admin role via a custom JWT claim. `scholarships` / `internships` — public read when `status = published`; write by admins and, for internships, members of the verified organisation. Listings past their deadline are marked `expired` automatically.

---

## 6. Design system corrections

The blueprint’s colours fail WCAG AA contrast as specified (white on `#00B4D8` ≈ 2.5:1; `#FDC500` on white ≈ 1.6:1). Keep the brand hues, change how they are used:

| Token | Value | Use | Contrast |
|---|---|---|---|
| `teal-500` (brand) | `#00B4D8` | Large graphics, fills **with dark text** | dark text on it ≈ 8.5:1 |
| `teal-700` | `#0077B6` | Primary buttons (white text), links | white on it ≈ 4.9:1 |
| `gold-400` (brand) | `#FDC500` | Highlight fills **with dark text only** | `#1A1A1A` on it > 10:1 |
| `gold-800` | `#8A6A00` | Gold-family text on white | ≈ 5:1 |
| `text` | `#1A1A1A` | Body text | |

Rules:
- **Icons:** functional SVG icons only (Lucide); no emojis. No heavy drop-shadows: crisp 1–2px borders instead.
- **Verified badge:** teal check icon + the words “Verified (Tier 2)”. Not gold — gold means “caution” in the simulator.
- **Zones:** colour + icon + word (“Safe”, “Borderline”, “Danger”). Never colour alone.
- Inter, 16px base, 1.25 type scale. Visible 3px focus rings. Minimum tap target 44px.
- Re-check all ratios with a contrast tool once tokens are final.

---

## 7. Milestones (~16 weeks, 1–2 developers)

| # | Weeks | Milestone | Done when |
|---|---|---|---|
| M0 | 1 | **Foundations** | Monorepo, Supabase project, CI (lint, typecheck, tests), design tokens, deploy preview |
| M1 | 2–4 | **Rules engine + data model** | Engine package passes golden tests; schema migrated (incl. opportunities tables); admin can enter programmes, requirements, cut-offs |
| M2 | 3–8 | **Data seeding (in parallel)** | 5 universities: programmes + requirements + ≥3 years of cut-offs; ≥50 current scholarships; first partner organisations verified — every row with a source |
| M3 | 5–7 | **Admission Simulator** | Enter UACE + UCE results → ranked programme list with points breakdown, zone, cut-off history, alternatives; works offline after first load |
| M4 | 7–8 | **What-If Sandbox** | Toggle subjects/grades → programmes unlock/lock live, with the reason shown |
| M5 | 8–10 | **Accounts + Venturer profiles (Tier 1–2)** | Magic link / Google / LinkedIn sign-in; consent capture; Venturer timeline builder; admin approval queue |
| M6 | 10–12 | **Scholarships & verified internships** | Scholarship search with a “you may qualify” check from simulator results; organisation verification by email domain; internship listings and posting; automatic expiry |
| M7 | 12–14 | **Pathway Explorer v1** | Career pages (SEO), list view of pathways, lazy-loaded graph on desktop, linked Venturers, scholarships and internships |
| M8 | 14–15 | **Hardening** | Accessibility audit (axe + manual screen reader), performance budget met on a low-end Android over throttled 3G, RLS security review |
| M9 | 16 | **Pilot launch** | 3–5 partner schools, 100+ Venturers seeded, feedback loop live |

Phase 2 (after pilot): Professional Pivot Node, Tier 3 verification, O-level → A-level combination guidance, USSD channel if chosen.
Phase 3: second country (Kenya or Rwanda) added purely as data + a rule set — the real test of the “Global Rules Engine” claim.

---

## 8. Data acquisition plan (the critical path)

| Dataset | Likely source | Effort |
|---|---|---|
| Programme list + national codes | University admissions publications / PUJAB guidelines | Medium |
| Essential/relevant subjects per programme | University admission requirements documents, reviewed by a careers teacher | **High** |
| Historical cut-offs (≥3 yrs, per scheme, per sex) | Published admission lists / cut-off releases, newspapers | **High** |
| Worked examples for golden tests | Admissions offices, careers teachers | Medium |
| Scholarships (eligibility, value, deadlines) | Ministry of Education and Sports, university financial-aid offices, NGOs, foundations, embassies | **High** (changes every year) |
| Internship listings | Partner employers, verified by email domain; university placement offices | Medium |
| Careers + salary bands | Labour-market surveys, job boards, Venturer submissions | Later |

Every row stores `source_url` and `entered_by`; a second person reviews before publishing. Build the admin data-entry screens early (M1) so seeding is not blocked on engineering.

---

## 9. Compliance & safety

- **Uganda Data Protection and Privacy Act, 2019:** register with the Personal Data Protection Office before collecting personal data; publish a privacy notice; name a data protection contact.
- **Minors:** the simulator is anonymous by default. Accounts for under-18s collect the minimum (birth year only, no school required); confirm with a local lawyer whether parental consent is needed.
- **Salaries:** brackets only; hide a bracket for a career/region until it has enough submissions (e.g. ≥5) to avoid identifying people.
- **Tier 3 (Phase 2):** process documents in memory or via a third-party verification provider; store only the outcome; never persist the file.
- **Disclaimer on every simulator result:** “Estimate based on past cut-offs. Official admission decisions are made by the universities.”

---

## 10. Success metrics for the pilot

- Simulator completions (results entered → results viewed) and median time to result
- Share of sessions on mobile / slow connections that complete successfully
- Accuracy: once real admission lists are published, % of users whose “Safe” programmes actually admitted them
- Venturer profiles submitted / approved; % at Tier 2
- Return visits (the lifelong-use signal)

## 11. Top risks

1. **Data quality / availability** — source-tracking, review workflow, a “no data” state instead of guessing.
2. **Rules errors misleading students** — golden tests, versioned rule sets, visible working, disclaimer, partner review.
3. **Scope creep across five modules** — hold the MVP line in §1.
4. **Low-end device performance** — JS budget enforced in CI; list-first UI.
5. **Stale scholarship / internship listings** — deadlines drive automatic expiry; show “last checked” dates; a periodic review queue for admins.
6. **Venturer cold start** — personal network and partner-employer outreach before launch; keep the profile form short.
