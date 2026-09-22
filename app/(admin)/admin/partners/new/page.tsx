import PartnerForm from '@/components/admin/PartnerForm';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function NewPartner() { return (<><PageHead title="Add partner" /><PartnerForm /></>); }
