import type { Metadata } from 'next';
import PageHero from '@/components/dss/PageHero';
import Invitation from '@/components/dss/Invitation';
import PieceCard from '@/components/dss/PieceCard';
import ResearchFilters from '@/components/dss/ResearchFilters';
import { Section } from '@/components/dss/Tiles';
import { getPublishedPieces, weekOptions } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  alternates: { canonical: '/research/professional-curiosity' },
  title: 'Professional Curiosity — FalconBridge Partners',
  description: 'Opinion pieces drawn from our studies.',
};

export default async function ProfessionalCuriosityPage({ searchParams }: { searchParams?: { territory?: string; week?: string } }) {
  const all = await getPublishedPieces();
  const t = searchParams?.territory, w = searchParams?.week;
  const inTerritory = all.filter((p) => !t || p.territory === t);
  const pieces = w ? inTerritory.filter((p) => p.week_label === w) : inTerritory;
  return (
    <>
      <PageHero eyebrow="Research · Professional Curiosity" title="Professional Curiosity" intro="Opinion pieces drawn from our studies." />
      <Section>
        <ResearchFilters basePath="/research/professional-curiosity" territory={t} week={w} weeks={weekOptions(inTerritory)} count={pieces.length} noun={['piece', 'pieces']} />
        {pieces.length === 0 ? <p className="text-white/60">Nothing published for this selection yet.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{pieces.map((p) => <PieceCard key={p.id} piece={p} />)}</div>
        )}
      </Section>
      <Invitation compact />
    </>
  );
}
