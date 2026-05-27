'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import ShopShell from '../shared/ShopShell';
import ProductCard from '../shared/ProductCard';
import type { Product } from '../shared/shop-types';

const CATEGORY_HEADINGS: Record<string, string> = {
  preorder: 'PRE ORDER',
  onhand: 'ON HAND',
  lightsticks: 'LIGHTSTICKS',
  photocards: 'PHOTOCARDS',
};

export default function CategoryPage() {
  const params = useParams();
  const category = (params?.category as string) ?? '';

  if (!CATEGORY_HEADINGS[category]) notFound();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?category=${category}`)
      .then((r) => r.json())
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [category]);

  return (
    <ShopShell category={category}>
      {(onAddToCart) => (
        <section style={{ padding: '40px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ fontWeight: 700, fontSize: '28px', marginBottom: '24px', color: '#121212', letterSpacing: '0.02em' }}>
              {CATEGORY_HEADINGS[category]}
            </h2>
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>Loading products...</div>
            ) : products.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '48px', lineHeight: 1 }}>🛍️</div>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#121212', margin: 0 }}>No items yet</p>
                <p style={{ fontSize: '13px', color: '#888', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>
                  Check back soon — new collections are on their way!
                </p>
              </div>
            ) : (
              <div className="shop-product-grid">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onAddToCart={onAddToCart} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </ShopShell>
  );
}
