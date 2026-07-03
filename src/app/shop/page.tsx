'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ShopShell from './shared/ShopShell';
import ProductCard from './shared/ProductCard';
import { sortCategories, CATEGORY_LABEL_OVERRIDES } from './shared/shop-constants';
import type { Product } from './shared/shop-types';

function categoryToLabel(slug: string): string {
  return CATEGORY_LABEL_OVERRIDES[slug] ?? slug.toUpperCase().replace(/-/g, ' ');
}

const ARROW_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 200,
  background: '#1a1a1a',
  border: 'none',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
  cursor: 'pointer',
  transition: 'background 0.2s, opacity 0.2s',
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? sortCategories(cats) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Touch-swipe between categories on mobile
  const touchStartX = useRef<number | null>(null);
  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleSwipeEnd = useCallback((e: React.TouchEvent, total: number, current: number) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(diff) < 50) return; // ignore small drags
    if (diff > 0 && current < total - 1) {
      setActiveIdx(current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (diff < 0 && current > 0) {
      setActiveIdx(current - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Keep ALL categories — even those with no products yet
  const sectionsWithProducts = categories
    .map((cat) => ({ cat, items: products.filter((p) => p.categories.includes(cat)) }));

  return (
    <ShopShell loading={loading} initialCategories={categories}>
      {(onAddToCart, searchQuery) => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = sectionsWithProducts
          .map(({ cat, items }) => ({
            cat,
            items: q ? items.filter((p) => p.title.toLowerCase().includes(q)) : items,
          }))
          // When searching, hide empty-result categories; otherwise show all
          .filter(({ items }) => q ? items.length > 0 : true);

        if (loading) {
          return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading products...</div>;
        }

        if (filtered.length === 0) {
          return (
            <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px', lineHeight: 1 }}>🛍️</div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#121212', margin: 0 }}>
                {q ? `No results for "${searchQuery}"` : 'No items yet'}
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
                {q ? 'Try a different search term.' : 'Check back soon — new collections are on their way!'}
              </p>
            </div>
          );
        }

        // When searching, show all results; otherwise show one category at a time
        if (q) {
          return (
            <>
              {filtered.map(({ cat, items }, idx) => (
                <section key={cat} style={{ padding: '40px 0', borderTop: idx > 0 ? '1px solid #f0f0f0' : undefined }}>
                  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 20px' }}>
                    <h2 style={{ fontWeight: 700, fontSize: isMobile ? '22px' : '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
                      {categoryToLabel(cat)}
                    </h2>
                    <div className="shop-product-grid">
                      {items.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} showDirectCheckout />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </>
          );
        }

        const clampedIdx = Math.min(activeIdx, filtered.length - 1);
        const { cat, items } = filtered[clampedIdx];
        const hasPrev = clampedIdx > 0;
        const hasNext = clampedIdx < filtered.length - 1;

        return (
          <>
            {/* Left arrow — desktop only */}
            {!isMobile && (
              <button
                aria-label="Previous category"
                onClick={() => { setActiveIdx(clampedIdx - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  ...ARROW_STYLE,
                  left: '16px',
                  opacity: hasPrev ? 1 : 0,
                  pointerEvents: hasPrev ? 'auto' : 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Category section */}
            <section
              style={{ padding: '40px 0' }}
              onTouchStart={isMobile ? handleSwipeStart : undefined}
              onTouchEnd={isMobile ? (e) => handleSwipeEnd(e, filtered.length, clampedIdx) : undefined}
            >
              <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 80px' }}>
                {/* Category heading */}
                <h2 style={{ fontWeight: 700, fontSize: isMobile ? '22px' : '28px', color: '#121212', letterSpacing: '0.02em', margin: '0 0 10px' }}>
                  {categoryToLabel(cat)}
                </h2>
                {/* Dot indicators — always on their own row */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {filtered.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to ${categoryToLabel(filtered[i].cat)}`}
                      onClick={() => { setActiveIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      style={{
                        width: i === clampedIdx ? '20px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: i === clampedIdx ? '#1a1a1a' : '#ccc',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'width 0.3s, background 0.3s',
                      }}
                    />
                  ))}
                </div>

                {items.length === 0 ? (
                  <div style={{ padding: '40px 0', color: '#aaa', fontSize: '14px', textAlign: 'center' }}>
                    No products in this category yet — check back soon!
                  </div>
                ) : (
                  <div className="shop-product-grid">
                    {items.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} showDirectCheckout />
                    ))}
                  </div>
                )}


              </div>
            </section>

            {/* Right arrow — desktop only */}
            {!isMobile && (
              <button
                aria-label="Next category"
                onClick={() => { setActiveIdx(clampedIdx + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  ...ARROW_STYLE,
                  right: '16px',
                  opacity: hasNext ? 1 : 0,
                  pointerEvents: hasNext ? 'auto' : 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </>
        );
      }}
    </ShopShell>
  );
}
