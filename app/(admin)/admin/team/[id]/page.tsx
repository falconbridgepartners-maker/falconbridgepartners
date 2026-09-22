import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import TeamForm from '@/components/admin/TeamForm';
import { PageHead } from '@/components/admin/ui';
import type { TeamMember } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditTeamMember({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('team_members').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const member = data as TeamMember;
  return (<><PageHead title="Edit team member" sub={member.name} /><TeamForm member={member} /></>);
}
