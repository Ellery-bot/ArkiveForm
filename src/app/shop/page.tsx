'use client';

import { useState, useEffect } from 'react';
import ShopShell from './shared/ShopShell';
import ProductCard from './shared/ProductCard';
import type { Product } from './shared/shop-types';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, []);

  const preOrder = products.filter((p) => p.categories.includes('preorder'));
  const onHand = products.filter((p) => p.categories.includes('onhand'));

  return (
    <ShopShell>
      {(onAddToCart) => (
        loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <>
            {preOrder.length > 0 && (
              <section style={{ padding: '40px 0', scrollMarginTop: '57px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
                    PRE ORDER
                  </h2>
                  <div className="shop-product-grid">
                    {preOrder.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} showDirectCheckout />
                    ))}
                  </div>
                </div>
              </section>
            )}
            {onHand.length > 0 && (
              <section style={{ padding: '40px 0', borderTop: '1px solid #f0f0f0', scrollMarginTop: '57px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                  <h2 style={{ fontWeight: 700, fontSize: '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
                    ON HAND
                  </h2>
                  <div className="shop-product-grid">
                    {onHand.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} showDirectCheckout />
                    ))}
                  </div>
                </div>
              </section>
            )}
            {preOrder.length === 0 && onHand.length === 0 && (
              <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '48px', lineHeight: 1 }}>🛍️</div>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#121212', margin: 0 }}>No items yet</p>
                <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
                  Check back soon — new collections are on their way!
                </p>
              </div>
            )}
          </>
        )
      )}
    </ShopShell>
  );
}
