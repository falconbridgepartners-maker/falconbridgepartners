import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import { Section, Band } from '@/components/dss/Tiles';
import { research } from '@/content/site';
import WeekFilter from '@/components/dss/WeekFilter';
import { getPublishedScans, territoryName, weekOptions, weekText } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Weekly Scan — FalconBridge Partners',
  description: 'Systematic territorial scans identify significant developments. The FalconBridge Lens turns selected signals into decision-relevant questions.',
};

export default async function WeeklyScanPage({ searchParams }: { searchParams?: { territory?: string; week?: string } }) {
  const filter = searchParams?.territory;
  const week = searchParams?.week;
  const inTerritory = await getPublishedScans(filter);
  const weeks = weekOptions(inTerritory);
  const scans = week ? inTerritory.filter((s) => s.week_label === week) : inTerritory;
  const withWeek = (territory?: string) => { const p = new URLSearchParams(); if (territory) p.set('territory', territory); if (week) p.set('week', week); const q = p.toString(); return `/research/weekly-scan${q ? `?${q}` : ''}`; };
  const hasSamples = scans.some((s) => s.sample);
  return (
    <>
      <PageHero eyebrow="Research · Weekly Scan" title="Signals worth a question" intro="Systematic territorial scans identify significant developments. Our interpretation turns a development into a question worth testing. Findings and FBP’s interpretation are kept visibly distinct." />
      <Section>
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href={withWeek()} className={`px-4 py-2 rounded-full text-sm border ${!filter ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/60'}`}>All territories</Link>
          {research.curiosity.territories.map((t) => (
            t.status === 'active' ? (
              <Link key={t.key} href={withWeek(t.key)} className={`px-4 py-2 rounded-full text-sm border ${filter === t.key ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/60'}`}>{t.name}</Link>
            ) : (
              <span key={t.key} className="px-4 py-2 rounded-full text-sm border border-dashed border-brand-gold/40 text-white/45">{t.name}</span>
            )
          ))}
          <a href="/research/weekly-scan/rss.xml" className="ml-auto text-sm text-white/45 hover:text-white self-center">RSS</a>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-8 -mt-3">
          <WeekFilter weeks={weeks} current={week} basePath="/research/weekly-scan" params={{ territory: filter }} />
        </div>
        {hasSamples && (
          <div className="tile-ivory p-4 mb-8 text-sm"><strong>Prototype note.</strong> Entries marked “sample” are placeholders showing the structure of a scan entry. They are replaced by real scans before launch.</div>
        )}
        {scans.length === 0 && <p className="text-white/60">No scan entries for this selection yet.</p>}
        <div className="grid grid-cols-1 gap-5">
          {scans.map((e) => (
            <Link key={e.slug} href={`/research/weekly-scan/${e.slug}`} className="group tile p-7 hover:border-brand-gold/60 transition-colors">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                <span className="label-tech">{territoryName[e.territory] ?? e.territory}</span>
                <span className="text-white/45 text-sm">{weekText(e.week_label) ?? `Week of ${e.week_of}`}</span>
                {e.sample && <span className="text-[0.68rem] text-brand-gold-pale border border-brand-gold/40 rounded-full px-2 py-0.5">Sample — prototype</span>}
              </div>
              {e.content ? (
                <>
                  <p className="governing text-xl leading-snug mb-3">{e.content.lead?.title ?? e.question}</p>
                  <p className="text-white/70 line-clamp-3">{e.content.lead?.body ?? e.signal}</p>
                </>
              ) : (
                <>
                  <p className="text-white/70 mb-3">{e.signal}</p>
                  <p className="governing text-lg leading-snug">{e.question}</p>
                </>
              )}
              <span className="inline-flex items-center gap-2 text-sm text-brand-gold-pale mt-4">{e.content ? 'Read the signal' : 'Read the scan'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          ))}
        </div>
        <div className="mt-12"><Band title="A scan frames an investigation" body={research.curiosity.distinction} /></div>
      </Section>
      <Invitation compact />
    </>
  );
}
