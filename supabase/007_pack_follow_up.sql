-- FalconBridge Partners — follow-up after a pack download (October 2026). Run after 001–006.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- When a reader first downloads a document from a research pack, the site emails them once: thanks, and a
-- link to book a discovery call. This column records when that email went out, so a reader who takes several
-- packs is written to once in 30 days, and so the send shows under Pack requests in the admin.

alter table public.access_requests add column if not exists followup_sent_at timestamptz;
create index if not exists access_requests_followup_idx on public.access_requests (email, followup_sent_at desc) where followup_sent_at is not null;
