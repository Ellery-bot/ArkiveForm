"use client";

import Link from "next/link";
import Script from "next/script";

const PINK = "#1520A6";
const FONT = `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;

export default function FormPage() {
  return (
    <div className="shop-mode" style={{ background: "#fff", color: "#121212", minHeight: "100vh", fontFamily: FONT }}>

      {/* Announcement bar */}
      <div style={{ background: PINK, color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: "14px" }}>
        Shipping fees are all estimated. For bulk orders and international shipping, please DM us!
      </div>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/shop" style={{ fontWeight: 700, fontSize: "20px", color: "#121212", textDecoration: "none", letterSpacing: "0.02em" }}>
            ARKIVE MARKET
          </Link>
          <Link href="/shop" style={{ marginLeft: "auto", fontSize: "13px", color: "#888", textDecoration: "none" }}
            onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = PINK)}
            onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "#888")}>
            ← Back to Shop
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
          <h1 style={{ fontWeight: 700, fontSize: "28px", marginBottom: "28px", color: "#121212", letterSpacing: "0.02em" }}>
            PAYMENT FORM
          </h1>
          <iframe
            src="https://www.cognitoforms.com/f/L2UuXU6xtkaidqDci0gNxA/30"
            style={{ border: 0, width: "100%" }}
            height={1127}
          />
          <Script src="https://www.cognitoforms.com/f/iframe.js" strategy="afterInteractive" />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e5e5", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>© 2025 Arkive Market. All rights reserved.</p>
      </footer>
    </div>
  );
}
