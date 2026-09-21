import { savePartner, deletePartner } from '@/lib/admin/actions';
import { input, label, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import UploadField from '@/components/admin/UploadField';
import { publicMediaUrl, TERRITORIES, type PartnerRow } from '@/lib/data';

export default function PartnerForm({ partner }: { partner?: PartnerRow }) {
  return (
    <form action={savePartner} className="space-y-8">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="name" title="Name"><input id="name" name="name" required defaultValue={partner?.name} className={input} /></Field>
        <Field id="slug" title="URL slug" hint="Leave blank to generate from the name."><input id="slug" name="slug" defaultValue={partner?.slug} className={input} /></Field>
        <Field id="title" title="Title (cards)" hint="e.g. Co-Founder & Managing Partner"><input id="title" name="title" defaultValue={partner?.title} className={input} /></Field>
        <Field id="short_title" title="Short title (map, footer, contact)" hint="e.g. Managing Partner"><input id="short_title" name="short_title" defaultValue={partner?.short_title ?? ''} className={input} /></Field>
        <Field id="location" title="Location (cards)" hint="e.g. Based in North Carolina, USA"><input id="location" name="location" defaultValue={partner?.location ?? ''} className={input} /></Field>
        <Field id="location_short" title="Location, short (map, footer)" hint="e.g. North Carolina"><input id="location_short" name="location_short" defaultValue={partner?.location_short ?? ''} className={input} /></Field>
        <Field id="email" title="Email"><input id="email" name="email" type="email" defaultValue={partner?.email ?? ''} className={input} /></Field>
        <Field id="linkedin" title="LinkedIn URL"><input id="linkedin" name="linkedin" defaultValue={partner?.linkedin ?? ''} className={input} /></Field>
        <Field id="phone" title="Phone (shown in footer and contact)"><input id="phone" name="phone" defaultValue={partner?.phone ?? ''} className={input} placeholder="+971 52 706 8408" /></Field>
        <Field id="phone_label" title="Phone label"><input id="phone_label" name="phone_label" defaultValue={partner?.phone_label ?? ''} className={input} placeholder="UAE" /></Field>
        <div className="md:col-span-2"><Field id="qualification" title="Qualifications line"><input id="qualification" name="qualification" defaultValue={partner?.qualification ?? ''} className={input} /></Field></div>
        <div className="md:col-span-2"><Field id="emphasis" title="One-line emphasis (under the card)"><input id="emphasis" name="emphasis" defaultValue={partner?.emphasis ?? ''} className={input} /></Field></div>
      </div>

      <UploadField name="portrait_path" kind="image" folder="portraits" defaultPath={partner?.portrait_path} previewUrl={publicMediaUrl(partner?.portrait_path)} label="Portrait (portrait orientation, at least 800×1000)" />

      <div>
        <p className={label}>Profile (three paragraphs, About page)</p>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tile p-4 space-y-2">
              <input name={`section_title_${i}`} placeholder="Heading" defaultValue={partner?.sections?.[i]?.title ?? ''} className={input} />
              <textarea name={`section_body_${i}`} placeholder="Paragraph" rows={3} defaultValue={partner?.sections?.[i]?.body ?? ''} className={`${input} resize-y`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={label}>Territories covered (map labels)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 tile p-4">
          {TERRITORIES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" name="territories" value={t.value} defaultChecked={partner?.territories?.includes(t.value)} className="accent-[#c8a86a]" /> {t.label}</label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field id="sort_order" title="Order"><input id="sort_order" name="sort_order" type="number" defaultValue={partner?.sort_order ?? 0} className={input} /></Field>
        <div className="md:col-span-2 tile p-5 space-y-3">
          <Check name="founder" title="Founding partner" defaultChecked={partner?.founder} hint="Founders appear on the Home page; all active partners appear on About." />
          <Check name="active" title="Shown on the site" defaultChecked={partner ? partner.active : true} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save partner</button>
        <a href="/admin/partners" className={btnGhost}>Cancel</a>
      </div>
      {partner && <div className="pt-6 border-t border-brand-gold/15"><button formAction={deletePartner} className="text-sm text-red-300 hover:text-red-200">Delete this partner</button></div>}
    </form>
  );
}
