import ReportForm from '@/components/admin/ReportForm';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function NewReport() { return (<><PageHead title="Add report" /><ReportForm /></>); }
