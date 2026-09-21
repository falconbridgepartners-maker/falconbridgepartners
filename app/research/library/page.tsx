import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import ReportCard from '@/components/dss/ReportCard';
import { Section, Band } from '@/components/dss/Tiles';
import { research } from '@/content/site';
import { getPublishedReports, REPORT_KINDS, TERRITORIES } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Research library — FalconBridge Partners',
  description: 'Public studies, commissioned samples and papers, available to readers with the research package.',
};

export default async function LibraryPage({ searchParams }: { searchParams?: { territory?: string; kind?: string } }) {
  const all = await getPublishedReports();
  const t = searchParams?.territory, k = searchParams?.kind;
  const reports = all.filter((r) => (!t || r.territory === t) && (!k || r.kind === k));
  const chip = (active: boolean) => `px-4 py-2 rounded-full text-sm border ${active ? 'border-brand-gold text-white' : 'border-brand-gold/30 text-white/60'}`;
  const href = (nt?: string, nk?: string) => { const p = new URLSearchParams(); if (nt) p.set('territory', nt); if (nk) p.set('kind', nk); const s = p.toString(); return `/research/library${s ? `?${s}` : ''}`; };
  return (
    <>
      <PageHero eyebrow="Research · Library" title="Research available to readers" intro={research.publicNote} />
      <Section>
        <div className="flex flex-wrap gap-2 mb-4">
          <Link href={href(undefined, k)} className={chip(!t)}>All territories</Link>
          {TERRITORIES.map((x) => <Link key={x.value} href={href(x.value, k)} className={chip(t === x.value)}>{x.label}</Link>)}
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href={href(t, undefined)} className={chip(!k)}>All types</Link>
          {REPORT_KINDS.map((x) => <Link key={x.value} href={href(t, x.value)} className={chip(k === x.value)}>{x.label}</Link>)}
        </div>
        {reports.length === 0 ? <p className="text-white/60">Nothing published for this selection yet.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{reports.map((r) => <ReportCard key={r.id} report={r} />)}</div>
        )}
        <div className="mt-12"><Band title="Research is licensed for agreed use" body="FBP retains its research IP. Broader circulation, publication, reproduction or exclusivity must follow the agreed licence. Availability of a public download does not transfer ownership." /></div>
      </Section>
      <Invitation compact />
    </>
  );
}
