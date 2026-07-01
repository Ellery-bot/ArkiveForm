'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  categories: string[];
  active: boolean;
  quantity: number;
}

export function AdminProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [soldOut, setSoldOut] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category management
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCatMgmt, setShowCatMgmt] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');
  const [catAdding, setCatAdding] = useState(false);
  const [catRemoving, setCatRemoving] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setError(''), 4000);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setAvailableCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name) return;
    setCatError('');
    setCatAdding(true);
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCatAdding(false);
    if (res.ok) {
      setNewCatName('');
      fetchCategories();
    } else {
      const err = await res.json();
      setCatError(err.error ?? 'Failed to add category.');
    }
  };

  const handleRemoveCategory = async (name: string) => {
    setCatRemoving(name);
    const res = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setCatRemoving(null);
    if (res.ok) {
      fetchCategories();
      setCategories((prev) => prev.filter((c) => c !== name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!title.trim()) {
      showError('Product title is required.');
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      showError('A valid price is required.');
      return;
    }
    if (originalPrice && (isNaN(parseFloat(originalPrice)) || parseFloat(originalPrice) <= 0)) {
      showError('Original price must be a valid number greater than 0.');
      return;
    }
    if (categories.length === 0) {
      showError('Please select at least one category.');
      return;
    }
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
      showError('Quantity must be at least 1.');
      return;
    }
    if (!editingId && !imageFile) {
      showError('Please upload a product image.');
      return;
    }
    if (editingId && !imageFile && !imagePreview) {
      showError('Please upload a product image.');
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('price', price);
    fd.append('originalPrice', originalPrice);
    fd.append('categories', JSON.stringify(categories));
    fd.append('active', String(!soldOut));
    fd.append('quantity', quantity);
    if (imageFile) fd.append('image', imageFile);

    try {
      const method = editingId ? 'PATCH' : 'POST';
      if (editingId) fd.append('id', editingId);

      const res = await fetch('/api/admin/products', { method, body: fd });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || 'Operation failed');
        return;
      }

      // Reset form
      setTitle('');
      setPrice('');
      setOriginalPrice('');
      setCategories([]);
      setImageFile(null);
      setImagePreview(null);
      setSoldOut(false);
      setQuantity('');
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(String(product.price));
    setOriginalPrice(product.original_price ? String(product.original_price) : '');
    setCategories(product.categories);
    setImageFile(null);
    setImagePreview(product.image_url ?? null);
    setSoldOut(!product.active);
    setQuantity(String(product.quantity ?? 0));
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchProducts();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <>
      {error && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          background: '#dc2626', color: '#fff', padding: '12px 18px', borderRadius: '8px',
          fontSize: '12px', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          width: 'calc(100% - 32px)', maxWidth: '360px', textAlign: 'center',
          pointerEvents: 'none', lineHeight: 1.5,
        }}>
          ⚠ {error}
        </div>
      )}
      {/* Manage Categories */}
      <div className="mb-6 border-2 border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCatMgmt((v) => !v)}
          className="w-full flex justify-between items-center px-4 py-3 text-xs font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span>Manage Categories</span>
          <span className="text-[10px]">{showCatMgmt ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showCatMgmt && (
          <div className="px-4 py-3 flex flex-col gap-3">
            {/* Existing categories */}
            {availableCategories.length === 0 ? (
              <p className="text-xs text-gray-400">No categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      disabled={catRemoving === cat}
                      className="text-red-400 hover:text-red-600 ml-1 leading-none disabled:opacity-40"
                      aria-label={`Remove ${cat}`}
                    >
                      {catRemoving === cat ? '…' : '✕'}
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Add new category */}
            <form onSubmit={handleAddCategory} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="new-category"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 flex-1"
              />
              <button
                type="submit"
                disabled={catAdding || !newCatName.trim()}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {catAdding ? '…' : '+ Add'}
              </button>
            </form>
            {catError && <p className="text-red-600 text-[10px]">{catError}</p>}
            <p className="text-[10px] text-gray-400">Names are lowercased and spaces become hyphens.</p>
          </div>
        )}
      </div>

      <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-900">Manage Products</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setTitle('');
            setPrice('');
            setOriginalPrice('');
            setCategories([]);
            setImageFile(null);
            setImagePreview(null);
            setSoldOut(false);
            setQuantity('');
            setError('');
          }}
          className="btn-secondary text-xs"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700">Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700">Price (PHP) <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="number"
              placeholder="e.g. 499.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0.01"
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
              required
            />
          </div>
          <input
            type="number"
            placeholder="Original price (optional)"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            step="0.01"
            className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700">Quantity <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="1"
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700">Categories <span style={{ color: '#dc2626' }}>*</span></label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-1 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCategories([...categories, cat]);
                      } else {
                        setCategories(categories.filter((c) => c !== cat));
                      }
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-700">Product image: <span style={{ color: '#dc2626' }}>*</span></label>
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border border-gray-300" />}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="border-2 border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 w-full"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} />
            Sold Out
          </label>

          <button type="submit" disabled={submitting} className="btn-primary text-xs py-2 disabled:opacity-50">
            {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Product
          </button>
        </form>
      )}

      {!showForm && (loading ? (
        <p className="text-xs text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-xs text-gray-500">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border border-gray-300">
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Qty</th>
                <th className="px-3 py-2 text-left">Categories</th>
                <th className="px-3 py-2 text-left">Sold Out</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border border-gray-300">
                  <td className="px-3 py-2">{product.title}</td>
                  <td className="px-3 py-2">₱{product.price.toFixed(2)}</td>
                  <td className="px-3 py-2">{product.quantity ?? 0}</td>
                  <td className="px-3 py-2">{product.categories.join(', ')}</td>
                  <td className="px-3 py-2">{!product.active ? '✓' : '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      </div>
    </>
  );
}
