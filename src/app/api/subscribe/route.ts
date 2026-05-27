import { NextResponse } from 'next/server';

// SUBSCRIBE FEATURE — commented out for now. Uncomment the full implementation below when ready.

export async function POST() {
  return NextResponse.json({ error: 'This feature is not available yet.' }, { status: 503 });
}

/*
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: email.trim().toLowerCase() }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This email is already subscribed.' }, { status: 409 });
      }
      console.error('Subscribe error:', error);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
*/
