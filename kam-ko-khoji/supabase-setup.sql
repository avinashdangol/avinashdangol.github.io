-- =====================================================================
--  Kam Ko Khoji PL — database setup
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1) Admins ------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) Jobs --------------------------------------------------------------
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '30 days',
  status        text not null default 'pending' check (status in ('pending','approved','rejected','closed')),
  title         text not null check (char_length(title) between 2 and 90),
  company       text not null check (char_length(company) <= 90),
  city          text not null check (char_length(city) <= 60),
  category      text not null default 'other',
  salary        text check (char_length(salary) <= 60),
  hours         text check (char_length(hours) <= 60),
  contract      text check (char_length(contract) <= 20),
  languages     text check (char_length(languages) <= 60),
  accommodation boolean not null default false,
  docs_accepted text[] not null default '{}',
  description   text not null check (char_length(description) <= 1500),
  contact_name  text not null check (char_length(contact_name) <= 80),
  contact_phone text not null check (char_length(contact_phone) <= 30),
  contact_email text check (char_length(contact_email) <= 120)
);
alter table public.jobs enable row level security;

drop policy if exists "public sees live jobs" on public.jobs;
create policy "public sees live jobs" on public.jobs
  for select using (status = 'approved' and expires_at > now());

drop policy if exists "anyone can submit a job for review" on public.jobs;
create policy "anyone can submit a job for review" on public.jobs
  for insert with check (status = 'pending');

drop policy if exists "admins manage jobs" on public.jobs;
create policy "admins manage jobs" on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Visitors may read only the public columns (poster phone/email stay hidden)
revoke select, update, delete on public.jobs from anon;
grant select (id, created_at, expires_at, status, title, company, city, category, salary, hours,
              contract, languages, accommodation, docs_accepted, description) on public.jobs to anon;
grant insert on public.jobs to anon;

-- 3) Applications --------------------------------------------------------
create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  job_id       uuid references public.jobs(id) on delete set null,
  status       text not null default 'new' check (status in ('new','contacted','forwarded','hired','rejected')),
  full_name    text not null check (char_length(full_name) <= 90),
  phone        text not null check (char_length(phone) <= 30),
  email        text check (char_length(email) <= 120),
  current_city text check (char_length(current_city) <= 60),
  doc_status   text not null check (doc_status in ('visa','trc','trc_applied','other')),
  doc_paths    text[] not null default '{}' check (cardinality(doc_paths) <= 3),
  message      text check (char_length(message) <= 800),
  consent      boolean not null check (consent = true)
);
alter table public.applications enable row level security;

drop policy if exists "anyone can apply" on public.applications;
create policy "anyone can apply" on public.applications
  for insert with check (consent = true and status = 'new');

drop policy if exists "admins manage applications" on public.applications;
create policy "admins manage applications" on public.applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke select, update, delete on public.applications from anon;
grant insert on public.applications to anon;

-- Logged-in admins (rules above still check is_admin)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.jobs, public.applications to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- 4) Private document storage -----------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 5242880, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf','image/jpeg','image/png'];

drop policy if exists "anyone can upload documents" on storage.objects;
create policy "anyone can upload documents" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'documents');

drop policy if exists "admins read documents" on storage.objects;
create policy "admins read documents" on storage.objects
  for select to authenticated using (bucket_id = 'documents' and public.is_admin());

drop policy if exists "admins delete documents" on storage.objects;
create policy "admins delete documents" on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and public.is_admin());

-- =====================================================================
--  AFTER running this file:
--  1. Authentication → Users → "Add user" → create YOUR admin email + password.
--  2. Run this (with your email) to make that user an admin:
--
--     insert into public.admins (user_id)
--     select id from auth.users where email = 'YOUR-EMAIL@example.com';
--
--  3. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up".
-- =====================================================================

-- Optional clean-up (run every month, or schedule with pg_cron):
-- deletes applications older than 90 days. Delete their files in Storage too
-- (or use the "Delete" button in admin.html, which removes both).
--   delete from public.applications where created_at < now() - interval '90 days';
