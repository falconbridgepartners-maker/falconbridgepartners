'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { connectionStatus, disconnect, downloadText, dropboxConfigured, listFolder, publishPath, DropboxError, type DropboxConnection } from '@/lib/dropbox';
import { parseManifest, previewEntries, type EntryPreview } from '@/lib/weekly/manifest';
import { importEntry, type ImportResult } from '@/lib/weekly/import';

type RowState = 'new' | 'draft' | 'published' | 'none';
export type EntryState = EntryPreview & { scanState: RowState; reportState: RowState; pieceState: RowState };
export type ManifestSummary = {
  source: string;          // Dropbox path, or "pasted"
  name: string;            // folder name, e.g. 2026-W41
  weekLabel?: string; reviewPeriod?: string; modified?: string; preparedBy?: string; notes?: string;
  entries: EntryState[]; errors: string[];
};
export type ImportScreen = { configured: boolean; connection: DropboxConnection; folder: string; manifests: ManifestSummary[]; error?: string };

async function withStates(entries: EntryPreview[]): Promise<EntryState[]> {
  const db = createAdminClient();
  const scanSlugs = entries.map((e) => e.scanSlug).filter(Boolean) as string[];
  const reportSlugs = entries.map((e) => e.reportSlug).filter(Boolean) as string[];
  const pieceSlugs = entries.map((e) => e.pieceSlug).filter(Boolean) as string[];
  const [{ data: scans }, { data: reports }, { data: pieces }] = await Promise.all([
    scanSlugs.length ? db.from('scans').select('slug, published').in('slug', scanSlugs) : Promise.resolve({ data: [] as { slug: string; published: boolean }[] }),
    reportSlugs.length ? db.from('reports').select('slug, published').in('slug', reportSlugs) : Promise.resolve({ data: [] as { slug: string; published: boolean }[] }),
    // Asked only when a manifest carries a piece, so the screen works on a database that predates 006_pieces.sql.
    pieceSlugs.length ? db.from('pieces').select('slug, published').in('slug', pieceSlugs) : Promise.resolve({ data: [] as { slug: string; published: boolean }[] }),
  ]);
  const state = (rows: { slug: string; published: boolean }[] | null, slug?: string) => {
    if (!slug) return 'none' as const;
    const r = (rows ?? []).find((x) => x.slug === slug);
    return r ? (r.published ? 'published' as const : 'draft' as const) : 'new' as const;
  };
  return entries.map((e) => ({ ...e, scanState: state(scans, e.scanSlug), reportState: state(reports, e.reportSlug), pieceState: state(pieces, e.pieceSlug) }));
}

async function summarise(source: string, name: string, json: string, modified?: string): Promise<ManifestSummary> {
  const { manifest, errors } = parseManifest(json);
  if (!manifest) return { source, name, modified, entries: [], errors };
  const rp = manifest.review_period;
  return {
    source, name, modified, weekLabel: manifest.week_label, preparedBy: manifest.prepared_by, notes: manifest.notes,
    reviewPeriod: rp ? `${rp.from} to ${rp.to}` : undefined, entries: await withStates(previewEntries(manifest)), errors: [],
  };
}

/** Everything the import screen needs: the connection, and each manifest found in the publishing folder (newest first). */
export async function loadImportScreen(): Promise<ImportScreen> {
  await requireAdmin();
  const base: ImportScreen = { configured: dropboxConfigured(), connection: await connectionStatus(), folder: publishPath(), manifests: [] };
  if (!base.configured || !base.connection.connected) return base;
  try {
    const files = (await listFolder(publishPath(), true)).filter((e) => e.tag === 'file' && /manifest.*\.json$/i.test(e.name));
    // Newest saved first, so the manifest just written is always at the top however many weeks are on file.
    files.sort((a, b) => ((b.modified ?? '') > (a.modified ?? '') ? 1 : (b.modified ?? '') < (a.modified ?? '') ? -1 : b.path > a.path ? 1 : -1));
    const recent = files.slice(0, 60);
    for (let i = 0; i < recent.length; i += 8) {
      const batch = await Promise.all(recent.slice(i, i + 8).map(async (f) => {
        const label = f.name.replace(/\.json$/i, '');
        try { return await summarise(f.path, label, (await downloadText(f.id)).text, f.modified); }
        catch (e) { return { source: f.path, name: label, entries: [], errors: [e instanceof Error ? e.message : String(e)] } as ManifestSummary; }
      }));
      base.manifests.push(...batch);
    }
  } catch (e) {
    base.error = e instanceof DropboxError && e.code === 'not-found'
      ? `The publishing folder was not found in Dropbox: ${publishPath()}`
      : e instanceof Error ? e.message : String(e);
  }
  return base;
}

/** Checks a pasted manifest without writing anything. */
export async function checkPastedManifest(json: string): Promise<ManifestSummary> {
  await requireAdmin();
  return summarise('pasted', 'Pasted manifest', json);
}

/**
 * Imports one territory. The screen calls this once per territory so each call stays short.
 * `source` is a Dropbox path from loadImportScreen, or "pasted" with the JSON in `pasted`.
 */
export async function importOne(source: string, index: number, opts: { publish: boolean; overwritePublished: boolean }, pasted?: string): Promise<ImportResult> {
  const admin = await requireAdmin();
  let json = pasted ?? '';
  if (source !== 'pasted') {
    if (!source.toLowerCase().startsWith(`${publishPath().toLowerCase()}/`)) return { territory: '?', status: 'failed', detail: 'That file is outside the publishing folder.', files: [], warnings: [] };
    try { json = (await downloadText(source)).text; }
    catch (e) { return { territory: '?', status: 'failed', detail: e instanceof Error ? e.message : String(e), files: [], warnings: [] }; }
  }
  const { manifest, errors } = parseManifest(json);
  if (!manifest) return { territory: '?', status: 'failed', detail: errors.join(' '), files: [], warnings: [] };
  const result = await importEntry(manifest, index, { ...opts, adminEmail: admin.email, source });
  for (const p of ['/', '/research', '/research/library', '/research/weekly-scan', '/research/professional-curiosity', '/sitemap.xml']) revalidatePath(p);
  if (result.piece) { revalidatePath(`/research/professional-curiosity/${result.piece.slug}`); revalidatePath('/research/studies/[slug]', 'page'); }
  if (result.report) revalidatePath(`/research/studies/${result.report.slug}`);
  if (result.scan) revalidatePath(`/research/weekly-scan/${result.scan.slug}`);
  revalidatePath('/admin', 'layout');
  return result;
}

export async function disconnectDropbox(): Promise<void> {
  await requireAdmin();
  await disconnect();
  revalidatePath('/admin', 'layout');
}
