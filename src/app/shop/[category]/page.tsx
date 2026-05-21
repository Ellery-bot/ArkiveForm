'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'

/* ─── Types ─── */
type Product = {
  id: number
  title: string
  price: string
  originalPrice?: string
  badge?: string
  tags: string[]
}

/* ─── Constants ─── */
const PINK = '#1520A6'
const FONT = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
const BG_COLORS = [
  '#1520A6', '#1a27c9', '#0e1680', '#2336d4',
  '#3d52e0', '#0a0f6b', '#4a63e8', '#6b7ff0',
  '#1520A6', '#2336d4', '#3d52e0', '#0e1680',
]

/* ─── Navigation ─── */
const NAV_LINKS = [
  { label: 'PRE-ORDER',    href: '/shop/preorder' },
  { label: 'ON HAND',      href: '/shop/onhand' },
  { label: 'LIGHTSTICKS',  href: '/shop/lightsticks' },
  { label: 'PHOTOCARDS',   href: '/shop/photocards' },
  { label: 'PAYMENT FORM', href: '/form' },
]

/* ─── Category config ─── */
const VALID_CATEGORIES: Record<string, { heading: string }> = {
  preorder:   { heading: 'PRE ORDER' },
  onhand:     { heading: 'ON HAND' },
  lightsticks:{ heading: 'LIGHTSTICKS' },
  photocards: { heading: 'PHOTOCARDS' },
}

/* ─── All products with tags ─── */
const ALL_PRODUCTS: Product[] = [
  { id: 1,  title: '[PRE ORDER] BTS - OFFICIAL LIGHTSTICK VER. 4',     price: 'From ₱2,500.00', originalPrice: '₱3,799.00', badge: 'Sale', tags: ['preorder', 'lightsticks'] },
  { id: 2,  title: '[PRE ORDER] BLACKPINK × TAMAGOTCHI',                price: '₱4,500.00',                                                 tags: ['preorder'] },
  { id: 3,  title: '[PRE ORDER] JENNIE - RUBY [1st STUDIO ALBUM]',      price: '₱1,600.00',                                                 tags: ['preorder', 'photocards'] },
  { id: 4,  title: '[PRE ORDER] BTS - 10 STAR (BTS 2000 DAYS JOURNEY)', price: '₱900.00',                                                   tags: ['preorder'] },
  { id: 5,  title: '[PRE ORDER] BTS WHAT IS YOUR LOVE SONG CARRIER STRAP', price: '₱830.00',                                               tags: ['preorder'] },
  { id: 6,  title: '[PRE ORDER] BTS ARIRANG WORLD TOUR PICK UP MERCH',  price: 'From ₱800.00',                                              tags: ['preorder'] },
  { id: 7,  title: '[ON HAND] BLACKPINK JISOO FIRST SINGLE ALBUM',      price: 'From ₱700.00',                                              tags: ['onhand', 'photocards'] },
  { id: 8,  title: '[ON HAND] BLACKPINK - DEADLINE [3rd Mini Album]',   price: 'From ₱1,100.00',                                            tags: ['onhand', 'photocards'] },
  { id: 9,  title: '[ON HAND] BLACKPINK DEADLINE OFFICIAL MERCH',       price: 'From ₱1,000.00',                                            tags: ['onhand'] },
  { id: 10, title: '[ON HAND] ENHYPEN ROMANCE : UNTOLD',                price: 'From ₱759.00',   originalPrice: '₱859.00',  badge: 'Sale', tags: ['onhand', 'photocards'] },
  { id: 11, title: '[ON HAND] BTS OFFICIAL LIGHTSTICK v4 [ARMY BOMB]',  price: 'From ₱930.00',                                              tags: ['onhand', 'lightsticks'] },
  { id: 12, title: '[ON HAND] G-DRAGON 3RD ALBUM UBERMENSCH',           price: 'From ₱890.00',   originalPrice: '₱1,000.00', badge: 'Sale', tags: ['onhand', 'photocards'] },
  { id: 13, title: '[ON HAND] G-DRAGON UBERMENSCH OFFICIAL LIGHTSTICK', price: 'From ₱2,600.00',                                            tags: ['onhand', 'lightsticks'] },
  { id: 14, title: '[ON HAND] BIGBANG - OFFICIAL LIGHTSTICK ver.4',     price: '₱3,599.00',      originalPrice: '₱4,200.00', badge: 'Sale', tags: ['onhand', 'lightsticks'] },
  { id: 15, title: '[ON HAND] AHOF - OFFICIAL LIGHTSTICK [NO POB]',     price: 'From ₱3,500.00',                                            tags: ['onhand', 'lightsticks'] },
  { id: 16, title: '[ON HAND] 2NE1 OFFICIAL LIGHTSTICK',                price: '₱3,500.00',                                                 tags: ['onhand', 'lightsticks'] },
]

