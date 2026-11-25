import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { territoryName } from '@/lib/data';
import { orderFields, parseOrder, priceOrder, recordOrder } from '@/lib/licenceOrder';
import { leadsAddress, sendFromSite } from '@/lib/mail';
import { stripeTestMode, verifyWebhook } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const INVOICING = 'joel@falconbp.com';

/**
 * Stripe tells the site a checkout was paid. The order is rebuilt from the session's metadata and priced again; the
 * amount Stripe collected must match, or the firm is told to check it. Stripe emails the buyer the receipt and invoice.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const event = verifyWebhook(raw, request.headers.get('stripe-signature'));
  if (!event) return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true });

  const s = event.data.object as { id: string; payment_status?: string; amount_total?: number; currency?: string; customer_email?: string; customer_details?: { email?: string }; metadata?: Record<string, string>; presentment_details?: { presentment_amount?: number; presentment_currency?: string } };
  if (s.payment_status !== 'paid') return NextResponse.json({ received: true });
  const m = s.metadata ?? {};
  try {
    const parsed = parseOrder({ slug: m.slug, licence: m.licence, country: m.country, company: m.company, fullName: m.full_name, email: s.customer_details?.email ?? s.customer_email, address: m.address, objective: m.objective, accepted: true });
    if ('error' in parsed) { console.error('[stripe-webhook] order', s.id, parsed.error); return NextResponse.json({ received: true }); }
    const o = await priceOrder(parsed.order);
    if (!o) { console.error('[stripe-webhook] study not found', s.id, m.slug); return NextResponse.json({ received: true }); }

    const paidUsd = (s.amount_total ?? 0) / 100;
    const matches = s.currency === 'usd' && paidUsd === o.q.total;
    const now = new Date().toISOString();
    await recordOrder(o, { paid_at: now, invoiced_at: now, stripe_session_id: s.id });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const local = s.presentment_details?.presentment_currency && s.presentment_details.presentment_currency !== 'usd'
        ? ` (buyer paid ${(s.presentment_details.presentment_amount ?? 0) / 100} ${s.presentment_details.presentment_currency.toUpperCase()})` : '';
      await sendFromSite('website', (from) => resend.emails.send({
        from, to: Array.from(new Set([leadsAddress().toLowerCase(), INVOICING])), replyTo: o.email,
        subject: `${stripeTestMode() ? '[TEST] ' : ''}Licence PAID: ${o.licenceShort} · ${o.report.title} — ${o.company}`,
        html: buildBrandedEmail({
          title: `${stripeTestMode() ? 'Test payment: ' : ''}a research licence was paid by card`,
          subtitle: `${o.report.title} · ${territoryName[o.report.territory] ?? o.report.territory}`,
          fields: [...orderFields(o), { label: 'Collected by Stripe', value: `US$${paidUsd.toLocaleString('en-US')}${local}${matches ? '' : ' · DOES NOT MATCH THE PRICE LIST, check before delivering'}` }, { label: 'Stripe session', value: s.id }],
          footerNote: 'Payment is complete and Stripe has emailed the buyer a receipt and invoice. Deliver the report with its completed licence statement.',
        }),
      }));
    }
  } catch (e) { console.error('[stripe-webhook]', s.id, e); return NextResponse.json({ error: 'retry' }, { status: 500 }); }
  return NextResponse.json({ received: true });
}
