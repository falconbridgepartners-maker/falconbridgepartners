import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ScanForm from '@/components/admin/ScanForm';
import { PageHead } from '@/components/admin/ui';
import type { Scan } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditScan({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('scans').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const scan = data as Scan;
  const { data: reports } = await db.from('reports').select('id, title, week_label').order('updated_at', { ascending: false }).limit(300);
  return (<><PageHead title="Edit scan entry" sub={scan.title} /><ScanForm scan={scan} reports={reports ?? []} /></>);
}
