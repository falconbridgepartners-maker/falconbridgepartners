'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkPastedManifest, disconnectDropbox, importOne, type ImportScreen, type ManifestSummary } from '@/lib/admin/importActions';
import type { ImportResult } from '@/lib/weekly/import';
import { input, btn, btnGhost } from '@/components/admin/ui';

const TERRITORY: Record<string, string> = {
  'uae-gcc': 'UAE / GCC', 'south-africa': 'South Africa', 'new-zealand': 'New Zealand', mauritius: 'Mauritius', 'north-carolina': 'North Carolina', singapore: 'Singapore',
  global: 'Global', usa: 'USA',
};
const ACCESS: Record<string, string> = { open: 'open', request: 'in the pack', internal: 'internal' };
const STATE: Record<string, string> = { new: 'new', draft: 'draft exists', published: 'live', none: '—' };

type Run = { busy: boolean; mode?: 'draft' | 'publish'; results: Record<number, ImportResult | 'working'> };

function ManifestCard({ m, pasted }: { m: ManifestSummary; pasted?: string }) {
  const router = useRouter();
  const [run, setRun] = useState<Run>({ busy: false, results: {} });
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const anyLive = m.entries.some((e) => e.scanState === 'published' || e.reportState === 'published' || e.pieceState === 'published');

  const start = async (publish: boolean) => {
    setConfirmPublish(false);
    setRun({ busy: true, mode: publish ? 'publish' : 'draft', results: {} });
    // One territory per request, in order, so a slow file never takes the whole week down with it.
    for (const e of m.entries) {
      setRun((r) => ({ ...r, results: { ...r.results, [e.index]: 'working' } }));
      let res: ImportResult;
      try { res = await importOne(m.source, e.index, { publish, overwritePublished: overwrite }, pasted); }
      catch (err) { res = { territory: e.territory, status: 'failed', detail: err instanceof Error ? err.message : 'The request did not complete.', files: [], warnings: [] }; }
      setRun((r) => ({ ...r, results: { ...r.results, [e.index]: res } }));
    }
    setRun((r) => ({ ...r, busy: false }));
    router.refresh();
  };

  const done = Object.values(run.results).filter((r) => r !== 'working') as ImportResult[];
  const finished = !run.busy && done.length === m.entries.length && done.length > 0;
  const problems = done.filter((r) => r.status === 'failed' || r.files.some((f) => f.status === 'failed'));

  return (
    <section className="tile p-6 space-y-5" aria-label={`Manifest ${m.weekLabel ?? m.name}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-2xl">{m.weekLabel ?? m.name}</h2>
          {m.weekLabel && m.name !== m.weekLabel && <p className="text-white/70 text-sm mt-1">{m.name}</p>}
          <p className="text-white/50 text-xs mt-1">
            {[m.reviewPeriod && `Review period ${m.reviewPeriod}`, m.preparedBy && `prepared by ${m.preparedBy}`, m.modified && `saved ${new Date(m.modified).toLocaleString('en-GB')}`].filter(Boolean).join(' · ')}
          </p>
        </div>
        <p className="text-[0.7rem] text-white/35 truncate max-w-full">{m.source}</p>
      </div>

      {m.notes && <p className="text-sm text-white/70 border-l-2 border-brand-gold pl-4">{m.notes}</p>}

      {m.errors.length > 0 ? (
        <div className="text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-lg p-4" role="alert">
          <p className="font-bold mb-2">This manifest cannot be imported until these are fixed:</p>
          <ul className="list-disc pl-5 space-y-1">{m.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {m.entries.map((e) => {
              const r = run.results[e.index];
              return (
                <div key={e.index} className="rounded-lg border border-brand-gold/15 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-white font-bold">{TERRITORY[e.territory] ?? e.territory}</p>
                    <p className="text-xs text-white/45">scan: {STATE[e.scanState]} · study: {STATE[e.reportState]}{e.pieceSlug ? ` · piece: ${STATE[e.pieceState]}` : ''}</p>
                  </div>
                  {(e.reportTitle || e.reportSlug) && <p className="text-sm text-white/75 mt-1">{e.reportTitle ?? e.reportSlug}</p>}
                  {e.scanTitle && <p className="text-xs text-white/45 mt-0.5">{e.scanTitle}</p>}
                  {e.pieceTitle && <p className="text-sm text-white/75 mt-1"><span className="text-white/45">Professional Curiosity piece: </span>{e.pieceTitle}</p>}
                  {e.files.length > 0 && (
                    <p className="text-xs text-white/50 mt-2">{e.files.map((f) => `${f.label} (${ACCESS[f.access]})`).join(' · ')}</p>
                  )}
                  {r === 'working' && <p className="text-xs text-brand-gold-pale mt-3" role="status">Copying from Dropbox…</p>}
                  {r && r !== 'working' && (
                    <div className={`text-xs mt-3 ${r.status === 'failed' ? 'text-red-200' : 'text-white/70'}`} role="status">
                      <p className="font-bold">
                        {r.status === 'skipped' ? 'Skipped.' : r.status === 'failed' ? 'Failed.' : r.report?.published || r.scan?.published || r.piece?.published ? 'Published.' : 'Saved as draft.'}
                        {r.detail ? ` ${r.detail}` : ''}
                      </p>
                      {r.files.length > 0 && <p className="mt-1">{r.files.map((f) => `${f.label}: ${f.status}${f.detail ? ` (${f.detail})` : ''}`).join(' · ')}</p>}
                      {r.warnings.map((w) => <p key={w} className="mt-1 text-brand-gold-pale">{w}</p>)}
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {r.report && <Link className="underline underline-offset-4" href={`/admin/reports/${r.report.id}`}>Edit study</Link>}
                        {r.scan && <Link className="underline underline-offset-4" href={`/admin/scans/${r.scan.id}`}>Edit scan</Link>}
                        {r.piece && <Link className="underline underline-offset-4" href={`/admin/pieces/${r.piece.id}`}>Edit piece</Link>}
                        {r.report?.published && <a className="underline underline-offset-4" href={`/research/studies/${r.report.slug}`} target="_blank" rel="noopener">View study</a>}
                        {r.scan?.published && <a className="underline underline-offset-4" href={`/research/weekly-scan/${r.scan.slug}`} target="_blank" rel="noopener">View scan</a>}
                        {r.piece && (r.piece.published
                          ? <a className="underline underline-offset-4" href={`/research/professional-curiosity/${r.piece.slug}`} target="_blank" rel="noopener">View piece</a>
                          : <a className="underline underline-offset-4" href={`/admin/pieces/${r.piece.id}/preview`} target="_blank" rel="noopener">Preview piece</a>)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {finished && (
            <p className={`text-sm p-3 rounded-lg ${problems.length ? 'bg-red-900/20 border border-red-500/30 text-red-100' : 'tile-ivory'}`} role="status">
              {problems.length
                ? `${problems.length} of ${m.entries.length} territories need attention. Run the import again to retry; files already copied are not copied twice.`
                : run.mode === 'publish' ? `Week ${m.weekLabel ?? ''} is published: ${m.entries.length} ${m.entries.length === 1 ? 'entry' : 'entries'}.`
                : done.every((r) => r.report?.published || r.scan?.published || r.piece?.published) ? `Week ${m.weekLabel ?? ''} is updated. The entries were already live and stay live.`
                : `Week ${m.weekLabel ?? ''} is saved as drafts. Review, then publish from here or from each entry.`}
            </p>
          )}

          {anyLive && (
            <label className="flex items-start gap-3 text-sm text-white/75">
              <input type="checkbox" checked={overwrite} onChange={(ev) => setOverwrite(ev.target.checked)} className="mt-1 accent-[#c8a86a]" disabled={run.busy} />
              <span>Replace published entries<span className="block text-[0.7rem] text-white/40">Live entries are skipped unless this is ticked. Ticking it replaces their text with the manifest’s.</span></span>
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" className={btnGhost} disabled={run.busy} onClick={() => start(false)}>{run.busy && run.mode === 'draft' ? 'Importing…' : 'Import as drafts'}</button>
            {confirmPublish ? (
              <>
                <button type="button" className={btn} disabled={run.busy} onClick={() => start(true)}>Confirm: publish {m.entries.length} {m.entries.length === 1 ? 'entry' : 'entries'}</button>
                <button type="button" className="text-sm text-white/50 hover:text-white" onClick={() => setConfirmPublish(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className={btn} disabled={run.busy} onClick={() => setConfirmPublish(true)}>{run.busy && run.mode === 'publish' ? 'Publishing…' : 'Import and publish'}</button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default function WeeklyImport({ screen }: { screen: ImportScreen }) {
  const router = useRouter();
  const [json, setJson] = useState('');
  const [pasted, setPasted] = useState<ManifestSummary | null>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try { setPasted(await checkPastedManifest(json)); } finally { setChecking(false); }
  };

  // A manifest is finished when every scan, study and piece it names is live; those are folded away below.
  const live = (s: string) => s === 'published' || s === 'none';
  const isImported = (m: ManifestSummary) => m.errors.length === 0 && m.entries.length > 0 && m.entries.every((e) => live(e.scanState) && live(e.reportState) && live(e.pieceState));
  const pending = screen.manifests.filter((m) => !isImported(m));
  const imported = screen.manifests.filter(isImported);

  return (
    <div className="space-y-8">
      <section className="tile p-6">
        <h2 className="text-xl mb-2">Dropbox</h2>
        {!screen.configured ? (
          <p className="text-sm text-white/70">Dropbox is not set up on this deployment. Add <code>DROPBOX_APP_KEY</code> and <code>DROPBOX_APP_SECRET</code> in Vercel, redeploy, then return here to connect.</p>
        ) : screen.connection.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              Connected{screen.connection.account ? ` as ${screen.connection.account}` : ''}. Read-only.
              <span className="block text-[0.7rem] text-white/40 mt-1">Manifests are read from {screen.folder}</span>
            </p>
            <button type="button" className="text-sm text-white/50 hover:text-white" onClick={async () => { await disconnectDropbox(); router.refresh(); }}>Disconnect</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/70">Connect once so the site can read the weekly packs. The site only ever reads from Dropbox.</p>
            <a href="/api/dropbox/connect" className={btn}>Connect Dropbox</a>
          </div>
        )}
      </section>

      {screen.error && <p className="text-sm text-red-200 bg-red-900/20 border border-red-500/30 rounded-lg p-4" role="alert">{screen.error}</p>}

      {screen.connection.connected && !screen.error && screen.manifests.length > 0 && pending.length === 0 && (
        <p className="text-white/60 text-sm">Nothing is waiting. Every manifest in the publishing folder has been imported.</p>
      )}

      {screen.connection.connected && !screen.error && screen.manifests.length === 0 && (
        <p className="text-white/60 text-sm">No manifest yet. When a week is ready, its <code>manifest.json</code> appears in a dated folder inside the publishing folder and shows up here.</p>
      )}

      {pending.map((m) => <ManifestCard key={m.source} m={m} />)}

      {imported.length > 0 && (
        <details className="tile p-6">
          <summary className="cursor-pointer text-white font-bold">Already imported ({imported.length})</summary>
          <p className="text-sm text-white/60 mt-3 mb-5">Every entry in these manifests is live. Open one to import it again, for example after a file is replaced in Dropbox.</p>
          <div className="space-y-6">{imported.map((m) => <ManifestCard key={m.source} m={m} />)}</div>
        </details>
      )}

      <details className="tile p-6">
        <summary className="cursor-pointer text-white font-bold">Paste a manifest instead</summary>
        <p className="text-sm text-white/60 mt-3 mb-3">For a manifest that is not in the publishing folder. Files are still copied from Dropbox, so Dropbox must be connected.</p>
        <textarea value={json} onChange={(e) => { setJson(e.target.value); setPasted(null); }} rows={8} className={`${input} font-mono text-xs resize-y`} placeholder='{ "version": 1, "week_label": "2026-W41", "entries": [ … ] }' aria-label="Manifest JSON" />
        <div className="mt-3"><button type="button" className={btnGhost} disabled={!json.trim() || checking} onClick={check}>{checking ? 'Checking…' : 'Check manifest'}</button></div>
        {pasted && <div className="mt-5"><ManifestCard m={pasted} pasted={json} /></div>}
      </details>
    </div>
  );
}
