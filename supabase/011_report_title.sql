-- 011: the study's report name, as issued, shown as a small label on the study page.
-- Since 21 Oct 2026 a study's title on the site is the headline of its Executive Visual (Quincy's own words);
-- the GDRS report name ("From X to Y") is kept here and shown above the title.
-- Safe to run more than once.

alter table public.reports add column if not exists report_title text;

update public.reports set report_title = v.report_title
from (values
  ('from-pump-price-to-budget-north-carolina-2026', 'From Pump Price to Budget'),
  ('from-expectation-to-evidence-new-zealand-2026', 'From Expectation to Evidence'),
  ('from-allocation-to-opportunity-uae-gcc-2026', 'From Allocation to Opportunity'),
  ('from-exposure-to-resilience-south-africa-2026', 'From Exposure to Resilience'),
  ('from-land-to-load-north-carolina-2026', 'From Land to Load'),
  ('from-weather-to-wallet-south-africa-2026', 'From Weather to Wallet'),
  ('from-intake-to-succession-new-zealand-2026', 'From Intake to Succession'),
  ('from-launch-to-acceptance-mauritius-2026', 'From Launch to Acceptance'),
  ('from-advice-to-actual-market-routes-new-zealand-2026', 'From Government Advice to Actual Market Routes'),
  ('from-entitlement-to-equity-charlotte-2026', 'From Entitlement to Equity'),
  ('from-pump-price-to-cost-base-mauritius-2026', 'From Pump Price to Cost Base'),
  ('from-attraction-to-ecosystem-uae-gcc-2026', 'From Attraction to Ecosystem'),
  ('from-innovation-capacity-to-regional-execution-north-carolina-2026', 'From Innovation Capacity to Regional Execution')
) as v(slug, report_title)
where public.reports.slug = v.slug and public.reports.report_title is null;
