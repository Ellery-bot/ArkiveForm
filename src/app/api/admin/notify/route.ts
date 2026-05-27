import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/admin-auth';

// NOTIFY SUBSCRIBERS FEATURE — commented out for now. Uncomment the full implementation below when ready.

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ error: 'This feature is not available yet.' }, { status: 503 });
}

/*
FULL IMPLEMENTATION — uncomment when ready:

import { Resend } from 'resend';
import { createServerSupabase } from '@/lib/supabase-server';

const SHOP_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arkivemarket.com';

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
  }

  try {
    const { subject, message } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: subscribers, error } = await supabase.from('subscribers').select('email');
    if (error) return NextResponse.json({ error: 'Failed to fetch subscribers.' }, { status: 500 });
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers to notify.' }, { status: 400 });
    }

    const resend = new Resend(resendKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'Arkive Market <noreply@arkivemarket.com>';
    const emailHtml = `...`;  // full HTML template was here
    const emails = subscribers.map((s) => s.email as string);

    const batchSize = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await resend.emails.send({ from: fromAddress, to: batch, subject: subject.trim(), html: emailHtml });
      sent += batch.length;
    }
    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error('Notify error:', err);
    return NextResponse.json({ error: 'Failed to send emails.' }, { status: 500 });
  }
}
*/
