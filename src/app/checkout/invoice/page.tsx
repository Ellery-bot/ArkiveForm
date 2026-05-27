'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';

const PINK = '#1520A6';
const FB_PAGE_URL = 'https://www.facebook.com/profile.php?id=61580470037051';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  customer_name?: string;
  customer_email?: string;
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order found.');
      setLoading(false);
      return;
    }
    fetch(`/api/checkout?order_id=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError('Could not load your order. Please contact us.');
        } else {
          setOrder(data);
          // Clear cart once invoice is loaded
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('storage'));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your order. Please contact us.');
        setLoading(false);
      });
  }, [orderId]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>Generating your invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ color: '#dc2626', marginBottom: '16px', fontSize: '14px' }}>{error}</p>
          <Link href="/shop" style={{ color: PINK, fontWeight: 600, fontSize: '14px' }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="invoice-page" style={{ minHeight: '100vh', padding: '24px 16px', background: '#f3f4f6', fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
        {/* Action buttons — hidden on print */}
        <div className="no-print" style={{ maxWidth: '680px', margin: '0 auto 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href="/shop" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>← Back to Shop</Link>
        </div>

        {/* Invoice card */}
        <div
          ref={invoiceRef}
          className="invoice-wrapper"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: '40px 36px',
          }}
        >
          {/* Invoice content — captured for PDF */}
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '22px', color: PINK, letterSpacing: '0.04em' }}>ARKIVE MARKET</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Order Invoice</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Date</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#121212' }}>{formatDate(order.created_at)}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>Order #</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#121212' }}>{order.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#666', fontWeight: 600 }}>Item</th>
                <th style={{ textAlign: 'center', padding: '8px 8px', color: '#666', fontWeight: 600 }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontWeight: 600 }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '8px 0 8px 16px', color: '#666', fontWeight: 600 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 0', color: '#121212', fontWeight: 500 }}>{item.title}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#444' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#444' }}>₱{item.price.toFixed(2)}</td>
                  <td style={{ padding: '10px 0 10px 16px', textAlign: 'right', color: '#121212', fontWeight: 500 }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '14px 20px', minWidth: '200px', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Total Amount</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: PINK }}>₱{order.total_amount.toFixed(2)}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '2px dashed #e5e7eb', marginBottom: '28px' }} />

          {/* Instructions */}
          <div className="no-print" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: PINK, marginBottom: '12px' }}>
              📋 How to complete your order
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 18px', color: '#374151', fontSize: '13px', lineHeight: '1.8' }}>
              <li>Take a <strong>screenshot</strong> of this invoice.</li>
              <li>Go to our Facebook page: <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ color: PINK, wordBreak: 'break-all' }}>{FB_PAGE_URL}</a></li>
              <li>Send us a message with the screenshot attached and include your <strong>full name</strong>, <strong>complete address</strong>, and <strong>email address</strong>.</li>
              <li>We only accept payment via <strong>GCash</strong> and <strong>Maya</strong>. Payment instructions will be sent to you through Facebook Messenger.</li>
            </ol>
          </div>


        </div>
      </div>
    </>
  );
}

export default function InvoicePage() {
  return (
    <Suspense>
      <InvoiceContent />
    </Suspense>
  );
}
