export const PINK = '#1520A6';
export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
export const BG_COLORS = [
  '#1520A6', '#1a27c9', '#0e1680', '#2336d4',
  '#3d52e0', '#0a0f6b', '#4a63e8', '#6b7ff0',
];
export const NAV_LINKS = [
  { label: 'PRE-ORDER', href: '/shop/preorder' },
  { label: 'ON HAND', href: '/shop/onhand' },
  { label: 'LIGHTSTICKS', href: '/shop/lightsticks' },
  { label: 'PHOTOCARDS', href: '/shop/photocards' },
] as const;

/** Base product-type categories always pinned to the end of the nav. */
export const BASE_CATEGORIES = ['preorder', 'onhand', 'lightsticks', 'photocards'];

/**
 * Sorts categories so custom/artist ones come first (alphabetically),
 * followed by base product-type ones in their original order.
 */
export function sortCategories(categories: string[]): string[] {
  const base = BASE_CATEGORIES.filter((c) => categories.includes(c));
  const custom = categories.filter((c) => !BASE_CATEGORIES.includes(c)).sort();
  return [...custom, ...base];
}
