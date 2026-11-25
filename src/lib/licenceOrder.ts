import 'server-only';
import { sanitizeInput, isValidEmail } from '@/lib/security';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Report } from '@/lib/data';
import { LICENCES, countryName, isCountry, quote, tierFor, type LicenceId, type Quote, type Tier } from '@/lib/licencePricing';

export type LicenceOrder = {
  slug: string; licence: LicenceId; licenceName: string; licenceShort: string; country: string; countryName: string;
  company: string; fullName: string; email: string; address: string; objective: string;
};
export type PricedOrder = LicenceOrder & { report: Report; tier: Tier; q: Quote };

/** Checks a Buy page submission. Returns the clean order, or the message to show the buyer. */
export function parseOrder(data: Record<string, unknown>): { order: LicenceOrder } | { error: string } {
  if (!data.slug || !data.company || !data.fullName || !data.email || !data.address) return { error: 'Please complete the form.' };
  if (data.accepted !== true) return { error: 'Please tick to accept the terms first.' };
  const licence = LICENCES.find((l) => l.id === String(data.licence));
  if (!licence) return { error: 'Please choose a licence.' };
  const country = String(data.country || '');
  if (!isCountry(country)) return { error: 'Please choose your country of registration.' };
  const company = sanitizeInput(String(data.company)).slice(0, 200);
  const fullName = sanitizeInput(String(data.fullName)).slice(0, 100);
  const email = sanitizeInput(String(data.email)).toLowerCase();
  const address = sanitizeInput(String(data.address)).slice(0, 600);
  const objective = data.objective ? sanitizeInput(String(data.objective)).slice(0, 1000) : '';
  if (!isValidEmail(email) || email.length > 200) return { error: 'Please enter a valid email address.' };
  if (company.length < 2 || fullName.length < 2 || address.length < 5) return { error: 'Please complete your company, name and invoice address.' };
  if (licence.id === 't2' && objective.length < 5) return { error: 'Please state the objective the Single Use licence is for.' };
  return { order: { slug: String(data.slug), licence: licence.id, licenceName: licence.name, licenceShort: licence.short, country, countryName: countryName(country), company, fullName, email, address, objective } };
}

/** Finds the study and works out the price on the server. Null if the study cannot be licensed online. */
export async function priceOrder(order: LicenceOrder): Promise<PricedOrder | null> {
  const db = createAdminClient();
  const { data } = await db.from('reports').select('*').eq('slug', order.slug).eq('published', true).maybeSingle();
  const report = data as Report | null;
  if (!report || report.kind !== 'study') return null;
  const tier = tierFor(report.published_at);
  return { ...order, report, tier, q: quote(order.licence, tier, order.country) };
}

/** Keeps the request in licence_requests (supabase/013). Logs and carries on if the table is not there yet. */
export async function recordOrder(o: PricedOrder, extra: Record<string, unknown> = {}): Promise<{ duplicate: boolean }> {
  const db = createAdminClient();
  const { error } = await db.from('licence_requests').insert({
    report_id: o.report.id, licence: o.licence, tier: o.tier, country: o.country, price_band: o.q.reduced ? 'reduced' : 'standard',
    fee_usd: o.q.usd, vat_usd: o.q.vat, total_usd: o.q.total, company: o.company, full_name: o.fullName, email: o.email,
    invoice_address: o.address, stated_objective: o.objective || null, terms_version: '1.0', accepted_at: new Date().toISOString(), ...extra,
  });
  // 23505: this Stripe session was already recorded (Stripe sent the same event twice).
  if (error?.code === '23505') return { duplicate: true };
  if (error) console.error('[licence] record (the email is the record)', error);
  return { duplicate: false };
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** The order as the rows of the email to the firm. */
export function orderFields(o: PricedOrder) {
  return [
    { label: 'Licence', value: o.licenceName },
    { label: 'Study', value: o.report.title },
    { label: 'Company', value: o.company }, { label: 'Name', value: o.fullName }, { label: 'Email', value: o.email },
    { label: 'Invoice address', value: o.address },
    { label: 'Country of registration', value: `${o.countryName} · ${o.q.reduced ? 'reduced price' : 'standard price'}` },
    ...(o.objective ? [{ label: 'Stated objective', value: o.objective }] : []),
    { label: 'Licence fee', value: `US$${fmt(o.q.usd)}` },
    { label: 'VAT', value: o.q.uae ? `UAE VAT 5%: US$${fmt(o.q.vat)}` : 'Not charged (outside the UAE)' },
    { label: 'Total', value: `US$${fmt(o.q.total)}` },
    { label: 'Terms accepted', value: 'Research Licences v1.0, including the Common Terms' },
  ];
}
