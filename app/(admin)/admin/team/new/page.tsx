import TeamForm from '@/components/admin/TeamForm';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function NewTeamMember() { return (<><PageHead title="Add team member" /><TeamForm /></>); }
