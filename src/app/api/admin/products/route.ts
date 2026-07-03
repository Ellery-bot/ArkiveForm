import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/admin-auth';
import { createServerSupabase } from '@/lib/supabase-server';

function isAuthorized(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value;
  return verifySessionToken(token);
}

/**
 * GET /api/admin/products
 * Returns all products (admin only)
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/products
 * Create a new product
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const originalPrice = formData.get('originalPrice') as string | null;
    const categoriesRaw = formData.get('categories') as string | null;
    const imageFiles = formData.getAll('images') as File[];
    const active = formData.get('active') === 'true';
    const quantityRaw = formData.get('quantity') as string | null;

    // Validation
    if (!title || !price || !categoriesRaw) {
      return NextResponse.json(
        { error: 'Title, price, and categories are required' },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const quantityNum = quantityRaw !== null ? parseInt(quantityRaw) : NaN;
    if (isNaN(quantityNum) || quantityNum < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }

    let categories: string[] = [];
    try {
      categories = JSON.parse(categoriesRaw);
      if (!Array.isArray(categories)) {
        categories = [];
      }
    } catch {
      categories = [];
    }

    const supabase = createServerSupabase();
    const imageUrls: string[] = [];

    // Upload images if provided
    if (imageFiles && imageFiles.length > 0) {
      // Ensure bucket exists (creates it if missing)
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === 'product-images');
      if (!bucketExists) {
        await supabase.storage.createBucket('product-images', { public: true });
      }

      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, { contentType: imageFile.type });

          if (uploadError) {
            return NextResponse.json(
              { error: `Image upload failed: ${uploadError.message}` },
              { status: 500 }
            );
          }

          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrls.push(urlData.publicUrl);
        }
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          title,
          description,
          price: priceNum,
          original_price: originalPrice ? parseFloat(originalPrice) : null,
          categories,
          image_url: imageUrls[0] ?? null,
          image_urls: imageUrls,
          active,
          quantity: quantityNum,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products
 * Update a product
 */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const id = formData.get('id') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const originalPrice = formData.get('originalPrice') as string | null;
    const categoriesRaw = formData.get('categories') as string | null;
    const imageFiles = formData.getAll('images') as File[];
    const existingImageUrlsRaw = formData.get('existingImageUrls') as string | null;
    const active = formData.get('active') === 'true';
    const quantityRaw = formData.get('quantity') as string | null;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Get current product state
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      updateData.price = priceNum;
    }
    if (originalPrice !== undefined) {
      updateData.original_price = originalPrice ? parseFloat(originalPrice) : null;
    }
    if (categoriesRaw) {
      try {
        const categories = JSON.parse(categoriesRaw);
        if (Array.isArray(categories)) {
          updateData.categories = categories;
        }
      } catch {
        // Ignore parse errors
      }
    }
    updateData.active = active;

    if (quantityRaw !== null && quantityRaw !== '') {
      const quantityNum = parseInt(quantityRaw);
      if (!isNaN(quantityNum) && quantityNum >= 0) {
        updateData.quantity = quantityNum;
      }
    }

    let existingImageUrls: string[] = [];
    if (existingImageUrlsRaw) {
      try {
        existingImageUrls = JSON.parse(existingImageUrlsRaw);
      } catch {
        // ignore
      }
    }

    // Delete images that were removed
    const currentImageUrls = product?.image_urls ?? [];
    const imagesToDelete = currentImageUrls.filter((url: string) => !existingImageUrls.includes(url));
    if (imagesToDelete.length > 0) {
      const fileNamesToDelete = imagesToDelete.map((url: string) => url.split('/').pop() as string);
      await supabase.storage.from('product-images').remove(fileNamesToDelete);
    }
    
    // Handle image uploads
    const newImageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === 'product-images');
      if (!bucketExists) {
        await supabase.storage.createBucket('product-images', { public: true });
      }

      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, { contentType: imageFile.type });

          if (uploadError) {
            return NextResponse.json(
              { error: `Image upload failed: ${uploadError.message}` },
              { status: 500 }
            );
          }

          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          newImageUrls.push(urlData.publicUrl);
        }
      }
    }

    const finalImageUrls = [...existingImageUrls, ...newImageUrls];
    updateData.image_urls = finalImageUrls;
    updateData.image_url = finalImageUrls[0] ?? null;


    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products
 * Delete a product
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
