'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ShopShell from '../../shared/ShopShell';
import { PINK, FONT } from '../../shared/shop-constants';
import type { Product } from '../../shared/shop-types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [checkingOut, setCheckingOut] = useState(false);
  const [added, setAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Touch swipe for image gallery
  const touchStartX = useRef<number | null>(null);

  // Lightbox zoom & pan
  const [lbZoom, setLbZoom] = useState(1);
  const [lbPan, setLbPan] = useState({ x: 0, y: 0 });
  const [lbDragging, setLbDragging] = useState(false);
  const lbDragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0, moved: false });
  const lbPinchRef = useRef({ active: false, startDist: 0, startZoom: 1 });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset zoom when switching images or closing lightbox
  useEffect(() => { setLbZoom(1); setLbPan({ x: 0, y: 0 }); }, [activeImg]);
  useEffect(() => { if (!lightboxOpen) { setLbZoom(1); setLbPan({ x: 0, y: 0 }); } }, [lightboxOpen]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => { if (d) { setProduct(d); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const handleDirectCheckout = useCallback(async () => {
    if (!product || checkingOut) return;
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
  }, [product, checkingOut, qty, router]);

  return (
    <ShopShell loading={loading}>
      {(onAddToCart) => {
        if (loading) {
          return <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>Loading…</div>;
        }
        if (notFound || !product) {
          return (
            <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px' }}>🔍</div>
              <p style={{ fontWeight: 700, fontSize: '18px', color: '#121212', margin: 0 }}>Product not found</p>
              <button
                onClick={() => router.push('/shop')}
                style={{ marginTop: '8px', padding: '10px 24px', background: PINK, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: '13px', fontWeight: 600 }}
              >
                Back to shop
              </button>
            </div>
          );
        }

        const images: string[] =
          product.image_urls && product.image_urls.length > 0
            ? product.image_urls
            : product.image_url
            ? [product.image_url]
            : [];

        const isSoldOut = !product.active || product.quantity === 0;
        const salePrice = product.original_price != null && product.original_price > product.price;
        const lowStock = !isSoldOut && product.quantity <= 5;

        return (
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px 16px 48px' : '32px 20px 60px' }}>
            {/* Back link */}
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', fontFamily: FONT, padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            {/* Two-column layout on desktop, stacked on mobile */}
            <div className="product-detail-layout">
              {/* ── Left: image gallery ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Main image */}
                <div
                  style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: images.length === 0 ? PINK : '#f5f5f5', borderRadius: '4px', maxHeight: isMobile ? '260px' : 'none', cursor: images.length > 0 ? 'zoom-in' : 'default' }}
                  onClick={() => { if (images.length > 0) setLightboxOpen(true); }}
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                  onTouchEnd={(e) => {
                    if (touchStartX.current === null) return;
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 30) {
                      if (diff > 0) setActiveImg((i) => (i + 1) % images.length);
                      else setActiveImg((i) => (i - 1 + images.length) % images.length);
                    }
                    touchStartX.current = null;
                  }}
                >
                  {images.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        width: `${images.length * 100}%`,
                        height: '100%',
                        transform: `translateX(-${activeImg * (100 / images.length)}%)`,
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
                            backgroundImage: `url(${url})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '14px' }}>No image</span>
                    </div>
                  )}

                  {/* Prev / Next arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                        style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % images.length); }}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </>
                  )}

                  {/* Sale badge */}
                  {salePrice && !isSoldOut && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: PINK, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '40px', zIndex: 4 }}>
                      Sale
                    </span>
                  )}
                  {isSoldOut && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                      <span style={{ background: '#111', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '6px 18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sold Out</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        style={{
                          flexShrink: 0,
                          width: '64px',
                          height: '64px',
                          borderRadius: '4px',
                          border: i === activeImg ? `2px solid ${PINK}` : '2px solid transparent',
                          background: '#f5f5f5',
                          backgroundImage: `url(${url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'border-color 0.2s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Lightbox ── */}
              {lightboxOpen && (
                <div
                  onClick={() => { if (lbZoom === 1) setLightboxOpen(false); }}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.92)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setLightboxOpen(false)}
                    style={{ position: 'absolute', top: '16px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', lineHeight: 1, zIndex: 4 }}
                    aria-label="Close"
                  >
                    ×
                  </button>

                  {/* Image — click/tap to zoom in · drag to pan · pinch on mobile */}
                  <img
                    src={images[activeImg]}
                    alt={product.title}
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      lbDragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panX: lbPan.x, panY: lbPan.y, moved: false };
                      setLbDragging(true);
                    }}
                    onMouseMove={(e) => {
                      if (!lbDragRef.current.active) return;
                      const dx = e.clientX - lbDragRef.current.startX;
                      const dy = e.clientY - lbDragRef.current.startY;
                      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragRef.current.moved = true;
                      if (lbZoom > 1) setLbPan({ x: lbDragRef.current.panX + dx, y: lbDragRef.current.panY + dy });
                    }}
                    onMouseUp={() => {
                      const moved = lbDragRef.current.moved;
                      lbDragRef.current.active = false;
                      setLbDragging(false);
                      if (!moved) {
                        if (lbZoom > 1) { setLbZoom(1); setLbPan({ x: 0, y: 0 }); }
                        else setLbZoom(2.5);
                      }
                    }}
                    onMouseLeave={() => { lbDragRef.current.active = false; setLbDragging(false); }}
                    onTouchStart={(e) => {
                      if (e.touches.length === 2) {
                        const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                        lbPinchRef.current = { active: true, startDist: dist, startZoom: lbZoom };
                        lbDragRef.current.active = false;
                      } else if (e.touches.length === 1) {
                        lbDragRef.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, panX: lbPan.x, panY: lbPan.y, moved: false };
                      }
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length === 2 && lbPinchRef.current.active) {
                        const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
                        const newZoom = Math.min(4, Math.max(1, lbPinchRef.current.startZoom * (dist / lbPinchRef.current.startDist)));
                        setLbZoom(newZoom);
                        if (newZoom <= 1) setLbPan({ x: 0, y: 0 });
                      } else if (e.touches.length === 1 && lbDragRef.current.active && lbZoom > 1) {
                        const dx = e.touches[0].clientX - lbDragRef.current.startX;
                        const dy = e.touches[0].clientY - lbDragRef.current.startY;
                        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) lbDragRef.current.moved = true;
                        setLbPan({ x: lbDragRef.current.panX + dx, y: lbDragRef.current.panY + dy });
                      }
                    }}
                    onTouchEnd={(e) => {
                      const moved = lbDragRef.current.moved;
                      const wasPinch = lbPinchRef.current.active;
                      lbDragRef.current.active = false;
                      lbPinchRef.current.active = false;
                      if (!moved && !wasPinch && e.changedTouches.length === 1) {
                        if (lbZoom > 1) { setLbZoom(1); setLbPan({ x: 0, y: 0 }); }
                        else setLbZoom(2.5);
                      }
                    }}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      borderRadius: '4px',
                      userSelect: 'none',
                      touchAction: 'none',
                      cursor: lbZoom > 1 ? (lbDragging ? 'grabbing' : 'grab') : 'zoom-in',
                      transform: `scale(${lbZoom}) translate(${lbPan.x / lbZoom}px, ${lbPan.y / lbZoom}px)`,
                      transformOrigin: 'center',
                      transition: lbDragging ? 'none' : 'transform 0.2s ease',
                    }}
                  />

                  {/* Reset zoom pill */}
                  {lbZoom > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLbZoom(1); setLbPan({ x: 0, y: 0 }); }}
                      style={{ position: 'absolute', bottom: '64px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '11px', padding: '5px 14px', borderRadius: '20px', cursor: 'pointer', zIndex: 4, whiteSpace: 'nowrap', fontFamily: FONT }}
                    >
                      Reset zoom
                    </button>
                  )}

                  {/* Prev arrow */}
                  {images.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLbZoom(1); setLbPan({ x: 0, y: 0 }); setActiveImg((i) => (i - 1 + images.length) % images.length); }}
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                      aria-label="Previous image"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                  )}

                  {/* Next arrow */}
                  {images.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLbZoom(1); setLbPan({ x: 0, y: 0 }); setActiveImg((i) => (i + 1) % images.length); }}
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
                      aria-label="Next image"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  )}

                  {/* Dot counter */}
                  {images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setLbZoom(1); setLbPan({ x: 0, y: 0 }); setActiveImg(i); }}
                          style={{ width: i === activeImg ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', padding: 0, cursor: 'pointer', transition: 'width 0.2s, background 0.2s' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Right: product info ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                {/* Title */}
                <h1 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 700, color: '#121212', margin: 0, lineHeight: 1.4, fontFamily: FONT }}>
                  {product.title}
                </h1>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: salePrice ? PINK : '#121212', fontFamily: FONT }}>
                    ₱{product.price.toFixed(2)}
                  </span>
                  {salePrice && (
                    <s style={{ fontSize: isMobile ? '12px' : '13px', color: '#aaa', fontFamily: FONT }}>
                      ₱{product.original_price!.toFixed(2)}
                    </s>
                  )}
                  {salePrice && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>
                      -{Math.round((1 - product.price / product.original_price!) * 100)}%
                    </span>
                  )}
                </div>

                {/* Stock */}
                <p style={{ margin: 0, fontSize: '12px', color: lowStock ? '#dc2626' : '#888', fontFamily: FONT }}>
                  {isSoldOut ? 'Out of stock' : lowStock ? `Only ${product.quantity} left in stock` : `${product.quantity} in stock`}
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: 0 }} />

                {/* Description */}
                {product.description && (
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: FONT }}>Description</p>
                    <p style={{ margin: 0, fontSize: isMobile ? '12px' : '14px', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: FONT }}>
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Quantity selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#555', fontFamily: FONT }}>Qty</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={isSoldOut}
                      style={{ width: isMobile ? '28px' : '30px', height: isMobile ? '28px' : '30px', border: 'none', background: '#f5f5f5', fontSize: isMobile ? '13px' : '14px', cursor: isSoldOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSoldOut ? 0.4 : 1 }}
                    >−</button>
                    <span style={{ minWidth: isMobile ? '28px' : '30px', textAlign: 'center', fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: '#121212', fontFamily: FONT }}>{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                      disabled={isSoldOut}
                      style={{ width: isMobile ? '28px' : '30px', height: isMobile ? '28px' : '30px', border: 'none', background: '#f5f5f5', fontSize: isMobile ? '13px' : '14px', cursor: isSoldOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSoldOut ? 0.4 : 1 }}
                    >+</button>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (isSoldOut) return;
                      onAddToCart(product, qty);
                      setAdded(true);
                      setTimeout(() => setAdded(false), 2000);
                    }}
                    disabled={isSoldOut}
                    style={{
                      padding: isMobile ? '10px' : '11px',
                      border: `1.5px solid ${isSoldOut ? '#ccc' : PINK}`,
                      background: added ? PINK : 'transparent',
                      color: added ? '#fff' : isSoldOut ? '#aaa' : '#121212',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: 600,
                      cursor: isSoldOut ? 'not-allowed' : 'pointer',
                      fontFamily: FONT,
                      letterSpacing: '0.04em',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isSoldOut ? 'Sold Out' : added ? '✓ Added to cart' : 'Add to Cart'}
                  </button>

                  {!isSoldOut && (
                    <button
                      onClick={handleDirectCheckout}
                      disabled={checkingOut}
                      style={{
                        padding: isMobile ? '10px' : '11px',
                        border: 'none',
                        background: PINK,
                        color: '#fff',
                        fontSize: isMobile ? '12px' : '13px',
                        fontWeight: 700,
                        cursor: checkingOut ? 'not-allowed' : 'pointer',
                        fontFamily: FONT,
                        letterSpacing: '0.04em',
                        opacity: checkingOut ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {checkingOut ? 'Processing…' : 'Check Out'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </ShopShell>
  );
}
