import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import TerritoryMap from '@/components/dss/TerritoryMap';
import { Section, Tile, ThreeColumns, Band, NextLink } from '@/components/dss/Tiles';
import { research, serviceByKey, firm } from '@/content/site';
import { getFeaturedReport, publicMediaUrl, territoryName } from '@/lib/data';
import { getSitePartners } from '@/lib/partners';

export const metadata: Metadata = {
  title: 'Research — FalconBridge Partners',
  description: 'Research that readers can examine: a substantive investigation delivered with the means to navigate, discuss and challenge its findings.',
};

export const dynamic = 'force-dynamic';

export default async function ResearchPage() {
  const raas = serviceByKey('raas');
  const [featuredStudy, partners] = await Promise.all([getFeaturedReport(), getSitePartners()]);
  const cover = publicMediaUrl(featuredStudy?.cover_path);
  return (
    <>
      <PageHero eyebrow="Research" title={research.heading} intro={research.intro} />

      <Section>
        <ThreeColumns items={research.columns} />
        <div className="mt-10"><Band title="Public research and confidential commissions" body={research.publicNote} /></div>
      </Section>

      <Section eyebrow="Professional curiosity" title={research.curiosity.heading} intro={research.curiosity.intro}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {research.curiosity.steps.map((st, i) => (
            <div key={st.title} className="tile-ivory p-6">
              <p className="governing text-xl mb-2" style={{ color: '#262626' }}>{String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-base md:text-lg mb-1.5">{st.title}</h3>
              <p className="text-sm">{st.body}</p>
            </div>
          ))}
        </div>
        <TerritoryMap partners={partners} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          <NextLink href="/research/weekly-scan" label="Weekly Scan" sub="Signals from each territory, turned into decision-relevant questions." />
          <NextLink href="/research/library" label="Research library" sub="Public studies, commissioned samples and papers, available to readers." />
        </div>
      </Section>

      <Section eyebrow="Research in practice" title="Depth that the reader can examine">
        <p className="governing text-xl md:text-2xl mb-8">{firm.clarityQuote}</p>
        {featuredStudy && <div className="tile p-8 md:p-10 flex gap-8">
          {cover && <div className="hidden md:block w-44 shrink-0 self-start rounded-lg overflow-hidden border border-brand-gold/25">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cover} alt={featuredStudy.title} className="w-full h-auto" /></div>}
          <div className="min-w-0 flex-1">
          <p className="label-tech mb-3">{territoryName[featuredStudy.territory] ?? featuredStudy.territory} · FBP-commissioned study</p>
          <h3 className="text-2xl md:text-3xl mb-2">{featuredStudy.title}</h3>
          <p className="text-white/70 mb-8">{featuredStudy.subtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredStudy.facts.map((f) => (
              <div key={f.figure} className="border-t border-brand-gold/30 pt-4">
                <p className="governing text-xl mb-1">{f.figure}</p>
                <p className="text-sm text-white/60">{f.body}</p>
              </div>
            ))}
          </div>
          <Link href={`/research/studies/${featuredStudy.slug}`} className="inline-flex items-center gap-2 text-brand-gold-pale mt-8 text-sm">Examine the study <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>}
      </Section>

      <Section eyebrow="A complete bespoke research package" title={raas.outputs.title} intro={raas.outputs.body}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {raas.work.map((w) => <Tile key={w.title} ivory title={w.title} body={w.body} />)}
        </div>
        <p className="governing text-xl md:text-2xl mt-8 max-w-4xl">{research.readersLine}</p>
      </Section>

      <Section eyebrow="Evidence, interpretation and use" title="Substance includes clarity about what a study establishes and what it leaves open">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {research.evidence.map((e) => <Tile key={e.title} title={e.title} body={e.body} />)}
        </div>
      </Section>

      <Invitation compact />
    </>
  );
}
