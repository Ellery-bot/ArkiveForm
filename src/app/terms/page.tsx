'use client';

import Link from "next/link";
import { useState, useCallback } from "react";

const terms = [
  {
    number: 1,
    title: "Orders & Confirmation",
    content: "All orders must be confirmed via the official order form or direct message. Orders are considered secured once payment (full or down payment, if applicable) is received.",
  },
  {
    number: 2,
    title: "Payment",
    content: "Accepted payment methods: GCash, bank transfer, and other methods specified per item. Payments must be made according to the schedule provided for each item.",
  },
  {
    number: 3,
    title: "Pricing & Availability",
    content: "Prices are subject to supplier costs and may change without prior notice. Availability is limited and items are sold on a first-come, first-served basis.",
  },
  {
    number: 4,
    title: "Preorders & Lead Time",
    content: "Preordered items will be delivered based on the estimated timelines shared. Delays may occur due to shipping, customs, or supplier issues, which are beyond our control.",
  },
  {
    number: 5,
    title: "Shipping & Handling",
    content: "Items are securely packed to minimize risk of damage during transit. Buyers are responsible for shipping fees unless stated otherwise. Tracking numbers will be provided once items are shipped.",
  },
  {
    number: 6,
    title: "Damaged or Defective Items",
    content: "Buyers must record an unboxing video upon receiving the item. Claims for damaged or defective items will only be accepted with an unboxing video.",
  },
  {
    number: 7,
    title: "Refunds & Cancellations",
    content: "Down payments or full payments are non-refundable once the order is confirmed. Cancellations are not allowed unless the item is unavailable from the supplier.",
  },
  {
    number: 8,
    title: "Authenticity",
    content: "All items sold are guaranteed authentic and sourced from trusted suppliers. No replicas or unofficial items are sold.",
  },
  {
    number: 9,
    title: "Buyer Responsibilities",
    content: "Ensure correct details (name, address, contact info) are provided for shipping. Communicate promptly for any concerns or clarifications.",
  },
  {
    number: 10,
    title: "Limitation of Liability",
    content: "The reseller is not liable for delays, lost packages after shipping, or damages caused by third-party couriers. Responsibility ends once the item is handed over to the courier with proper packaging.",
  },
  {
    number: 11,
    title: "Amendments",
    content: "Terms and conditions may be updated or changed at any time. Buyers will be notified of major changes.",
  },
];

export default function TermsPage() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setAnimKey((k) => k + 1);
  }, []);

  const goPrev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  const goNext = useCallback(() => {
    if (current < terms.length - 1) goTo(current + 1);
  }, [current, goTo]);

  const section = terms[current];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card card-padded animate-fade-in">

          {/* Back to Home */}
          <div className="mb-4">
            <Link href="/" className="btn-secondary text-sm inline-block">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <h1 className="text-xl sm:text-3xl font-bold text-center text-gray-900 mb-6">
            Terms & Conditions
          </h1>

          {/* Slide content — fixed height so card doesn't resize */}
          <div
            key={animKey}
            className="animate-fade-in h-[220px] sm:h-[200px] overflow-y-auto flex flex-col justify-start mb-6"
          >
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              {section.number}. {section.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-justify">
              {section.content}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {terms.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to section ${i + 1}`}
                className="w-2.5 h-2.5 rounded-sm transition-all"
                style={{
                  backgroundColor: i === current ? '#0c134c' : '#cbd5e1',
                  border: '1px solid #0c134c',
                }}
              />
            ))}
          </div>

          {/* Prev / Next navigation */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={goPrev}
              disabled={current === 0}
              className="btn-primary text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              onClick={goNext}
              disabled={current === terms.length - 1}
              className="btn-primary text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
