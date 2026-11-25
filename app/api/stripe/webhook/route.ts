import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { territoryName } from '@/lib/data';
import { orderFields, parseOrder, priceOrder, recordOrder } from '@/lib/licenceOrder';
import { leadsAddress, sendFromSite } from '@/lib/mail';
import { cardCountries, stripeTestMode, verifyWebhook } from '@/lib/stripe';
import { HIGH_INCOME, countryName } from '@/lib/licencePricing';
import { deliverLicence } from '@/lib/licenceDelivery';
import { createAdminClient } from '@/lib/supabase/admin';

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
  if (event.type === 'invoice.paid') return invoicePaid(event.data.object as InvoiceObj);
  if (event.type !== 'checkout.session.completed') return NextResponse.json({ received: true });

  const s = event.data.object as { id: string; payment_status?: string; amount_total?: number; currency?: string; customer_email?: string; customer_details?: { email?: string }; metadata?: Record<string, string>; presentment_details?: { presentment_amount?: number; presentment_currency?: string } };
  if (s.payment_status !== 'paid') return NextResponse.json({ received: true });
  const m = s.metadata ?? {};
  try {
    const parsed = parseOrder({ slug: m.slug, licence: m.licence, country: m.country, company: m.company, fullName: m.full_name, email: s.customer_details?.email ?? s.customer_email, address: m.address, objective: m.objective, accepted: true, declared: true });
    if ('error' in parsed) { console.error('[stripe-webhook] order', s.id, parsed.error); return NextResponse.json({ received: true }); }
    const o = await priceOrder(parsed.order);
    if (!o) { console.error('[stripe-webhook] study not found', s.id, m.slug); return NextResponse.json({ received: true }); }

    const paidUsd = (s.amount_total ?? 0) / 100;
    const matches = s.currency === 'usd' && paidUsd === o.q.total;
    const now = new Date().toISOString();
    const { duplicate } = await recordOrder(o, { paid_at: now, invoiced_at: now, stripe_session_id: s.id });
    if (duplicate) return NextResponse.json({ received: true, duplicate: true });

    // Safeguard: a reduced-price order paid with a card from a high-income country is held for the firm to check.
    const cc = await cardCountries(s.id);
    const payCountry = cc.card ?? cc.billing;
    const highCountry = o.q.reduced ? [cc.card, cc.billing].find((x) => x && HIGH_INCOME.has(x)) : undefined;
    const heldForCountry = Boolean(highCountry);
    const countryNote = !payCountry ? 'Not reported by Stripe'
      : `Card issued in ${cc.card ? countryName(cc.card) : 'unknown'}${cc.billing ? ` · billing address in ${countryName(cc.billing)}` : ''}${payCountry === o.country ? ' · matches the declared country' : ` · DIFFERS from the declared country (${o.countryName})`}${heldForCountry ? ' · reduced price paid from a high-income country: HELD' : ''}`;

    // Deliver straight away when the amount matches and the country check passes; otherwise hold it for the firm.
    const delivery = !matches ? { delivered: false as const, reason: 'The amount collected does not match the price list.' }
      : heldForCountry ? { delivered: false as const, reason: `The reduced price was paid with a card or billing address in ${countryName(highCountry!)}, a high-income country. Confirm where the licensee is registered (for example, its trade licence) before delivering, or invoice the difference.` }
      : await deliverLicence(o, s.id);

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const local = s.presentment_details?.presentment_currency && s.presentment_details.presentment_currency !== 'usd'
        ? ` (buyer paid ${(s.presentment_details.presentment_amount ?? 0) / 100} ${s.presentment_details.presentment_currency.toUpperCase()})` : '';
      await sendFromSite('website', (from) => resend.emails.send({
        from, to: Array.from(new Set([leadsAddress().toLowerCase(), INVOICING])), replyTo: o.email,
        subject: `${stripeTestMode() ? '[TEST] ' : ''}Licence PAID${delivery.delivered ? ' and delivered' : ' · DELIVER BY HAND'}: ${o.licenceShort} · ${o.report.title} — ${o.company}`,
        html: buildBrandedEmail({
          title: `${stripeTestMode() ? 'Test payment: ' : ''}a research licence was paid by card`,
          subtitle: `${o.report.title} · ${territoryName[o.report.territory] ?? o.report.territory}`,
          fields: [
            ...orderFields(o),
            { label: 'Collected by Stripe', value: `US$${paidUsd.toLocaleString('en-US')}${local}${matches ? '' : ' · DOES NOT MATCH THE PRICE LIST, check before delivering'}` },
            { label: 'Payment country', value: countryNote },
            { label: 'Delivery', value: delivery.delivered ? `Sent automatically: pack link (works until ${delivery.expires}) and the completed licence statement, valid until ${delivery.until}` : `NOT SENT: ${delivery.reason} Deliver by hand.` },
            { label: 'Stripe session', value: s.id },
          ],
          footerNote: delivery.delivered
            ? 'Payment is complete. Stripe has emailed the buyer a receipt and invoice, and the site has emailed the pack and licence statement. Nothing more to do.'
            : 'Payment is complete and Stripe has emailed the buyer a receipt and invoice. The pack was NOT sent automatically: deliver it by hand with the completed licence statement.',
        }),
      }));
    }
  } catch (e) { console.error('[stripe-webhook]', s.id, e); return NextResponse.json({ error: 'retry' }, { status: 500 }); }
  return NextResponse.json({ received: true });
}

