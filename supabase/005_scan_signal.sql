-- FalconBridge Partners — Weekly Signal carried as issued (October 2026). Run after 004.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- scans.content holds the Weekly Signal in its own structure (themes, lead topic, one to watch,
-- article audit log) exactly as issued. When it is present, the scan page shows it as written.
alter table public.scans add column if not exists content jsonb;
grant all privileges on all tables in schema public to service_role;
