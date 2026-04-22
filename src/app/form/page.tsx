"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1c1sYBo6gg09wqawHAoCzujvGaBoovWoUpYl3_EExdv4/pubhtml?widget=true&headers=false";
const REFRESH_INTERVAL = 60_000; // 60 seconds

export default function FormPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState(SHEET_URL);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      // Append a cache-bust param so the browser actually re-fetches
      setIframeSrc(`${SHEET_URL}&_=${Date.now()}`);
      setLastRefreshed(new Date());
    }, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="card animate-fade-in p-6">

          {/* Google Form */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-center">PRE-ORDER: NEW BTS ARMY BOMB LIGHTSTICK V4</h2>
            <div className="w-full rounded overflow-hidden border border-[var(--card-border)]">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSeiHsZxqkThv4arYNzEYKk0iEpDwSf97dP-DZrVYyRVNdAUfw/viewform?embedded=true"
                width="100%"
                height="700"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="PRE-ORDER: NEW BTS ARMY BOMB LIGHTSTICK V4 Form"
                className="block"
              >
                Loading form...
              </iframe>
            </div>
          </section>

          {/* Google Spreadsheet */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-center">Order Records</h2>
            <div className="w-full rounded overflow-hidden border border-[var(--card-border)]">
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                width="100%"
                height="500"
                frameBorder="0"
                title="Order Records Spreadsheet"
                className="block"
              >
                Loading spreadsheet...
              </iframe>
            </div>
            <p className="text-xs text-center mt-2 opacity-60">
              Auto-refreshes every 60s · Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </section>

          <div className="pt-4 flex justify-center">
            <Link href="/" className="btn-secondary text-sm inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
