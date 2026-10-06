-- FalconBridge Partners — weekly pipeline (October 2026). Run after 001–003.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- Adds:
--   1. A third access level on package files: open · request (behind the email form) · internal (never shown)
--   2. access_requests — one row per pack request: the lead, and the expiring link that was emailed
--   3. app_secrets     — server-only key/value store (holds the Dropbox connection)
--   4. import_log      — what the weekly importer created or updated, and who ran it
--   5. week labels on reports and scans, and the link from a scan to the study it led to

-- ── 1. Access levels ─────────────────────────────────────────────────────────
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.report_files'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%access%'
  loop
    execute format('alter table public.report_files drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.report_files add constraint report_files_access_check check (access in ('open','request','internal'));

alter table public.report_files add column if not exists source_ref text;   -- where the file came from (Dropbox id + revision)
alter table public.report_files add column if not exists file_name  text;   -- the name a reader's download is saved under

-- ── 2. Pack requests ─────────────────────────────────────────────────────────
create table if not exists public.access_requests (
  id              uuid primary key default gen_random_uuid(),
  report_id       uuid not null references public.reports(id) on delete cascade,
  full_name       text not null,
  email           citext not null,
  organisation    text not null,
  role            text,
  intended_use    text,
  consent         boolean not null default false,
  token_hash      text not null unique,          -- sha-256 of the link token; the token itself is never stored
  expires_at      timestamptz not null,
  first_opened_at timestamptz,
  last_opened_at  timestamptz,
  open_count      int not null default 0,
  download_count  int not null default 0,
  created_at      timestamptz not null default now()
);
alter table public.access_requests enable row level security;
revoke all on public.access_requests from anon, authenticated;
create index if not exists access_requests_report_idx  on public.access_requests (report_id, created_at desc);
create index if not exists access_requests_created_idx on public.access_requests (created_at desc);

-- ── 3. Server-only secrets ───────────────────────────────────────────────────
create table if not exists public.app_secrets (
  key        text primary key,
  value      text not null,
  meta       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

-- ── 4. Import log ────────────────────────────────────────────────────────────
create table if not exists public.import_log (
  id          uuid primary key default gen_random_uuid(),
  week_label  text,
  territory   text,
  scan_slug   text,
  report_slug text,
  published   boolean not null default false,
  result      jsonb not null default '{}'::jsonb,
  source      text,
  created_by  text,
  created_at  timestamptz not null default now()
);
alter table public.import_log enable row level security;
revoke all on public.import_log from anon, authenticated;
create index if not exists import_log_week_idx on public.import_log (week_label, created_at desc);

-- ── 5. Week labels and the scan → study link ─────────────────────────────────
alter table public.reports add column if not exists week_label text;        -- e.g. 2026-W41 (FalconBridge week numbering)
alter table public.scans   add column if not exists week_label text;
alter table public.scans   add column if not exists report_id  uuid references public.reports(id) on delete set null;
create index if not exists reports_week_idx  on public.reports (week_label);
create index if not exists scans_week_idx    on public.scans (week_label);
create index if not exists scans_report_idx  on public.scans (report_id);

-- Grants for the tables created above (idempotent).
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
