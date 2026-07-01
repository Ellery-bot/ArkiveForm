import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 * Public route — returns all category names sorted alphabetically
 */
export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map((row) => row.name));
}
