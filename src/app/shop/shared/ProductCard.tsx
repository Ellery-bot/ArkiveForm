'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

  // Build image list — prefer image_urls array, fall back to single image_url
  const images: string[] =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url
      ? [product.image_url]
      : [];

  const [imgIndex, setImgIndex] = useState(0);
  const [imgHovered, setImgHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  // true when the last touch moved enough to count as a swipe (not a tap)
  const didSwipe = useRef(false);

  const prevImg = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); },
    [images.length],
  );
  const nextImg = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); },
    [images.length],
  );
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    didSwipe.current = false;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      didSwipe.current = true;
      diff > 0 ? setImgIndex(i => (i + 1) % images.length) : setImgIndex(i => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

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

  const detailHref = `/shop/product/${product.id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image / color block — click navigates to product detail (unless the user swiped) */}
      <div
        style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: images.length === 0 ? bg : '#f0f0f0', flexShrink: 0, cursor: 'pointer' }}
        onClick={() => { if (!didSwipe.current) router.push(detailHref); }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <div
            style={{
              display: 'flex',
              width: `${images.length * 100}%`,
              height: '100%',
              transform: `translateX(-${imgIndex * (100 / images.length)}%)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {images.map((url, i) => (
              <div
                key={i}
                style={{
                  width: `${100 / images.length}%`,
                  height: '100%',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Image
                  src={url}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                  style={{ objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box' }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
              {product.title}
            </span>
          </div>
        )}

        {/* Prev / Next arrows — desktop hover */}
        {images.length > 1 && imgHovered && (
          <>
            <button
              onClick={prevImg}
              style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
            >‹</button>
            <button
              onClick={nextImg}
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
            >›</button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 3 }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={() => setImgIndex(i)}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
              />
            ))}
          </div>
        )}

        {!isSoldOut && salePrice && (
          <span
            style={{
              position: 'absolute',
              bottom: images.length > 1 ? '22px' : '8px',
              left: '8px',
              background: PINK,
              color: '#fff',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '40px',
              zIndex: 4,
            }}
          >
            Sale
          </span>
        )}
        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
            <span style={{ background: '#111', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '13px', fontWeight: 400, margin: '0 0 6px', lineHeight: 1.4, color: '#121212', minHeight: '7em' }}>
          <Link href={detailHref} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.title}
          </Link>
        </h3>
        <div style={{ marginBottom: '10px', minHeight: '56px' }}>
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
