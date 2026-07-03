'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { PINK, FONT, BG_COLORS, sortCategories } from './shop-constants';
import type { Product } from './shop-types';

function categoryToLabel(slug: string): string {
  return slug.toUpperCase().replace(/-/g, ' ');
}

interface Notification {
  title: string;
  qty: number;
  price: number;
}

interface ShopShellProps {
  /** Current category slug — used for active nav highlighting. Omit on the shop-all page. */
  category?: string;
  /** When true, the footer is hidden (products are still loading). */
  loading?: boolean;
  /** Pass categories from the parent to skip the internal /api/categories fetch. */
  initialCategories?: string[];
  /** Render function receives `onAddToCart` and `searchQuery` so product cards can trigger cart updates and search filtering. */
  children: (onAddToCart: (p: Product, qty: number) => void, searchQuery: string) => React.ReactNode;
}

export default function ShopShell({ category, loading = false, initialCategories, children }: ShopShellProps) {
  const { cartItems, addToCart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [navCategories, setNavCategories] = useState<string[]>(initialCategories ?? []);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Draggable floating cart
  const [floatPos, setFloatPos] = useState<{ right: number; top: number }>({ right: 24, top: 80 });
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; startRight: number; startTop: number; moved: boolean }>(
    { dragging: false, startX: 0, startY: 0, startRight: 24, startTop: 80, moved: false }
  );
  const lastWasDrag = useRef(false);

  const onFloatPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { dragging: true, startX: e.clientX, startY: e.clientY, startRight: floatPos.right, startTop: floatPos.top, moved: false };
  }, [floatPos]);

  const onFloatPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.moved = true;
    const newRight = Math.max(8, dragState.current.startRight - dx);
    const newTop = Math.max(8, dragState.current.startTop + dy);
    setFloatPos({ right: newRight, top: newTop });
  }, []);

  const onFloatPointerUp = useCallback(() => {
    lastWasDrag.current = dragState.current.moved;
    dragState.current.dragging = false;
    dragState.current.moved = false;
  }, []);

  const onFloatClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!lastWasDrag.current) setCartOpen(true);
  }, []);;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cursor-driven nav scroll
  const navListRef = useRef<HTMLUListElement>(null);
  const navRafRef = useRef<number | null>(null);
  const navTargetScroll = useRef(0);

  const tickNavScroll = useCallback(() => {
    const el = navListRef.current;
    if (!el) return;
    const diff = navTargetScroll.current - el.scrollLeft;
    if (Math.abs(diff) > 0.5) {
      el.scrollLeft += diff * 0.1;
      navRafRef.current = requestAnimationFrame(tickNavScroll);
    } else {
      el.scrollLeft = navTargetScroll.current;
      navRafRef.current = null;
    }
  }, []);

  const handleNavMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = navListRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    navTargetScroll.current = relX * (el.scrollWidth - el.clientWidth);
    if (!navRafRef.current) {
      navRafRef.current = requestAnimationFrame(tickNavScroll);
    }
  }, [tickNavScroll]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return; // already have data from parent
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setNavCategories(Array.isArray(d) ? sortCategories(d) : []))
      .catch(() => {});
  }, [initialCategories]);

  const handleAddToCart = useCallback((product: Product, qty: number) => {
    addToCart(
      { id: product.id, title: product.title, price: product.price, image: product.image_url, stockQuantity: product.quantity },
      qty,
    );
    setNotification({ title: product.title, qty, price: product.price });
    setTimeout(() => setNotification(null), 4000);
  }, [addToCart]);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            title: item.title,
            price: item.price,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Checkout failed. Please try again.');
        setCheckingOut(false);
        return;
      }
      const { orderId } = await res.json();
      window.location.href = `/checkout/invoice?order_id=${orderId}`;
    } catch {
      alert('Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  }, [cartItems]);

  return (
    <div className="cursor-reset-zone" style={{ background: '#fff', color: '#121212', minHeight: '100vh', fontFamily: FONT, overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Announcement banner */}
      <div style={{ background: PINK, color: '#fff', padding: '10px 0', fontSize: '14px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-block', animation: 'marquee 30s linear infinite' }}>
          Looking for a specific K-pop item or ordering 2 or more items? Send us a DM for assistance and possible discounts.
        </span>
      </div>

      {/* Sticky header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px 14px 20px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="shop-hamburger"
            style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
          </button>

          <Link
            href="/shop"
            className="shop-logo-link"
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <span style={{ fontSize: '13px', color: '#121212', fontWeight: 700, letterSpacing: '1px', lineHeight: 1.2, display: 'block', whiteSpace: 'nowrap' }}>
              ARKIVE MARKET
            </span>
          </Link>

          <nav
            style={{ marginLeft: '20px', display: 'none' }}
            className="shop-nav-desktop"
            onMouseMove={handleNavMouseMove}
          >
            <ul
              ref={navListRef}
              style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', overflowX: 'hidden' }}
            >
              {navCategories.map((cat) => {
                const isActive = category === cat;
                return (
                  <li key={cat}>
                    <a
                      href={`/shop/${cat}`}
                      style={{
                        fontSize: '13px',
                        color: isActive ? PINK : '#121212',
                        textDecoration: 'none',
                        padding: '8px 12px',
                        display: 'block',
                        letterSpacing: '0.05em',
                        fontWeight: isActive ? 700 : 500,
                        borderBottom: isActive ? `2px solid ${PINK}` : '2px solid transparent',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {categoryToLabel(cat)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              style={{ background: 'none', border: 'none', padding: '8px', color: '#121212', display: 'flex', position: 'relative', fontSize: '20px' }}
            >
              🛒
              {cartCount > 0 && (
                <span
                  className="cart-badge"
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: PINK,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search bar strip */}
      <div style={{ position: 'sticky', top: '77px', zIndex: 99, background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#aaa', pointerEvents: 'none' }}>🔍</span>
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '20px',
                border: `1.5px solid #e5e5e5`,
                fontSize: '13px',
                outline: 'none',
                background: '#f9f9f9',
                fontFamily: FONT,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = PINK)}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e5e5')}
            />
          </div>
        </div>
      </div>

      {/* Page-specific content via render prop */}
      <main style={{ flex: 1 }}>{children(handleAddToCart, searchQuery)}</main>

      {/* Floating cart button */}
      {scrolled && !cartOpen && (
        <button
          onPointerDown={onFloatPointerDown}
          onPointerMove={onFloatPointerMove}
          onPointerUp={onFloatPointerUp}
          onClick={onFloatClick}
          aria-label="Cart"
          style={{
            position: 'fixed',
            top: `${floatPos.top}px`,
            right: `${floatPos.right}px`,
            zIndex: 250,
            background: '#1a1a1a',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.30)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#e53e3e',
                color: '#fff',
                borderRadius: '50%',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                padding: '0 4px',
                lineHeight: 1,
                boxSizing: 'border-box',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      )}

      {/* Footer */}
      {!loading && <footer style={{ background: '#fff', borderTop: `3px solid ${PINK}`, padding: '48px 20px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div style={{ minWidth: 0, overflowWrap: 'break-word' }}>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', lineHeight: 1.3, display: 'block' }}>
                ARKIVE MARKET
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 8px' }}>
              <span style={{ fontWeight: 700, color: '#121212' }}>Email: </span>
              <a href="mailto:arkivemarketshop@gmail.com" style={{ color: '#555', textDecoration: 'none' }}>arkivemarketshop@gmail.com</a>
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: PINK, margin: '0 0 16px' }}>Pages</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><a href="/shop" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>→ Shop All</a></li>
              <li><a href="/faqs" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>→ FAQs</a></li>
              <li><a href="/terms" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>→ Terms and Conditions</a></li>
              <li><a href="/reviews" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>→ Reviews</a></li>
            </ul>
          </div>

          {/* Find Us */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: PINK, margin: '0 0 16px' }}>Find Us</h3>
            <a
              href="https://www.facebook.com/profile.php?id=61580470037051"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', width: '42px', height: '42px', borderRadius: '50%', background: '#1877F2', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Facebook"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            </a>
          </div>

          {/* Payment & Delivery */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: PINK, margin: '0 0 14px' }}>Payment Methods</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ background: '#0070BA', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '7px 14px', borderRadius: '5px', letterSpacing: '0.02em' }}>GCash</span>
              <span style={{ background: '#0B7A3E', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '7px 14px', borderRadius: '5px', letterSpacing: '0.02em' }}>Maya</span>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: PINK, margin: '0 0 14px' }}>Delivered By</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ background: '#E30E18', color: '#fff', fontWeight: 800, fontSize: '12px', padding: '7px 14px', borderRadius: '5px', letterSpacing: '0.02em' }}>J&amp;T Express</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid #e5e5e5', fontSize: '12px', color: '#888', textAlign: 'center' }}>
          &copy; 2026 Arkive Market. All rights reserved.
        </div>
      </footer>}

      {/* Added-to-cart notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            zIndex: 300,
            background: '#fff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            padding: '16px 20px',
            maxWidth: '320px',
            width: '100%',
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Added to cart</p>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '14px', lineHeight: 1, padding: 0, marginLeft: '12px', flexShrink: 0 }}
            >✕</button>
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#121212', margin: '0 0 4px', lineHeight: 1.4 }}>{notification.title}</p>
          <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>Qty: {notification.qty} &nbsp;·&nbsp; ₱{(notification.price * notification.qty).toLocaleString()}</p>
        </div>
      )}

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="shop-mobile-menu" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: '280px', background: '#fff', overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#121212', lineHeight: 1, cursor: 'pointer' }}
              >&times;</button>
            </div>
            <nav className="shop-menu-nav">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {navCategories.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <li key={cat} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <a
                        href={`/shop/${cat}`}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          fontSize: '14px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? PINK : '#121212',
                          textDecoration: 'none',
                          padding: '14px 20px',
                          display: 'block',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {categoryToLabel(cat)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="shop-menu-gohome" style={{ padding: '16px 20px', borderTop: '1px solid #e5e5e5', marginTop: 'auto' }}>
              <a
                href="/"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#555', textDecoration: 'none', padding: '10px 0', letterSpacing: '0.05em' }}
              >
                ← Go Home
              </a>
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setCartOpen(false)} />
          <div style={{ width: '360px', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
              <h2 style={{ fontWeight: 600, fontSize: '18px', margin: 0 }}>Your cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#121212', lineHeight: 1, cursor: 'pointer' }}
              >&times;</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {cartItems.length === 0 ? (
                <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cartItems.map((item, i) => (
                    <li key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: BG_COLORS[i % BG_COLORS.length], flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', margin: '0 0 4px', lineHeight: 1.4 }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>₱{item.price.toFixed(2)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : setRemoveConfirmId(item.id)}
                            style={{ width: '22px', height: '22px', border: '1px solid #ddd', background: '#f5f5f5', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '16px', textAlign: 'center', color: '#121212' }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.stockQuantity != null && item.quantity >= item.stockQuantity}
                            style={{
                              width: '22px',
                              height: '22px',
                              border: '1px solid #ddd',
                              background: '#f5f5f5',
                              fontSize: '13px',
                              cursor: (item.stockQuantity != null && item.quantity >= item.stockQuantity) ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              opacity: (item.stockQuantity != null && item.quantity >= item.stockQuantity) ? 0.4 : 1,
                            }}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                      </div>
                      <button
                        onClick={() => setRemoveConfirmId(item.id)}
                        style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: '18px', lineHeight: 1, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cartItems.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                  <span>Total:</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: PINK,
                    color: '#fff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    opacity: checkingOut ? 0.6 : 1,
                    cursor: checkingOut ? 'not-allowed' : 'pointer',
                  }}
                >
                  {checkingOut ? 'Processing...' : 'Check out Items'}
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', fontSize: '13px', color: '#555', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Continue shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove-item confirmation modal */}
      {removeConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '28px 24px', maxWidth: '300px', width: '90%', fontFamily: FONT, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <p style={{ fontSize: '14px', color: '#121212', margin: '0 0 20px', lineHeight: 1.6 }}>
              Are you sure you want to remove this item?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { removeFromCart(removeConfirmId); setRemoveConfirmId(null); }}
                style={{ flex: 1, padding: '10px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Remove
              </button>
              <button
                onClick={() => setRemoveConfirmId(null)}
                style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#121212', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
