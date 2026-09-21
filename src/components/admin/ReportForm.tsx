import { saveReport, deleteReport } from '@/lib/admin/actions';
import { input, label, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import UploadField from '@/components/admin/UploadField';
import { publicMediaUrl, REPORT_KINDS, TERRITORIES, type Report, type ReportFile } from '@/lib/data';

const LABELS = ['User guide', 'Executive deck', 'Full research report', 'Executive summary', 'Executive visual', 'Reference and link audit'];

export default function ReportForm({ report }: { report?: Report }) {
  const files: (ReportFile | undefined)[] = LABELS.map((_, i) => (report?.files ?? []).find((f) => f.sort_order === i + 1));
  return (
    <form action={saveReport} className="space-y-8">
      {report && <input type="hidden" name="id" value={report.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="title" title="Title"><input id="title" name="title" required defaultValue={report?.title} className={input} /></Field>
        <Field id="slug" title="URL slug" hint="Leave blank to generate from the title."><input id="slug" name="slug" defaultValue={report?.slug} className={input} /></Field>
        <div className="md:col-span-2"><Field id="subtitle" title="Subtitle"><input id="subtitle" name="subtitle" defaultValue={report?.subtitle ?? ''} className={input} /></Field></div>
        <Field id="kind" title="Type">
          <select id="kind" name="kind" defaultValue={report?.kind ?? 'study'} className={`${input} bg-brand-navy`}>{REPORT_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}</select>
        </Field>
        <Field id="territory" title="Territory">
          <select id="territory" name="territory" defaultValue={report?.territory ?? 'south-africa'} className={`${input} bg-brand-navy`}>{TERRITORIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </Field>
        <Field id="year" title="Year"><input id="year" name="year" type="number" defaultValue={report?.year ?? ''} className={input} /></Field>
        <Field id="published_at" title="Published on"><input id="published_at" name="published_at" type="date" defaultValue={report?.published_at ?? ''} className={input} /></Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <UploadField name="cover_path" kind="image" folder="covers" defaultPath={report?.cover_path} previewUrl={publicMediaUrl(report?.cover_path)} label="Cover image (3:4)" />
        <UploadField name="extract_path" kind="image" folder="extracts" defaultPath={report?.extract_path} previewUrl={publicMediaUrl(report?.extract_path)} label="Report extract image (4:3)" />
      </div>

      <div>
        <p className={label}>Key facts (three tiles)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tile p-4 space-y-2">
              <input name={`fact_figure_${i}`} placeholder="Figure, e.g. 196 pages" defaultValue={report?.facts?.[i]?.figure ?? ''} className={input} />
              <textarea name={`fact_body_${i}`} placeholder="What it means" rows={3} defaultValue={report?.facts?.[i]?.body ?? ''} className={`${input} resize-none`} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <Field id="extract_note" title="Extract note"><textarea id="extract_note" name="extract_note" rows={2} defaultValue={report?.extract_note ?? ''} className={`${input} resize-none`} /></Field>
        <Field id="body" title="About the study"><textarea id="body" name="body" rows={6} defaultValue={report?.body ?? ''} className={`${input} resize-y`} /></Field>
        <Field id="qualifier" title="Qualifier" hint="What this sample does and does not demonstrate."><textarea id="qualifier" name="qualifier" rows={3} defaultValue={report?.qualifier ?? ''} className={`${input} resize-none`} /></Field>
      </div>

      <div>
        <p className={label}>Package files</p>
        <p className="text-[0.7rem] text-white/40 mb-3">Upload each element. “Open download” serves it to any reader; “On request” keeps it behind the request form.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LABELS.map((l, i) => {
            const f = files[i];
            return (
              <div key={l} className="space-y-2">
                <input type="hidden" name={`file_id_${i}`} value={f?.id ?? ''} />
                <input name={`file_label_${i}`} defaultValue={f?.label ?? l} className={input} />
                <UploadField name={`file_path_${i}`} sizeName={`file_size_${i}`} kind="file" folder="reports" defaultPath={f?.storage_path} label={`${l} — file`} />
                <select name={`file_access_${i}`} defaultValue={f?.access ?? 'request'} className={`${input} bg-brand-navy`}>
                  <option value="request">On request</option>
                  <option value="open">Open download</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tile p-5 space-y-3">
        <Check name="published" title="Published" defaultChecked={report?.published} hint="Unpublished reports are hidden from the library, the sitemap and the study page." />
        <Check name="featured" title="Featured on Home and Research" defaultChecked={report?.featured} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save report</button>
        <a href="/admin/reports" className={btnGhost}>Cancel</a>
      </div>
      {report && (
        <div className="pt-6 border-t border-brand-gold/15">
          <button formAction={deleteReport} className="text-sm text-red-300 hover:text-red-200" onClick={undefined}>Delete this report</button>
        </div>
      )}
    </form>
  );
}
