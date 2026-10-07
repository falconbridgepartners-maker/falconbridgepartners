import PieceForm from '@/components/admin/PieceForm';
import { PageHead } from '@/components/admin/ui';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function NewPiece() {
  const db = createAdminClient();
  const { data: reports } = await db.from('reports').select('id, title, week_label').order('updated_at', { ascending: false }).limit(300);
  return (<><PageHead title="New piece" sub="A Professional Curiosity piece, carried as issued." /><PieceForm reports={reports ?? []} /></>);
}
