import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ScanForm from '@/components/admin/ScanForm';
import { PageHead } from '@/components/admin/ui';
import type { Scan } from '@/lib/data';

export default async function EditScan({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('scans').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const scan = data as Scan;
  return (<><PageHead title="Edit scan entry" sub={scan.title} /><ScanForm scan={scan} /></>);
}
