import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import ReportCard from '@/components/dss/ReportCard';
import { Section, Band } from '@/components/dss/Tiles';
import { research } from '@/content/site';
import ResearchFilters, { chip, filterHref } from '@/components/dss/ResearchFilters';
import { getPublishedReports, REPORT_KINDS, territoryName, weekOptions } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  alternates: { canonical: '/research/library' },
  title: 'Research library — FalconBridge Partners',
  description: 'Public studies, commissioned samples and papers, available to readers with the research package.',
};

export default async function LibraryPage({ searchParams }: { searchParams?: { territory?: string; kind?: string; week?: string } }) {
  const all = await getPublishedReports();
  const t = searchParams?.territory, k = searchParams?.kind, w = searchParams?.week;
  const inSelection = all.filter((r) => (!t || r.territory === t) && (!k || r.kind === k));
  const reports = w ? inSelection.filter((r) => r.week_label === w) : inSelection;
  return (
    <>
      <PageHero eyebrow="Research · Library" title="Research available to readers" intro={research.publicNote} />
      <Section>
        <ResearchFilters basePath="/research/library" territory={t} week={w} weeks={weekOptions(inSelection)} params={{ kind: k }} count={reports.length} noun={['study', 'studies']}>
          <div className="flex flex-wrap gap-2 mb-4">
            <Link href={filterHref('/research/library', { territory: t, week: w })} className={chip(!k)}>All types</Link>
            {REPORT_KINDS.map((x) => <Link key={x.value} href={filterHref('/research/library', { territory: t, kind: x.value, week: w })} className={chip(k === x.value)}>{x.label}</Link>)}
          </div>
        </ResearchFilters>
        {t && <p className="text-sm text-white/45 mb-6"><Link href={`/research/territories/${t}`} className="text-brand-gold-pale underline underline-offset-4">All research on {territoryName[t] ?? t}: signals, studies and pieces</Link></p>}
        {reports.length === 0 ? <p className="text-white/60">Nothing published for this selection yet.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">{reports.map((r) => <ReportCard key={r.id} report={r} />)}</div>
        )}
        <div className="mt-12"><Band title="Research is licensed for agreed use" body="FBP retains its research IP. Broader circulation, publication, reproduction or exclusivity must follow the agreed licence. Availability of a public download does not transfer ownership." /></div>
      </Section>
      <Invitation compact />
    </>
  );
}
