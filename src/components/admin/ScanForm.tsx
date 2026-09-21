import { saveScan, deleteScan } from '@/lib/admin/actions';
import { input, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import { SERVICES, TERRITORIES, type Scan } from '@/lib/data';

export default function ScanForm({ scan }: { scan?: Scan }) {
  return (
    <form action={saveScan} className="space-y-8">
      {scan && <input type="hidden" name="id" value={scan.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="title" title="Title (internal; becomes the URL)"><input id="title" name="title" required defaultValue={scan?.title} className={input} /></Field>
        <Field id="slug" title="URL slug" hint="Leave blank to generate from the title."><input id="slug" name="slug" defaultValue={scan?.slug} className={input} /></Field>
        <Field id="territory" title="Territory">
          <select id="territory" name="territory" defaultValue={scan?.territory ?? 'uae-gcc'} className={`${input} bg-brand-navy`}>{TERRITORIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </Field>
        <Field id="service" title="Closest service">
          <select id="service" name="service" defaultValue={scan?.service ?? 'none'} className={`${input} bg-brand-navy`}>{SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
        </Field>
        <Field id="week_of" title="Week of"><input id="week_of" name="week_of" type="date" required defaultValue={scan?.week_of ?? new Date().toISOString().slice(0, 10)} className={input} /></Field>
      </div>
      <div className="space-y-5">
        <Field id="signal" title="The signal" hint="What the weekly scan identified. Firm voice: “Our research finds…”"><textarea id="signal" name="signal" required rows={3} defaultValue={scan?.signal} className={`${input} resize-none`} /></Field>
        <Field id="question" title="The question it raises" hint="A decision-relevant question a leader in this territory would recognise."><textarea id="question" name="question" required rows={2} defaultValue={scan?.question} className={`${input} resize-none`} /></Field>
        <Field id="finding" title="What the evidence establishes" hint="Findings only — sources, dates and scope. No interpretation here."><textarea id="finding" name="finding" rows={6} defaultValue={scan?.finding ?? ''} className={`${input} resize-y`} /></Field>
        <Field id="interpretation" title="FBP’s interpretation" hint="Kept visibly separate from the finding."><textarea id="interpretation" name="interpretation" rows={5} defaultValue={scan?.interpretation ?? ''} className={`${input} resize-y`} /></Field>
        <Field id="open_questions" title="What remains open" hint="One question per line."><textarea id="open_questions" name="open_questions" rows={4} defaultValue={(scan?.open_questions ?? []).join('\n')} className={`${input} resize-y`} /></Field>
      </div>
      <div className="tile p-5 space-y-3">
        <Check name="reviewed" title="Reviewed by a partner" defaultChecked={scan?.reviewed} hint="Required before publishing. Internal — never shown on the site." />
        <Check name="published" title="Published" defaultChecked={scan?.published} />
        <Check name="sample" title="Sample entry (prototype placeholder)" defaultChecked={scan?.sample} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save scan</button>
        <a href="/admin/scans" className={btnGhost}>Cancel</a>
      </div>
      {scan && <div className="pt-6 border-t border-brand-gold/15"><button formAction={deleteScan} className="text-sm text-red-300 hover:text-red-200">Delete this entry</button></div>}
    </form>
  );
}
