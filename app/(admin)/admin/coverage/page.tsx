import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { TERRITORIES, territoryName } from '@/lib/data';
import { SLOTS } from '@/lib/weekly/manifest';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ScanRow = { id: string; slug: string; title: string; territory: string; week_label: string | null; week_of: string; published: boolean; report_id: string | null };
type FileRow = { sort_order: number; storage_path: string | null; access: string };
type ReportRow = { id: string; slug: string; title: string; territory: string; week_label: string | null; published: boolean; files: FileRow[] };
type PieceRow = { id: string; slug: string; territory: string; report_id: string | null; published: boolean };

type Cell = { scan?: ScanRow; reports: ReportRow[]; pieces: PieceRow[] };

/** Sort "2026-W41" style labels newest first. */
function weekSort(a: string, b: string) {
  return b.localeCompare(a);
}

export default async function Coverage() {
  const db = createAdminClient();
  const [{ data: scans }, { data: reports }, { data: pieces }] = await Promise.all([
    db.from('scans').select('id, slug, title, territory, week_label, week_of, published, report_id'),
    db.from('reports').select('id, slug, title, territory, week_label, published, files:report_files(sort_order, storage_path, access)'),
    db.from('pieces').select('id, slug, territory, report_id, published'),
  ]);

  const scanRows = (scans ?? []) as ScanRow[];
  const reportRows = (reports ?? []) as ReportRow[];
  const pieceRows = (pieces ?? []) as PieceRow[];
  const reportById = new Map(reportRows.map((r) => [r.id, r]));

  // Territories in play: the ones on offer, plus any a record already holds (hidden ones included, so nothing is lost from view).
  const territoryKeys = Array.from(new Set([
    ...TERRITORIES.map((t) => t.value),
    ...scanRows.map((s) => s.territory),
    ...reportRows.map((r) => r.territory),
  ]));

  const grid = new Map<string, Map<string, Cell>>();
  const cell = (week: string, territory: string): Cell => {
    let row = grid.get(week);
    if (!row) { row = new Map(); grid.set(week, row); }
    let c = row.get(territory);
    if (!c) { c = { reports: [], pieces: [] }; row.set(territory, c); }
    return c;
  };
  const unfiled: { kind: string; title: string; href: string; territory: string }[] = [];

  for (const s of scanRows) {
    if (!s.week_label) { unfiled.push({ kind: 'Signal', title: s.title, href: `/admin/scans/${s.id}`, territory: s.territory }); continue; }
    cell(s.week_label, s.territory).scan = s;
  }
  for (const r of reportRows) {
    if (!r.week_label) { unfiled.push({ kind: 'Study', title: r.title, href: `/admin/reports/${r.id}`, territory: r.territory }); continue; }
    cell(r.week_label, r.territory).reports.push(r);
  }
  for (const p of pieceRows) {
    // A piece takes the week of the study it sits behind. One without a study, or behind a study without a week, is listed below.
    const study = p.report_id ? reportById.get(p.report_id) : undefined;
    if (!study?.week_label) { unfiled.push({ kind: 'Piece', title: p.slug, href: `/admin/pieces/${p.id}`, territory: p.territory }); continue; }
    cell(study.week_label, study.territory).pieces.push(p);
  }

  const weeks = Array.from(grid.keys()).sort(weekSort);
  const packSlots = SLOTS.filter((s) => (s.access as string) !== 'internal').length;

  const totals = {
    weeks: weeks.length,
    signals: scanRows.filter((s) => s.published && s.week_label).length,
    studies: reportRows.filter((r) => r.published && r.week_label).length,
    pieces: pieceRows.filter((p) => p.published).length,
  };

  return (
    <>
      <PageHead title="Coverage" sub="Every week by territory: the Weekly Signal, the study, the files in its pack and any Professional Curiosity piece." />
      <p className="text-white/55 text-sm mb-6">
        {totals.weeks} weeks · {totals.signals} signals live · {totals.studies} studies live · {totals.pieces} pieces live. A pack is complete at {packSlots} files;
        the count shows files actually uploaded. Drafts are shown in grey.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-brand-navy text-left text-white/70 font-bold px-3 py-2 border-b border-brand-gold/20">Week</th>
              {territoryKeys.map((t) => (
                <th key={t} className="text-left text-white/70 font-bold px-3 py-2 border-b border-brand-gold/20 min-w-[11rem]">{territoryName[t] ?? t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.length === 0 && (
              <tr><td colSpan={territoryKeys.length + 1} className="px-3 py-6 text-white/55">Nothing filed under a week yet.</td></tr>
            )}
            {weeks.map((week) => {
              const row = grid.get(week)!;
              return (
                <tr key={week} className="align-top">
                  <td className="sticky left-0 bg-brand-navy px-3 py-3 border-b border-white/10 text-white font-bold whitespace-nowrap">{week}</td>
                  {territoryKeys.map((t) => {
                    const c = row.get(t);
                    if (!c) return <td key={t} className="px-3 py-3 border-b border-white/10 text-white/25">·</td>;
                    return (
                      <td key={t} className="px-3 py-3 border-b border-white/10">
                        <div className="space-y-1.5">
                          {c.scan ? (
                            <Link href={`/admin/scans/${c.scan.id}`} className={`block hover:underline ${c.scan.published ? 'text-brand-gold' : 'text-white/40'}`}>
                              Signal{c.scan.published ? '' : ' (draft)'}
                            </Link>
                          ) : (
                            <span className="block text-white/30">No signal</span>
                          )}
                          {c.reports.length === 0 && <span className="block text-white/30">No study</span>}
                          {c.reports.map((r) => {
                            const uploaded = r.files.filter((f) => f.storage_path).length;
                            const internal = r.files.filter((f) => f.storage_path && f.access === 'internal').length;
                            const missing = SLOTS.filter((s) => !r.files.some((f) => f.sort_order === s.slot && f.storage_path)).map((s) => s.slot);
                            const complete = uploaded - internal >= packSlots;
                            return (
                              <div key={r.id}>
                                <Link href={`/admin/reports/${r.id}`} className={`block hover:underline ${r.published ? 'text-white' : 'text-white/40'}`} title={r.title}>
                                  {r.title}{r.published ? '' : ' (draft)'}
                                </Link>
                                <span className={`block ${complete ? 'text-white/55' : 'text-amber-300/80'}`}>
                                  {uploaded} of {SLOTS.length} files{missing.length ? ` · missing ${missing.join(', ')}` : ''}{internal ? ` · ${internal} internal` : ''}
                                </span>
                              </div>
                            );
                          })}
                          {c.pieces.map((p) => (
                            <Link key={p.id} href={`/admin/pieces/${p.id}`} className={`block hover:underline ${p.published ? 'text-white/80' : 'text-white/40'}`}>
                              Piece{p.published ? '' : ' (draft)'}
                            </Link>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {unfiled.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl mb-3">Not filed under a week</h2>
          <p className="text-white/55 text-sm mb-4">These have no week label (or, for a piece, no study with one). Open each and set it, or leave it if it is not part of a week.</p>
          <ul className="space-y-1.5 text-sm">
            {unfiled.map((u) => (
              <li key={u.href}>
                <span className="text-white/50">{u.kind} · {territoryName[u.territory] ?? u.territory} · </span>
                <Link href={u.href} className="text-brand-gold hover:underline">{u.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
