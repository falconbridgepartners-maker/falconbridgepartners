import 'server-only';
import { randomUUID } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { PUBLIC_MEDIA, RESEARCH_FILES, territoryName, thumbPathOf } from '@/lib/data';
import { download } from '@/lib/dropbox';
import { SLOTS, type ManifestEntry, type ManifestFile, type WeeklyManifest } from '@/lib/weekly/manifest';
import { PIECE_SERIES } from '@/lib/pieces';

export type ImportOptions = { publish: boolean; overwritePublished: boolean; adminEmail: string; source?: string };
export type ImportFileResult = { slot: number; label: string; access: string; status: 'copied' | 'unchanged' | 'failed'; detail?: string };
export type ImportResult = {
  territory: string; status: 'imported' | 'skipped' | 'failed'; detail?: string;
  scan?: { id: string; slug: string; published: boolean }; report?: { id: string; slug: string; published: boolean };
  piece?: { id: string; slug: string; published: boolean };
  files: ImportFileResult[]; warnings: string[];
};

const PACK_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  zip: 'application/zip',
};
const IMAGE_MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
const extOf = (name: string) => (name.split('.').pop() ?? '').toLowerCase();

/** "From Pump Price to Cost Base" + "Executive deck" → a tidy name for the reader's download. */
function downloadName(studyTitle: string, label: string, ext: string) {
  const clean = (s: string) => s.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `FalconBridge - ${clean(studyTitle).slice(0, 90)} - ${clean(label)}.${ext}`;
}

type Db = ReturnType<typeof createAdminClient>;

async function copyImage(db: Db, ref: string, folder: 'extracts' | 'covers' | 'share'): Promise<string> {
  const { data, entry } = await download(ref);
  const ext = extOf(entry.name);
  const mime = IMAGE_MIME[ext];
  if (!mime) throw new Error(`${entry.name}: images must be PNG, JPEG or WebP.`);
  if (data.byteLength > 10 * 1024 * 1024) throw new Error(`${entry.name}: images must be under 10 MB.`);
  const path = `${folder}/${randomUUID()}.${ext === 'jpeg' ? 'jpg' : ext}`;
  const { error } = await db.storage.from(PUBLIC_MEDIA).upload(path, data, { contentType: mime, upsert: true });
  if (error) throw new Error(error.message);
  await makeThumb(db, data, path);
  return path;
}

/**
 * A web-sized copy for lists and cards, so a page of studies does not load every full-size visual.
 * Best effort: if it cannot be made, the cards fall back to the full image.
 */
async function makeThumb(db: Db, data: ArrayBuffer, path: string): Promise<void> {
  try {
    const sharp = (await import('sharp')).default;
    const out = await sharp(Buffer.from(data)).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    const { error } = await db.storage.from(PUBLIC_MEDIA).upload(thumbPathOf(path), out, { contentType: 'image/webp', upsert: true });
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error('[import] thumbnail not made:', e instanceof Error ? e.message : e);
  }
}

type FileRow = { id: string; sort_order: number; storage_path: string | null; source_ref: string | null; access: string };

