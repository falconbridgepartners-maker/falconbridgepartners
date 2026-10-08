import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildDownloadFollowUpEmail } from '@/lib/emailTemplates';
import { discoveryCallUrl, leadsAddress, sendFromSite } from '@/lib/mail';
import type { AccessRequest, Report } from '@/lib/data';

/** A reader who takes several packs is written to once in this many days, not once per study. */
const QUIET_DAYS = 30;

/**
 * The follow-up a reader receives when they first download a document from a pack: thanks, and a link to book
 * a discovery call. Called once per pack request, on its first download (see recordDownload).
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
  const sent = await sendFromSite('research', (from) => resend.emails.send({
    from, to: request.email, replyTo: leadsAddress(),
    subject: 'Thank you for downloading the research pack',
    html: buildDownloadFollowUpEmail({ name: request.full_name, studyTitle: report.title, bookingUrl: discoveryCallUrl(), replyTo: leadsAddress() }),
  }));
  if (sent.error) { console.error('[pack] follow-up email', sent.error); return 'failed'; }
  await db.from('access_requests').update({ followup_sent_at: new Date().toISOString() }).eq('id', request.id);
  return 'sent';
}
