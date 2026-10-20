import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import PieceCard from '@/components/dss/PieceCard';
import { Section } from '@/components/dss/Tiles';
import WeekFilter from '@/components/dss/WeekFilter';
import { getPublishedPieces, TERRITORIES, weekOptions } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  alternates: { canonical: '/research/professional-curiosity' },
  title: 'Professional Curiosity — FalconBridge Partners',
  description: 'Opinion pieces drawn from our studies.',
};

export default async function ProfessionalCuriosityPage({ searchParams }: { searchParams?: { territory?: string; week?: string } }) {
  const all = await getPublishedPieces();
  const t = searchParams?.territory;
  const week = searchParams?.week;
  const inTerritory = all.filter((p) => !t || p.territory === t);
  const weeks = weekOptions(inTerritory);
  const pieces = week ? inTerritory.filter((p) => p.week_label === week) : inTerritory;
  const href = (territory?: string) => { const q = new URLSearchParams(); if (territory) q.set('territory', territory); if (week) q.set('week', week); const s = q.toString(); return `/research/professional-curiosity${s ? `?${s}` : ''}`; };
  const chip = (active: boolean) => `px-4 py-2 rounded-full text-sm border ${active ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/60'}`;
  return (
    <>
      <PageHero eyebrow="Research · Professional Curiosity" title="Professional Curiosity" intro="Opinion pieces drawn from our studies." />
      <Section>
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href={href()} className={chip(!t)}>All territories</Link>
          {TERRITORIES.map((x) => <Link key={x.value} href={href(x.value)} className={chip(t === x.value)}>{x.label}</Link>)}
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <WeekFilter weeks={weeks} current={week} basePath="/research/professional-curiosity" params={{ territory: t }} />
        </div>
        <p className="text-sm text-white/45 mb-10">{pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}{t || week ? ' in this selection' : ''}</p>
        {pieces.length === 0 ? <p className="text-white/60">Nothing published for this selection yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{pieces.map((p) => <PieceCard key={p.id} piece={p} />)}</div>
        )}
      </Section>
      <Invitation compact />
    </>
  );
}
