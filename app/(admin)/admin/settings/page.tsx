import { createAdminClient } from '@/lib/supabase/admin';
import { getSiteSettings, publicMediaUrl, type Report } from '@/lib/data';
import { saveSettings } from '@/lib/admin/actions';
import { PageHead, Notice, Field, input, btn } from '@/components/admin/ui';
import UploadField from '@/components/admin/UploadField';

export default async function SettingsPage({ searchParams }: { searchParams?: { saved?: string } }) {
  const db = createAdminClient();
  const [settings, { data: reports }] = await Promise.all([getSiteSettings(), db.from('reports').select('id, title, published').order('title')]);
  const list = (reports ?? []) as Pick<Report, 'id' | 'title' | 'published'>[];
  return (
    <>
      <PageHead title="Site settings" sub="What the home page features, and the partner portraits." />
      <Notice q={searchParams} />
      <form action={saveSettings} className="space-y-8">
        <Field id="featured_report_id" title="Featured report (Home and Research)">
          <select id="featured_report_id" name="featured_report_id" defaultValue={settings.featured_report_id ?? ''} className={`${input} bg-brand-navy`}>
            <option value="">Most recent published report</option>
            {list.map((r) => <option key={r.id} value={r.id}>{r.title}{r.published ? '' : ' (draft)'}</option>)}
          </select>
        </Field>
        <div>
          <p className="text-xs font-bold text-white/70 mb-2">Partner portraits</p>
          <p className="text-[0.7rem] text-white/40 mb-3">Portrait orientation, at least 800×1000 px. Leave empty to keep the built-in portrait.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['quincy', 'joel', 'wayne'] as const).map((k) => (
              <UploadField key={k} name={`portrait_${k}`} kind="image" folder="portraits" defaultPath={settings.portraits[k]} previewUrl={publicMediaUrl(settings.portraits[k])} label={k[0].toUpperCase() + k.slice(1)} />
            ))}
          </div>
        </div>
        <button type="submit" className={btn}>Save settings</button>
      </form>
    </>
  );
}
