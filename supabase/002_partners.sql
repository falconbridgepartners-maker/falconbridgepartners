-- FalconBridge Partners — partners managed in the admin (v5). Run after 001.

create table if not exists public.partners (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  title          text not null,               -- e.g. Co-Founder & Managing Partner
  short_title    text,                        -- e.g. Managing Partner (map / contact)
  location       text,                        -- e.g. UAE · Remote · Based in North Carolina, USA
  location_short text,                        -- e.g. UAE (map / footer)
  email          text,
  phone          text,
  phone_label    text,
  linkedin       text,
  qualification  text,
  emphasis       text,                        -- one line under the card
  sections       jsonb not null default '[]'::jsonb,   -- [{title, body}] ×3
  portrait_path  text,                        -- storage path in public-media
  territories    text[] not null default '{}',-- keys: uae-gcc, south-africa, new-zealand, mauritius, north-carolina, singapore
  founder        boolean not null default false,
  sort_order     int not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.partners enable row level security;
revoke all on public.partners from anon, authenticated;
grant all privileges on public.partners to service_role;
drop trigger if exists partners_updated_at on public.partners;
create trigger partners_updated_at before update on public.partners for each row execute function public.set_updated_at();

insert into public.partners (slug, name, title, short_title, location, location_short, email, phone, phone_label, linkedin, qualification, emphasis, sections, territories, founder, sort_order) values
('quincy-jc-beukes','Quincy JC Beukes','Co-Founder & Managing Partner (Global)','Managing Partner (Global)','Remote','Remote','quincy@falconbp.com',null,null,'https://www.linkedin.com/in/quincy-jc-beukes/','MBA (Cum Laude) · ELP · AMP · ChBP (SA)',
 'Corporate finance, strategy and private capital experience informing research and decision analysis.',
 '[{"title":"Experience brought to the work","body":"Quincy’s background spans banking, financial services, corporate finance, private capital and business transformation, including senior executive responsibilities. His work centres on contextual clarity and structured analysis for boards, shareholders, investors and leaders."},{"title":"The research philosophy","body":"Direction by Information reflects the importance of understanding the context before committing to a course of action. At FBP, research is intended to expose evidence, assumptions and uncertainty so that the decision-maker can examine the reasoning."},{"title":"FalconBridge’s origins","body":"Quincy identified a broader application for an Equity Research Tool first developed in the PRiVATi setting. FalconBridge became an independent business in 2025, owning its own systems, processes and intellectual property."}]'::jsonb,
 '{south-africa,mauritius,new-zealand,singapore}', true, 1),
('joel-arcus','Joel Arcus','Co-Founder & Managing Partner (AMEA)','Managing Partner (AMEA)','UAE','UAE','joel@falconbp.com','+971 52 706 8408','UAE','https://www.linkedin.com/in/joelarcus/','ICF ACC · CPQC (Positive Intelligence)',
 'Human capital and leadership experience informing confidential coaching and strategic advisory.',
 '[{"title":"Experience brought to the work","body":"Based in Dubai, with professional roots in South Africa, Joel brings experience across coaching, consulting, strategy, human capital and leadership development. His perspective connects organisational context with the people responsible for decisions."},{"title":"Space for considered judgement","body":"Leadership transitions and consequential choices can compress reflective space. Joel’s work emphasises examining assumptions, pressures and trade-offs, while preserving the client’s authority to understand and own the decision."},{"title":"A complementary perspective","body":"Joel’s people focus sits alongside FBP’s evidence and execution disciplines. Coaching remains a confidential human relationship. Strategic advisory supports considered action as circumstances change, within an agreed mandate."}]'::jsonb,
 '{uae-gcc}', true, 2),
('wayne-loraine-grews','Wayne Loraine-Grews','Managing Partner (North America)','Managing Partner (North America)','Based in North Carolina, USA','North Carolina','wayne@falconbp.com','+1 919 537 5026','North Carolina','https://www.linkedin.com/in/wayne-loraine-grews/','BS Marketing (Cum Laude), Quincy University (USA)',
 'Global CEO and operations executive with experience across North America, Africa and Asia.',
 '[{"title":"Global executive leadership","body":"Wayne’s career spans more than thirty years in international business, including global CEO and operations executive roles. He has led enterprise transformation and delivered investor returns across North America, Africa and Asia."},{"title":"Private equity and end-to-end transactions","body":"His private equity experience spans the full value creation cycle, including strategic repositioning, operational transformation, post-acquisition integration and PE exit. He brings end-to-end transaction experience and deep expertise in supply chain, multi-site retail and franchise networks."},{"title":"Board governance and operational execution","body":"Wayne combines board-level governance with hands-on operational execution. He has served on shareholder, audit, executive and operating boards across listed companies, private equity-backed platforms and nonprofit organisations."}]'::jsonb,
 '{north-carolina}', false, 3)
on conflict (slug) do nothing;
