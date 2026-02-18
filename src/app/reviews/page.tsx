'use client';

import Link from "next/link";
import { useState, useCallback } from "react";

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Maria Santos",
    rating: 5,
    text: "Amazing service! The team was very professional and helpful. Highly recommended for anyone looking for event tickets.",
    date: "January 2026"
  },
  {
    id: 2,
    name: "John Reyes",
    rating: 5,
    text: "Excellent experience from start to finish. The booking process was smooth and the customer support was outstanding.",
    date: "January 2026"
  },
  {
    id: 3,
    name: "Angela Cruz",
    rating: 4,
    text: "Great service overall. Very responsive team and competitive pricing. Would definitely use again for future events.",
    date: "December 2025"
  },
  {
    id: 4,
    name: "Miguel Torres",
    rating: 5,
    text: "Five stars! Got my tickets quickly and the whole process was hassle-free. Best ticketing service I've used.",
    date: "December 2025"
  },
  {
    id: 5,
    name: "Isabella Fernandez",
    rating: 5,
    text: "Very professional and reliable. They answered all my questions promptly and made the booking experience enjoyable.",
    date: "November 2025"
  },
  {
    id: 6,
    name: "Carlos Mendez",
    rating: 4,
    text: "Good service and fair prices. The only thing could be improved is the payment method options, but overall satisfied.",
    date: "November 2025"
  }
];

