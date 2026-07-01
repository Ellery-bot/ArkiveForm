import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/admin-auth';
import { createServerSupabase } from '@/lib/supabase-server';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value;
  return verifySessionToken(token);
}

/**
 * GET /api/admin/categories
 * Returns all category names
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

/**
 * POST /api/admin/categories
 * Add a new category
 * Body: { name: string }
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = (body?.name ?? '').trim().toLowerCase().replace(/\s+/g, '-');

  if (!name) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    return NextResponse.json(
      { error: 'Category name may only contain letters, numbers, and hyphens.' },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from('categories').insert({ name });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/categories
 * Remove a category by name
 * Body: { name: string }
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const name = (body?.name ?? '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from('categories').delete().eq('name', name);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
