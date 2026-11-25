import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { territoryName } from '@/lib/data';
import { orderFields, parseOrder, priceOrder, recordOrder } from '@/lib/licenceOrder';
import { leadsAddress, sendFromSite } from '@/lib/mail';
import { sendLicenceInvoice, stripeConfigured } from '@/lib/stripe';

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

    // With Stripe set up, the buyer is sent a numbered, branded invoice with the WIO bank details and a pay-online
    // link. When it is paid (card, or marked paid in Stripe once the transfer lands) the pack is delivered.
    let invoice: { id: string; number: string | null; url: string | null } | null = null;
    if (stripeConfigured()) {
      try {
        const lines = [{ name: `${o.licenceShort} licence: ${o.report.title}`, description: `FalconBridge Research Licences v1.0 · ${o.licenceName}`, usdCents: o.q.usd * 100 }];
        if (o.q.vat) lines.push({ name: 'UAE VAT 5%', description: 'Value added tax, United Arab Emirates', usdCents: o.q.vat * 100 });
        invoice = await sendLicenceInvoice({
          email: o.email, company: o.company, contact: o.fullName, address: o.address, country: o.country, lines,
          description: `Research licence: ${o.licenceName} for “${o.report.title}”. The report and licence statement are emailed once payment is received.`,
          customFields: [{ name: 'Licensee', value: o.company }, { name: 'Licence', value: o.licenceName }],
          metadata: {
            kind: 'licence-invoice', slug: o.slug, licence: o.licence, country: o.country, company: o.company, full_name: o.fullName,
            email: o.email, address: o.address, objective: o.objective, fee_usd: String(o.q.usd), vat_usd: String(o.q.vat), terms: '1.0', country_declared: 'yes',
          },
        });
      } catch (e) { console.error('[licence-request] stripe invoice', e); /* the firm invoices by hand */ }
    }
    await recordOrder(o, invoice ? { stripe_session_id: invoice.id, invoiced_at: new Date().toISOString() } : {});

    const resend = new Resend(process.env.RESEND_API_KEY);
    const firm = await sendFromSite('website', (from) => resend.emails.send({
      from, to: Array.from(new Set([leadsAddress().toLowerCase(), INVOICING])), replyTo: o.email,
      subject: invoice ? `Licence invoiced (${invoice.number ?? invoice.id}): ${o.licenceShort} · ${o.report.title} — ${o.company}` : `Licence request (invoice): ${o.licenceShort} · ${o.report.title} — ${o.company}`,
      html: buildBrandedEmail({
        title: invoice ? `Invoice ${invoice.number ?? ''} sent: a research licence was requested` : 'A research licence was requested: please invoice',
        subtitle: `${o.report.title} · ${territoryName[o.report.territory] ?? o.report.territory} · ${o.tier === 'back' ? 'Back catalogue' : 'New report'}`,
        fields: [...orderFields(o), ...(invoice ? [{ label: 'Stripe invoice', value: `${invoice.number ?? invoice.id} · due in 14 days${invoice.url ? ` · ${invoice.url}` : ''}` }] : [])],
        footerNote: invoice
          ? 'Stripe has emailed the buyer the invoice, with the WIO bank details and a pay-online link. If they pay by card, the pack is delivered automatically. When a bank transfer lands, open the invoice in Stripe and choose "Mark as paid" (paid outside Stripe): the pack and licence statement then go out automatically.'
          : 'Issue the invoice to the buyer and deliver the report with its licence statement once payment is received. Reply to this message to write to the buyer.',
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
          footerNote: invoice
            ? `Your invoice ${invoice.number ?? ''} has been emailed to you separately, with our bank details for a transfer and a link to pay online by card. Your research pack and licence statement are emailed as soon as payment is received. The full terms are at falconbp.com/legal/research-licences.`
            : 'Your invoice follows by email. The report is delivered with its licence statement as soon as payment is received. The full terms are at falconbp.com/legal/research-licences.',
        }),
      }));
    } catch (e) { console.error('[licence-request] buyer email', e); }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[licence-request]', error);
    return bad('The request could not be processed. Please try again.', 500);
  }
}
