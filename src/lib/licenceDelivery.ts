import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasGatedPack, readerFiles, type Report } from '@/lib/data';
import { newToken } from '@/lib/packAccess';
import { buildPackEmail } from '@/lib/emailTemplates';
import { leadsAddress, sendFromSite } from '@/lib/mail';
import { statements, type Block } from '@/content/researchLicences';
import type { PricedOrder } from '@/lib/licenceOrder';

/** A paid licence's pack link works for 30 days; the licence itself runs 12 or 24 months. */
const PAID_LINK_DAYS = 30;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const day = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' });
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Marks the access request as a paid licence, so the pack page shows the licence instead of the free terms. */
export const PAID_PREFIX = 'Paid licence: ';

/** The licence statement from section 9, with the licensee, dates and (Single Use) stated objective filled in. */
export function filledStatement(o: PricedOrder, delivered: Date): { title: string; blocks: Block[]; until: string } {
  const st = statements.find((x) => x.title.includes(o.licence === 't2' ? 'Type 2' : 'Type 3'))!;
  const months = o.licence === 't2' ? 12 : 24;
  const end = new Date(delivered); end.setMonth(end.getMonth() + months);
  const fill = (t: string) => t
    .replace(/\[Purpose\] within the \[Target market \/ sector \/ focus area\] as viewed from the perspective of \[Own market \/ sector \/ focus area\]/, o.objective || 'as stated at purchase')
    .replace(/\[Licensee\]/g, o.company)
    .replace(/\[date of delivery\]|\[date\]/g, day(delivered))
    .replace(/the report/, `the report (“${o.report.title}”)`);
  const blocks = st.blocks.map((b) => ({ h: b.h, items: b.items.map((it) => ({ ...it, t: fill(it.t) })) }));
  return { title: st.title.replace('Licence statement: ', ''), blocks, until: day(end) };
}

function statementHtml(s: { title: string; blocks: Block[] }) {
  const parts = s.blocks.map((b) => `${b.h ? `<p style="margin:14px 0 4px;color:#e2cf9f;font-weight:700;font-size:13px;">${esc(b.h)}</p>` : ''}${b.items.map((it) => `<p style="margin:0 0 6px;${it.bullet ? 'padding-left:12px;' : ''}${it.note ? 'font-style:italic;font-size:12px;' : ''}">${esc(it.t)}</p>`).join('')}`).join('');
  return `<p style="margin:0 0 6px;color:#ffffff;font-weight:700;">${esc(s.title)}</p>${parts}`;
}

/**
 * Delivers a paid licence: an expiring pack link (the same pack page free readers get, without the discovery-call
 * follow-up) and the completed licence statement, by email to the buyer. Returns why it could not, if it could not.
 */
export async function deliverLicence(o: PricedOrder, stripeSessionId: string | null): Promise<{ delivered: true; until: string; expires: string } | { delivered: false; reason: string }> {
  if (!process.env.RESEND_API_KEY) return { delivered: false, reason: 'Email is not configured.' };
  const db = createAdminClient();
  const { data: withFiles } = await db.from('reports').select('*, files:report_files(*)').eq('id', o.report.id).maybeSingle();
  const report = withFiles as Report | null;
  if (!report || !hasGatedPack(report.files)) return { delivered: false, reason: 'This study has no downloadable pack on the site.' };

  const now = new Date();
  const statement = filledStatement(o, now);
  const { token, hash } = newToken();
  const expiresAt = new Date(now.getTime() + PAID_LINK_DAYS * 86_400_000);
  const row = {
    report_id: report.id, full_name: o.fullName, email: o.email, organisation: o.company, role: 'Licensee',
    intended_use: `${PAID_PREFIX}${o.licenceName}${o.objective ? ` · ${o.objective}` : ''}`.slice(0, 1000),
    consent: true, token_hash: hash, expires_at: expiresAt.toISOString(),
  };
  // A paying licensee is not sent the free reader's "book a call" follow-up, so mark it as already sent.
  let { error } = await db.from('access_requests').insert({ ...row, followup_sent_at: now.toISOString() });
  if (error && /followup_sent_at/.test(error.message)) ({ error } = await db.from('access_requests').insert(row));
  if (error) { console.error('[licence-delivery] access', error); return { delivered: false, reason: 'The pack link could not be created.' }; }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const expires = day(expiresAt);
  const sent = await sendFromSite('research', (from) => resend.emails.send({
    from, to: o.email, replyTo: 'joel@falconbp.com',
    subject: `Your licensed research pack: ${report.title}`,
    html: buildPackEmail({
      name: o.fullName, studyTitle: report.title, link: `${SITE_URL}/research/pack/${token}`, expires,
      files: readerFiles(report.files).sort((a, b) => a.sort_order - b.sort_order).map((f) => f.label), replyTo: leadsAddress(),
      licence: { name: `${o.licenceName}, licensed to ${o.company} until ${statement.until}`, html: statementHtml(statement) },
    }),
  }));
  if (sent.error) { console.error('[licence-delivery] email', sent.error); return { delivered: false, reason: 'The email to the buyer failed.' }; }

  if (stripeSessionId) await db.from('licence_requests').update({ delivered_at: now.toISOString() }).eq('stripe_session_id', stripeSessionId);
  return { delivered: true, until: statement.until, expires };
}
