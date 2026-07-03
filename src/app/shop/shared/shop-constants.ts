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

/** Base product-type categories that follow a fixed pinned order. */
export const BASE_CATEGORIES = ['preorder', 'onhand', 'lightstick', 'lightsticks', 'album', 'albums', 'photocards'];

/**
 * Pinned order: preorder → onhand → lightstick(s) → album(s) → artist cats (a–z) → photocards
 * Handles both singular and plural slug variants stored in the DB.
 */
const PINNED_ORDER = ['preorder', 'onhand', 'lightstick', 'lightsticks', 'album', 'albums'];
const PINNED_TAIL  = ['photocards'];

/**
 * Display label overrides — handles singular slugs and adds plural display names.
 */
export const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  lightstick: 'LIGHTSTICKS',
  album: 'ALBUMS',
};

/**
 * Sort order: preorder → onhand → lightstick(s) → album(s) → custom (a–z) → photocards
 */
export function sortCategories(categories: string[]): string[] {
  const pinned  = PINNED_ORDER.filter((c) => categories.includes(c));
  const tail    = PINNED_TAIL.filter((c) => categories.includes(c));
  const custom  = categories.filter((c) => !BASE_CATEGORIES.includes(c)).sort();
  return [...pinned, ...custom, ...tail];
}
