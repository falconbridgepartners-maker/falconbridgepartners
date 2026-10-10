import { saveTeamMember, deleteTeamMember } from '@/lib/admin/actions';
import { input, label, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import UploadField from '@/components/admin/UploadField';
import { publicMediaUrl, territoryOptions, type TeamMember } from '@/lib/data';

/** The same fields as the partner form, field for field; only the founder flag is left out. */
export default function TeamForm({ member }: { member?: TeamMember }) {
  return (
    <form action={saveTeamMember} className="space-y-8">
      {member && <input type="hidden" name="id" value={member.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="name" title="Name"><input id="name" name="name" required defaultValue={member?.name} className={input} /></Field>
        <Field id="slug" title="URL slug" hint="Leave blank to generate from the name."><input id="slug" name="slug" defaultValue={member?.slug} className={input} /></Field>
        <Field id="title" title="Title (cards)" hint="e.g. Fractional PRO"><input id="title" name="title" defaultValue={member?.title ?? member?.role ?? ''} className={input} /></Field>
        <Field id="short_title" title="Short title (map, footer, contact)" hint="e.g. PRO"><input id="short_title" name="short_title" defaultValue={member?.short_title ?? ''} className={input} /></Field>
        <Field id="location" title="Location (cards)" hint="e.g. Based in Dubai, UAE"><input id="location" name="location" defaultValue={member?.location ?? ''} className={input} /></Field>
        <Field id="location_short" title="Location, short (map, footer)" hint="e.g. UAE"><input id="location_short" name="location_short" defaultValue={member?.location_short ?? ''} className={input} /></Field>
        <Field id="email" title="Email"><input id="email" name="email" type="email" defaultValue={member?.email ?? ''} className={input} /></Field>
        <Field id="linkedin" title="LinkedIn URL"><input id="linkedin" name="linkedin" defaultValue={member?.linkedin ?? ''} className={input} /></Field>
        <Field id="phone" title="Phone (shown in footer and contact)"><input id="phone" name="phone" defaultValue={member?.phone ?? ''} className={input} placeholder="+971 52 706 8408" /></Field>
        <Field id="phone_label" title="Phone label"><input id="phone_label" name="phone_label" defaultValue={member?.phone_label ?? ''} className={input} placeholder="UAE" /></Field>
        <div className="md:col-span-2"><Field id="qualification" title="Qualifications line"><input id="qualification" name="qualification" defaultValue={member?.qualification ?? ''} className={input} /></Field></div>
        <div className="md:col-span-2"><Field id="emphasis" title="One-line emphasis (under the card)"><input id="emphasis" name="emphasis" defaultValue={member?.emphasis ?? member?.bio ?? ''} className={input} /></Field></div>
      </div>

      <UploadField name="portrait_path" kind="image" folder="team" defaultPath={member?.portrait_path} previewUrl={publicMediaUrl(member?.portrait_path)} label="Portrait (portrait orientation, at least 800×1000)" />

      <div>
        <p className={label}>Profile (three paragraphs, About page)</p>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tile p-4 space-y-2">
              <input name={`section_title_${i}`} placeholder="Heading" defaultValue={member?.sections?.[i]?.title ?? ''} className={input} />
              <textarea name={`section_body_${i}`} placeholder="Paragraph" rows={3} defaultValue={member?.sections?.[i]?.body ?? ''} className={`${input} resize-y`} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={label}>Territories covered (map labels)</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 tile p-4">
          {territoryOptions(...(member?.territories ?? [])).map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm text-white/80"><input type="checkbox" name="territories" value={t.value} defaultChecked={member?.territories?.includes(t.value)} className="accent-[#c8a86a]" /> {t.label}</label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field id="sort_order" title="Order"><input id="sort_order" name="sort_order" type="number" defaultValue={member?.sort_order ?? 0} className={input} /></Field>
        <div className="md:col-span-2 tile p-5"><Check name="active" title="Shown on the site" defaultChecked={member ? member.active : true} /></div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save team member</button>
        <a href="/admin/team" className={btnGhost}>Cancel</a>
      </div>
      {member && <div className="pt-6 border-t border-brand-gold/15"><button formAction={deleteTeamMember} className="text-sm text-red-300 hover:text-red-200">Remove this team member</button></div>}
    </form>
  );
}
