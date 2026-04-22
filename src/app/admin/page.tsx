'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Login form
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add review form
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [date, setDate] = useState(''); // stored as YYYY-MM-DD from <input type="date">
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    const res = await fetch('/api/admin/reviews');
    if (res.status === 401) {
      setIsAuthed(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setIsAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword('');
      setLoading(true);
      fetchReviews();
    } else {
      setLoginError('Wrong password. Try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthed(false);
    setReviews([]);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    setSubmitting(true);
    // Format YYYY-MM-DD → "January 15, 2026"
    const [year, month, day] = date.split('-');
    const formattedDate = new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating, text, date: formattedDate }),
    });
    setSubmitting(false);
    if (res.ok) {
      setName('');
      setRating(5);
      setText('');
      setDate('');
      setFormSuccess(true);
      fetchReviews();
    } else {
      const err = await res.json();
      setFormError(err.error ?? 'Failed to add review.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xs">Loading...</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="card card-padded w-full max-w-xs animate-fade-in">
          <h1 className="text-base font-bold text-center text-gray-900 mb-6">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 w-full"
              required
              autoComplete="current-password"
            />
            {loginError && (
              <p className="text-red-600 text-xs">{loginError}</p>
            )}
            <button type="submit" className="btn-primary text-xs py-2">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="card card-padded animate-fade-in">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-base font-bold text-gray-900">Admin Panel</h1>
            <button onClick={handleLogout} className="btn-secondary text-xs">
              Logout
            </button>
          </div>

          {/* Add Review Form */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Add New Review</h2>
            <form onSubmit={handleAddReview} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                required
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-700 shrink-0">Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 flex-1"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Review text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 min-h-[80px] resize-y"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-700">Date of review:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                  required
                />
              </div>
              {formError && <p className="text-red-600 text-xs">{formError}</p>}
              {formSuccess && (
                <p className="text-green-600 text-xs">Review added successfully!</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : '+ Add Review'}
              </button>
            </form>
          </section>

          {/* Existing Reviews */}
          <section>
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-2 border-gray-200 rounded-lg p-3 flex justify-between items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900">{review.name}</p>
                      <p className="text-[10px] text-yellow-500 mb-1">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </p>
                      <p className="text-[10px] text-gray-700 line-clamp-2">{review.text}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-500 text-sm shrink-0 hover:text-red-700 leading-none"
                      aria-label="Delete review"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
