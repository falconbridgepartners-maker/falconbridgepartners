import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail, buildPackEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';
import { hasGatedPack, readerFiles, territoryName, type Report } from '@/lib/data';
import { newToken } from '@/lib/packAccess';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const LEADS_TO = () => process.env.RESEND_LEADS_EMAIL || 'info@falconbp.com';
const FROM = () => process.env.RESEND_FROM || 'noreply@notifications.falconbp.com';
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * A reader asks for a study's research pack.
 * The request is logged, the reader is emailed a link that expires, and the firm is told who asked.
 * Files are never attached and never linked directly: the emailed link opens a page that issues short-lived downloads.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !supabaseConfigured()) return bad('The pack cannot be sent at the moment. Please write to info@falconbp.com.', 503);

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`pack:${ip}`, 12)) return bad('Too many requests. Please try again later.', 429);

    const data = await request.json();
    if (!data.slug || !data.fullName || !data.email || !data.organization || !data.turnstileToken) return bad('Please complete the form.');
    if (data.consent !== true) return bad('Please confirm that we may contact you about this study.');
    if (!(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');

    const fullName = sanitizeInput(String(data.fullName));
    const email = sanitizeInput(String(data.email)).toLowerCase();
    const organisation = sanitizeInput(String(data.organization));
    const role = data.role ? sanitizeInput(String(data.role)).slice(0, 100) : '';
    const intendedUse = data.decisionContext ? sanitizeInput(String(data.decisionContext)).slice(0, 1000) : '';
    if (!isValidEmail(email) || email.length > 200) return bad('Please enter a valid email address.');
    if (fullName.length < 2 || fullName.length > 100) return bad('Name must be between 2 and 100 characters.');
    if (organisation.length < 2 || organisation.length > 200) return bad('Organisation must be between 2 and 200 characters.');

    const db = createAdminClient();
    const { data: found } = await db.from('reports').select('*, files:report_files(*)').eq('slug', String(data.slug)).eq('published', true).maybeSingle();
    const report = found as Report | null;
    if (!report || !hasGatedPack(report.files)) return bad('This pack is not available for download. Please write to info@falconbp.com.', 404);

    const { token, hash, expiresAt } = newToken();
    const { error: insertError } = await db.from('access_requests').insert({
      report_id: report.id, full_name: fullName, email, organisation, role: role || null, intended_use: intendedUse || null,
      consent: true, token_hash: hash, expires_at: expiresAt.toISOString(),
    });
    if (insertError) { console.error('[request-pack] insert', insertError); return bad('The request could not be recorded. Please try again.', 500); }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = `${SITE_URL}/research/pack/${token}`;
    const expires = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    const files = readerFiles(report.files).sort((a, b) => a.sort_order - b.sort_order).map((f) => f.label);

    const sent = await resend.emails.send({
      from: FROM(), to: email, replyTo: LEADS_TO(),
      subject: `Your research pack: ${report.title}`,
      html: buildPackEmail({ name: fullName, studyTitle: report.title, link, expires, files, replyTo: LEADS_TO() }),
    });
    if (sent.error) { console.error('[request-pack] reader email', sent.error); return bad('The email could not be sent. Please check the address and try again.', 502); }

    // Tell the firm: the general address, copied to the partner(s) for the study's territory.
    try {
      const { data: partners } = await db.from('partners').select('email').eq('active', true).contains('territories', [report.territory]);
      const cc = Array.from(new Set((partners ?? []).map((p) => String(p.email || '').toLowerCase()).filter((e) => e && e !== LEADS_TO().toLowerCase())));
      await resend.emails.send({
        from: FROM(), to: LEADS_TO(), ...(cc.length ? { cc } : {}), replyTo: email,
        subject: `Pack requested: ${report.title} — ${organisation}`,
        html: buildBrandedEmail({
          title: 'A research pack was requested',
          subtitle: `${report.title} · ${territoryName[report.territory] ?? report.territory}${report.week_label ? ` · ${report.week_label}` : ''}`,
          fields: [
            { label: 'Name', value: fullName }, { label: 'Email', value: email }, { label: 'Organisation', value: organisation },
            ...(role ? [{ label: 'Role', value: role }] : []), ...(intendedUse ? [{ label: 'Intended use', value: intendedUse }] : []),
            { label: 'Link expires', value: expires },
          ],
          footerNote: 'The reader has been emailed a link to the pack. Reply to this message to write to them. Opens and downloads are recorded under Pack requests in the admin.',
        }),
      });
    } catch (e) { console.error('[request-pack] lead email', e); /* the reader already has the pack; the lead is in the admin */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[request-pack]', error);
    return bad('The request could not be processed. Please try again.', 500);
  }
}
