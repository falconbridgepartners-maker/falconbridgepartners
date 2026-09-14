import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { research, sampleScans } from '@/content/site';

export const metadata: Metadata = {
  title: 'Weekly Scan — FalconBridge Partners',
  description: 'Systematic territorial scans identify significant developments. The FalconBridge Lens turns selected signals into decision-relevant questions.',
};

export default function WeeklyScanPage() {
  return (
    <>
      <PageHero eyebrow="Research · Weekly Scan" title="Signals worth a question" intro="Systematic territorial scans identify significant developments. Our interpretation turns a development into a question worth testing. Findings and FBP’s interpretation are kept visibly distinct." />

      <Section>
        <div className="flex flex-wrap gap-2 mb-8">
          {research.curiosity.territories.map((t) => (
            <span key={t.key} className={`px-4 py-2 rounded-full text-sm border ${t.status === 'active' ? 'border-brand-gold/40 text-white' : 'border-dashed border-brand-gold/40 text-white/50'}`}>
              {t.name}{t.status === 'planned' ? ' · planned' : ''}
            </span>
          ))}
        </div>

        <div className="tile-ivory p-4 mb-8 text-sm" style={{ borderColor: '#c8a86a' }}>
          <strong>Prototype note.</strong> The entries below are sample placeholders showing the structure of a scan entry. They are replaced by real scans before launch.
        </div>

        <div className="grid grid-cols-1 gap-5">
          {sampleScans.map((e) => (
            <Link key={e.slug} href={`/research/weekly-scan/${e.slug}`} className="group tile p-7 hover:border-brand-gold/60 transition-colors">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                <span className="label-tech">{e.territory}</span>
                <span className="text-white/45 text-sm">{e.week}</span>
                <span className="text-[0.68rem] text-brand-gold-pale border border-brand-gold/40 rounded-full px-2 py-0.5">Sample — prototype</span>
              </div>
              <p className="text-white/70 mb-3">{e.signal}</p>
              <p className="governing text-lg leading-snug">{e.question}</p>
              <span className="inline-flex items-center gap-2 text-sm text-brand-gold-pale mt-4">Read the scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-12"><Band title="A scan frames an investigation" body={research.curiosity.distinction} /></div>
      </Section>

      <Invitation compact />
    </>
  );
}
