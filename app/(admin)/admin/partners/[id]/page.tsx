import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import PartnerForm from '@/components/admin/PartnerForm';
import { PageHead } from '@/components/admin/ui';
import type { PartnerRow } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditPartner({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('partners').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const partner = data as PartnerRow;
  return (<><PageHead title="Edit partner" sub={partner.name} /><PartnerForm partner={partner} /></>);
}
