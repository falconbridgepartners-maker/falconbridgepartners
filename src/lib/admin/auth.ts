import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type AdminUser = { email: string; display_name: string | null };

/** Returns the signed-in admin, or null. Validates the JWT, then checks an active admin_users row (service role, RLS-blind). */
/** Preview-only bypass for review: ADMIN_PREVIEW_BYPASS=true on a non-production Vercel deployment. Never honoured in production. */
function previewBypass(): AdminUser | null {
  const on = process.env.ADMIN_PREVIEW_BYPASS === 'true';
  const notProduction = process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production' ? true : process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';
  return on && notProduction ? { email: 'preview@falconbp.com', display_name: 'Preview reviewer' } : null;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const bypass = previewBypass();
  if (bypass) return bypass;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;
    const admin = createAdminClient();
    const { data } = await admin
      .from('admin_users')
      .select('email, display_name, active')
      .eq('email', user.email.toLowerCase())
      .eq('active', true)
      .maybeSingle();
    return data ? { email: data.email, display_name: data.display_name } : null;
  } catch {
    return null;
  }
}

/** For the admin layout and every server action. Redirects non-admins. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect('/admin/login');
  return admin;
}
