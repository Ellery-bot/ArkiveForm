"use client";

import Link from "next/link";

const formLinks = [
  {
    label: "1. BTS Army Bomb Lightstick V4 Pre-Order Link:",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSeiHsZxqkThv4arYNzEYKk0iEpDwSf97dP-DZrVYyRVNdAUfw/viewform",
  },
  {
    label: "2. BTS Pre-Order Masterlist: ",
    url: "https://docs.google.com/spreadsheets/d/1c1sYBo6gg09wqawHAoCzujvGaBoovWoUpYl3_EExdv4/pubhtml",
  },
];

export default function FormPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="card card-padded w-full max-w-xs sm:max-w-sm animate-fade-in">

        {/* Back to Home */}
        <div className="mb-4">
          <Link href="/" className="btn-secondary text-xs inline-block">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-base font-bold text-center mb-6">Form Links</h1>

        <div className="flex flex-col gap-4">
          {formLinks.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="text-xs font-bold">{item.label}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] break-all text-blue-600 underline hover:opacity-75"
              >
                {item.url}
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
