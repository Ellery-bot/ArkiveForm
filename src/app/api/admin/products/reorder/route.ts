import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/admin-auth';
import { createServerSupabase } from '@/lib/supabase-server';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value;
  return verifySessionToken(token);
}

/**
 * POST /api/admin/products/reorder
 * Batch-update sort_order for a list of products.
 * Body: { updates: { id: string; sort_order: number }[] }
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: { id: string; sort_order: number }[] = body?.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Update each product's sort_order individually — Supabase JS v2 has no
    // bulk-upsert on arbitrary rows without a unique constraint workaround.
    const results = await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from('products').update({ sort_order }).eq('id', id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error reordering products:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
