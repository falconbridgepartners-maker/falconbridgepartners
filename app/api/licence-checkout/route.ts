import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimit';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { licenceSalesOpen } from '@/lib/licencePricing';
import { parseOrder, priceOrder } from '@/lib/licenceOrder';
import { createCheckoutSession, stripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * A buyer pays for a business licence by card. The price is worked out here, the buyer is sent to Stripe Checkout,
 * and the order travels in the session's metadata so the webhook can record it and tell the firm once paid.
 */
export async function POST(request: NextRequest) {
  try {
    if (!licenceSalesOpen()) return bad('Online licence purchase is paused. Please write to joel@falconbp.com.', 503);
    if (!stripeConfigured() || !supabaseConfigured()) return bad('Card payment is not available at the moment. Please request an invoice instead.', 503);
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`checkout:${ip}`, 8)) return bad('Too many requests. Please try again later.', 429);

    const data = await request.json();
    const parsed = parseOrder(data);
    if ('error' in parsed) return bad(parsed.error);
    if (!data.turnstileToken || !(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');
    const o = await priceOrder(parsed.order);
    if (!o) return bad('This study cannot be licensed online. Please write to joel@falconbp.com.', 404);

    const lines = [{ name: `${o.licenceShort} licence: ${o.report.title}`, description: `FalconBridge Research Licences v1.0 · ${o.licenceName} · Licensee: ${o.company}`, usdCents: o.q.usd * 100 }];
    if (o.q.vat) lines.push({ name: 'UAE VAT 5%', description: 'Value added tax, United Arab Emirates', usdCents: o.q.vat * 100 });

    const session = await createCheckoutSession({
      lines, email: o.email, reference: `${o.slug}:${o.licence}`,
      invoiceDescription: `Research licence: ${o.licenceName} for “${o.report.title}”. Paid by card.`,
      customFields: [{ name: 'Licensee', value: o.company }, { name: 'Licence', value: o.licenceName }],
      successUrl: `${SITE_URL}/research/studies/${o.slug}/buy/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${SITE_URL}/research/studies/${o.slug}/buy`,
      metadata: {
        slug: o.slug, licence: o.licence, country: o.country, company: o.company, full_name: o.fullName,
        address: o.address, objective: o.objective, fee_usd: String(o.q.usd), vat_usd: String(o.q.vat), terms: '1.0', country_declared: 'yes',
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[licence-checkout]', error);
    return bad('Card checkout could not be started. Please try again or request an invoice.', 500);
  }
}
