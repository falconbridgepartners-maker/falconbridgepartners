import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { requireAdmin } from '@/lib/admin/auth';
import { authorizeUrl, dropboxConfigured } from '@/lib/dropbox';

export const dynamic = 'force-dynamic';

/** Starts the one-time Dropbox connection. Admins only; the state cookie ties the reply to this browser. */
export async function GET(request: Request) {
  await requireAdmin();
  const { origin } = new URL(request.url);
  if (!dropboxConfigured()) return NextResponse.redirect(`${origin}/admin/import?dropbox=not-configured`);
  const state = randomBytes(24).toString('base64url');
  const res = NextResponse.redirect(authorizeUrl(`${origin}/api/dropbox/callback`, state));
  res.cookies.set('dbx_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/dropbox', maxAge: 600 });
  return res;
}
