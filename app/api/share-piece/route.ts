import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { buildPieceShareEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { supabaseConfigured } from '@/lib/supabase/admin';
import { getPieceBySlug } from '@/lib/data';
import { pieceSummary } from '@/lib/pieces';
import { leadsAddress, sendFromSite } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falconbp.com').replace(/\/+$/, '');
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Anyone may email a published Professional Curiosity piece to someone: a name, an email address and the bot check.
 * The email holds only the piece's headline, summary and link, so the form cannot carry anyone's own text.
 * Limits: 10 sends an hour from one address, 3 a day to one recipient.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY || !supabaseConfigured()) return bad('The piece cannot be sent at the moment. Please try again later.', 503);

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(`share:${ip}`, 10)) return bad('Too many sends. Please try again later.', 429);

    const data = await request.json();
    if (!data.slug || !data.name || !data.email || !data.turnstileToken) return bad('Please give a name and an email address.');
    if (!(await verifyTurnstile(data.turnstileToken, process.env.TURNSTILE_SECRET_KEY || '', ip))) return bad('Bot verification failed. Please try again.');

    const name = sanitizeInput(String(data.name)).replace(/[\r\n]+/g, ' ');
    const email = sanitizeInput(String(data.email)).toLowerCase();
    if (name.length < 1 || name.length > 80) return bad('Please give a name of up to 80 characters.');
    if (/https?:|www\.|[<>]/i.test(name)) return bad('Please give a name only.');
    if (!isValidEmail(email) || email.length > 200) return bad('Please enter a valid email address.');
    if (!checkRateLimit(`share-to:${email}`, 3, 24 * 60 * 60 * 1000)) return bad('This piece has already been sent to that address today.', 429);

    const piece = await getPieceBySlug(String(data.slug));
    if (!piece) return bad('This piece is not available.', 404);

    const link = `${SITE_URL}/research/professional-curiosity/${piece.slug}`;
    const mail = buildPieceShareEmail({ name, headline: piece.content.headline, summary: pieceSummary(piece), link, replyTo: leadsAddress() });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sent = await sendFromSite('research', (from) => resend.emails.send({
      from, to: email, replyTo: leadsAddress(), subject: mail.subject, html: mail.html, text: mail.text,
    }));
    if (sent.error) { console.error('[share-piece]', sent.error); return bad('The email could not be sent. Please check the address and try again.', 502); }

    console.info('[share-piece] sent', piece.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[share-piece]', error);
    return bad('The piece could not be sent. Please try again.', 500);
  }
}
