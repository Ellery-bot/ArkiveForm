import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

interface CheckoutItem {
  productId: string;
  quantity: number;
  title: string;
  price: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  customerEmail?: string;
  customerName?: string;
}

/**
 * GET /api/checkout?order_id=xxx
 * Fetch a single order by ID (used by the invoice page)
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

/**
 * POST /api/checkout
 * Create a pending order and return the order ID for the invoice page
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of body.items) {
      if (!item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }
      totalAmount += item.price * item.quantity;
    }

    const supabase = createServerSupabase();

    // Validate stock for each item
    const productIds = body.items.map((i) => i.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, title, quantity')
      .in('id', productIds);

    if (products) {
      for (const item of body.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          return NextResponse.json({ error: `Product "${item.title}" is no longer available.` }, { status: 400 });
        }
        if (item.quantity > product.quantity) {
          return NextResponse.json(
            { error: `"${product.title}" only has ${product.quantity} left in stock. Please adjust your cart.` },
            { status: 400 }
          );
        }
      }
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          status: 'pending',
          total_amount: totalAmount,
          customer_email: body.customerEmail ?? null,
          customer_name: body.customerName ?? null,
          items: body.items,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ orderId: orderData.id }, { status: 201 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
