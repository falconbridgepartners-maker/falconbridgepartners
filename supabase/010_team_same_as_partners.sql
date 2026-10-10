-- FalconBridge Partners — team members carry the same fields as partners (October 2026). Run after 001–009.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- A team member is edited with the partner form and shown with the partner card, so team_members takes
-- every partners column. The old role and bio columns are kept and copied across so nothing is lost.

alter table public.team_members
  add column if not exists title          text,
  add column if not exists short_title    text,
  add column if not exists location_short text,
  add column if not exists phone          text,
  add column if not exists phone_label    text,
  add column if not exists qualification  text,
  add column if not exists emphasis       text,
  add column if not exists sections       jsonb not null default '[]'::jsonb,
  add column if not exists territories    text[] not null default '{}';

update public.team_members set title = role where title is null and role is not null;
update public.team_members set emphasis = bio where emphasis is null and bio is not null;
alter table public.team_members alter column role drop not null;
