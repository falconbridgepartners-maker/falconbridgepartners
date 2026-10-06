import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/admin/auth';
import { completeConnection } from '@/lib/dropbox';

export const dynamic = 'force-dynamic';

/** Dropbox sends the admin back here with a code; it is exchanged for a refresh token kept server-side. */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  const { origin, searchParams } = new URL(request.url);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/admin/import?dropbox=${q}`);
    res.cookies.set('dbx_state', '', { path: '/api/dropbox', maxAge: 0 });
    return res;
  };
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const expected = cookies().get('dbx_state')?.value;
  if (searchParams.get('error')) return back('declined');
  if (!code || !state || !expected || state !== expected) return back('state');
  try {
    await completeConnection(code, `${origin}/api/dropbox/callback`, admin.email);
    return back('connected');
  } catch (e) {
    console.error('[dropbox] connect failed:', e);
    return back('failed');
  }
}
