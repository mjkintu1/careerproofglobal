# Career path planner (`/paths`, `/paths/[country]`)

A node-and-wire planner in the spirit of automation builders such as n8n: start anywhere
(school or any guided career), pick a goal, and see every route between them.

## Model

- **Nodes (938):** the 68 guided careers plus every O\*NET 31.0 occupation that has related-occupation
  data. A guided career absorbs the O\*NET occupation it maps to (via `career-esco.json` and the crosswalk),
  so "Registered Nurses" (29-1141.00) and "nurse" are one node. Ids are guided slugs or O\*NET-SOC codes.
- **Colours:** "You are here" (green), goal (gold), steps (grey), changes of field (orange), qualifications (purple).
- **Edges (6,682)**, built once on the server in `apps/web/src/lib/path-network.ts`:
  | Evidence | Count | Time |
  |---|---|---|
  | Known moves (`sample-data` transitions) | 106 | Typical years recorded |
  | O\*NET Related Occupations (CC BY 4.0) | 5,526 | Not published |
  | Shared skills, 30%+ weighted by rarity, at least two non-generic skills | 80 | Not published |
  | Entry routes (guided routes; O\*NET education + Job Zone for the rest) | 970 | Route years / not published |
- O\*NET 31.0 no longer ships the Career Changers and Career Starters matrices; Related Occupations replaced them.
- **Ranking rules** (disclosed on the page; times shown are never altered):
  - A move with no published time costs the target's main qualification length (guided careers) or the
    minimum Specific Vocational Preparation for its O\*NET Job Zone (zone 1–2: 0.5 yr, 3: 1, 4: 2, 5: 4;
    SVP ranges from O\*NET's Job Zone Reference, years from the DOT SVP scale).
  - Each change of job adds 1 year, so a direct route beats hopping through many similar jobs.
  - At most 3 moves with no published time per route: chains of "similar" jobs drift in meaning.
    Known moves and entry routes are unlimited, so routes can be any length.
  - Licences (0 years), internships and supervised practice are not ways in on their own; postgraduate
    routes are offered only when retraining from a career, not from school.
- **Search:** `GET /api/paths?from&to&country` runs Yen's k-shortest loopless paths (12 routes) with a
  Dijkstra over (node, unpublished moves used) on a binary heap (`packages/career-graph/src/routes.ts`).
  Typical response: 15–80 ms. Routes much longer than the best are folded behind "Show longer routes".
- **Prompt:** `apps/web/src/lib/path-prompt.ts` matches guided titles, aliases, O\*NET titles (singular,
  each part of "A and B" / "Head, qualifier", last two words) and country names. Ties go to guided careers,
  then the most general title. Deterministic; it never invents a career or a figure.

## Pay and entry level by country

- **Pay:** ILOSTAT average monthly earnings of employees by ISCO-08 major group
  (`DF_EAR_EMTA_SEX_OCU_NB`), 151 countries, latest year since 2010, local currency, nominal.
  Snapshot: `packages/reference-data/src/snapshots/ilostat-earnings.json`; refresh with `npm run ingest:ilostat`.
  ILOSTAT does not publish single-occupation pay, so careers in one major group share a figure.
  Women, men and the ratio to all employees are shown.
- **Entry level:** ISCO-08 skill level of the major group (ILO, ISCO-08 Vol. I) plus each career's routes.

## Known gaps

- O\*NET-only nodes have no curated routes or local licensing bodies; their entry level is O\*NET's (US) view.
- Next: ESCO occupations (2,909) as nodes via the crosswalk, and O\*NET "reported job titles" as prompt aliases.
- Pay ranges (percentiles) exist only for the US (BLS OEWS, to be refetched with percentiles) and UK (ONS ASHE).
- ILOSTAT licence: CC BY 4.0 as stated on ILO publications; the ILOSTAT terms page refused automated access, so confirm.
- Route data mixes alternatives and sequential steps (e.g. degree + internship); splitting them would
  make time estimates more accurate.
