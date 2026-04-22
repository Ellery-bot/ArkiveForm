import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, rating, text, date')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json([], { status: 200 });
  }
  return NextResponse.json(data ?? []);
}