async function copyPackFile(db: Db, reportId: string, studyTitle: string, f: ManifestFile, existing: FileRow | undefined): Promise<ImportFileResult> {
  const slot = SLOTS[f.slot - 1];
  const label = f.label || slot.label;
  const access = f.access ?? slot.access;
  try {
    // A file already copied from the same Dropbox reference is left alone; only its label and access follow the manifest.
    if (existing?.storage_path && existing.source_ref && existing.source_ref.split('@')[0] === f.dropbox) {
      const { error } = await db.from('report_files').update({ label, access }).eq('id', existing.id);
      if (error) throw new Error(error.message);
      return { slot: f.slot, label, access, status: 'unchanged' };
    }
    const { data, entry } = await download(f.dropbox);
    const ext = extOf(f.name || entry.name);
    const mime = PACK_MIME[ext];
    if (!mime) throw new Error(`${entry.name}: pack files must be PDF, PPTX, DOCX or ZIP.`);
    const path = `reports/${randomUUID()}.${ext}`;
    const up = await db.storage.from(RESEARCH_FILES).upload(path, data, { contentType: mime, upsert: true });
    if (up.error) throw new Error(up.error.message);
    const row = {
      report_id: reportId, label, sort_order: f.slot, storage_path: path, access, size_bytes: data.byteLength,
      source_ref: `${f.dropbox}@${entry.rev ?? ''}`, file_name: downloadName(studyTitle, label, ext),
    };
    const { error } = existing ? await db.from('report_files').update(row).eq('id', existing.id) : await db.from('report_files').insert(row);
    if (error) throw new Error(error.message);
    if (existing?.storage_path) await db.storage.from(RESEARCH_FILES).remove([existing.storage_path]).catch(() => undefined);
    return { slot: f.slot, label, access, status: 'copied', detail: `${(data.byteLength / 1048576).toFixed(1)} MB` };
  } catch (e) {
    return { slot: f.slot, label, access, status: 'failed', detail: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Imports one territory from a validated manifest. Safe to run again: rows are matched by slug and files by slot,
 * and files already copied from the same Dropbox reference are not copied twice.
 *
 * Nothing is published unless `publish` is set. An entry that is already live is left untouched unless
 * `overwritePublished` is set, so a partner's edits to a published page are not replaced by accident.
 */
export async function importEntry(manifest: WeeklyManifest, index: number, opts: ImportOptions): Promise<ImportResult> {
  const entry: ManifestEntry | undefined = manifest.entries[index];
  if (!entry) return { territory: '?', status: 'failed', detail: `No entry ${index} in the manifest.`, files: [], warnings: [] };
  const out: ImportResult = { territory: entry.territory, status: 'imported', files: [], warnings: [] };
  const db = createAdminClient();

  try {
    // ── What is already there ────────────────────────────────────────────────
    const [{ data: exReport }, { data: exScan }, { data: exPiece, error: pieceErr }] = await Promise.all([
      entry.report ? db.from('reports').select('id, title, published, extract_path, cover_path').eq('slug', entry.report.slug).maybeSingle() : Promise.resolve({ data: null }),
      entry.scan ? db.from('scans').select('id, published, reviewed').eq('slug', entry.scan.slug).maybeSingle() : Promise.resolve({ data: null }),
      entry.piece ? db.from('pieces').select('id, published, share_image_path').eq('slug', entry.piece.slug).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (entry.piece && pieceErr) throw new Error(`piece: ${pieceErr.message}. If the pieces table does not exist yet, run supabase/006_pieces.sql.`);
    if (!opts.overwritePublished && (exReport?.published || exScan?.published || exPiece?.published)) {
      return { ...out, status: 'skipped', detail: 'Already published. Tick “Replace published entries” to import over it.' };
    }

    // ── The study ────────────────────────────────────────────────────────────
    let reportId: string | null = exReport?.id ?? null;
    let reportPublished = Boolean(exReport?.published);
    if (entry.report) {
      const r = entry.report;
      // A new study takes every field, with defaults. An existing one is updated only where the manifest says something,
      // so a manifest that carries just the slug and its files (adding a document, say) leaves the live wording alone.
      const row: Record<string, unknown> = reportId
        ? { territory: entry.territory, week_label: manifest.week_label }
        : {
          slug: r.slug, title: r.title, subtitle: r.subtitle ?? null, kind: r.kind ?? 'study', territory: entry.territory,
          year: r.year ?? Number(manifest.week_label.slice(0, 4)), published_at: r.published_at ?? new Date().toISOString().slice(0, 10),
          body: r.body ?? null, facts: r.facts ?? [], extract_note: r.extract_note ?? null, qualifier: r.qualifier ?? null,
          week_label: manifest.week_label,
        };
      if (reportId) {
        for (const key of ['title', 'subtitle', 'kind', 'year', 'published_at', 'body', 'facts', 'extract_note', 'qualifier'] as const) {
          if (r[key] !== undefined) row[key] = r[key];
        }
      } else if (!r.title) {
        throw new Error(`report: "${r.slug}" is not on the site yet, so the manifest must give its title.`);
      }
      for (const [key, folder, column] of [['extract_image', 'extracts', 'extract_path'], ['cover_image', 'covers', 'cover_path']] as const) {
        const ref = r[key];
        if (!ref) continue;
        try { row[column] = await copyImage(db, ref, folder); }
        catch (e) { out.warnings.push(`${key}: ${e instanceof Error ? e.message : String(e)}`); }
      }
      if (reportId) {
        const { error } = await db.from('reports').update(row).eq('id', reportId);
        if (error) throw new Error(`report: ${error.message}`);
        for (const column of ['extract_path', 'cover_path'] as const) {
          const old = exReport?.[column];
          if (row[column] && old && old !== row[column]) await db.storage.from(PUBLIC_MEDIA).remove([old, thumbPathOf(old)]).catch(() => undefined);
        }
      } else {
        const { data, error } = await db.from('reports').insert({ ...row, published: false, featured: false }).select('id').single();
        if (error) throw new Error(`report: ${error.message}`);
        reportId = data.id;
      }

      // ── Its files ──────────────────────────────────────────────────────────
      const { data: rows } = await db.from('report_files').select('id, sort_order, storage_path, source_ref, access').eq('report_id', reportId!);
      const bySlot = new Map<number, FileRow>((rows ?? []).map((x) => [x.sort_order, x as FileRow]));
      out.files = await Promise.all((entry.files ?? []).map((f) => copyPackFile(db, reportId!, r.title ?? exReport?.title ?? r.slug, f, bySlot.get(f.slot))));
      // Slots the manifest leaves out are created empty and internal, so the admin form never defaults them to "in the pack".
      const named = new Set((entry.files ?? []).map((f) => f.slot));
      const missing = SLOTS.filter((s) => !named.has(s.slot) && !bySlot.has(s.slot)).map((s) => ({ report_id: reportId!, label: s.label, sort_order: s.slot, access: 'internal' }));
      if (missing.length) await db.from('report_files').insert(missing);
    }

    const failed = out.files.filter((f) => f.status === 'failed');
    // A study never goes live with a file missing: it stays a draft and the screen says which file failed.
    const mayPublish = opts.publish && failed.length === 0;
    if (opts.publish && failed.length) out.warnings.push(`Not published: ${failed.length} file${failed.length === 1 ? '' : 's'} could not be copied.`);

    if (entry.report && reportId && mayPublish && !reportPublished) {
      const { error } = await db.from('reports').update({ published: true }).eq('id', reportId);
      if (error) throw new Error(`report: ${error.message}`);
      reportPublished = true;
    }
    if (entry.report && reportId) out.report = { id: reportId, slug: entry.report.slug, published: reportPublished };

    // ── The scan entry ───────────────────────────────────────────────────────
    if (entry.scan) {
      const s = entry.scan;
      const row: Record<string, unknown> = {
        slug: s.slug, title: s.title, territory: entry.territory, service: s.service ?? 'none', week_of: s.week_of,
        signal: s.signal, question: s.question, finding: s.finding ?? null, interpretation: s.interpretation ?? null,
        open_questions: s.open_questions ?? [], week_label: manifest.week_label, sample: false,
      };
      if (reportId) row.report_id = reportId;
      // The Weekly Signal as issued. Left untouched on re-import when the manifest carries none.
      if (s.content) row.content = s.content;
      let scanPublished = Boolean(exScan?.published);
      if (mayPublish) { row.reviewed = true; row.published = true; scanPublished = true; }
      let scanId = exScan?.id as string | undefined;
      if (scanId) {
        const { error } = await db.from('scans').update(row).eq('id', scanId);
        if (error) throw new Error(`scan: ${error.message}`);
      } else {
        const { data, error } = await db.from('scans').insert({ reviewed: false, published: false, ...row }).select('id').single();
        if (error) throw new Error(`scan: ${error.message}`);
        scanId = data.id;
      }
      out.scan = { id: scanId!, slug: s.slug, published: scanPublished };
    }

    // ── The Professional Curiosity piece ─────────────────────────────────────
    if (entry.piece) {
      const p = entry.piece;
      // The study behind the piece: this entry's own report, or the study the piece names.
      let studyId: string | null = reportId;
      if (!entry.report && p.study) {
        const { data: st } = await db.from('reports').select('id').eq('slug', p.study).maybeSingle();
        if (st) studyId = st.id; else out.warnings.push(`piece: no study with the slug "${p.study}" — the piece is saved without a link to its study.`);
      }
      const row: Record<string, unknown> = {
        slug: p.slug, title: p.content.headline.trim(), series: p.content.series?.trim() || PIECE_SERIES, territory: entry.territory,
        description: p.description ?? null, published_at: p.published_at ?? new Date().toISOString().slice(0, 10), evidence_date: p.evidence_date ?? null,
        content: p.content,
      };
      if (studyId) row.report_id = studyId;
      if (p.share_image) {
        try { row.share_image_path = await copyImage(db, p.share_image, 'share'); }
        catch (e) { out.warnings.push(`share_image: ${e instanceof Error ? e.message : String(e)}`); }
      }
      let piecePublished = Boolean(exPiece?.published);
      if (mayPublish) { row.reviewed = true; row.published = true; piecePublished = true; }
      let pieceId = exPiece?.id as string | undefined;
      if (pieceId) {
        const { error } = await db.from('pieces').update(row).eq('id', pieceId);
        if (error) throw new Error(`piece: ${error.message}`);
        const old = exPiece?.share_image_path;
        if (row.share_image_path && old && old !== row.share_image_path) await db.storage.from(PUBLIC_MEDIA).remove([old, thumbPathOf(old)]).catch(() => undefined);
      } else {
        const { data, error } = await db.from('pieces').insert({ reviewed: false, published: false, ...row }).select('id').single();
        if (error) throw new Error(`piece: ${error.message}`);
        pieceId = data.id;
      }
      out.piece = { id: pieceId!, slug: p.slug, published: piecePublished };
    }

    if (failed.length) out.detail = `${territoryName[entry.territory] ?? entry.territory}: ${failed.length} file${failed.length === 1 ? '' : 's'} failed — run the import again to retry.`;
  } catch (e) {
    out.status = 'failed';
    out.detail = e instanceof Error ? e.message : String(e);
  }

  try {
    await db.from('import_log').insert({
      week_label: manifest.week_label, territory: entry.territory, scan_slug: entry.scan?.slug ?? null, report_slug: entry.report?.slug ?? null,
      published: Boolean(out.report?.published || out.scan?.published || out.piece?.published), result: out, source: opts.source ?? null, created_by: opts.adminEmail,
      // Only named when the entry carries a piece, so the log keeps working on a database that predates 006_pieces.sql.
      ...(entry.piece ? { piece_slug: entry.piece.slug } : {}),
    });
  } catch { /* the log is a record, not a dependency */ }
  return out;
}
