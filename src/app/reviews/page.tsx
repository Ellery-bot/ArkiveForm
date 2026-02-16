'use client';

import Link from "next/link";
import { useState } from "react";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {[...Array(5)].map((_, i) => (
        <img
          key={i}
          src={i < rating ? "/star.png" : "/star-empty.png"}
          alt="star"
          className="w-6 h-6"
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  const currentReview = reviews[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Customer Reviews</h1>
          
          {/* Average Rating */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <StarRating rating={Math.round(parseFloat(averageRating))} />
            </div>
            <p className="text-lg font-semibold">
              {averageRating} out of 5 stars
            </p>
            <p className="text-sm text-gray-600">
              Based on {reviews.length} customer reviews
            </p>
          </div>

          <hr className="my-8" />

          {/* Review Slideshow */}
          <section className="mb-8">
            <div className="min-h-64 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl">{currentReview.name}</h3>
                  <p className="text-sm text-gray-600">{currentReview.date}</p>
                </div>
                <StarRating rating={currentReview.rating} />
              </div>
              <p className="text-base text-gray-800 leading-relaxed mb-6">
                {currentReview.text}
              </p>
            </div>

            {/* Navigation and Indicator */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrev}
                className="btn-primary text-sm"
              >
                ← Previous
              </button>
              <span className="text-sm font-semibold">
                {currentIndex + 1} of {reviews.length}
              </span>
              <button
                onClick={handleNext}
                className="btn-primary text-sm"
              >
                Next →
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </section>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/" className="btn-secondary text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
