'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string; // for backward compatibility
  image_urls?: string[];
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    if (!editingId && imageFiles.length === 0) {
      showError('Please upload at least one product image.');
      return;
    }
    if (editingId && imageFiles.length === 0 && imagePreviews.length === 0) {
      showError('Please upload at least one product image.');
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
    
    imageFiles.forEach(file => {
      fd.append('images', file);
    });

    try {
      const method = editingId ? 'PATCH' : 'POST';
      if (editingId) {
        fd.append('id', editingId);
        fd.append('existingImageUrls', JSON.stringify(imagePreviews));
      }

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
      setImageFiles([]);
      setImagePreviews([]);
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
    setImageFiles([]);
    
    // Handle both single and multiple images for backward compatibility
    const existingImages = product.image_urls ?? (product.image_url ? [product.image_url] : []);
    setImagePreviews(existingImages);

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
            setImageFiles([]);
            setImagePreviews([]);
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

          <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-700">Product Images (up to 7) <span style={{ color: '#dc2626' }}>*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded border border-gray-300" />
                  <button
                    type="button"
                    onClick={() => {
                      const removedPreview = imagePreviews[index];

                      // Revoke blob URL to prevent memory leaks
                      if (removedPreview.startsWith('blob:')) {
                        URL.revokeObjectURL(removedPreview);
                      }
                      
                      // Count how many previews before this one were also for new files
                      let fileIndexToRemove = -1;
                      if (removedPreview.startsWith('blob:')) {
                        let newFileCounter = 0;
                        for (let i = 0; i < index; i++) {
                          if (imagePreviews[i].startsWith('blob:')) {
                            newFileCounter++;
                          }
                        }
                        fileIndexToRemove = newFileCounter;
                      }
                      
                      const newImagePreviews = [...imagePreviews];
                      newImagePreviews.splice(index, 1);
                      setImagePreviews(newImagePreviews);
                  
                      if (fileIndexToRemove > -1) {
                        const newImageFiles = [...imageFiles];
                        newImageFiles.splice(fileIndexToRemove, 1);
                        setImageFiles(newImageFiles);
                      }
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const newFiles = Array.from(files);
                  if (imageFiles.length + newFiles.length > 7) {
                    showError('You can upload a maximum of 7 images.');
                    return;
                  }
                  setImageFiles([...imageFiles, ...newFiles]);
                  const newPreviews = newFiles.map(file => URL.createObjectURL(file));
                  setImagePreviews([...imagePreviews, ...newPreviews]);
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
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left w-12">Img</th>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Price</th>
                <th className="px-3 py-2 text-right w-12">Qty</th>
                <th className="px-3 py-2 text-left">Categories</th>
                <th className="px-3 py-2 text-center w-20">Status</th>
                <th className="px-3 py-2 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const thumb = product.image_urls?.[0] ?? product.image_url ?? null;
                const isActive = product.active && product.quantity > 0;
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-10 h-10 object-cover rounded border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-300 text-[10px]">No img</div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 max-w-[220px]">{product.title}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-gray-700">₱{product.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{product.quantity ?? 0}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((c) => (
                          <span key={c} className="bg-gray-100 border border-gray-300 rounded-full px-2 py-0.5 text-[10px] text-gray-600 whitespace-nowrap">{c}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {isActive ? 'Active' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      </div>
    </>
  );
}
