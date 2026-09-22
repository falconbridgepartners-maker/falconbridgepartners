import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import ReportForm from '@/components/admin/ReportForm';
import { PageHead } from '@/components/admin/ui';
import type { Report } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditReport({ params }: { params: { id: string } }) {
  const db = createAdminClient();
  const { data } = await db.from('reports').select('*, files:report_files(*)').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const report = data as Report;
  return (<><PageHead title="Edit report" sub={report.title} /><ReportForm report={report} /></>);
}
