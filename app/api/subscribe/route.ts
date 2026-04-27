import { Resend } from 'resend';
import { type NextRequest, NextResponse } from 'next/server';

// Initialize once — Resend client is stateless and safe to reuse across requests
const resend = new Resend(process.env.RESEND_API_KEY);

// RFC-5322-lite: catches obvious malformed emails without being a regex monstrosity
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // ── Parse ──────────────────────────────────────────────────────────────────
  let email: string;
  try {
    const body = await req.json() as { email?: unknown };
    email = typeof body.email === 'string' ? body.email.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  // Guard: audience ID must be configured in env — fail loudly at startup, not silently
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.error('[subscribe] RESEND_AUDIENCE_ID is not set in environment variables');
    return NextResponse.json({ error: 'Service unavailable. Try again later.' }, { status: 503 });
  }

  // ── Store in Resend Contacts ───────────────────────────────────────────────
  // Resend's contacts.create is idempotent for the same email+audience pair,
  // so duplicate signups are handled gracefully without extra checks here.
  try {
    await resend.contacts.create({ email, audienceId });
    console.log(`[subscribe] ✓ Contact added: ${email}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    // Log the full error server-side for traceability; never expose internals to the client
    console.error('[subscribe] ✗ Resend error for', email, ':', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
