import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { listFolder, downloadText, publishPath } from '@/lib/dropbox';
import { parseManifest } from '@/lib/weekly/manifest';
import { importEntry } from '@/lib/weekly/import';
import { announcePublished } from '@/lib/weekly/announce';
import { sweepEntry, type Finding } from '@/lib/weekly/sweep';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MANIFEST_NAME = /manifest.*\.json$/i;
const MAX_AGE_DAYS = 30;

/**
 * The weekly import job. It looks in the Dropbox publishing folder for manifests it has not handled,
 * sweeps every entry, and publishes the clean ones that are new to the site.
 *
 *  - Only entries whose scan, study and piece are not on the site yet are published. Anything already there,
 *    live or unpublished, is left alone, so a page a partner took down is never put back.
 *  - An entry with any sweep finding is held and reported; the rest of the manifest still goes.
 *  - A manifest revision is marked handled once none of its entries failed. A newly saved revision is handled afresh.
 *
 * Called with `Authorization: Bearer CRON_SECRET`. Add `?dry=1` to sweep and report without publishing.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new NextResponse('Not authorised.', { status: 401 });
  const dry = new URL(req.url).searchParams.get('dry') === '1';
  const db = createAdminClient();
  const report: Array<Record<string, unknown>> = [];

  try {
    const files = (await listFolder(publishPath())).filter((e) => e.tag === 'file' && MANIFEST_NAME.test(e.name));
    const cutoff = Date.now() - MAX_AGE_DAYS * 86_400_000;
    for (const f of files) {
      if (f.modified && Date.parse(f.modified) < cutoff) continue;
      const tag = `auto:${f.id}@${f.rev ?? ''}`;
      const { data: done } = await db.from('import_log').select('id').eq('source', tag).limit(1);
      if (done?.length) continue;

      const item: Record<string, unknown> = { file: f.name, rev: f.rev, entries: [] as unknown[] };
      report.push(item);
      const { text } = await downloadText(f.id);
      const { manifest, errors } = parseManifest(text);
      if (!manifest) { item.held = errors; continue; }
      const rows = item.entries as Array<Record<string, unknown>>;
      let anyFailed = false;

      for (let i = 0; i < manifest.entries.length; i++) {
        const raw = manifest.entries[i];
        const row: Record<string, unknown> = { territory: raw.territory };
        rows.push(row);
        const slugs = { scan: raw.scan?.slug, report: raw.report?.slug, piece: raw.piece?.slug };
        const [a, b, c] = await Promise.all([
          slugs.scan ? db.from('scans').select('id').eq('slug', slugs.scan).maybeSingle() : { data: null },
          slugs.report ? db.from('reports').select('id').eq('slug', slugs.report).maybeSingle() : { data: null },
          slugs.piece ? db.from('pieces').select('id').eq('slug', slugs.piece).maybeSingle() : { data: null },
        ]);
        if (a.data || b.data || c.data) { row.status = 'already on the site, left alone'; continue; }

        const { entry, findings } = sweepEntry(raw, manifest.week_label);
        if (findings.length) { row.status = 'HELD'; row.findings = findings satisfies Finding[]; continue; }
        if (dry) { row.status = 'clean, would publish'; continue; }

        manifest.entries[i] = entry;
        const res = await importEntry(manifest, i, { publish: true, overwritePublished: false, adminEmail: 'auto-import', source: `auto-entry:${f.id}@${f.rev ?? ''}` });
        row.status = res.status; row.detail = res.detail; row.warnings = res.warnings;
        row.published = Boolean(res.scan?.published || res.report?.published || res.piece?.published);
        if (res.status === 'failed' || res.files.some((x) => x.status === 'failed')) anyFailed = true;
      }
      const held = rows.some((r) => r.status === 'HELD');
      item.complete = !anyFailed;
      if (!dry && !anyFailed) {
        await db.from('import_log').insert({ week_label: manifest.week_label, published: false, source: tag, created_by: 'auto-import', result: { held, entries: rows } });
      }
    }
    if (!dry) for (const p of ['/', '/research', '/research/library', '/research/weekly-scan', '/research/professional-curiosity', '/sitemap.xml']) revalidatePath(p);
    const announced = dry ? null : await announcePublished();
    return NextResponse.json({ ok: true, dry, checked_at: new Date().toISOString(), report, announced }, { headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e), report }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
