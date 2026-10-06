import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHead } from '@/components/admin/ui';
import type { AccessRequest } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = AccessRequest & { report: { id: string; title: string; slug: string; week_label: string | null } | null };
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default async function PackRequests({ searchParams }: { searchParams?: { report?: string } }) {
  const db = createAdminClient();
  let q = db.from('access_requests').select('*, report:reports(id, title, slug, week_label)').order('created_at', { ascending: false }).limit(500);
  if (searchParams?.report) q = q.eq('report_id', searchParams.report);
  const { data, error } = await q;
  const rows = (data ?? []) as unknown as Row[];
  const opened = rows.filter((r) => r.open_count > 0).length;
  return (
    <>
      <PageHead title="Pack requests" sub="Everyone who asked for a research pack, newest first." />
      {error && <p className="text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6" role="alert">Pack requests are not available yet. Run supabase/004_weekly_pipeline.sql in the Supabase SQL editor.</p>}
      {!error && (
        <p className="text-white/55 text-sm mb-6">
          {rows.length} request{rows.length === 1 ? '' : 's'}{rows.length ? ` · ${opened} opened the pack` : ''}
          {searchParams?.report && <> · <Link href="/admin/requests" className="underline underline-offset-4">show all studies</Link></>}
        </p>
      )}
      {!error && rows.length === 0 && <p className="text-white/55">No one has asked for a pack yet. Requests appear here the moment a reader completes the form on a study page.</p>}
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="tile p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-baseline">
            <div className="md:col-span-4 min-w-0">
              <p className="text-white font-bold truncate">{r.full_name}</p>
              <p className="text-white/60 text-sm truncate">{r.organisation}{r.role ? ` · ${r.role}` : ''}</p>
              <a href={`mailto:${r.email}`} className="text-brand-gold-pale text-sm underline underline-offset-4 break-all">{r.email}</a>
            </div>
            <div className="md:col-span-5 min-w-0">
              {r.report ? (
                <Link href={`/admin/requests?report=${r.report.id}`} className="text-white/80 text-sm hover:text-white">{r.report.week_label ? `${r.report.week_label} · ` : ''}{r.report.title}</Link>
              ) : <span className="text-white/40 text-sm">Study removed</span>}
              {r.intended_use && <p className="text-white/45 text-xs mt-1">{r.intended_use}</p>}
            </div>
            <div className="md:col-span-3 text-xs text-white/50 md:text-right">
              <p>Asked {day(r.created_at)}</p>
              <p>{r.open_count > 0 ? `Opened ${day(r.first_opened_at)} · ${r.download_count} download${r.download_count === 1 ? '' : 's'}` : new Date(r.expires_at) < new Date() ? 'Link lapsed unopened' : 'Not opened yet'}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
