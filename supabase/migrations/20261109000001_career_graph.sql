-- Career Proof: global career graph (career-paths-first)
-- Three layers, see docs/STUDENTHUB_ANALYSIS.md section 3:
--   1. global graph: clusters, occupations (ISCO-08), skills, transitions
--   2. country overlay: occupation_localisations, region-specific routes
--   3. evidence: source_url + last_reviewed_at on every fact

-- Regions gain the name of their school-leaving exams, shown on career pages.
alter table public.regions add column secondary_exams text;
alter table public.regions add column sort_order integer not null default 100;

create table public.career_clusters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique,
  description text not null,
  sort_order integer not null default 100
);
comment on table public.career_clusters is 'Browsing groups for occupations (our own grouping, similar to career clusters).';

create table public.occupations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  isco_code text check (isco_code ~ '^[0-9]{4}$'),
  cluster_id uuid not null references public.career_clusters (id) on delete restrict,
  summary text not null,
  tasks text[] not null default '{}',
  typical_level text not null check (typical_level in ('none', 'certificate', 'diploma', 'bachelor', 'master', 'doctorate')),
  riasec text check (riasec ~ '^[RIASEC]{1,3}$'),
  school_subjects text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'illustrative', 'published', 'retired')),
  source_url text,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
comment on table public.occupations is 'Global occupation, keyed to ISCO-08 where known. Country detail lives in occupation_localisations.';
comment on column public.occupations.riasec is 'Holland interest code (up to 3 letters), used by the interest quiz.';
comment on column public.occupations.school_subjects is 'Secondary-school subjects that keep this path open, by common name (country mapping comes later).';
create index on public.occupations (cluster_id);
create index on public.occupations (isco_code);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique,
  kind text not null default 'skill' check (kind in ('skill', 'knowledge', 'tool')),
  esco_uri text
);

create table public.occupation_skills (
  occupation_id uuid not null references public.occupations (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  importance smallint not null default 2 check (importance between 1 and 3),
  primary key (occupation_id, skill_id)
);
create index on public.occupation_skills (skill_id);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  issuer text,
  typical_months integer check (typical_months > 0),
  scope text not null default 'global' check (scope in ('global', 'regional', 'national'))
);

-- Ways into an occupation. region_id null = applies everywhere.
create table public.qualification_routes (
  id uuid primary key default gen_random_uuid(),
  occupation_id uuid not null references public.occupations (id) on delete cascade,
  region_id uuid references public.regions (id) on delete cascade,
  route_type text not null check (route_type in ('degree', 'diploma', 'certificate', 'apprenticeship', 'certification', 'licence', 'experience')),
  title text not null,
  typical_years numeric(3, 1) check (typical_years >= 0),
  degree_id uuid references public.degrees (id) on delete set null,
  certification_id uuid references public.certifications (id) on delete set null,
  sort_order integer not null default 100,
  source_url text,
  last_reviewed_at timestamptz
);
create index on public.qualification_routes (occupation_id);
create index on public.qualification_routes (region_id);

-- Career paths: moves from one occupation to another.
create table public.occupation_transitions (
  id uuid primary key default gen_random_uuid(),
  from_occupation_id uuid not null references public.occupations (id) on delete cascade,
  to_occupation_id uuid not null references public.occupations (id) on delete cascade,
  kind text not null check (kind in ('progression', 'specialisation', 'pivot')),
  typical_years numeric(3, 1) check (typical_years >= 0),
  via text,
  region_id uuid references public.regions (id) on delete cascade,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  source_url text,
  check (from_occupation_id <> to_occupation_id),
  unique nulls not distinct (from_occupation_id, to_occupation_id, kind, region_id)
);
comment on table public.occupation_transitions is 'Directed career moves. pivot = change of field (dashed edge in the Explorer). evidence_count grows with Venturer journeys.';
create index on public.occupation_transitions (to_occupation_id);
create index on public.occupation_transitions (region_id);

-- Country overlay for an occupation.
create table public.occupation_localisations (
  occupation_id uuid not null references public.occupations (id) on delete cascade,
  region_id uuid not null references public.regions (id) on delete cascade,
  local_title text,
  context text,
  regulator text,
  regulator_url text,
  salary_band_low numeric(14, 2) check (salary_band_low >= 0),
  salary_band_high numeric(14, 2),
  salary_period text check (salary_period in ('month', 'year')),
  salary_source text,
  salary_year integer check (salary_year between 2000 and 2100),
  demand text not null default 'unknown' check (demand in ('low', 'medium', 'high', 'unknown')),
  is_illustrative boolean not null default false,
  source_url text,
  last_reviewed_at timestamptz,
  primary key (occupation_id, region_id),
  check (salary_band_high is null or salary_band_low is null or salary_band_high >= salary_band_low),
  check (salary_band_low is null or salary_source is not null)
);
create index on public.occupation_localisations (region_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: public read, admin write (same pattern as academic core)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'career_clusters', 'skills', 'occupation_skills', 'certifications',
    'qualification_routes', 'occupation_transitions', 'occupation_localisations'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "%s: public read" on public.%I for select to anon, authenticated using (true)', t, t);
    execute format('create policy "%s: admin insert" on public.%I for insert to authenticated with check ((select private.is_admin()))', t, t);
    execute format('create policy "%s: admin update" on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t, t);
    execute format('create policy "%s: admin delete" on public.%I for delete to authenticated using ((select private.is_admin()))', t, t);
  end loop;
end
$$;

-- Occupations: drafts and retired entries are visible to admins only.
alter table public.occupations enable row level security;
grant select on public.occupations to anon, authenticated;
grant insert, update, delete on public.occupations to authenticated;
create policy "occupations: public read of live entries" on public.occupations
  for select to anon, authenticated
  using (status in ('published', 'illustrative') or (select private.is_admin()));
create policy "occupations: admin insert" on public.occupations
  for insert to authenticated with check ((select private.is_admin()));
create policy "occupations: admin update" on public.occupations
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "occupations: admin delete" on public.occupations
  for delete to authenticated using ((select private.is_admin()));
