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

/**
 * What every FalconBridge invoice carries, besides the branding set in the Stripe dashboard.
 * INVOICE_TRN: the firm's UAE VAT registration number. INVOICE_BANK_DETAILS: the WIO account to pay by transfer,
 * as the lines to print (entered by CJ in Vercel; the site never holds them in code).
 */
const trn = () => (process.env.INVOICE_TRN || '').trim();
const bankDetails = () => (process.env.INVOICE_BANK_DETAILS || '').replace(/\\n/g, '\n').trim();
export const bankTransferReady = () => Boolean(bankDetails());

/** Stripe allows four custom fields on an invoice, each name ≤ 40 and value ≤ 140 characters. */
function invoiceCustomFields(extra: { name: string; value: string }[] = []) {
  const fields = [...(trn() ? [{ name: 'Supplier TRN (UAE VAT)', value: trn() }] : []), ...extra];
  return fields.slice(0, 4).map((f) => ({ name: f.name.slice(0, 40), value: f.value.slice(0, 140) }));
}

function invoiceFooter(bankTransfer: boolean) {
  const lines = ['FalconBridge Partners FZC LLC · falconbp.com · Research Licences v1.0 apply: falconbp.com/legal/research-licences'];
  if (bankTransfer && bankDetails()) lines.unshift(`Pay by bank transfer to:\n${bankDetails()}\nPlease quote the invoice number as the payment reference. Bank charges are for the payer's account.`);
  return lines.join('\n\n').slice(0, 5000);
}

async function stripePost<T = Record<string, unknown>>(path: string, body: URLSearchParams): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path} ${res.status}: ${data?.error?.message ?? 'error'}`);
  return data as T;
}

/**
 * Creates and emails a Stripe invoice for a buyer who chose to pay later. It shows the WIO bank details for a
 * transfer and also lets the buyer pay online by card. Due in 14 days. When it is paid (by card, or marked paid in
 * the Stripe dashboard once the transfer lands), Stripe sends invoice.paid and the site delivers the pack.
 */
export async function sendLicenceInvoice(args: {
  email: string; company: string; contact: string; address: string; country: string; lines: Line[];
  description: string; customFields: { name: string; value: string }[]; metadata: Record<string, string>;
}): Promise<{ id: string; number: string | null; url: string | null }> {
  const customer = await stripePost<{ id: string }>('customers', form({
    email: args.email, name: args.company, description: `Contact: ${args.contact}`,
    'address[line1]': args.address.split('\n')[0]?.slice(0, 200), 'address[line2]': args.address.split('\n').slice(1).join(', ').slice(0, 200),
    'address[country]': args.country, 'metadata[contact]': args.contact,
  }));
  const inv = form({
    customer: customer.id, collection_method: 'send_invoice', days_until_due: 14, currency: 'usd',
    pending_invoice_items_behavior: 'exclude', description: args.description, footer: invoiceFooter(true),
    'payment_settings[payment_method_types][0]': 'card',
  });
  invoiceCustomFields(args.customFields).forEach((f, i) => { inv.append(`custom_fields[${i}][name]`, f.name); inv.append(`custom_fields[${i}][value]`, f.value); });
  for (const [k, v] of Object.entries(args.metadata)) inv.append(`metadata[${k}]`, v.slice(0, 500));
  const invoice = await stripePost<{ id: string }>('invoices', inv);
  for (const l of args.lines) {
    await stripePost('invoiceitems', form({ customer: customer.id, invoice: invoice.id, currency: 'usd', amount: l.usdCents, description: l.description ? `${l.name} · ${l.description}` : l.name }));
  }
  await stripePost(`invoices/${invoice.id}/finalize`, form({ auto_advance: 'false' }));
  const sent = await stripePost<{ id: string; number: string | null; hosted_invoice_url: string | null }>(`invoices/${invoice.id}/send`, new URLSearchParams());
  return { id: sent.id, number: sent.number, url: sent.hosted_invoice_url };
}

export async function createCheckoutSession(args: {
  lines: Line[]; email: string; successUrl: string; cancelUrl: string; metadata: Record<string, string>; reference: string;
  invoiceDescription?: string; customFields?: { name: string; value: string }[];
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
    'invoice_creation[invoice_data][description]': args.invoiceDescription,
    'invoice_creation[invoice_data][footer]': invoiceFooter(false),
  });
  invoiceCustomFields(args.customFields).forEach((f, i) => {
    body.append(`invoice_creation[invoice_data][custom_fields][${i}][name]`, f.name);
    body.append(`invoice_creation[invoice_data][custom_fields][${i}][value]`, f.value);
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

/**
 * Where the card that paid a checkout was issued, and the billing country the buyer gave, as ISO codes.
 * Used to flag reduced-price orders paid from high-income countries. Empty if Stripe does not say.
 */
export async function cardCountries(sessionId: string): Promise<{ card?: string; billing?: string }> {
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.latest_charge`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    if (!res.ok) return {};
    const d = await res.json();
    const charge = d?.payment_intent?.latest_charge;
    const card = charge?.payment_method_details?.card?.country || undefined;
    const billing = d?.customer_details?.address?.country || charge?.billing_details?.address?.country || undefined;
    return { card: card?.toUpperCase(), billing: billing?.toUpperCase() };
  } catch { return {}; }
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
