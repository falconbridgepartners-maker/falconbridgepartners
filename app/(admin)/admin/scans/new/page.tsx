import ScanForm from '@/components/admin/ScanForm';
import { PageHead } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default function NewScan() { return (<><PageHead title="New scan entry" /><ScanForm /></>); }
