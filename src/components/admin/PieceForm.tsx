import { savePiece, deletePiece } from '@/lib/admin/actions';
import { input, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import { TERRITORIES, type Piece } from '@/lib/data';
import { PIECE_FORMAT } from '@/lib/pieces';

const EMPTY = JSON.stringify({ format: PIECE_FORMAT, headline: '', headline_accent: '', blocks: [{ type: 'paragraph', text: '' }], disclaimer: '' }, null, 2);

export default function PieceForm({ piece, reports = [] }: { piece?: Piece; reports?: { id: string; title: string; week_label?: string | null }[] }) {
  return (
    <form action={savePiece} className="space-y-8">
      {piece && <input type="hidden" name="id" value={piece.id} />}
      <p className="tile-ivory p-4 text-sm">
        A piece is shown exactly as issued. The usual route is the import screen: the piece arrives in a manifest and nothing is retyped. Use this form to link the study, set the dates, review and publish, or to correct the piece itself.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="slug" title="URL slug" hint="The piece’s address: /research/professional-curiosity/<slug>. Leave blank to generate from the headline. Do not change it once the link has been shared."><input id="slug" name="slug" defaultValue={piece?.slug} className={input} /></Field>
        <Field id="territory" title="Territory">
          <select id="territory" name="territory" defaultValue={piece?.territory ?? 'global'} className={`${input} bg-brand-navy`}>{TERRITORIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </Field>
        <Field id="published_at" title="Date" hint="The byline shows its month and year."><input id="published_at" name="published_at" type="date" defaultValue={piece?.published_at ?? new Date().toISOString().slice(0, 10)} className={input} /></Field>
        <Field id="evidence_date" title="Evidence date" hint="Shown in the byline: “Own-account research, evidence date …”."><input id="evidence_date" name="evidence_date" type="date" defaultValue={piece?.evidence_date ?? ''} className={input} /></Field>
        <div className="md:col-span-2">
          <Field id="report_id" title="The study behind this piece" hint="The piece links to the study and its “Request the full study” button opens the study’s request form. The study page links back.">
            <select id="report_id" name="report_id" defaultValue={piece?.report_id ?? ''} className={`${input} bg-brand-navy`}>
              <option value="">No study</option>
              {reports.map((r) => <option key={r.id} value={r.id}>{r.week_label ? `${r.week_label} · ` : ''}{r.title}</option>)}
            </select>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field id="description" title="Link-preview description" hint="One or two sentences shown under the headline when the link is shared, and on the index. Leave blank to use the piece’s opening lines."><textarea id="description" name="description" rows={2} defaultValue={piece?.description ?? ''} className={`${input} resize-y`} /></Field>
        </div>
      </div>
      <Field id="content" title="The piece, as issued" hint="Headline, blocks (paragraph, heading, stats, callouts, questions, list, quote) and disclaimer. The format is described in docs/WEEKLY_PIPELINE.md. It is checked when you save.">
        <textarea id="content" name="content" required rows={22} spellCheck={false} defaultValue={piece ? JSON.stringify(piece.content, null, 2) : EMPTY} className={`${input} font-mono text-xs resize-y`} />
      </Field>
      <div className="tile p-5 space-y-3">
        <Check name="reviewed" title="Reviewed by a partner" defaultChecked={piece?.reviewed} hint="Required before publishing. Internal — never shown on the site." />
        <Check name="published" title="Published" defaultChecked={piece?.published} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save piece</button>
        <a href="/admin/pieces" className={btnGhost}>Cancel</a>
      </div>
      {piece && <div className="pt-6 border-t border-brand-gold/15"><button formAction={deletePiece} className="text-sm text-red-300 hover:text-red-200">Delete this piece</button></div>}
    </form>
  );
}
