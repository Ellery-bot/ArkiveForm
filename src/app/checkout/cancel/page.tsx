'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PINK = '#1520A6';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          ⚠
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', color: '#121212' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px', lineHeight: 1.6 }}>
          Your payment has been cancelled. No charges were made to your account.
        </p>

        {orderId && (
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
            Order ID: {orderId}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            href="/shop"
            style={{
              padding: '12px 24px',
              background: '#f5f5f5',
              color: '#121212',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              border: '1px solid #ddd',
            }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/shop"
            style={{
              padding: '12px 24px',
              background: PINK,
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            Try Again
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  );
}