type InvoiceObj = { id: string; number?: string | null; amount_paid?: number; currency?: string; paid_out_of_band?: boolean; metadata?: Record<string, string> };

/**
 * A licence invoice (sent when a buyer chose to pay later) has been paid: by card through Stripe's invoice page, or
 * marked "paid outside Stripe" in the dashboard once the bank transfer landed. Deliver once, then tell the firm.
 * Invoices Stripe makes for card checkouts carry no kind and are ignored here.
 */
async function invoicePaid(inv: InvoiceObj) {
  const m = inv.metadata ?? {};
  if (m.kind !== 'licence-invoice') return NextResponse.json({ received: true });
  try {
    const db = createAdminClient();
    const now = new Date().toISOString();
    // Claim it: only the first invoice.paid for this invoice updates the row and goes on to deliver.
    const { data: claimed, error: claimError } = await db.from('licence_requests').update({ paid_at: now }).eq('stripe_session_id', inv.id).is('paid_at', null).select('id');
    if (!claimError && claimed && claimed.length === 0) return NextResponse.json({ received: true, duplicate: true });
    const parsed = parseOrder({ slug: m.slug, licence: m.licence, country: m.country, company: m.company, fullName: m.full_name, email: m.email, address: m.address, objective: m.objective, accepted: true, declared: true });
    if ('error' in parsed) { console.error('[stripe-webhook] invoice order', inv.id, parsed.error); return NextResponse.json({ received: true }); }
    const o = await priceOrder(parsed.order);
    if (!o) { console.error('[stripe-webhook] invoice study not found', inv.id, m.slug); return NextResponse.json({ received: true }); }
    // The invoice was raised at the price agreed when it was requested; check against that, not today's price.
    const invoiced = Number(m.fee_usd) + Number(m.vat_usd);
    const matches = inv.currency === 'usd' && (inv.paid_out_of_band || (inv.amount_paid ?? 0) / 100 === invoiced);
    if (claimError) await recordOrder(o, { paid_at: now, invoiced_at: now, stripe_session_id: inv.id });
    const delivery = matches ? await deliverLicence(o, inv.id) : { delivered: false as const, reason: 'The amount paid does not match the invoice.' };
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const how = inv.paid_out_of_band ? 'bank transfer (marked paid in Stripe)' : 'card, on the Stripe invoice page';
      await sendFromSite('website', (from) => resend.emails.send({
        from, to: Array.from(new Set([leadsAddress().toLowerCase(), INVOICING])), replyTo: o.email,
        subject: `${stripeTestMode() ? '[TEST] ' : ''}Invoice ${inv.number ?? inv.id} PAID${delivery.delivered ? ' and delivered' : ' · DELIVER BY HAND'}: ${o.licenceShort} · ${o.report.title} — ${o.company}`,
        html: buildBrandedEmail({
          title: `${stripeTestMode() ? 'Test: ' : ''}a licence invoice was paid`,
          subtitle: `${o.report.title} · ${territoryName[o.report.territory] ?? o.report.territory}`,
          fields: [
            ...orderFields(o),
            { label: 'Invoice', value: `${inv.number ?? inv.id} · paid by ${how} · US$${invoiced.toLocaleString('en-US')}` },
            { label: 'Delivery', value: delivery.delivered ? `Sent automatically: pack link (works until ${delivery.expires}) and the completed licence statement, valid until ${delivery.until}` : `NOT SENT: ${delivery.reason} Deliver by hand.` },
          ],
          footerNote: delivery.delivered ? 'The buyer has the pack and licence statement. Nothing more to do.' : 'The pack was NOT sent automatically: deliver it by hand with the completed licence statement.',
        }),
      }));
    }
  } catch (e) { console.error('[stripe-webhook] invoice', inv.id, e); return NextResponse.json({ error: 'retry' }, { status: 500 }); }
  return NextResponse.json({ received: true });
}