/* ─── Product Card ─── */
function ProductCard({
  product, index, onAddToCart,
}: {
  product: Product
  index: number
  onAddToCart: (title: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const bg = BG_COLORS[index % BG_COLORS.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '1 / 1', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '12px' }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
          {product.title}
        </span>
        {product.badge && (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: PINK, color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 10px', borderRadius: '40px' }}>
            {product.badge}
          </span>
        )}
      </div>

      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: '13px', fontWeight: 400, margin: '0 0 6px', lineHeight: 1.4, color: '#121212' }}>
          {product.title}
        </h3>
        <div style={{ marginBottom: '10px' }}>
          {product.originalPrice && (
            <s style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '2px' }}>{product.originalPrice}</s>
          )}
          <span style={{ fontSize: '13px', fontWeight: 600, color: product.badge === 'Sale' ? PINK : '#121212' }}>
            {product.price}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product.title)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%', padding: '8px', marginTop: 'auto',
            border: `1px solid ${hovered ? PINK : '#121212'}`,
            background: hovered ? PINK : 'transparent',
            color: hovered ? '#fff' : '#121212',
            fontSize: '12px', fontWeight: 500, transition: 'all 0.2s', letterSpacing: '0.04em',
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

/* ─── Category Page ─── */
export default function CategoryPage() {
  const params = useParams()
  const category = (params?.category as string) ?? ''

  if (!VALID_CATEGORIES[category]) notFound()

  const { heading } = VALID_CATEGORIES[category]
  const products = ALL_PRODUCTS.filter(p => p.tags.includes(category))

  const [cartItems, setCartItems]         = useState<{ cartId: number; title: string }[]>([])
  const [cartOpen, setCartOpen]           = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [menuOpen, setMenuOpen]           = useState(false)
  const [notification, setNotification]   = useState<string | null>(null)
  const [email, setEmail]                 = useState('')
  const [subscribed, setSubscribed]       = useState(false)

  const cartCount = cartItems.length

  const addToCart = (title: string) => {
    setCartItems(prev => [...prev, { cartId: Date.now() + Math.random(), title }])
    setNotification(title)
    setTimeout(() => setNotification(null), 4000)
  }

  const removeFromCart = (cartId: number) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId))
  }

  return (
    <div className="shop-mode" style={{ background: '#fff', color: '#121212', minHeight: '100vh', fontFamily: FONT }}>

      {/* ── ANNOUNCEMENT BAR ── */}
      <div role="region" aria-label="Announcement" style={{ background: PINK, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: '14px' }}>
        Shipping fees are all estimated. For bulk orders and international shipping, please DM us!
      </div>

      {/* ── STICKY HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Hamburger */}
          <button className="shop-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu"
            style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#121212' }} />
          </button>

          {/* Logo */}
          <Link href="/shop" style={{ fontWeight: 700, fontSize: '20px', color: '#121212', textDecoration: 'none', flexShrink: 0, letterSpacing: '0.02em' }}>
            ARKIVE MARKET
          </Link>

          {/* Desktop nav */}
          <nav className="shop-nav-desktop">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
              <li>
                <Link
                  href="/"
                  style={{ fontSize: '13px', color: '#888', textDecoration: 'none', padding: '8px 12px', display: 'block', letterSpacing: '0.05em', fontWeight: 500 }}
                  onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = PINK)}
                  onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#888')}
                >
                  ← Home
                </Link>
              </li>
              <li style={{ width: '1px', height: '16px', background: '#ddd', margin: '0 4px' }} />
              {NAV_LINKS.map(link => {
                const isActive = link.href === `/shop/${category}`
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: '13px',
                        color: isActive ? PINK : '#121212',
                        textDecoration: 'none',
                        padding: '8px 12px',
                        display: 'block',
                        letterSpacing: '0.05em',
                        fontWeight: isActive ? 700 : 500,
                        borderBottom: isActive ? `2px solid ${PINK}` : '2px solid transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Icons */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              style={{ background: 'none', border: 'none', padding: '8px', color: '#121212', display: 'flex' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19" width={18} height={18}>
                <path fillRule="evenodd" clipRule="evenodd" d="M11.03 11.68A5.784 5.784 0 112.85 3.5a5.784 5.784 0 018.18 8.18zm.26 1.12a6.78 6.78 0 11.72-.7l5.4 5.4a.5.5 0 11-.71.7l-5.41-5.4z" fill="currentColor" />
              </svg>
            </button>
            <button onClick={() => setCartOpen(true)} aria-label={`Cart (${cartCount})`}
              style={{ background: 'none', border: 'none', padding: '8px', color: '#121212', display: 'flex', position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" width={18} height={18}>
                <path d="m15.75 11.8h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33l-.78-11.61zm0 1h-2.22l-.71 10.67a4 4 0 0 0 3.99 4.27h7.38a4 4 0 0 0 4-4.27l-.72-10.67h-2.22v.63a4.75 4.75 0 1 1 -9.5 0zm8.5 0h-7.5v.63a3.75 3.75 0 1 0 7.5 0z" fill="currentColor" fillRule="evenodd" />
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', background: PINK, color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── PRODUCTS SECTION ── */}
      <main>
        <section style={{ padding: '40px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
              {heading}
            </h2>
            {products.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px', padding: '40px 0' }}>No products found in this category.</p>
            ) : (
              <div className="shop-product-grid">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section style={{ background: PINK, padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: '30px', color: '#fff', marginBottom: '8px' }}>Subscribe to our emails</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '28px', fontSize: '14px' }}>
            Be the first to know about new collections and exclusive offers.
          </p>
          {subscribed ? (
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>✓ You&apos;re subscribed!</p>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true) }}
              style={{ display: 'flex', maxWidth: '420px', margin: '0 auto', background: '#fff' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email" required aria-label="Email address"
                style={{ flex: 1, border: 'none', padding: '12px 16px', fontSize: '14px', outline: 'none', color: '#121212', background: 'transparent', minWidth: 0 }} />
              <button type="submit" aria-label="Subscribe"
                style={{ background: 'none', border: 'none', borderLeft: '1px solid #e5e5e5', padding: '0 18px', color: '#121212', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 14 10" fill="none" width={14} height={10}>
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.537.808a.5.5 0 01.817-.162l4 4a.5.5 0 010 .708l-4 4a.5.5 0 11-.708-.708L11.793 5.5H1a.5.5 0 010-1h10.793L8.646 1.354a.5.5 0 01-.109-.546z" fill="currentColor" />
                </svg>
              </button>
            </form>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e5e5e5', padding: '40px 20px' }}>
        <div className="shop-footer-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: PINK, marginBottom: '12px' }}>ARKIVE MARKET</div>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.8, margin: 0 }}>
              <strong>Location:</strong> Philippines<br />
              <strong>Email:</strong> arkivemarket@gmail.com<br />
              <strong>Facebook:</strong> @arkivemarket
            </p>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#121212', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pages</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[{ label: 'Home', href: '/' }, { label: 'Payment Form', href: '/form' }, { label: 'Terms & Conditions', href: '/terms' }, { label: 'FAQs', href: '/faqs' }, { label: 'Reviews', href: '/reviews' }].map(link => (
                <li key={link.label}>
                  <Link href={link.href} style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}
                    onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = PINK)}
                    onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#555')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#121212', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Find Us</h3>
            <a href="https://www.facebook.com/profile.php?id=61580470037051" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = PINK)}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = '#555')}>
              Facebook — @arkivemarket
            </a>
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#121212', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Payment Methods</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['GCash', 'Maya', 'BDO', 'BPI', 'Metrobank'].map(m => (
                <span key={m} style={{ fontSize: '12px', color: '#555', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 10px' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '28px auto 0', paddingTop: '20px', borderTop: '1px solid #e5e5e5', fontSize: '12px', color: '#888', textAlign: 'center' }}>
          © 2025 Arkive Market. All rights reserved.
        </div>
      </footer>

      {/* ── CART NOTIFICATION ── */}
      {notification && (
        <div role="dialog" aria-label="Item added to your cart"
          style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 300, background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '16px 20px', maxWidth: '320px', width: '100%', animation: 'shopSlideIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <svg viewBox="0 0 12 9" fill="none" width={12} height={9}>
              <path fillRule="evenodd" clipRule="evenodd" d="M11.35.643a.5.5 0 01.006.707l-6.77 6.886a.5.5 0 01-.719-.006L.638 4.845a.5.5 0 11.724-.69l2.872 3.011 6.41-6.517a.5.5 0 01.707-.006h-.001z" fill={PINK} />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Item added to your cart</span>
            <button onClick={() => setNotification(null)} aria-label="Close"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '18px', color: '#888', lineHeight: 1 }}>×</button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 14px', lineHeight: 1.4 }}>
            {notification.length > 65 ? notification.substring(0, 65) + '…' : notification}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setCartOpen(true); setNotification(null) }}
              style={{ flex: 1, padding: '8px', border: '1px solid #121212', background: 'transparent', fontSize: '12px', fontWeight: 500 }}>
              View cart ({cartCount})
            </button>
            <button onClick={() => setNotification(null)}
              style={{ flex: 1, padding: '8px', border: 'none', background: PINK, color: '#fff', fontSize: '12px', fontWeight: 500 }}>
              Check out
            </button>
          </div>
        </div>
      )}

      {/* ── SEARCH MODAL ── */}
      {searchOpen && (
        <div role="dialog" aria-modal="true" aria-label="Search"
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSearchOpen(false)}>
          <div style={{ marginTop: 0, background: '#fff', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <form onSubmit={e => { e.preventDefault(); setSearchOpen(false) }}
              style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
              <input autoFocus type="search" placeholder="Search products..." aria-label="Search"
                style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e5e5', fontSize: '15px', outline: 'none', color: '#121212', minWidth: 0 }} />
              <button type="submit"
                style={{ padding: '12px 20px', background: PINK, color: '#fff', border: 'none', fontSize: '14px', fontWeight: 500 }}>Search</button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"
                style={{ padding: '12px 14px', background: 'none', border: '1px solid #e5e5e5', fontSize: '18px', color: '#121212' }}>×</button>
            </form>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU DRAWER ── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ width: '280px', background: '#fff', position: 'absolute', left: 0, top: 0, bottom: 0, overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu"
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#121212', lineHeight: 1 }}>×</button>
            </div>
            <nav>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {NAV_LINKS.map(link => (
                  <li key={link.label} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)}
                      style={{ fontSize: '14px', fontWeight: link.href === `/shop/${category}` ? 700 : 500, color: link.href === `/shop/${category}` ? PINK : '#121212', textDecoration: 'none', padding: '14px 20px', display: 'block', letterSpacing: '0.05em' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <Link href="/" onClick={() => setMenuOpen(false)}
                    style={{ fontSize: '14px', fontWeight: 500, color: '#121212', textDecoration: 'none', padding: '14px 20px', display: 'block', letterSpacing: '0.05em' }}>
                    ← Back to Home
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', marginLeft: '280px' }} onClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* ── CART SIDEBAR ── */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setCartOpen(false)} />
          <div style={{ width: '360px', background: '#fff', position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
              <h2 style={{ fontWeight: 600, fontSize: '18px', margin: 0 }}>Your cart</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart"
                style={{ background: 'none', border: 'none', fontSize: '22px', color: '#121212', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {cartItems.length === 0 ? (
                <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cartItems.map((item, i) => (
                    <li key={item.cartId} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start' }}>
                      <div style={{ width: '60px', height: '60px', background: BG_COLORS[i % BG_COLORS.length], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', margin: '0 0 4px', lineHeight: 1.4 }}>{item.title}</p>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Qty: 1</p>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} aria-label={`Remove ${item.title}`}
                        style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '18px', lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0, marginTop: '2px' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = PINK)}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#aaa')}>
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cartItems.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ width: '100%', padding: '13px', background: PINK, color: '#fff', border: 'none', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Check out
                </button>
                <button onClick={() => setCartOpen(false)}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', fontSize: '13px', color: '#555', textDecoration: 'underline' }}>
                  Continue shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shopSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
