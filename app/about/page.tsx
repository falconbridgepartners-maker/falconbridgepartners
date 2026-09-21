import type { Metadata } from 'next';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import PartnerCard from '@/components/dss/PartnerCard';
import TerritoryMap from '@/components/dss/TerritoryMap';
import { Section, Tile, Band } from '@/components/dss/Tiles';
import { firm, origins, humanAuthority, trustAndUse, trustLine } from '@/content/site';
import { getSitePartners } from '@/lib/partners';

export const metadata: Metadata = {
  title: 'About — FalconBridge Partners',
  description: firm.shortDescription,
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const partners = await getSitePartners();
  const founders = partners.filter((p) => p.founder);
  const others = partners.filter((p) => !p.founder);
  return (
    <>
      <PageHero eyebrow="About FalconBridge" title="Experience with personal accountability" governing={firm.clarityLine} intro={firm.standardIntroduction} />

      <Section eyebrow="Our origins" title={origins.heading} intro={origins.intro}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {origins.milestones.map((m) => (
            <div key={m.figure} className="tile-ivory p-7">
              <p className="governing text-4xl mb-2" style={{ color: '#262626' }}>{m.figure}</p>
              <h3 className="text-lg mb-2">{m.title}</h3>
              <p className="text-sm">{m.body}</p>
            </div>
          ))}
        </div>
        <p className="text-white/70 mt-8 max-w-4xl">{origins.history}</p>
        <p className="text-white/45 text-sm mt-4 max-w-4xl">{origins.qualifier}</p>
      </Section>

      <Section eyebrow="The partners" title={`${founders.map((p) => p.name.split(' ')[0]).join(' and ')} ${founders.length > 1 ? 'are the founding partners' : 'is the founding partner'}.${others.length ? ` ${others.map((p) => p.name.split(' ')[0]).join(', ')} ${others.length > 1 ? 'extend' : 'extends'} the partnership into ${others.map((p) => p.locationShort).join(', ')}.` : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {partners.map((p) => <PartnerCard key={p.slug} partner={p} full />)}
        </div>
      </Section>

      <Section eyebrow="Where we work" title="Territories and partners" intro="Our weekly scans cover five territories: UAE/GCC, South Africa, New Zealand, Mauritius and North Carolina. Singapore is building. Partners are based in the UAE, remotely, and in North Carolina.">
        <TerritoryMap partners={partners} />
      </Section>

      <Section eyebrow="Our philosophy" title="Human authority in AI-assisted work">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {humanAuthority.map((h) => <Tile key={h.title} title={h.title} body={h.body} />)}
        </div>
        <p className="text-white/70 mt-8">Coaching and advisory remain human relationships. Any supporting technology use must respect the engagement’s purpose and confidentiality.</p>
      </Section>

      <Section eyebrow={firm.whoWeAreNot.heading} title={firm.whoWeAreNot.closing} intro={firm.whoWeAreNot.intro}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {firm.whoWeAreNot.items.map((i) => <Tile key={i.title} title={i.title} body={i.body} />)}
        </div>
        <p className="text-white/70 mt-8 max-w-4xl">{firm.noDependency}</p>
      </Section>

      <Section eyebrow="Trust and use" title="Confidentiality and agreed use rights" intro="The engagement defines what FBP will deliver, how the client may use it and how sensitive information is handled.">
        <div className="space-y-6">
          {trustAndUse.map((t) => <Band key={t.title} title={t.title} body={t.body} />)}
        </div>
        <p className="governing text-xl md:text-2xl mt-10">{trustLine}</p>
      </Section>

      <Invitation />
    </>
  );
}
