-- FalconBridge Partners — Professional Curiosity pieces (October 2026). Run after 001–005.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- A piece is a short opinion piece drawn from one of our own-account studies. It sits after the weekly
-- signal and the study in the reader's path: signal, then study, then our view.
--
-- pieces.content holds the piece in its own structure (headline, body blocks, stat tiles, numbered
-- callouts, numbered questions, closing disclaimer) exactly as issued. The site shows it as written.

create table if not exists public.pieces (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,                       -- the headline, as issued
  series           text not null default 'Professional Curiosity Series',
  territory        text not null,
  report_id        uuid references public.reports(id) on delete set null,   -- the study behind the piece
  description      text,                                -- one or two sentences for lists and link previews
  published_at     date,                                -- the byline's month and year
  evidence_date    date,                                -- the byline's evidence date
  content          jsonb not null,                      -- the piece as issued (format professional-curiosity-v1)
  share_image_path text,                                -- optional link-preview image in public-media; one is drawn when empty
  reviewed         boolean not null default false,      -- internal, never rendered
  published        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.pieces enable row level security;
revoke all on public.pieces from anon, authenticated;
create index if not exists pieces_published_idx on public.pieces (published, published_at desc);
create index if not exists pieces_report_idx    on public.pieces (report_id);

drop trigger if exists pieces_updated_at on public.pieces;
create trigger pieces_updated_at before update on public.pieces for each row execute function public.set_updated_at();

-- The import log records which piece an import wrote, alongside the scan and the study.
alter table public.import_log add column if not exists piece_slug text;

-- Grants for the table created above (idempotent).
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
