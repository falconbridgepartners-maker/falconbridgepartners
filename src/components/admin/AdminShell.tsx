import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, BookOpen, Radar, Settings, Globe, LogOut } from 'lucide-react';
import logo from '@/assets/logos/logo.png';
import type { AdminUser } from '@/lib/admin/auth';
import { signOut } from '@/lib/admin/actions';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reports', label: 'Reports', icon: BookOpen },
  { href: '/admin/scans', label: 'Weekly Scan', icon: Radar },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
];

export default function AdminShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-navy grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
      <aside className="bg-brand-navy-dark border-r border-brand-gold/15 flex flex-col">
        <div className="p-6 border-b border-brand-gold/15">
          <Image src={logo} alt="FalconBridge Partners" className="h-10 w-auto" />
          <p className="label-tech mt-3">Research admin</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <Icon className="w-4 h-4 text-brand-gold" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-brand-gold/15 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5"><Globe className="w-4 h-4" /> View site</Link>
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4" /> Sign out</button>
          </form>
          <p className="px-3 pt-2 text-[0.7rem] text-white/35 truncate">{admin.email}</p>
        </div>
      </aside>
      <main className="p-6 md:p-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}
