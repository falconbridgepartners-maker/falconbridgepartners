import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import PieceView from '@/components/dss/PieceView';
import { getStudyForPiece, type Piece } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** The piece as a reader will see it, published or not. Only signed-in admins reach this page. */
export default async function PreviewPiece({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('pieces').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const piece = data as Piece;
  const study = await getStudyForPiece(piece);
  return (
    <div className="-m-6 md:-m-10">
      <p className="tile-ivory m-6 md:m-10 mb-0 md:mb-0 p-3 text-sm">
        {piece.published ? 'This piece is live.' : 'Draft preview. This piece is not on the site yet.'}{' '}
        <Link href={`/admin/pieces/${piece.id}`} className="underline underline-offset-4">Edit</Link>
        {piece.published && <>{' · '}<a href={`/research/professional-curiosity/${piece.slug}`} className="underline underline-offset-4" target="_blank" rel="noopener">Open the live page</a></>}
      </p>
      <PieceView piece={piece} study={study} />
    </div>
  );
}
