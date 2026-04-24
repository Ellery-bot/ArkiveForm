import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/admin-auth';
import { createServerSupabase } from '@/lib/supabase-server';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get('name') as string | null;
  const ratingRaw = formData.get('rating') as string | null;
  const text = formData.get('text') as string | null;
  const date = formData.get('date') as string | null;
  const imageFile = formData.get('image') as File | null;

  const rating = ratingRaw ? Number(ratingRaw) : NaN;

  if (!name || !ratingRaw || !text || !date) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  let image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('review-images')
      .upload(fileName, buffer, { contentType: imageFile.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(fileName);
    image_url = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ name: String(name), rating, text: String(text), date: String(date), image_url }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const id = formData.get('id') as string | null;
  const name = formData.get('name') as string | null;
  const ratingRaw = formData.get('rating') as string | null;
  const text = formData.get('text') as string | null;
  const date = formData.get('date') as string | null;
  const imageFile = formData.get('image') as File | null;
  const removeImage = formData.get('remove_image') === 'true';

  if (!id || !name || !ratingRaw || !text || !date) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const rating = Number(ratingRaw);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = { name, rating, text, date };

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('review-images')
      .upload(fileName, buffer, { contentType: imageFile.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('review-images').getPublicUrl(fileName);
    updates.image_url = urlData.publicUrl;
  } else if (removeImage) {
    updates.image_url = null;
  }

  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
