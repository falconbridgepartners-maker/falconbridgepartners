import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildDownloadFollowUpEmail } from '@/lib/emailTemplates';
import { discoveryCallUrl, leadsAddress, sendFromSite } from '@/lib/mail';
import type { AccessRequest, Report } from '@/lib/data';

/** A reader who takes several packs is written to once in this many days, not once per study. */
const QUIET_DAYS = 30;

/** How long after the first download the follow-up goes: time to read the summaries, not time to go cold. */
const WAIT_HOURS = 48;

/**
 * The follow-up a reader receives after first downloading from a pack: thanks, and a link to book a discovery
 * call. Sent by the daily job (sendDueFollowUps) once the first download is WAIT_HOURS old — by then most
 * readers have been through the summaries and their own questions have started to surface.
 *
 * Sent only to readers who agreed on the pack form that we may contact them about the study.
 * access_requests.followup_sent_at (supabase/007_pack_follow_up.sql) records the send. Until that column exists
 * the email still goes, once per pack request, but the 30-day rule cannot be applied.
 */
export async function sendDownloadFollowUp(request: AccessRequest, report: Pick<Report, 'title'>): Promise<'sent' | 'skipped' | 'failed'> {
  if (!process.env.RESEND_API_KEY || !request.consent) return 'skipped';
  const db = createAdminClient();
  const since = new Date(Date.now() - QUIET_DAYS * 86_400_000).toISOString();
  const { data: earlier } = await db.from('access_requests').select('id').eq('email', request.email).gte('followup_sent_at', since).limit(1);
  if (earlier && earlier.length > 0) return 'skipped';

  const resend = new Resend(process.env.RESEND_API_KEY);
  const email = buildDownloadFollowUpEmail({ name: request.full_name, studyTitle: report.title, bookingUrl: discoveryCallUrl(), replyTo: leadsAddress() });
  const sent = await sendFromSite('research', (from) => resend.emails.send({ from, to: request.email, replyTo: leadsAddress(), ...email }));
  if (sent.error) { console.error('[pack] follow-up email', sent.error); return 'failed'; }
  await db.from('access_requests').update({ followup_sent_at: new Date().toISOString() }).eq('id', request.id);
  return 'sent';
}

/** A first download older than this is left alone: the moment for the email has passed. */
const STALE_DAYS = 7;

/**
 * The daily sweep behind /api/cron/pack-follow-up: every request whose first download (first_download_at,
 * supabase/008_follow_up_timing.sql) is WAIT_HOURS old, with consent and no follow-up yet, gets the email.
 * Unpublished studies are passed over, and a first download more than STALE_DAYS old is never written to —
 * so a send held back by the 30-day rule, or a pause in the job, cannot surface weeks later as a stale email.
 * Until 008 is run there is nothing to sweep, and no email goes at all.
 */
export async function sendDueFollowUps(): Promise<{ sent: number; skipped: number; failed: number }> {
  const out = { sent: 0, skipped: 0, failed: 0 };
  const db = createAdminClient();
  const due = new Date(Date.now() - WAIT_HOURS * 3_600_000).toISOString();
  const { data: rows, error } = await db.from('access_requests').select('*').is('followup_sent_at', null).eq('consent', true).lte('first_download_at', due).gte('first_download_at', new Date(Date.now() - STALE_DAYS * 86_400_000).toISOString()).order('first_download_at', { ascending: true }).limit(100);
  if (error) { console.error('[pack] follow-up sweep', error); return out; }
  const requests = (rows ?? []) as AccessRequest[];
  if (!requests.length) return out;
  const { data: reports } = await db.from('reports').select('id, title, published').in('id', Array.from(new Set(requests.map((r) => r.report_id))));
  for (const request of requests) {
    const report = (reports ?? []).find((x) => x.id === request.report_id) as Pick<Report, 'id' | 'title' | 'published'> | undefined;
    if (!report?.published) { out.skipped++; continue; }
    try { out[await sendDownloadFollowUp(request, report)]++; }
    catch (e) { console.error('[pack] follow-up', e); out.failed++; }
  }
  return out;
}

