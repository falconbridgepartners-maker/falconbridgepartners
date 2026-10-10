-- FalconBridge Partners — team member credentials line (October 2026). Run after 001–008.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- Team members get the same credentials line the partners carry (shown under the role on the card),
-- and their URL slug becomes editable in the admin. The slug column already exists from 003.

alter table public.team_members add column if not exists short_title text;
