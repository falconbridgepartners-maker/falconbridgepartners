import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type AdminUser = { email: string; display_name: string | null };
export type AdminCheck = { admin: AdminUser | null; reason: 'ok' | 'bypass' | 'no-session' | 'not-admin' | 'error'; detail?: string; email?: string };

/** Preview-only bypass for review: ADMIN_PREVIEW_BYPASS=true on a non-production Vercel deployment. Never honoured in production. */
function previewBypass(): AdminUser | null {
  const on = process.env.ADMIN_PREVIEW_BYPASS === 'true';
  const notProduction = process.env.VERCEL_ENV !== 'production' && process.env.NODE_ENV !== 'production' ? true : process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';
  return on && notProduction ? { email: 'preview@falconbp.com', display_name: 'Preview reviewer' } : null;
}

/** Full check with a reason, for the login page's diagnostics. */
export async function checkAdmin(): Promise<AdminCheck> {
  const bypass = previewBypass();
  if (bypass) return { admin: bypass, reason: 'bypass' };
  let email: string | undefined;
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user?.email) return { admin: null, reason: 'no-session', detail: error?.message };
    email = user.email.toLowerCase();
    const admin = createAdminClient();
    const { data, error: qErr } = await admin.from('admin_users').select('email, display_name, active').eq('email', email).eq('active', true).maybeSingle();
    if (qErr) return { admin: null, reason: 'error', detail: qErr.message, email };
    if (!data) return { admin: null, reason: 'not-admin', email };
    return { admin: { email: data.email, display_name: data.display_name }, reason: 'ok', email };
  } catch (e) {
    return { admin: null, reason: 'error', detail: e instanceof Error ? e.message : String(e), email };
  }
}

/** Returns the signed-in admin, or null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  return (await checkAdmin()).admin;
}

/** For the admin layout and every server action. Redirects non-admins to the login page with the reason. */
export async function requireAdmin(): Promise<AdminUser> {
  const c = await checkAdmin();
  if (!c.admin) {
    const p = new URLSearchParams({ why: c.reason });
    if (c.email) p.set('as', c.email);
    if (c.detail) p.set('detail', c.detail.slice(0, 160));
    redirect(`/admin/login?${p.toString()}`);
  }
  return c.admin;
}
