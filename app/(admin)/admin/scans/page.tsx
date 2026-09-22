import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { territoryName, type Scan } from '@/lib/data';
import { PageHead, Notice } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScansList({ searchParams }: { searchParams?: { saved?: string; deleted?: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('scans').select('*').order('week_of', { ascending: false });
  const scans = (data ?? []) as Scan[];
  return (
    <>
      <PageHead title="Weekly Scan" sub="Territorial signals turned into decision-relevant questions." action={{ href: '/admin/scans/new', label: '+ New scan entry' }} />
      <Notice q={searchParams} />
      <div className="space-y-3">
        {scans.length === 0 && <p className="text-white/55">No scan entries yet.</p>}
        {scans.map((s) => (
          <div key={s.id} className="tile p-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold truncate">{s.title}</p>
              <p className="text-white/50 text-xs mt-1">
                {territoryName[s.territory] ?? s.territory} · week of {s.week_of} · {s.published ? 'Published' : 'Draft'}{s.reviewed ? ' · reviewed' : ' · not reviewed'}{s.sample ? ' · sample' : ''}
              </p>
            </div>
            <Link href={`/admin/scans/${s.id}`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
          </div>
        ))}
      </div>
    </>
  );
}
