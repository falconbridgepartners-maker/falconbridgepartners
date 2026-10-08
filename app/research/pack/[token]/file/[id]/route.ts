import { NextResponse } from 'next/server';
import { signedFileUrl } from '@/lib/data';
import { resolvePack, recordDownload } from '@/lib/packAccess';
import { sendDownloadFollowUp } from '@/lib/packFollowUp';

export const dynamic = 'force-dynamic';

/** One download from an emailed pack link: checks the link, then redirects to a signed URL that lasts two minutes. */
export async function GET(_req: Request, { params }: { params: { token: string; id: string } }) {
  const grant = await resolvePack(params.token);
  if (!grant) return new NextResponse('This link is not recognised.', { status: 404 });
  if (grant.expired) return new NextResponse('This link has expired. Ask for the pack again from the study page.', { status: 410 });
  const file = grant.files.find((f) => f.id === params.id);
  if (!file?.storage_path) return new NextResponse('Not available', { status: 404 });
  const url = await signedFileUrl(file.storage_path, { expiresIn: 120, download: file.file_name ?? null });
  if (!url) return new NextResponse('Not available', { status: 404 });
  const { first } = await recordDownload(grant.request);
  // The reader came back and took a document: thank them once and offer a conversation. Never holds up the download.
  if (first) await sendDownloadFollowUp(grant.request, grant.report).catch((e) => console.error('[pack] follow-up', e));
  return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
