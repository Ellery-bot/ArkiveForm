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

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (body.items.length > 50) {
      return NextResponse.json({ error: 'Too many items in cart' }, { status: 400 });
    }

    // Validate structure only — prices are NEVER trusted from the client
    for (const item of body.items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }
    }

    // Sanitize optional text fields
    const customerName = body.customerName ? String(body.customerName).trim().slice(0, 100) : null;
    const customerEmail = body.customerEmail ? String(body.customerEmail).trim().slice(0, 200) : null;

    const supabase = createServerSupabase();

    // Fetch authoritative prices and stock from the database
    const productIds = body.items.map((i) => i.productId);
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, quantity')
      .in('id', productIds);

    let totalAmount = 0;
    const validatedItems: CheckoutItem[] = [];

    for (const item of body.items) {
      const product = products?.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `A product in your cart is no longer available.` }, { status: 400 });
      }
      if (item.quantity > product.quantity) {
        return NextResponse.json(
          { error: `"${product.title}" only has ${product.quantity} left in stock. Please adjust your cart.` },
          { status: 400 }
        );
      }
      totalAmount += product.price * item.quantity;
      validatedItems.push({
        productId: item.productId,
        title: product.title,
        price: product.price, // store authoritative DB price in order snapshot
        quantity: item.quantity,
      });
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          status: 'pending',
          total_amount: totalAmount,
          customer_email: customerEmail,
          customer_name: customerName,
          items: validatedItems,
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
