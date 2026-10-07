import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Invitation from '@/components/dss/Invitation';
import PieceView from '@/components/dss/PieceView';
import { getPieceBySlug, getStudyForPiece, publicMediaUrl } from '@/lib/data';
import { pieceSummary } from '@/lib/pieces';
import { generatedImagePath, shareMetadata } from '@/lib/share';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPieceBySlug(params.slug);
  if (!p) return {};
  const own = publicMediaUrl(p.share_image_path);
  return shareMetadata({
    pageTitle: `${p.content.headline} — FalconBridge Partners`,
    title: p.content.headline,
    description: pieceSummary(p),
    path: `/research/professional-curiosity/${p.slug}`,
    image: own ? { url: own, generated: false } : { url: generatedImagePath('piece', p.slug), generated: true },
    publishedTime: p.published_at,
  });
}

export default async function PiecePage({ params }: { params: { slug: string } }) {
  const p = await getPieceBySlug(params.slug);
  if (!p) notFound();
  const study = await getStudyForPiece(p);
  return (
    <>
      <PieceView piece={p} study={study} />
      <Invitation compact />
    </>
  );
}
