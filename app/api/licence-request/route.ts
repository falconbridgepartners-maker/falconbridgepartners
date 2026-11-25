import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';
import { territoryName, type Report } from '@/lib/data';
import { LICENCES, countryName, isCountry, quote, tierFor, type LicenceId } from '@/lib/licencePricing';
import { leadsAddress, sendFromSite } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const fmt = (n: number) => n.toLocaleString('en-US');
/** Licence requests also go to the managing partner who issues the invoice. */
const INVOICING = 'joel@falconbp.com';

/**
 * A buyer requests a business licence for a ready-made study (step 1: invoice, no card payment).
 * The price is worked out here from the price list, never taken from the browser. The request is logged when the
 * licence_requests table exists (supabase/013_licence_requests.sql); the email to the firm is the record either way.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !supabaseConfigured()) return bad('Licences cannot be requested at the moment. Please write to joel@falconbp.com.', 503);

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`licence:${ip}`, 8)) return bad('Too many requests. Please try again later.', 429);

    const data = await request.json();
    if (!data.slug || !data.company || !data.fullName || !data.email || !data.address || !data.turnstileToken) return bad('Please complete the form.');
    if (data.accepted !== true) return bad('Please tick to accept the terms first.');
    const licenceId = String(data.licence) as LicenceId;
    const licence = LICENCES.find((l) => l.id === licenceId);
    if (!licence) return bad('Please choose a licence.');
    const country = String(data.country || '');
    if (!isCountry(country)) return bad('Please choose your country of registration.');
    if (!(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');

    const company = sanitizeInput(String(data.company)).slice(0, 200);
    const fullName = sanitizeInput(String(data.fullName)).slice(0, 100);
    const email = sanitizeInput(String(data.email)).toLowerCase();
    const address = sanitizeInput(String(data.address)).slice(0, 600);
    const objective = data.objective ? sanitizeInput(String(data.objective)).slice(0, 1000) : '';
    if (!isValidEmail(email) || email.length > 200) return bad('Please enter a valid email address.');
    if (company.length < 2 || fullName.length < 2 || address.length < 5) return bad('Please complete your company, name and invoice address.');
    if (licenceId === 't2' && objective.length < 5) return bad('Please state the objective the Single Use licence is for.');

    const db = createAdminClient();
    const { data: found } = await db.from('reports').select('*').eq('slug', String(data.slug)).eq('published', true).maybeSingle();
    const report = found as Report | null;
    if (!report || report.kind !== 'study') return bad('This study cannot be licensed online. Please write to joel@falconbp.com.', 404);

    const tier = tierFor(report.published_at);
    const q = quote(licenceId, tier, country);
    const place = countryName(country);

    const { error: insertError } = await db.from('licence_requests').insert({
      report_id: report.id, licence: licenceId, tier, country, price_band: q.reduced ? 'reduced' : 'standard',
      fee_usd: q.usd, vat_usd: q.vat, total_usd: q.total, company, full_name: fullName, email, invoice_address: address,
      stated_objective: objective || null, terms_version: '1.0', accepted_at: new Date().toISOString(),
    });
    if (insertError) console.error('[licence-request] insert (the email below is the record)', insertError);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = Array.from(new Set([leadsAddress().toLowerCase(), INVOICING]));
    const firm = await sendFromSite('website', (from) => resend.emails.send({
      from, to, replyTo: email,
      subject: `Licence request: ${licence.short} · ${report.title} — ${company}`,
      html: buildBrandedEmail({
        title: 'A research licence was requested',
        subtitle: `${report.title} · ${territoryName[report.territory] ?? report.territory} · ${tier === 'back' ? 'Back catalogue' : 'New report'}`,
        fields: [
          { label: 'Licence', value: licence.name },
          { label: 'Company', value: company }, { label: 'Name', value: fullName }, { label: 'Email', value: email },
          { label: 'Invoice address', value: address },
          { label: 'Country of registration', value: `${place} · ${q.reduced ? 'reduced price' : 'standard price'}` },
          ...(objective ? [{ label: 'Stated objective', value: objective }] : []),
          { label: 'Licence fee', value: `US$${fmt(q.usd)}` },
          { label: 'VAT', value: q.uae ? `UAE VAT 5%: US$${fmt(q.vat)}` : 'Not charged (outside the UAE)' },
          { label: 'Total to invoice', value: `US$${fmt(q.total)}` },
          { label: 'Terms accepted', value: 'Research Licences v1.0, including the Common Terms' },
        ],
        footerNote: 'Issue the invoice to the buyer and deliver the report with its licence statement once payment is received. Reply to this message to write to the buyer.',
      }),
    }));
    if (firm.error) { console.error('[licence-request] firm email', firm.error); return bad('The request could not be sent. Please try again or write to joel@falconbp.com.', 502); }

    try {
      await sendFromSite('research', (from) => resend.emails.send({
        from, to: email, replyTo: INVOICING,
        subject: `Your licence request: ${report.title}`,
        html: buildBrandedEmail({
          title: 'Your licence request is with us',
          subtitle: report.title,
          fields: [
            { label: 'Licence', value: licence.name },
            { label: 'Licensee', value: company },
            ...(objective ? [{ label: 'Stated objective', value: objective }] : []),
            { label: 'Total', value: `US$${fmt(q.total)}${q.uae ? ' including UAE VAT 5%' : ''}` },
          ],
          footerNote: 'Your invoice follows by email. The report is delivered with its licence statement as soon as payment is received. The full terms are at falconbp.com/legal/research-licences.',
        }),
      }));
    } catch (e) { console.error('[licence-request] buyer email', e); /* the firm has the request */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[licence-request]', error);
    return bad('The request could not be processed. Please try again.', 500);
  }
}
