-- Career Proof: features adopted from the StudentHub teardown (docs/STUDENTHUB_TECHNICAL_TEARDOWN.md section 8)
--   1. global school subjects linked to careers and to each country's exam subjects (subject pages, subject selector)
--   2. saved items (StudentHub "follow" for careers and courses)
--   3. page feedback ("Did this page help?"), anonymous, no personal data
--   4. documented sponsorship schemes for cut-offs (government / private day / private evening)

-- ---------------------------------------------------------------------------
-- 1. Global subjects
-- ---------------------------------------------------------------------------
create table public.global_subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique,
  description text not null
);
comment on table public.global_subjects is 'Country-neutral school subjects (Physics, Biology...). National exam subjects map onto these.';

create table public.occupation_subjects (
  occupation_id uuid not null references public.occupations (id) on delete cascade,
  global_subject_id uuid not null references public.global_subjects (id) on delete restrict,
  requirement text not null check (requirement in ('required', 'option')),
  primary key (occupation_id, global_subject_id)
);
comment on column public.occupation_subjects.requirement is 'required = keep this subject; option = one of several alternatives.';
create index on public.occupation_subjects (global_subject_id);

-- National exam subjects (e.g. UACE PHY, KCSE PHY) point at the global subject.
alter table public.subjects add column global_subject_id uuid references public.global_subjects (id) on delete set null;
create index on public.subjects (global_subject_id);

-- Ways in can point at a real degree, so a career links to the programmes that offer it.
create index if not exists qualification_routes_degree_id_idx on public.qualification_routes (degree_id);

-- ---------------------------------------------------------------------------
-- 2. Saved items (signed-in users)
-- ---------------------------------------------------------------------------
create table public.saved_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('occupation', 'programme', 'path')),
  item_key text not null check (char_length(item_key) between 1 and 200),
  location text check (location ~ '^[a-z]{2}$|^global$'),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_key)
);
comment on column public.saved_items.item_key is 'Occupation slug, programme id, or "from-slug>to-slug" for a saved path.';

-- ---------------------------------------------------------------------------
-- 3. Page feedback (anonymous)
-- ---------------------------------------------------------------------------
create table public.page_feedback (
  id uuid primary key default gen_random_uuid(),
  page_path text not null check (page_path ~ '^/' and char_length(page_path) <= 300),
  helpful boolean not null,
  comment text check (char_length(comment) <= 500),
  location text check (location ~ '^[a-z]{2}$|^global$'),
  created_at timestamptz not null default now()
);
comment on table public.page_feedback is 'Did this page help? No user id, IP or other personal data is stored. Add rate limiting at the edge before launch.';
create index on public.page_feedback (page_path, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Cut-off schemes
-- ---------------------------------------------------------------------------
comment on column public.historical_cutoffs.scheme is
  'Admission scheme. Uganda: government, private_day, private_evening, district_quota, disability, sports. Kenya: government (KUCCPS), self_sponsored. merit = generic. A missing year has NO row (never a 0).';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['global_subjects', 'occupation_subjects']
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

-- Saved items: owner only.
alter table public.saved_items enable row level security;
grant select, insert, delete on public.saved_items to authenticated;
create policy "saved_items: owner read" on public.saved_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "saved_items: owner insert" on public.saved_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saved_items: owner delete" on public.saved_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Page feedback: anyone may submit; only admins may read or remove.
alter table public.page_feedback enable row level security;
grant insert on public.page_feedback to anon, authenticated;
grant select, delete on public.page_feedback to authenticated;
create policy "page_feedback: anyone can submit" on public.page_feedback
  for insert to anon, authenticated with check (true);
create policy "page_feedback: admin read" on public.page_feedback
  for select to authenticated using ((select private.is_admin()));
create policy "page_feedback: admin delete" on public.page_feedback
  for delete to authenticated using ((select private.is_admin()));
