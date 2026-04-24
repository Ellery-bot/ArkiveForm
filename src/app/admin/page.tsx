'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  image_url?: string | null;
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Login form
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Add review form
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [date, setDate] = useState(''); // stored as YYYY-MM-DD from <input type="date">
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete confirmation modal
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Reviews list toggle
  const [showReviews, setShowReviews] = useState(false);

  // Edit modal
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

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

    const fd = new FormData();
    fd.append('name', name);
    fd.append('rating', String(rating));
    fd.append('text', text);
    fd.append('date', formattedDate);
    if (imageFile) fd.append('image', imageFile);

    const res = await fetch('/api/admin/reviews', { method: 'POST', body: fd });
    setSubmitting(false);
    if (res.ok) {
      setName('');
      setRating(5);
      setText('');
      setDate('');
      setImageFile(null);
      setImagePreview(null);
      setFormSuccess(true);
      fetchReviews();
    } else {
      const err = await res.json();
      setFormError(err.error ?? 'Failed to add review.');
    }
  };

  const openEdit = (review: Review) => {
    setEditReview(review);
    setEditName(review.name);
    setEditRating(review.rating);
    setEditText(review.text);
    // Parse "January 15, 2026" back to YYYY-MM-DD for the date input
    const parsed = new Date(review.date);
    setEditDate(
      isNaN(parsed.getTime())
        ? ''
        : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    );
    setEditImageFile(null);
    setEditImagePreview(review.image_url ?? null);
    setEditRemoveImage(false);
    setEditError('');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReview) return;
    setEditError('');
    setEditSubmitting(true);

    const [year, month, day] = editDate.split('-');
    const formattedDate = new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const fd = new FormData();
    fd.append('id', editReview.id);
    fd.append('name', editName);
    fd.append('rating', String(editRating));
    fd.append('text', editText);
    fd.append('date', formattedDate);
    fd.append('remove_image', editRemoveImage ? 'true' : 'false');
    if (editImageFile) fd.append('image', editImageFile);

    const res = await fetch('/api/admin/reviews', { method: 'PATCH', body: fd });
    setEditSubmitting(false);
    if (res.ok) {
      setEditReview(null);
      fetchReviews();
    } else {
      const err = await res.json();
      setEditError(err.error ?? 'Failed to save changes.');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchReviews();
    setConfirmId(null);
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 w-full pr-9"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
                  max={new Date().toISOString().split('T')[0]}
                  className="border-2 border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-900 w-full appearance-none"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-700">Review image:</label>
                <input
                  id="add-image-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImagePreview(url);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                />
                <label
                  htmlFor="add-image-input"
                  className="inline-flex items-center gap-2 cursor-pointer border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors w-fit"
                >
                  <span>{imageFile ? imageFile.name : 'Choose image'}</span>
                </label>
                {imagePreview && (
                  <div className="flex flex-col gap-1 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-[10px] text-red-600 hover:text-red-800 font-medium text-left w-fit"
                    >
                      ✕ Remove image
                    </button>
                  </div>
                )}
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
            <button
              onClick={() => setShowReviews((v) => !v)}
              className="w-full flex justify-between items-center text-sm font-bold text-gray-900 mb-4 hover:opacity-70 transition-opacity"
            >
              <span>Reviews ({reviews.length})</span>
              <span className="text-xs">{showReviews ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showReviews && (
              reviews.length === 0 ? (
                <p className="text-xs text-gray-500">No reviews yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-2 border-gray-200 rounded-lg p-3 flex justify-between items-start gap-3"
                    >
                      {review.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.image_url}
                          alt=""
                          className="w-14 h-14 object-cover rounded border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900">{review.name}</p>
                        <p className="text-[10px] text-yellow-500 mb-1">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </p>
                        <p className="text-[10px] text-gray-700 line-clamp-2">{review.text}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(review)}
                          className="text-blue-500 text-xs hover:text-blue-700 leading-none px-1"
                          aria-label="Edit review"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => setConfirmId(review.id)}
                          className="text-red-500 text-xs hover:text-red-700 leading-none px-1"
                          aria-label="Delete review"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>

        </div>
      </div>

      {/* Edit modal */}
      {editReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="card card-padded w-full max-w-sm animate-fade-in my-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-900">Edit Review</h2>
              <button onClick={() => setEditReview(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <form onSubmit={handleEditSave} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Customer name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                required
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-700 shrink-0">Rating:</label>
                <select
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
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
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 min-h-[80px] resize-y"
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-700">Date of review:</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="border-2 border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-900 w-full appearance-none"
                  style={{ minHeight: '44px' }}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-700">Review image:</label>
                {editImagePreview && !editRemoveImage && (
                  <div className="flex flex-col gap-1 mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editImagePreview} alt="Current" className="w-24 h-24 object-cover rounded border-2 border-gray-300" />
                    <button
                      type="button"
                      onClick={() => { setEditRemoveImage(true); setEditImagePreview(null); setEditImageFile(null); }}
                      className="text-[10px] text-red-600 hover:text-red-800 font-medium text-left w-fit"
                    >
                      ✕ Remove image
                    </button>
                  </div>
                )}
                <input
                  id="edit-image-input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setEditImageFile(file);
                    setEditRemoveImage(false);
                    if (file) {
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label
                  htmlFor="edit-image-input"
                  className="inline-flex items-center gap-2 cursor-pointer border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors w-fit"
                >
                  <span>{editImageFile ? editImageFile.name : 'Choose image'}</span>
                </label>
              </div>
              {editError && <p className="text-red-600 text-xs">{editError}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setEditReview(null)}
                  className="btn-secondary text-xs py-2 flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn-primary text-xs py-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom delete confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="card card-padded w-full max-w-xs animate-fade-in text-center">
            <p className="text-sm font-bold text-gray-900 mb-2">Delete Review?</p>
            <p className="text-xs text-gray-600 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="btn-secondary text-xs py-2 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                className="btn-primary text-xs py-2 flex-1"
                style={{ background: '#c0392b' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
