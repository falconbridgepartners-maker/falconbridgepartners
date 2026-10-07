import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import PieceForm from '@/components/admin/PieceForm';
import { PageHead } from '@/components/admin/ui';
import type { Piece } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditPiece({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('pieces').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const piece = data as Piece;
  const { data: reports } = await db.from('reports').select('id, title, week_label').order('updated_at', { ascending: false }).limit(300);
  return (<><PageHead title="Edit piece" sub={piece.title} action={{ href: `/admin/pieces/${piece.id}/preview`, label: 'Preview' }} /><PieceForm piece={piece} reports={reports ?? []} /></>);
}
