-- Career Proof: academic core schema (milestone M1, sprint day 1)
-- Country-agnostic: every country-specific value lives in rows (regions,
-- frameworks, rule_sets), never in code. See docs/IMPLEMENTATION_PLAN.md section 5.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create schema if not exists private;

-- Admins are marked in auth app_metadata (only settable server-side), never
-- in a user-editable table.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Localisation & frameworks
-- ---------------------------------------------------------------------------
create table public.regions (
  id uuid primary key default gen_random_uuid(),
  iso_code text not null unique check (iso_code ~ '^[A-Z]{2}$'),
  name text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  locale text not null default 'en',
  created_at timestamptz not null default now()
);
comment on table public.regions is 'Countries (or states) the platform covers.';

create table public.education_frameworks (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions (id) on delete restrict,
  code text not null unique,
  name text not null,
  level text not null check (level in ('primary', 'lower_secondary', 'upper_secondary', 'tertiary', 'professional')),
  created_at timestamptz not null default now()
);
comment on table public.education_frameworks is 'Examination / qualification systems, e.g. UG-UACE, KE-KCSE.';
create index on public.education_frameworks (region_id);

create table public.rule_sets (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.education_frameworks (id) on delete restrict,
  version text not null,
  valid_from_intake integer check (valid_from_intake between 1990 and 2100),
  rules jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'illustrative', 'published', 'retired')),
  source_url text,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (framework_id, version),
  check (status <> 'published' or (verified_by is not null and verified_at is not null))
);
comment on table public.rule_sets is 'Versioned admission rules as JSON, evaluated by packages/rules-engine. illustrative = demo values, not verified.';
comment on column public.rule_sets.status is 'draft: being edited; illustrative: demo values, never shown as official; published: verified; retired: superseded.';
create index on public.rule_sets (framework_id);

-- ---------------------------------------------------------------------------
-- Academic
-- ---------------------------------------------------------------------------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.education_frameworks (id) on delete restrict,
  code text not null,
  name text not null,
  kind text not null check (kind in ('principal', 'subsidiary', 'general')),
  unique (framework_id, code)
);
create index on public.subjects (framework_id);

create table public.combinations (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.education_frameworks (id) on delete restrict,
  code text not null,
  name text,
  unique (framework_id, code)
);
comment on table public.combinations is 'Common subject combinations, e.g. PCM, BCM, HEG.';

create table public.combination_subjects (
  combination_id uuid not null references public.combinations (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete restrict,
  primary key (combination_id, subject_id)
);
create index on public.combination_subjects (subject_id);

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions (id) on delete restrict,
  name text not null,
  short_name text,
  type text not null check (type in ('public', 'private')),
  website text,
  created_at timestamptz not null default now(),
  unique (region_id, name)
);
create index on public.institutions (region_id);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique
);
comment on table public.fields is 'Broad fields of study, used for alternatives and pathways.';

create table public.degrees (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields (id) on delete restrict,
  name text not null,
  level text not null check (level in ('certificate', 'diploma', 'bachelor', 'master', 'doctorate')),
  unique (name, level)
);
comment on table public.degrees is 'Abstract degree, independent of institution, e.g. Bachelor of Science in Civil Engineering.';
create index on public.degrees (field_id);

create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions (id) on delete restrict,
  degree_id uuid not null references public.degrees (id) on delete restrict,
  national_code text not null,
  title text not null,
  duration_years numeric(3, 1) check (duration_years > 0),
  fees_band text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (institution_id, national_code)
);
comment on table public.programmes is 'A degree offered at an institution, with its national admission code (the blueprint national_programs).';
create index on public.programmes (degree_id);

create table public.programme_requirements (
  programme_id uuid not null references public.programmes (id) on delete cascade,
  rule_set_id uuid not null references public.rule_sets (id) on delete restrict,
  subject_id uuid not null references public.subjects (id) on delete restrict,
  role text not null check (role in ('essential', 'relevant', 'desirable', 'mandatory', 'cluster')),
  min_grade text,
  primary key (programme_id, rule_set_id, subject_id, role)
);
comment on table public.programme_requirements is 'Which subjects count for a programme, and how (role is interpreted by the rule set).';
create index on public.programme_requirements (rule_set_id);
create index on public.programme_requirements (subject_id);

create table public.historical_cutoffs (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.programmes (id) on delete cascade,
  intake_year integer not null check (intake_year between 1990 and 2100),
  scheme text not null default 'merit',
  sex text not null default 'any' check (sex in ('any', 'F', 'M')),
  points numeric(6, 3) not null check (points >= 0),
  source_url text,
  is_illustrative boolean not null default false,
  entered_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (programme_id, intake_year, scheme, sex),
  check (is_illustrative or source_url is not null)
);
comment on column public.historical_cutoffs.is_illustrative is 'true for demo data. Real rows must cite a source_url.';

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  region_id uuid references public.regions (id) on delete set null,
  birth_year integer check (birth_year between 1920 and 2100),
  persona text not null default 'student' check (persona in ('student', 'early_career', 'professional')),
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Minimal profile. Birth year only (no full date of birth) to limit data held about minors.';

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null,
  version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
create index on public.consents (user_id);

create table public.saved_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rule_set_id uuid not null references public.rule_sets (id) on delete restrict,
  inputs jsonb not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
create index on public.saved_simulations (user_id);
create index on public.saved_simulations (rule_set_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Reference data: anyone can read, only admins can write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'regions', 'education_frameworks', 'subjects', 'combinations',
    'combination_subjects', 'institutions', 'fields', 'degrees', 'programmes',
    'programme_requirements', 'historical_cutoffs'
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

-- Rule sets: drafts and retired sets are visible to admins only.
alter table public.rule_sets enable row level security;
grant select on public.rule_sets to anon, authenticated;
grant insert, update, delete on public.rule_sets to authenticated;
create policy "rule_sets: public read of live sets" on public.rule_sets
  for select to anon, authenticated
  using (status in ('published', 'illustrative') or (select private.is_admin()));
create policy "rule_sets: admin insert" on public.rule_sets
  for insert to authenticated with check ((select private.is_admin()));
create policy "rule_sets: admin update" on public.rule_sets
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "rule_sets: admin delete" on public.rule_sets
  for delete to authenticated using ((select private.is_admin()));

-- Profiles: each user sees and edits only their own.
alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
create policy "profiles: owner read" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles: owner insert" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles: owner update" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Consents: the owner can record and withdraw, never rewrite history.
alter table public.consents enable row level security;
grant select, insert on public.consents to authenticated;
grant update (withdrawn_at) on public.consents to authenticated;
create policy "consents: owner read" on public.consents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "consents: owner insert" on public.consents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "consents: owner withdraw" on public.consents
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Saved simulations: owner only.
alter table public.saved_simulations enable row level security;
grant select, insert, delete on public.saved_simulations to authenticated;
create policy "saved_simulations: owner read" on public.saved_simulations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "saved_simulations: owner insert" on public.saved_simulations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saved_simulations: owner delete" on public.saved_simulations
  for delete to authenticated using ((select auth.uid()) = user_id);
