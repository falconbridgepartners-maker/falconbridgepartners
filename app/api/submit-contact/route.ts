import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing RESEND_API_KEY' },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip =
      (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit (max 5 submissions per hour per IP)
    if (!checkRateLimit(ip, 5)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.email || !data.decisionContext || !data.turnstileToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify Cloudflare Turnstile
    const isValidCaptcha = await verifyTurnstile(
      data.turnstileToken,
      process.env.TURNSTILE_SECRET_KEY || '',
      ip
    );
    if (!isValidCaptcha) {
      return NextResponse.json(
        { error: 'Bot verification failed' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const fullName = sanitizeInput(data.fullName);
    const email = sanitizeInput(data.email).toLowerCase();
    const organization = data.organization ? sanitizeInput(data.organization) : '';
    const decisionContext = sanitizeInput(data.decisionContext);
    const role = data.role ? sanitizeInput(data.role) : '';
    const region = data.region ? sanitizeInput(data.region) : '';

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate required field lengths
    if (fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (decisionContext.length < 10 || decisionContext.length > 2000) {
      return NextResponse.json(
        { error: 'Decision context must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    // Send email to engagement team
    const fields = [
      { label: 'Full name', value: fullName },
      { label: 'Work email', value: email },
      ...(organization ? [{ label: 'Organisation', value: organization }] : []),
      ...(role ? [{ label: 'Role', value: role }] : []),
      ...(region ? [{ label: 'Where they are based', value: region }] : []),
      { label: 'Decision context', value: decisionContext },
    ];

    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@notifications.falconbp.com',
      to: process.env.RESEND_CONTACT_EMAIL || 'engagement@falconbp.com',
      replyTo: email,
      subject: 'New Contact Form Submission',
      html: buildBrandedEmail({
        title: 'New contact request',
        subtitle: 'A new confidential intake request has been submitted.',
        fields,
      }),
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: emailResult.data?.id }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
