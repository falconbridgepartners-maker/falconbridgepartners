import Link from 'next/link';
import { BookOpen, Radar, Settings } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminUser } from '@/lib/admin/auth';
import { PageHead } from '@/components/admin/ui';

export default async function Dashboard() {
  const admin = await getAdminUser();
  const db = createAdminClient();
  const [{ count: published }, { count: drafts }, { count: scans }, { count: scanDrafts }, { data: featured }] = await Promise.all([
    db.from('reports').select('*', { count: 'exact', head: true }).eq('published', true),
    db.from('reports').select('*', { count: 'exact', head: true }).eq('published', false),
    db.from('scans').select('*', { count: 'exact', head: true }).eq('published', true),
    db.from('scans').select('*', { count: 'exact', head: true }).eq('published', false),
    db.from('site_settings').select('featured:reports(title)').eq('id', 1).maybeSingle(),
  ]);
  const featuredTitle = (featured as unknown as { featured: { title: string } | null } | null)?.featured?.title;
  const stat = (n: number | null, l: string) => (
    <div className="tile p-6"><p className="label-tech mb-2">{l}</p><p className="governing text-4xl">{n ?? 0}</p></div>
  );
  return (
    <>
      <PageHead title={`Welcome back${admin?.display_name ? `, ${admin.display_name}` : ''}`} sub="Manage reports, weekly scans and site settings." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stat(published, 'Published reports')}{stat(drafts, 'Draft reports')}{stat(scans, 'Published scans')}{stat(scanDrafts, 'Draft scans')}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/reports', icon: BookOpen, title: 'Manage reports', body: 'Add, edit or remove studies, samples and papers; upload covers and package files.' },
          { href: '/admin/scans', icon: Radar, title: 'Manage Weekly Scan', body: 'Write and publish scan entries by territory.' },
          { href: '/admin/settings', icon: Settings, title: 'Site settings', body: `Featured report${featuredTitle ? `: ${featuredTitle}` : ''}; partner portraits.` },
        ].map(({ href, icon: Icon, title, body }) => (
          <Link key={href} href={href} className="tile p-6 hover:border-brand-gold/60 transition-colors">
            <Icon className="w-5 h-5 text-brand-gold mb-3" />
            <p className="text-white font-bold mb-1">{title}</p>
            <p className="text-white/55 text-sm">{body}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
