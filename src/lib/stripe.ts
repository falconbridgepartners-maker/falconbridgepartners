import 'server-only';
import crypto from 'crypto';

/**
 * Stripe Checkout over the REST API (no SDK). STRIPE_SECRET_KEY selects test or live mode: sk_test_… or sk_live_….
 * Adaptive Pricing is switched on in the Stripe account, so Checkout offers the buyer's local currency itself.
 */
export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
export const stripeTestMode = () => (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');

type Line = { name: string; description?: string; usdCents: number };

function form(obj: Record<string, string | number | undefined>, out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== '') out.append(k, String(v));
  return out;
}

export async function createCheckoutSession(args: {
  lines: Line[]; email: string; successUrl: string; cancelUrl: string; metadata: Record<string, string>; reference: string;
}): Promise<{ id: string; url: string }> {
  const body = form({
    mode: 'payment',
    customer_email: args.email,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    client_reference_id: args.reference,
    'payment_intent_data[statement_descriptor_suffix]': 'RESEARCH',
    'payment_intent_data[description]': args.lines[0]?.name,
    'invoice_creation[enabled]': 'true',
  });
  args.lines.forEach((l, i) => {
    form({
      [`line_items[${i}][quantity]`]: 1,
      [`line_items[${i}][price_data][currency]`]: 'usd',
      [`line_items[${i}][price_data][unit_amount]`]: l.usdCents,
      [`line_items[${i}][price_data][product_data][name]`]: l.name,
      [`line_items[${i}][price_data][product_data][description]`]: l.description,
    }, body);
  });
  // Stripe keeps at most 50 metadata keys, each value up to 500 characters.
  for (const [k, v] of Object.entries(args.metadata)) {
    body.append(`metadata[${k}]`, v.slice(0, 500));
    body.append(`payment_intent_data[metadata][${k}]`, v.slice(0, 500));
  }
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(`Stripe ${res.status}: ${data?.error?.message ?? 'no checkout url'}`);
  return { id: data.id, url: data.url };
}

/** Verifies the Stripe-Signature header (v1, HMAC-SHA256) and returns the event, or null if it does not check out. */
export function verifyWebhook(raw: string, header: string | null, toleranceSec = 300): { type: string; data: { object: Record<string, unknown> } } | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return null;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]).filter((p) => p.length === 2 && p[0] !== 'v1'));
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return null;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  const ok = sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
  if (!ok) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
