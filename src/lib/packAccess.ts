import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { readerFiles, type AccessRequest, type Report, type ReportFile } from '@/lib/data';

/** How long an emailed pack link works. PACK_LINK_DAYS overrides the default of 7. */
export const packLinkDays = () => {
  const n = Number(process.env.PACK_LINK_DAYS);
  return Number.isFinite(n) && n >= 1 && n <= 90 ? Math.round(n) : 7;
};

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** A fresh link token and its hash. Only the hash is stored; the token exists in the email alone. */
export function newToken(): { token: string; hash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token), expiresAt: new Date(Date.now() + packLinkDays() * 86_400_000) };
}

export type PackGrant = { request: AccessRequest; report: Report; files: ReportFile[]; expired: boolean };

/** Resolves an emailed link. Returns null when the token is unknown or the study is no longer published. */
export async function resolvePack(token: string): Promise<PackGrant | null> {
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
  const db = createAdminClient();
  const { data: request } = await db.from('access_requests').select('*').eq('token_hash', hashToken(token)).maybeSingle();
  if (!request) return null;
  const { data: report } = await db.from('reports').select('*, files:report_files(*)').eq('id', request.report_id).eq('published', true).maybeSingle();
  if (!report) return null;
  const files = readerFiles((report as Report).files).sort((a, b) => a.sort_order - b.sort_order);
  return { request: request as AccessRequest, report: report as Report, files, expired: new Date(request.expires_at).getTime() < Date.now() };
}

export async function recordOpen(request: AccessRequest): Promise<void> {
  const db = createAdminClient();
  const now = new Date().toISOString();
  await db.from('access_requests').update({ first_opened_at: request.first_opened_at ?? now, last_opened_at: now, open_count: (request.open_count ?? 0) + 1 }).eq('id', request.id);
}

export async function recordDownload(request: AccessRequest): Promise<void> {
  const db = createAdminClient();
  await db.from('access_requests').update({ download_count: (request.download_count ?? 0) + 1, last_opened_at: new Date().toISOString() }).eq('id', request.id);
}
