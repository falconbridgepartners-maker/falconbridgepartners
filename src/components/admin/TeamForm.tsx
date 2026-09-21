import { saveTeamMember, deleteTeamMember } from '@/lib/admin/actions';
import { input, btn, btnGhost, Field, Check } from '@/components/admin/ui';
import UploadField from '@/components/admin/UploadField';
import { publicMediaUrl, type TeamMember } from '@/lib/data';

export default function TeamForm({ member }: { member?: TeamMember }) {
  return (
    <form action={saveTeamMember} className="space-y-8">
      {member && <input type="hidden" name="id" value={member.id} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="name" title="Name"><input id="name" name="name" required defaultValue={member?.name} className={input} /></Field>
        <Field id="role" title="Role" hint="e.g. Fractional PRO"><input id="role" name="role" required defaultValue={member?.role} className={input} /></Field>
        <Field id="location" title="Location"><input id="location" name="location" defaultValue={member?.location ?? ''} className={input} /></Field>
        <Field id="email" title="Email (optional)"><input id="email" name="email" type="email" defaultValue={member?.email ?? ''} className={input} /></Field>
        <Field id="linkedin" title="LinkedIn URL (optional)"><input id="linkedin" name="linkedin" defaultValue={member?.linkedin ?? ''} className={input} /></Field>
        <Field id="sort_order" title="Order"><input id="sort_order" name="sort_order" type="number" defaultValue={member?.sort_order ?? 0} className={input} /></Field>
        <div className="md:col-span-2"><Field id="bio" title="Short bio (one paragraph)"><textarea id="bio" name="bio" rows={4} defaultValue={member?.bio ?? ''} className={`${input} resize-y`} /></Field></div>
      </div>
      <UploadField name="portrait_path" kind="image" folder="team" defaultPath={member?.portrait_path} previewUrl={publicMediaUrl(member?.portrait_path)} label="Portrait (portrait orientation)" />
      <div className="tile p-5"><Check name="active" title="Shown on the site" defaultChecked={member ? member.active : true} /></div>
      <div className="flex items-center gap-3">
        <button type="submit" className={btn}>Save team member</button>
        <a href="/admin/team" className={btnGhost}>Cancel</a>
      </div>
      {member && <div className="pt-6 border-t border-brand-gold/15"><button formAction={deleteTeamMember} className="text-sm text-red-300 hover:text-red-200">Remove this team member</button></div>}
    </form>
  );
}
