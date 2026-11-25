import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { territoryName } from '@/lib/data';
import { orderFields, parseOrder, priceOrder, recordOrder } from '@/lib/licenceOrder';
import { leadsAddress, sendFromSite } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const fmt = (n: number) => n.toLocaleString('en-US');
/** Licence requests also go to the managing partner who issues the invoice. */
const INVOICING = 'joel@falconbp.com';

/**
 * A buyer asks to be invoiced for a business licence for a ready-made study.
 * The price is worked out here from the price list, never taken from the browser.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !supabaseConfigured()) return bad('Licences cannot be requested at the moment. Please write to joel@falconbp.com.', 503);
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`licence:${ip}`, 8)) return bad('Too many requests. Please try again later.', 429);

    const data = await request.json();
    const parsed = parseOrder(data);
    if ('error' in parsed) return bad(parsed.error);
    if (!data.turnstileToken || !(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');
    const o = await priceOrder(parsed.order);
    if (!o) return bad('This study cannot be licensed online. Please write to joel@falconbp.com.', 404);

    await recordOrder(o);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const firm = await sendFromSite('website', (from) => resend.emails.send({
      from, to: Array.from(new Set([leadsAddress().toLowerCase(), INVOICING])), replyTo: o.email,
      subject: `Licence request (invoice): ${o.licenceShort} · ${o.report.title} — ${o.company}`,
      html: buildBrandedEmail({
        title: 'A research licence was requested: please invoice',
        subtitle: `${o.report.title} · ${territoryName[o.report.territory] ?? o.report.territory} · ${o.tier === 'back' ? 'Back catalogue' : 'New report'}`,
        fields: orderFields(o),
        footerNote: 'Issue the invoice to the buyer and deliver the report with its licence statement once payment is received. Reply to this message to write to the buyer.',
      }),
    }));
    if (firm.error) { console.error('[licence-request] firm email', firm.error); return bad('The request could not be sent. Please try again or write to joel@falconbp.com.', 502); }

    try {
      await sendFromSite('research', (from) => resend.emails.send({
        from, to: o.email, replyTo: INVOICING,
        subject: `Your licence request: ${o.report.title}`,
        html: buildBrandedEmail({
          title: 'Your licence request is with us',
          subtitle: o.report.title,
          fields: [
            { label: 'Licence', value: o.licenceName }, { label: 'Licensee', value: o.company },
            ...(o.objective ? [{ label: 'Stated objective', value: o.objective }] : []),
            { label: 'Total', value: `US$${fmt(o.q.total)}${o.q.uae ? ' including UAE VAT 5%' : ''}` },
          ],
          footerNote: 'Your invoice follows by email. The report is delivered with its licence statement as soon as payment is received. The full terms are at falconbp.com/legal/research-licences.',
        }),
      }));
    } catch (e) { console.error('[licence-request] buyer email', e); }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[licence-request]', error);
    return bad('The request could not be processed. Please try again.', 500);
  }
}
