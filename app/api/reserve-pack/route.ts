import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimit';
import { createAdminClient, supabaseConfigured } from '@/lib/supabase/admin';
import { hasGatedPack, type Report } from '@/lib/data';
import { reservePack } from '@/lib/packReservations';

export const dynamic = 'force-dynamic';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * A reader reserves a study's research pack before the study exists (a week placeholder: see src/lib/weekly/placeholders.ts).
 * The reservation is recorded and the reader is told the pack follows when it lands. Fulfilment is in packReservations.ts.
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseConfigured()) return bad('Reservations cannot be taken at the moment. Please write to info@falconbp.com.', 503);
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`reserve:${ip}`, 12)) return bad('Too many requests. Please try again later.', 429);

    const data = await request.json();
    if (!data.slug || !data.fullName || !data.email || !data.turnstileToken) return bad('Please complete the form.');
    if (data.consent !== true) return bad('Please confirm that we may contact you about this study.');
    if (!(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');

    const fullName = sanitizeInput(String(data.fullName));
    const email = sanitizeInput(String(data.email)).toLowerCase();
    const organisation = data.organization ? sanitizeInput(String(data.organization)).slice(0, 200) : '';
    if (!isValidEmail(email) || email.length > 200) return bad('Please enter a valid email address.');
    if (fullName.length < 2 || fullName.length > 100) return bad('Name must be between 2 and 100 characters.');

    const db = createAdminClient();
    const { data: found } = await db.from('reports').select('id, slug, title, territory, week_label, placeholder, placeholder_status, files:report_files(storage_path, access)').eq('slug', String(data.slug)).eq('published', true).maybeSingle();
    const report = found as (Pick<Report, 'id' | 'slug' | 'title' | 'territory' | 'week_label' | 'placeholder' | 'placeholder_status'> & { files?: Report['files'] }) | null;
    if (!report || !report.placeholder) return bad('This study is already available: ask for the pack on its page.', 409);
    if (report.placeholder_status === 'no-study') return bad('No study was produced for this week. Reserve on a current week instead.', 410);
    if (hasGatedPack(report.files)) return bad('The pack is being released now. Refresh the page to ask for it.', 409);

    const r = await reservePack(report, { fullName, email, organisation });
    if (!r.ok) return bad(r.error, r.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reserve-pack]', error);
    return bad('The reservation could not be processed. Please try again.', 500);
  }
}
