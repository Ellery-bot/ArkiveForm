import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Returns all active products
 * Query params:
 *  - category: filter by category (preorder, onhand, lightsticks, photocards)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.contains('categories', [category]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
