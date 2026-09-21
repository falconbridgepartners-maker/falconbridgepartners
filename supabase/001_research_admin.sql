-- FalconBridge Partners — research admin schema (v4, September 2026)
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run once.

create extension if not exists citext;
create extension if not exists pgcrypto;

-- The server (service-role) client must be able to read and write these tables even when
-- "Automatically expose new tables" is off for the project.
grant usage on schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Admin users: who may sign in to /admin (magic link). RLS deny-by-default;
-- only the service-role client reads this table.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  email        citext primary key,
  display_name text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

insert into public.admin_users (email, display_name)
values ('researchteam@falconbp.com', 'Research Team')
on conflict (email) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Reports (public studies, commissioned samples, white papers)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  subtitle      text,
  kind          text not null default 'study' check (kind in ('study','sample','paper')),
  territory     text not null default 'south-africa',
  year          int,
  published_at  date,
  cover_path    text,          -- storage path in public-media
  extract_path  text,          -- storage path in public-media
  extract_note  text,
  qualifier     text,
  body          text,          -- plain text / light markdown
  facts         jsonb not null default '[]'::jsonb,   -- [{figure, body}]
  featured      boolean not null default false,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;
create index if not exists reports_published_idx on public.reports (published, published_at desc);

-- The six package elements per report. storage_path lives in research-files (private);
-- access = 'open' → served by signed URL; 'request' → behind the request form.
create table if not exists public.report_files (
  id           uuid primary key default gen_random_uuid(),
  report_id    uuid not null references public.reports(id) on delete cascade,
  label        text not null,
  sort_order   int not null default 0,
  storage_path text,
  access       text not null default 'request' check (access in ('open','request')),
  size_bytes   bigint,
  created_at   timestamptz not null default now()
);
alter table public.report_files enable row level security;
revoke all on public.report_files from anon, authenticated;
create index if not exists report_files_report_idx on public.report_files (report_id, sort_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- Weekly Scan entries
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scans (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  territory       text not null,
  service         text not null default 'none',
  week_of         date not null,
  signal          text not null,
  question        text not null,
  finding         text,
  interpretation  text,
  open_questions  jsonb not null default '[]'::jsonb,   -- ["…"]
  reviewed        boolean not null default false,      -- internal, never rendered
  sample          boolean not null default false,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.scans enable row level security;
revoke all on public.scans from anon, authenticated;
create index if not exists scans_published_idx on public.scans (published, week_of desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Site settings (single row)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id                 int primary key default 1 check (id = 1),
  featured_report_id uuid references public.reports(id) on delete set null,
  portraits          jsonb not null default '{}'::jsonb,   -- {joel: path, quincy: path, wayne: path}
  updated_at         timestamptz not null default now()
);
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- updated_at triggers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists reports_updated_at on public.reports;
create trigger reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
drop trigger if exists scans_updated_at on public.scans;
create trigger scans_updated_at before update on public.scans for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets
--   public-media   : covers, extracts, portraits — public read, service-role write
--   research-files : PDFs and package files — private; served by signed URL
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-media', 'public-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('research-files', 'research-files', false, 104857600, array['application/pdf','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'])
on conflict (id) do update set public = false, file_size_limit = 104857600;

-- No anon/authenticated storage policies: writes and private reads go through the service-role client only.

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed content (what the prototype showed as files)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.reports (slug, title, subtitle, kind, territory, year, published_at, extract_note, qualifier, body, facts, featured, published)
values (
  'can-south-africa-break-3-percent-growth',
  'Can South Africa Break 3% Growth?',
  'An FBP-commissioned study of the conditions behind a public economic target.',
  'study', 'south-africa', 2026, '2026-09-01',
  'The FalconBridge 3% Monitor, from page 158 of the report, illustrates how findings can be connected to observable conditions.',
  'This study’s page count and instruments are specific to its question. They are not universal promises. Each commissioned study follows its own question and evidence requirements.',
  'The study examines the conditions behind a public growth target for South Africa: what would need to be true, in what sequence, and with what dependencies, for the target to be reached. It is an FBP-funded investigation through the Global Discovery Research System and is made available to readers as a demonstration of the research package.',
  '[{"figure":"196 pages","body":"The full research report includes twelve thematic reviews and supporting appendices."},{"figure":"12 thematic reviews","body":"A structured investigation of the question."},{"figure":"Decision instruments","body":"Growth-bridge calculations, reform dependencies, contrasting scenarios and a monitor with explicit thresholds."}]'::jsonb,
  true, true
)
on conflict (slug) do nothing;

insert into public.report_files (report_id, label, sort_order)
select r.id, x.label, x.ord
from public.reports r
cross join (values ('User guide',1),('Executive deck',2),('Full research report',3),('Executive summary',4),('Executive visual',5),('Reference and link audit',6)) as x(label, ord)
where r.slug = 'can-south-africa-break-3-percent-growth'
  and not exists (select 1 from public.report_files f where f.report_id = r.id);

update public.site_settings set featured_report_id = (select id from public.reports where slug = 'can-south-africa-break-3-percent-growth') where id = 1 and featured_report_id is null;

insert into public.scans (slug, title, territory, service, week_of, signal, question, finding, interpretation, open_questions, sample, published)
values
 ('uae-supplier-compliance-thresholds', 'UAE supplier compliance thresholds', 'uae-gcc', 'ceaas', '2026-09-07',
  'Sample: a change to supplier-compliance obligations for larger buyers is being discussed for implementation.',
  'If buyer-side compliance obligations tighten, which SMEs in a supply chain carry the readiness burden, and what would a verifiable standing look like?',
  'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
  'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
  '["Sample open question one.","Sample open question two."]'::jsonb, true, true),
 ('south-africa-growth-monitor-update', 'South Africa growth monitor update', 'south-africa', 'raas', '2026-09-07',
  'Sample: a reform dependency tracked in the 3% Monitor has moved.',
  'Does the movement change any threshold in the monitor, and what should a reader of the study re-examine?',
  'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
  'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
  '["Sample open question one."]'::jsonb, true, true),
 ('new-zealand-sector-signal', 'New Zealand sector signal', 'new-zealand', 'none', '2026-08-31',
  'Sample: a sector development identified in the weekly scan.',
  'What would need to be true for this development to matter to an accountable decision-maker in the sector?',
  'Sample finding text. What the evidence establishes appears here, with sources, dates and the scope of what was examined.',
  'Sample interpretation. FBP’s reading of what the finding may mean for a decision-maker appears here, kept visibly separate from the finding itself.',
  '["Sample open question one.","Sample open question two.","Sample open question three."]'::jsonb, true, true)
on conflict (slug) do nothing;

-- Grants for tables created above (idempotent).
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
