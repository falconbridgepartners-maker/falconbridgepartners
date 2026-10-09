import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { territoryName } from '@/lib/data';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ScanRow = { id: string; slug: string; title: string; territory: string; week_label: string | null; published: boolean; report_id: string | null };
type FileRow = { id: string; sort_order: number; label: string; storage_path: string | null; access: string; size_bytes: number | null; source_ref: string | null };
type ReportRow = { id: string; slug: string; title: string; territory: string; week_label: string | null; published: boolean; files: FileRow[] };
type PieceRow = { id: string; slug: string; territory: string; report_id: string | null; published: boolean };

/**
 * Cross-reference check: every link between a study, the signal behind it, the pieces on it and the files in its pack,
 * with anything that disagrees called out at the top. The file source is the Dropbox id the file was copied from.
 */
export default async function Links() {
  const db = createAdminClient();
  const [{ data: scans }, { data: reports }, { data: pieces }] = await Promise.all([
    db.from('scans').select('id, slug, title, territory, week_label, published, report_id'),
    db.from('reports').select('id, slug, title, territory, week_label, published, files:report_files(id, sort_order, label, storage_path, access, size_bytes, source_ref)').order('week_label', { ascending: false }),
    db.from('pieces').select('id, slug, territory, report_id, published'),
  ]);
  const scanRows = (scans ?? []) as ScanRow[];
  const reportRows = (reports ?? []) as ReportRow[];
  const pieceRows = (pieces ?? []) as PieceRow[];
  const reportById = new Map(reportRows.map((r) => [r.id, r]));

  const problems: { text: string; href: string }[] = [];
  for (const s of scanRows) {
    if (!s.report_id) continue;
    const r = reportById.get(s.report_id);
    if (!r) { problems.push({ text: `Signal "${s.title}" points at a study that no longer exists.`, href: `/admin/scans/${s.id}` }); continue; }
    if (r.territory !== s.territory) problems.push({ text: `Signal "${s.title}" (${territoryName[s.territory] ?? s.territory}) points at "${r.title}" (${territoryName[r.territory] ?? r.territory}).`, href: `/admin/scans/${s.id}` });
    if (r.week_label && s.week_label && r.week_label !== s.week_label) problems.push({ text: `Signal "${s.title}" (${s.week_label}) points at "${r.title}" (${r.week_label}).`, href: `/admin/scans/${s.id}` });
  }
  for (const p of pieceRows) {
    if (!p.report_id) { problems.push({ text: `Piece "${p.slug}" has no study linked.`, href: `/admin/pieces/${p.id}` }); continue; }
    const r = reportById.get(p.report_id);
    if (!r) { problems.push({ text: `Piece "${p.slug}" points at a study that no longer exists.`, href: `/admin/pieces/${p.id}` }); continue; }
    if (r.territory !== p.territory) problems.push({ text: `Piece "${p.slug}" (${territoryName[p.territory] ?? p.territory}) points at "${r.title}" (${territoryName[r.territory] ?? r.territory}).`, href: `/admin/pieces/${p.id}` });
  }
  const scansByReport = new Map<string, ScanRow[]>();
  for (const s of scanRows) if (s.report_id) scansByReport.set(s.report_id, [...(scansByReport.get(s.report_id) ?? []), s]);
  for (const [rid, list] of scansByReport) if (list.length > 1) problems.push({ text: `"${reportById.get(rid)?.title ?? rid}" is linked from ${list.length} signals: ${list.map((s) => s.title).join('; ')}.`, href: `/admin/reports/${rid}` });
  const seenSource = new Map<string, string>();
  for (const r of reportRows) for (const f of r.files) {
    const src = f.source_ref?.split('@')[0];
    if (!src) continue;
    const prev = seenSource.get(src);
    if (prev && prev !== r.id) problems.push({ text: `"${r.title}" and "${reportById.get(prev)?.title}" share the same Dropbox file in their packs (${src}).`, href: `/admin/reports/${r.id}` });
    seenSource.set(src, r.id);
  }

  return (
    <>
      <PageHead title="Cross-references" sub="Every study with the signal behind it, the pieces on it and where each pack file was copied from. Anything that disagrees is listed first." />
      <p className="text-white/55 text-sm mb-6"><Link href="/admin/coverage" className="text-brand-gold hover:underline">Back to coverage</Link></p>

      <div className={`tile p-5 mb-8 ${problems.length ? 'border-amber-300/40' : ''}`}>
        {problems.length === 0 ? (
          <p className="text-white/80 text-sm">All cross-references agree: every linked signal and piece sits in the same territory and week as its study, no study is linked from two signals, and no Dropbox file sits in two packs.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {problems.map((p, i) => <li key={i}><Link href={p.href} className="text-amber-300/90 hover:underline">{p.text}</Link></li>)}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {reportRows.map((r) => {
          const linkedScans = scansByReport.get(r.id) ?? [];
          const linkedPieces = pieceRows.filter((p) => p.report_id === r.id);
          return (
            <div key={r.id} className="tile p-5 text-xs">
              <p className="text-white font-bold text-sm">
                <Link href={`/admin/reports/${r.id}`} className="hover:underline">{r.title}</Link>
                <span className="text-white/50 font-normal"> · {territoryName[r.territory] ?? r.territory} · {r.week_label ?? 'no week'} · {r.published ? 'live' : 'draft'} · {r.slug}</span>
              </p>
              <p className="text-white/70 mt-2">
                Signal: {linkedScans.length === 0 ? <span className="text-white/40">none linked</span> : linkedScans.map((s) => (
                  <Link key={s.id} href={`/admin/scans/${s.id}`} className="hover:underline">{s.title} ({territoryName[s.territory] ?? s.territory} · {s.week_label ?? 'no week'}{s.published ? '' : ' · draft'})</Link>
                ))}
              </p>
              <p className="text-white/70 mt-1">
                Pieces: {linkedPieces.length === 0 ? <span className="text-white/40">none</span> : linkedPieces.map((p, i) => (
                  <span key={p.id}>{i > 0 ? '; ' : ''}<Link href={`/admin/pieces/${p.id}`} className="hover:underline">{p.slug}</Link> ({territoryName[p.territory] ?? p.territory}{p.published ? '' : ' · draft'})</span>
                ))}
              </p>
              <table className="mt-3 w-full border-separate border-spacing-0">
                <tbody>
                  {[...r.files].sort((a, b) => a.sort_order - b.sort_order).map((f) => (
                    <tr key={f.id} className="text-white/60">
                      <td className="pr-3 py-0.5 whitespace-nowrap">{f.sort_order}. {f.label}</td>
                      <td className="pr-3 py-0.5 whitespace-nowrap">{f.storage_path ? `${((f.size_bytes ?? 0) / 1024).toFixed(0)} KB` : 'no file'}</td>
                      <td className="pr-3 py-0.5 whitespace-nowrap">{f.access}</td>
                      <td className="py-0.5 font-mono text-[0.7rem] text-white/45">{f.source_ref?.split('@')[0] ?? (f.storage_path ? 'uploaded by hand' : '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </>
  );
}
