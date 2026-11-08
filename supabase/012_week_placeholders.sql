-- FalconBridge Partners — week placeholders and pack reservations (October 2026). Run after 001–011.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- Every Monday the site creates one placeholder study page per territory, named by week, not by content
-- (/research/studies/2026-week-44-new-zealand). Jessica's LinkedIn posts link to it before the study exists.
-- Until the pack lands the page says "on its way" and takes a reader's name and email; when the study is
-- published the placeholder becomes the study and every reservation is sent the pack. If no study is produced
-- for that territory that week, the placeholder closes and reservations are pointed to the Weekly Signal.

alter table public.reports add column if not exists placeholder boolean not null default false;
-- 'pending' while waiting for the pack · 'no-study' once closed without one. Null on an ordinary study.
alter table public.reports add column if not exists placeholder_status text check (placeholder_status in ('pending', 'no-study'));
create index if not exists reports_placeholder_idx on public.reports (placeholder, week_label, territory) where placeholder;

create table if not exists public.pack_reservations (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports(id) on delete cascade,
  full_name     text not null,
  email         citext not null,
  organisation  text,
  consent       boolean not null default false,
  created_at    timestamptz not null default now(),
  -- When the pack-has-landed email went out (an access_requests row is created at the same moment).
  fulfilled_at  timestamptz,
  access_request_id uuid references public.access_requests(id) on delete set null,
  -- When the reader was told no study was produced for that week.
  closed_at     timestamptz
);
create index if not exists pack_reservations_open_idx on public.pack_reservations (report_id) where fulfilled_at is null and closed_at is null;
create unique index if not exists pack_reservations_once_idx on public.pack_reservations (report_id, email);

alter table public.pack_reservations enable row level security;
revoke all on public.pack_reservations from anon, authenticated;
grant all privileges on all tables in schema public to service_role;

-- Jessica signs in to /admin with a magic link to jessica@falconbp.com.
insert into public.admin_users (email, display_name, active) values ('jessica@falconbp.com', 'Jessica Jane Campbell', true)
on conflict (email) do update set active = true, display_name = excluded.display_name;
