-- FalconBridge Partners — research licence requests (November 2026). Run after 001–012.
-- Paste the whole file into Supabase → SQL Editor → Run. Safe to run more than once.
--
-- Research licence sales: a buyer chooses a Type 2 or Type 3 licence on a study's Buy page and either asks
-- for an invoice or pays by card through Stripe Checkout. Each request is kept here with the price the site quoted and the version of the terms accepted.
-- Until this file is run the site still emails every request to the firm; it just does not keep this row.

create table if not exists public.licence_requests (
  id               uuid primary key default gen_random_uuid(),
  report_id        uuid not null references public.reports(id) on delete restrict,
  licence          text not null check (licence in ('t2', 't3')),
  tier             text not null check (tier in ('new', 'back')),
  country          text not null,
  price_band       text not null check (price_band in ('standard', 'reduced')),
  fee_usd          integer not null,
  vat_usd          integer not null default 0,
  total_usd        integer not null,
  company          text not null,
  full_name        text not null,
  email            citext not null,
  invoice_address  text not null,
  stated_objective text,
  terms_version    text not null,
  accepted_at      timestamptz not null,
  created_at       timestamptz not null default now(),
  -- Filled in by hand when the invoice is issued and when it is paid and the report delivered.
  invoiced_at      timestamptz,
  paid_at          timestamptz,
  delivered_at     timestamptz,
  -- Card payments: the Stripe Checkout session, so a repeated webhook is recorded once.
  stripe_session_id text
);
create unique index if not exists licence_requests_stripe_idx on public.licence_requests (stripe_session_id) where stripe_session_id is not null;
create index if not exists licence_requests_report_idx on public.licence_requests (report_id, created_at desc);

-- Only the site's server (service role) reads and writes these rows.
alter table public.licence_requests enable row level security;
