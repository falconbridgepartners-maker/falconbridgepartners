import Link from 'next/link';
import { Pencil, Star } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicMediaUrl, territoryName, type Report } from '@/lib/data';
import { PageHead, Notice } from '@/components/admin/ui';

export default async function ReportsList({ searchParams }: { searchParams?: { saved?: string; deleted?: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('reports').select('*').order('updated_at', { ascending: false });
  const reports = (data ?? []) as Report[];
  return (
    <>
      <PageHead title="Reports" sub="Public studies, commissioned samples and papers." action={{ href: '/admin/reports/new', label: '+ Add report' }} />
      <Notice q={searchParams} />
      <div className="space-y-3">
        {reports.length === 0 && <p className="text-white/55">No reports yet.</p>}
        {reports.map((r) => {
          const cover = publicMediaUrl(r.cover_path);
          return (
            <div key={r.id} className="tile p-4 flex items-center gap-4">
              <div className="w-14 h-[4.5rem] rounded-md bg-brand-navy-dark border border-brand-gold/20 overflow-hidden shrink-0">
                {cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-bold truncate">{r.title}</p>
                <p className="text-white/50 text-xs mt-1">
                  {r.kind} · {territoryName[r.territory] ?? r.territory}{r.year ? ` · ${r.year}` : ''} · {r.published ? 'Published' : 'Draft'}
                  {r.featured && <span className="inline-flex items-center gap-1 ml-2 text-brand-gold-pale"><Star className="w-3 h-3" /> Featured</span>}
                </p>
              </div>
              <Link href={`/admin/reports/${r.id}`} className="p-2.5 rounded-full border border-brand-gold/30 text-white/80 hover:bg-white/5" aria-label="Edit"><Pencil className="w-4 h-4" /></Link>
            </div>
          );
        })}
      </div>
    </>
  );
}
