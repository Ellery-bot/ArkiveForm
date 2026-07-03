'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Categories that should appear first in the carousel, in this exact order.
// Any category not listed here is appended after in whatever order the API returns it.
const CATEGORY_ORDER = ['preorder', 'onhand', 'lightsticks', 'album', 'bts', 'blackpink'];

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

function SortableProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: isDragging ? '#eff6ff' : undefined,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };
  const thumb = product.image_urls?.[0] ?? product.image_url ?? null;
  const isActive = product.active && product.quantity > 0;
  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 transition-colors">
      <td className="px-2 py-2 text-center">
        <button
          {...attributes}
          {...listeners}
          style={{ touchAction: 'none' }}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 select-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          &#8942;&#8942;
        </button>
      </td>
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
        <button onClick={() => onEdit(product)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mr-3">
          Edit
        </button>
        <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium">
          Delete
        </button>
      </td>
    </tr>
  );
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
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    // Mouse only — requires 8 px movement so clicks on Edit/Delete still fire
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Touch only — hold for 200 ms to start drag; keeps normal scroll working
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
      setOrderDirty(false);
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
        // Only send real Supabase URLs — blob: URLs are local previews for newly selected
        // files and must never be persisted to the database.
        const persistedUrls = imagePreviews.filter((url) => !url.startsWith('blob:'));
        fd.append('existingImageUrls', JSON.stringify(persistedUrls));
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

  const handleCategoryDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setProducts((allProducts) => {
      // Collect the global-array indices for products belonging to this category,
      // preserving their current relative order (which reflects sort_order).
      const catIndices: number[] = [];
      const catProducts: Product[] = [];
      allProducts.forEach((p, i) => {
        if (p.categories.includes(category)) {
          catIndices.push(i);
          catProducts.push(p);
        }
      });

      const oldIdx = catProducts.findIndex((p) => p.id === active.id);
      const newIdx = catProducts.findIndex((p) => p.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return allProducts;

      // Reorder the category subset, then stitch it back into the global array.
      const reordered = arrayMove(catProducts, oldIdx, newIdx);
      const next = [...allProducts];
      catIndices.forEach((globalIdx, i) => {
        next[globalIdx] = reordered[i];
      });
      return next;
    });
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setOrderSaving(true);
    try {
      const updates = products.map((p, i) => ({ id: p.id, sort_order: i + 1 }));
      const res = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) {
        showError('Failed to save order.');
      } else {
        setOrderDirty(false);
      }
    } catch {
      showError('Failed to save order.');
    } finally {
      setOrderSaving(false);
    }
  };

  // Carousel: build the ordered list of navigable category sections
  const activeCats = availableCategories.filter((cat) =>
    products.some((p) => p.categories.includes(cat)),
  );
  const navigableSections = [
    // Priority categories first, in the defined order, skipping any not present
    ...CATEGORY_ORDER.filter((cat) => activeCats.includes(cat)),
    // Remaining categories (not in the priority list) in their original API order
    ...activeCats.filter((cat) => !CATEGORY_ORDER.includes(cat)),
    // Uncategorized products last
    ...(products.some((p) => !p.categories || p.categories.length === 0)
      ? ['__uncategorized__']
      : []),
  ];
  const safeCatIndex = Math.min(activeCatIndex, Math.max(0, navigableSections.length - 1));
  const currentSection = navigableSections[safeCatIndex] ?? '';
  const isCurrentUncategorized = currentSection === '__uncategorized__';
  const currentCatLabel = isCurrentUncategorized ? 'Uncategorized' : currentSection;
  const currentCatProducts = isCurrentUncategorized
    ? products.filter((p) => !p.categories || p.categories.length === 0)
    : products.filter((p) => p.categories.includes(currentSection));

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
        <div className="flex items-center gap-2">
          {orderDirty && !showForm && (
            <>
              <button
                onClick={handleSaveOrder}
                disabled={orderSaving}
                className="text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-800 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {orderSaving ? 'Saving…' : 'Save Order'}
              </button>
              <button
                onClick={() => { fetchProducts(); }}
                disabled={orderSaving}
                className="text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </>
          )}
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
        <div>
          {/* Prev / Next category navigation */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setActiveCatIndex((i) => Math.max(0, i - 1))}
              disabled={safeCatIndex === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none flex-shrink-0"
              aria-label="Previous category"
            >
              &#8249;
            </button>
            <div className="flex-1 text-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                  {currentCatLabel}
                </span>
                <span className="ml-2 text-[10px] text-gray-400">
                  {currentCatProducts.length} {currentCatProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              {navigableSections.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-1.5">
                  {navigableSections.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCatIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === safeCatIndex ? 'bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to category ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveCatIndex((i) => Math.min(navigableSections.length - 1, i + 1))}
              disabled={safeCatIndex === navigableSections.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none flex-shrink-0"
              aria-label="Next category"
            >
              &#8250;
            </button>
          </div>

          {/* Current category's product table */}
          {!isCurrentUncategorized ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleCategoryDragEnd(e, currentSection)}
            >
              <SortableContext
                items={currentCatProducts.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-2 w-8"></th>
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
                      {currentCatProducts.map((product) => (
                        <SortableProductRow
                          key={`${currentSection}-${product.id}`}
                          product={product}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left w-12">Img</th>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-right whitespace-nowrap">Price</th>
                    <th className="px-3 py-2 text-right w-12">Qty</th>
                    <th className="px-3 py-2 text-center w-20">Status</th>
                    <th className="px-3 py-2 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentCatProducts.map((product) => {
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
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {isActive ? 'Active' : 'Sold Out'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-[10px] font-medium mr-3">Edit</button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-[10px] font-medium">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      </div>
    </>
  );
}
