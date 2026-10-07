import Link from 'next/link';
import { Eye, Pencil } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { territoryName, type Piece } from '@/lib/data';
import { monthYear } from '@/lib/pieces';
import { PageHead, Notice } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PiecesList({ searchParams }: { searchParams?: { saved?: string; deleted?: string } }) {
  const db = createAdminClient();
  const { data, error } = await db.from('pieces').select('*').order('published_at', { ascending: false }).order('created_at', { ascending: false });
  const pieces = (data ?? []) as Piece[];
  return (
    <>
      <PageHead title="Professional Curiosity" sub="Opinion pieces drawn from our studies." action={{ href: '/admin/pieces/new', label: '+ New piece' }} />
      <Notice q={searchParams} />
      {error && <p className="text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6" role="alert">The pieces table could not be read. Run <code>supabase/006_pieces.sql</code> in the Supabase SQL editor, then reload this page.</p>}
      <div className="space-y-3">
        {!error && pieces.length === 0 && <p className="text-white/55">No pieces yet. Import one from <Link href="/admin/import" className="underline underline-offset-4">Weekly import</Link>, or add one here.</p>}
        {pieces.map((p) => (
          <div key={p.id} className="tile p-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold truncate">{p.title}</p>
              <p className="text-white/50 text-xs mt-1">
                {[territoryName[p.territory] ?? p.territory, monthYear(p.published_at), p.published ? 'Published' : 'Draft', p.reviewed ? 'reviewed' : 'not reviewed', p.report_id ? 'linked to its study' : 'no study linked'].filter(Boolean).join(' · ')}
              </p>
            </div>
            <Link href={`/admin/pieces/${p.id}/preview`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Preview"><Eye className="w-4 h-4" /></Link>
            <Link href={`/admin/pieces/${p.id}`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
          </div>
        ))}
      </div>
    </>
  );
}
