-- Career Proof: global data layer (see docs/DATA_STRATEGY.md)
-- Every imported number keeps its source, licence and import run.

-- Every country is a region now; currency and exam detail are optional.
alter table public.regions alter column currency drop not null;

-- ---------------------------------------------------------------------------
-- Provenance
-- ---------------------------------------------------------------------------
create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  publisher text not null,
  url text not null,
  licence text not null,
  licence_url text,
  access_method text not null check (access_method in ('rest_api', 'sdmx_api', 'bulk_download', 'rss_feed', 'partner_feed', 'manual')),
  update_frequency text not null check (update_frequency in ('realtime', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'irregular')),
  status text not null default 'planned' check (status in ('planned', 'active', 'paused', 'retired')),
  attribution text not null,
  notes text,
  last_checked_at timestamptz
);
comment on table public.data_sources is 'Registry of every external data source, with licence and attribution. Nothing is imported without a row here.';

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources (id) on delete restrict,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'succeeded', 'partial', 'failed')),
  rows_read integer not null default 0 check (rows_read >= 0),
  rows_written integer not null default 0 check (rows_written >= 0),
  params jsonb not null default '{}',
  error text
);
create index on public.ingestion_runs (source_id, started_at desc);

-- ---------------------------------------------------------------------------
-- Labour-market statistics (World Bank JOIN, ILOSTAT, OECD)
-- ---------------------------------------------------------------------------
create table public.labour_indicators (
  id bigint generated always as identity primary key,
  source_id uuid not null references public.data_sources (id) on delete restrict,
  ingestion_run_id uuid references public.ingestion_runs (id) on delete set null,
  indicator_code text not null,
  indicator_name text not null,
  region_id uuid not null references public.regions (id) on delete cascade,
  isco_code text check (isco_code ~ '^[0-9]{1,4}$'),
  sex text not null default 'total' check (sex in ('total', 'female', 'male')),
  age_group text not null default 'total',
  education_level text not null default 'total',
  urbanisation text not null default 'total' check (urbanisation in ('total', 'urban', 'rural')),
  period text not null check (period ~ '^[0-9]{4}(-(Q[1-4]|[0-9]{2}))?$'),
  value numeric not null,
  unit text not null,
  observation_status text,
  unique nulls not distinct (source_id, indicator_code, region_id, isco_code, sex, age_group, education_level, urbanisation, period)
);
comment on column public.labour_indicators.isco_code is 'ISCO-08 code at any level: 1 digit = major group ... 4 digits = unit group. Null = all occupations.';
comment on column public.labour_indicators.period is 'YYYY, YYYY-Qn or YYYY-MM.';
create index on public.labour_indicators (region_id, isco_code);
create index on public.labour_indicators (indicator_code, period);

-- ---------------------------------------------------------------------------
-- Classification crosswalks
-- ---------------------------------------------------------------------------
create table public.occupation_crosswalks (
  occupation_id uuid not null references public.occupations (id) on delete cascade,
  scheme text not null check (scheme in ('ISCO-08', 'ESCO', 'ONET-SOC', 'SOC-2018', 'NOC-2021', 'ANZSCO', 'NATIONAL')),
  code text not null,
  label text,
  uri text,
  region_id uuid references public.regions (id) on delete cascade,
  source_id uuid references public.data_sources (id) on delete set null,
  primary key (occupation_id, scheme, code)
);
comment on table public.occupation_crosswalks is 'Maps our occupations to international and national classifications. NATIONAL rows carry region_id.';
create index on public.occupation_crosswalks (scheme, code);

-- ---------------------------------------------------------------------------
-- Job postings (partner feeds and employer posting; never scraped)
-- ---------------------------------------------------------------------------
create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources (id) on delete restrict,
  external_id text not null,
  title text not null,
  organisation text,
  region_id uuid references public.regions (id) on delete set null,
  city text,
  remote boolean not null default false,
  isco_code text check (isco_code ~ '^[0-9]{1,4}$'),
  occupation_id uuid references public.occupations (id) on delete set null,
  apply_url text not null check (apply_url ~ '^https://'),
  salary_min numeric check (salary_min >= 0),
  salary_max numeric,
  salary_currency text check (salary_currency ~ '^[A-Z]{3}$'),
  salary_period text check (salary_period in ('hour', 'day', 'month', 'year')),
  posted_at timestamptz not null,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'expired', 'withdrawn')),
  ingestion_run_id uuid references public.ingestion_runs (id) on delete set null,
  unique (source_id, external_id),
  check (salary_max is null or salary_min is null or salary_max >= salary_min)
);
comment on table public.job_postings is 'Live vacancies from partner feeds (with permission) and verified employers. Expired rows are hidden from the public.';
create index on public.job_postings (occupation_id, status);
create index on public.job_postings (region_id, status, posted_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: public read, admin write. Import jobs use the service role.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['data_sources', 'labour_indicators', 'occupation_crosswalks']
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

-- Import runs: admins only (operational data).
alter table public.ingestion_runs enable row level security;
grant select, insert, update on public.ingestion_runs to authenticated;
create policy "ingestion_runs: admin all" on public.ingestion_runs
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Job postings: the public sees only active, unexpired postings.
alter table public.job_postings enable row level security;
grant select on public.job_postings to anon, authenticated;
grant insert, update, delete on public.job_postings to authenticated;
create policy "job_postings: public read of live postings" on public.job_postings
  for select to anon, authenticated
  using ((status = 'active' and (expires_at is null or expires_at > now())) or (select private.is_admin()));
create policy "job_postings: admin write" on public.job_postings
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
