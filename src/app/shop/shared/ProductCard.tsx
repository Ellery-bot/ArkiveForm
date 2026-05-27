'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PINK, BG_COLORS } from './shop-constants';
import type { Product } from './shop-types';

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (p: Product, qty: number) => void;
  showDirectCheckout?: boolean;
}

export default function ProductCard({
  product,
  index,
  onAddToCart,
  showDirectCheckout = false,
}: ProductCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [checkoutHovered, setCheckoutHovered] = useState(false);
  const [qty, setQty] = useState(1);
  const [checkingOut, setCheckingOut] = useState(false);

  const bg = BG_COLORS[index % BG_COLORS.length];
  const salePrice = product.original_price != null && product.original_price > product.price;
  const isSoldOut = !product.active || product.quantity === 0;

  const handleDirectCheckout = useCallback(async () => {
    if (isSoldOut || checkingOut) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: product.id, title: product.title, price: product.price, quantity: qty }],
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error ?? 'Checkout failed. Please try again.'); return; }
      router.push(`/checkout/invoice?order_id=${data.orderId}`);
    } catch {
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  }, [isSoldOut, checkingOut, product, qty, router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image / color block */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1',
          background: product.image_url ? 'transparent' : bg,
          backgroundImage: product.image_url ? `url(${product.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '12px',
        }}
      >
        {!product.image_url && (
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
            {product.title}
          </span>
        )}
        {!isSoldOut && salePrice && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: PINK,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '40px',
            }}
          >
            Sale
          </span>
        )}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#111', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '13px', fontWeight: 400, margin: '0 0 6px', lineHeight: 1.4, color: '#121212' }}>
          {product.title}
        </h3>
        <div style={{ marginBottom: '10px' }}>
          {salePrice && (
            <s style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '2px' }}>
              ₱{product.original_price!.toFixed(2)}
            </s>
          )}
          <span style={{ fontSize: '13px', fontWeight: 600, color: salePrice ? PINK : '#121212' }}>
            ₱{product.price.toFixed(2)}
          </span>
          <span style={{ fontSize: '11px', color: product.quantity <= 5 ? '#dc2626' : '#888', display: 'block', marginTop: '4px' }}>
            {!isSoldOut ? `${product.quantity} left in stock` : ''}
          </span>
        </div>

        {/* Quantity selector */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            disabled={isSoldOut}
            style={{ width: '26px', height: '26px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '14px', cursor: isSoldOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isSoldOut ? 0.4 : 1 }}
          >−</button>
          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '20px', textAlign: 'center', color: '#121212' }}>{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
            disabled={isSoldOut}
            style={{ width: '26px', height: '26px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '14px', cursor: isSoldOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isSoldOut ? 0.4 : 1 }}
          >+</button>
        </div>

        {/* Add to cart */}
        <button
          onClick={() => { if (!isSoldOut) { onAddToCart(product, qty); setQty(1); } }}
          onMouseEnter={() => !isSoldOut && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={isSoldOut}
          style={{
            width: '100%',
            padding: '8px',
            border: `1px solid ${isSoldOut ? '#ccc' : PINK}`,
            background: isSoldOut ? '#f5f5f5' : hovered ? PINK : 'transparent',
            color: isSoldOut ? '#aaa' : hovered ? '#fff' : '#121212',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.2s',
            letterSpacing: '0.04em',
            marginTop: 'auto',
            cursor: isSoldOut ? 'not-allowed' : 'pointer',
          }}
        >
          {isSoldOut ? 'Sold Out' : 'Add to cart'}
        </button>

        {/* Direct checkout (shop all page only) */}
        {showDirectCheckout && !isSoldOut && (
          <button
            onClick={handleDirectCheckout}
            onMouseEnter={() => setCheckoutHovered(true)}
            onMouseLeave={() => setCheckoutHovered(false)}
            disabled={checkingOut}
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              background: checkoutHovered ? '#0e1680' : PINK,
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
              marginTop: '6px',
              cursor: checkingOut ? 'not-allowed' : 'pointer',
              opacity: checkingOut ? 0.7 : 1,
            }}
          >
            {checkingOut ? 'Processing...' : 'Check Out'}
          </button>
        )}
      </div>
    </div>
  );
}
