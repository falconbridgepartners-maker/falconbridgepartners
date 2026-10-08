-- FalconBridge Partners — follow-up timing (October 2026). Run after 001–007.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- The follow-up email no longer goes out the moment a reader first downloads a document. The first download
-- is recorded here, and a daily job sends the email once 48 hours have passed — by then most readers have been
-- through the summaries and their own questions have started to surface.

alter table public.access_requests add column if not exists first_download_at timestamptz;

-- A reader who already downloaded, and has had no follow-up yet, gets the clock started now rather than never.
update public.access_requests set first_download_at = now()
  where first_download_at is null and download_count > 0 and followup_sent_at is null;

create index if not exists access_requests_followup_due_idx on public.access_requests (first_download_at)
  where followup_sent_at is null and first_download_at is not null;
