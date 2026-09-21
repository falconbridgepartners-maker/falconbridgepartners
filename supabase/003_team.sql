-- FalconBridge Partners — team members (Our Team section on About), managed in the admin. Run after 002.
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  role          text not null,                -- e.g. Fractional PRO
  location      text,
  email         text,
  linkedin      text,
  bio           text,                         -- short paragraph
  portrait_path text,
  sort_order    int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.team_members enable row level security;
revoke all on public.team_members from anon, authenticated;
grant all privileges on public.team_members to service_role;
drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at before update on public.team_members for each row execute function public.set_updated_at();
