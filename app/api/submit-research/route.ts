import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanitizeInput, isValidEmail, verifyTurnstile } from '@/lib/security';
import { buildBrandedEmail } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendFromSite } from '@/lib/mail';

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
    if (!data.fullName || !data.email || !data.organization || !data.role || !data.turnstileToken) {
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
    const organization = sanitizeInput(data.organization);
    const role = sanitizeInput(data.role);
    const decisionContext = data.decisionContext ? sanitizeInput(data.decisionContext) : '';

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

    if (organization.length < 2 || organization.length > 200) {
      return NextResponse.json(
        { error: 'Organization must be between 2 and 200 characters' },
        { status: 400 }
      );
    }

    if (role.length < 2 || role.length > 100) {
      return NextResponse.json(
        { error: 'Role must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (decisionContext && (decisionContext.length > 1000)) {
      return NextResponse.json(
        { error: 'Decision context must not exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Send email to research team for manual review
    const fields = [
      { label: 'Full name', value: fullName },
      { label: 'Work email', value: email },
      { label: 'Organisation', value: organization },
      { label: 'Role / title', value: role },
      ...(decisionContext ? [{ label: 'Decision context', value: decisionContext }] : []),
    ];

    const emailResult = await sendFromSite('website', (from) => resend.emails.send({
      from,
      to: process.env.RESEND_RESEARCH_EMAIL || 'researchteam@falconbp.com',
      replyTo: email,
      subject: 'New Research Access Request - Manual Review Required',
      html: buildBrandedEmail({
        title: 'New research access request',
        subtitle: 'Manual review required before granting access.',
        fields,
        footerNote: 'This request requires manual review before granting access.',
      }),
    }));

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Request received. Your request is being reviewed.',
      id: emailResult.data?.id 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing research request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
