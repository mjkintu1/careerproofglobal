-- Career Proof: global occupation catalogue from official classifications.
--   isco_groups       ISCO-08 hierarchy (via ESCO API)                 (c) European Union / ILO
--   esco_occupations  ESCO v1.2.x occupations mapped to ISCO-08       (c) European Union, reuse with acknowledgement
--   onet_occupations  O*NET 31.0 detail (tasks, skills, interests)    USDOL/ETA, CC BY 4.0
--   esco_onet_links   official ESCO <-> O*NET-SOC crosswalk           O*NET Resource Center, CC BY 4.0
-- Loaded by scripts/ingest/load-catalogue.mjs (service role), not by seed.sql.

create table public.isco_groups (
  code text primary key check (code ~ '^[0-9]{1,4}$'),
  level smallint not null check (level between 1 and 4),
  title text not null,
  description text,
  parent_code text references public.isco_groups (code) on delete restrict,
  esco_uri text unique,
  check ((level = 1) = (parent_code is null)),
  check (char_length(code) = level)
);
comment on table public.isco_groups is 'ISCO-08: 10 major, 43 sub-major, 130 minor and 436 unit groups, with definitions.';
create index on public.isco_groups (parent_code);

create table public.esco_occupations (
  code text primary key,
  uri text not null unique,
  title text not null,
  description text,
  alt_labels text[] not null default '{}',
  isco_code text not null references public.isco_groups (code) on delete restrict,
  broader_code text,
  regulated boolean not null default false,
  essential_skills text[] not null default '{}',
  optional_skill_count integer not null default 0
);
comment on column public.esco_occupations.regulated is 'ESCO marks the profession as regulated in at least one EU country.';
create index on public.esco_occupations (isco_code);

create table public.onet_occupations (
  soc_code text primary key check (soc_code ~ '^[0-9]{2}-[0-9]{4}\.[0-9]{2}$'),
  title text not null,
  description text not null,
  tasks text[] not null default '{}',
  skills text[] not null default '{}',
  riasec text check (riasec ~ '^[RIASEC]{1,3}$'),
  education text,
  job_zone smallint check (job_zone between 1 and 5),
  reported_titles text[] not null default '{}',
  related_soc_codes text[] not null default '{}'
);
comment on column public.onet_occupations.job_zone is 'O*NET Job Zone 1 (little preparation) to 5 (extensive preparation).';

create table public.esco_onet_links (
  esco_code text not null,
  soc_code text not null references public.onet_occupations (soc_code) on delete cascade,
  primary key (esco_code, soc_code)
);
comment on table public.esco_onet_links is 'Official crosswalk (AI-assisted with human validation). Treat as related, not identical.';
create index on public.esco_onet_links (soc_code);

-- Curated careers can point at their ESCO occupation(s).
comment on table public.occupation_crosswalks is 'Maps curated occupations to ISCO-08, ESCO (code), O*NET-SOC and national codes.';

do $$
declare
  t text;
begin
  foreach t in array array['isco_groups', 'esco_occupations', 'onet_occupations', 'esco_onet_links']
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
