'use client';

import { useState, useEffect } from 'react';
import ShopShell from './shared/ShopShell';
import ProductCard from './shared/ProductCard';
import { sortCategories } from './shared/shop-constants';
import type { Product } from './shared/shop-types';

function categoryToLabel(slug: string): string {
  return slug.toUpperCase().replace(/-/g, ' ');
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
    .map((cat) => ({ cat, items: products.filter((p) => p.categories.includes(cat)) }))
    .filter(({ items }) => items.length > 0);

  return (
    <ShopShell>
      {(onAddToCart) => (
        loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading products...</div>
        ) : sectionsWithProducts.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '48px', lineHeight: 1 }}>🛍️</div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#121212', margin: 0 }}>No items yet</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
              Check back soon — new collections are on their way!
            </p>
          </div>
        ) : (
          <>
            {sectionsWithProducts.map(({ cat, items }, idx) => (
              <section
                key={cat}
                style={{ padding: '40px 0', borderTop: idx > 0 ? '1px solid #f0f0f0' : undefined, scrollMarginTop: '57px' }}
              >
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
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
        )
      )}
    </ShopShell>
  );
}
