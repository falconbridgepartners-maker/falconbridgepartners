import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin/auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Gate for everything under /admin except /admin/login (which lives in the (auth) group). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
