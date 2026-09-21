'use client';
import { usePathname } from 'next/navigation';

/** Hides the public site's navigation and footer on admin and auth screens. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) return null;
  return <>{children}</>;
}