// Pixel hearts / power bar (health meter style)
function PixelHearts({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of 5`}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="inline-block w-4 h-4 border-2 border-[#0F380F]"
          style={{
            backgroundColor: i < rating ? '#9BBC0F' : '#306230',
            imageRendering: 'pixelated',
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}

// Play subtle 8-bit chime when review changes
function useReviewChime() {
  return useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore if AudioContext not supported
    }
  }, []);
}

export default function ReviewsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const playChime = useReviewChime();
  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  const currentReview = reviews[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    playChime();
  }, [playChime]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    playChime();
  }, [playChime]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    playChime();
  }, [playChime]);

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl mx-auto">
        {/* Gameboy shell - fixed dimensions for stable layout */}
        <div
          className="rounded-[2rem] p-6 sm:p-8 shadow-2xl w-full"
          style={{
            background: 'linear-gradient(180deg, #8b8b9e 0%, #5c5c6b 40%, #4a4a56 100%)',
            border: '4px solid #3d3d47',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top bezel */}
          <div className="flex justify-center mb-4">
            <div
              className="w-24 h-3 rounded-full"
              style={{ background: '#2d2d35', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}
              aria-hidden
            />
          </div>

          {/* Screen frame */}
          <div
            className="rounded-lg p-3 mb-6"
            style={{
              background: 'linear-gradient(180deg, #1a1a24 0%, #0d0d12 100%)',
              border: '4px solid #2d2d35',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
            }}
          >
            {/* LCD screen area with greenish tint - fixed height for stable layout */}
            <div
              className="rounded-md p-4 h-[340px] relative overflow-hidden flex flex-col"
              style={{
                background: 'linear-gradient(180deg, #9BBC0F 0%, #8BAC0F 20%, #306230 60%, #0F380F 100%)',
                boxShadow: 'inset 0 0 30px rgba(15, 56, 15, 0.9)',
                color: '#0F380F',
              }}
            >
              {/* Scanlines effect (subtle) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
                }}
                aria-hidden
              />

              {/* Title */}
              <h1
                className="text-center text-xs sm:text-sm mb-3"
                style={{ fontFamily: 'var(--font-pixel), "Press Start 2P", monospace', color: '#0F380F' }}
              >
                ★ REVIEWS ★
              </h1>

              {/* Average rating - power bar style */}
              <div className="flex flex-col items-center mb-4">
                <PixelHearts rating={Math.round(parseFloat(averageRating))} />
                <p className="text-[10px] mt-1" style={{ color: '#0F380F' }}>
                  {averageRating}/5 · {reviews.length} REVIEWS
                </p>
              </div>

              {/* RPG dialogue box - fixed height, scroll if text overflows */}
              <div
                className="gb-review-enter rounded border-4 p-4 mb-4 flex-1 min-h-0 overflow-y-auto"
                style={{
                  borderColor: '#0F380F',
                  backgroundColor: 'rgba(155, 188, 15, 0.4)',
                  boxShadow: 'inset 0 0 0 2px #8BAC0F',
                }}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3
                    className="text-[10px] font-bold"
                    style={{ color: '#0F380F' }}
                  >
                    {currentReview.name}
                  </h3>
                  <PixelHearts rating={currentReview.rating} />
                </div>
                <p className="text-[9px] leading-relaxed mb-1" style={{ color: '#0F380F' }}>
                  {currentReview.text}
                </p>
                <p className="text-[8px] opacity-80" style={{ color: '#0F380F' }}>
                  {currentReview.date}
                </p>
                <span
                  className="gb-cursor-blink inline-block ml-1 text-[10px]"
                  style={{ color: '#0F380F' }}
                  aria-hidden
                >
                  █
                </span>
              </div>

              {/* Screen nav: 1 of 6 */}
              <p className="text-center text-[8px]" style={{ color: '#0F380F' }}>
                {currentIndex + 1} / {reviews.length}
              </p>
            </div>
          </div>

          {/* Controls row: D-pad + A/B */}
          <div className="flex items-center justify-between gap-4">
            {/* D-pad - same size as A/B buttons */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <button
                  onClick={goPrev}
                  className="w-14 h-14 flex items-center justify-center rounded-l-md"
                  style={{
                    background: 'linear-gradient(90deg, #5c5c6b 0%, #3d3d47 100%)',
                    border: '2px solid #2d2d35',
                    boxShadow: '2px 0 0 #2d2d35',
                    color: '#0F380F',
                  }}
                  aria-label="Previous review"
                >
                  <span className="text-lg leading-none">◀</span>
                </button>
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{
                    background: '#3d3d47',
                    border: '2px solid #2d2d35',
                    borderRadius: '4px',
                  }}
                  aria-hidden
                />
                <button
                  onClick={goNext}
                  className="w-14 h-14 flex items-center justify-center rounded-r-md"
                  style={{
                    background: 'linear-gradient(270deg, #5c5c6b 0%, #3d3d47 100%)',
                    border: '2px solid #2d2d35',
                    boxShadow: '-2px 0 0 #2d2d35',
                    color: '#0F380F',
                  }}
                  aria-label="Next review"
                >
                  <span className="text-lg leading-none">▶</span>
                </button>
              </div>
            </div>

            {/* A / B buttons - same size as D-pad */}
            <div className="flex items-center gap-4">
              <button
                onClick={goPrev}
                className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #6b6b7a 0%, #4a4a56 100%)',
                  border: '3px solid #3d3d47',
                  boxShadow: '0 4px 0 #2d2d35, inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: '#0F380F',
                }}
                aria-label="Previous (B)"
              >
                B
              </button>
              <button
                onClick={goNext}
                className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #7a7a8a 0%, #5c5c6b 100%)',
                  border: '3px solid #4a4a56',
                  boxShadow: '0 4px 0 #3d3d47, inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: '#0F380F',
                }}
                aria-label="Next (A)"
              >
                A
              </button>
            </div>
          </div>

          {/* Dot indicators (cartridge slots vibe) */}
          <div className="flex justify-center gap-1.5 mt-4">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className="w-2.5 h-2.5 rounded-sm transition-all"
                style={{
                  backgroundColor: index === currentIndex ? '#9BBC0F' : '#306230',
                  border: '1px solid #0F380F',
                }}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>

          {/* INSERT CARTRIDGE CTA - for leaving a review */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block px-4 py-2 text-[10px] rounded border-2 transition hover:opacity-90"
              style={{
                borderColor: '#0F380F',
                backgroundColor: 'rgba(155, 188, 15, 0.5)',
                color: '#0F380F',
              }}
            >
              [ Back to Home ]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
