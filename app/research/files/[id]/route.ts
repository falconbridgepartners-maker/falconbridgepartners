import { NextResponse } from 'next/server';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';
import { signedFileUrl } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Redirects to a short-lived signed URL for an OPEN package file of a PUBLISHED report. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!supabaseConfigured()) return new NextResponse('Not available', { status: 404 });
  const db = createAdminClient();
  const { data } = await db.from('report_files').select('storage_path, access, report:reports(published)').eq('id', params.id).maybeSingle();
  const rep = (data as unknown as { storage_path: string | null; access: string; report: { published: boolean } | null } | null);
  if (!rep?.storage_path || rep.access !== 'open' || !rep.report?.published) return new NextResponse('Not available', { status: 404 });
  const url = await signedFileUrl(rep.storage_path);
  if (!url) return new NextResponse('Not available', { status: 404 });
  return NextResponse.redirect(url, 302);
}
