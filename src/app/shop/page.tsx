'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ShopShell from './shared/ShopShell';
import ProductCard from './shared/ProductCard';
import { sortCategories, CATEGORY_LABEL_OVERRIDES } from './shared/shop-constants';
import type { Product } from './shared/shop-types';

function categoryToLabel(slug: string): string {
  return CATEGORY_LABEL_OVERRIDES[slug] ?? slug.toUpperCase().replace(/-/g, ' ');
}

/** A single horizontally-scrollable category row with a right-arrow to reveal more */
function CategoryRow({
  cat,
  items,
  onAddToCart,
}: {
  cat: string;
  items: Product[];
  onAddToCart: (p: Product, qty: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll, items]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.querySelector<HTMLElement>('[data-card]')?.offsetWidth ?? 200;
    el.scrollBy({ left: dir === 'right' ? cardW * 3 : -(cardW * 3), behavior: 'smooth' });
  };

  const ARROW: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(15,15,30,0.85)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s, opacity 0.2s',
    flexShrink: 0,
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          aria-label="Scroll left"
          onClick={() => scroll('left')}
          style={{ ...ARROW, left: '-16px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
        }}
      >
        {items.map((p, i) => (
          <div
            key={p.id}
            data-card
            style={{
              flex: '0 0 auto',
              width: 'clamp(160px, 18vw, 220px)',
              scrollSnapAlign: 'start',
            }}
          >
            <ProductCard product={p} index={i} onAddToCart={onAddToCart} showDirectCheckout />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          aria-label="Scroll right"
          onClick={() => scroll('right')}
          style={{ ...ARROW, right: '-16px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
          .filter(({ items }) => q ? items.length > 0 : true);

        if (loading) {
          return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading products...</div>;
        }

        if (filtered.length === 0) {
          return (
            <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px', lineHeight: 1 }}>🛍️</div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#e0e7ff', margin: 0 }}>
                {q ? `No results for "${searchQuery}"` : 'No items yet'}
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
                {q ? 'Try a different search term.' : 'Check back soon — new collections are on their way!'}
              </p>
            </div>
          );
        }

        return (
          <>
            {filtered.map(({ cat, items }, idx) => (
              <section
                key={cat}
                style={{
                  padding: idx === 0 ? '32px 0 48px' : '48px 0',
                  borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.08)' : undefined,
                }}
              >
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px' }}>
                  <h2 style={{
                    fontWeight: 700,
                    fontSize: isMobile ? '18px' : '22px',
                    color: '#121212',
                    letterSpacing: '0.08em',
                    margin: '0 0 20px',
                  }}>
                    {categoryToLabel(cat)}
                  </h2>
                  {items.length === 0 ? (
                    <div style={{ padding: '32px 0', color: '#666', fontSize: '13px', textAlign: 'center' }}>
                      No products in this category yet — check back soon!
                    </div>
                  ) : (
                    <CategoryRow cat={cat} items={items} onAddToCart={onAddToCart} />
                  )}
                </div>
              </section>
            ))}
          </>
        );
      }}
    </ShopShell>
  );
}
