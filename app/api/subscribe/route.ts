import { Resend } from 'resend';
import { type NextRequest, NextResponse } from 'next/server';

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

  // Guard: both env vars must be set — surface misconfiguration at runtime, not build time.
  // Resend is instantiated here (not at module level) so a missing key never crashes the build.
  const apiKey    = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error('[subscribe] Missing env var —', !apiKey ? 'RESEND_API_KEY' : 'RESEND_AUDIENCE_ID');
    return NextResponse.json({ error: 'Service unavailable. Try again later.' }, { status: 503 });
  }

  // ── Store in Resend Contacts ───────────────────────────────────────────────
  // Instantiated per-request so build-time evaluation never touches the Resend SDK.
  // Resend's contacts.create is idempotent for the same email+audience pair.
  const resend = new Resend(apiKey);

  try {
    await resend.contacts.create({ email, audienceId });
    console.log(`[subscribe] ✓ Contact added: ${email}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] ✗ Resend error for', email, ':', err);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
