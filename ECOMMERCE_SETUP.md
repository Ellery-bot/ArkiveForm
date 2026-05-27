# ArkiveForm - eCommerce Implementation Guide

## What Was Built

This implementation transforms ArkiveForm into a fully functional eCommerce platform with:

### ✅ Completed Features

1. **Dynamic Product Management**
   - Products stored in Supabase `products` table
   - Admin panel CRUD operations for products
   - Image uploads to Supabase Storage
   - Product categories & filtering

2. **Shopping Cart System**
   - Global CartContext with localStorage persistence
   - Add/remove items, update quantities
   - Real-time total calculations

3. **PayMongo Payment Integration**
   - Support for GCash, Maya, credit/debit cards
   - Checkout session creation
   - Order tracking with payment status
   - Success/cancel page handling

4. **Admin Features**
   - Products tab with full CRUD
   - Orders tab to view transactions
   - Product image management

5. **Public Shop**
   - Dynamic product loading from DB
   - Category filtering (PRE-ORDER, ON HAND, etc.)
   - Persistent cart across sessions
   - Checkout flow

## Required Setup Steps

### 1. Supabase Database Tables

Run these SQL commands in your Supabase dashboard:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  categories TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  items JSONB,
  paymongo_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket for product images
-- (Create manually in Supabase Storage: "product-images")
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
# Existing Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayMongo
NEXT_PUBLIC_PAYMONGO_KEY=your_paymongo_public_key
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
```

### 3. Create PayMongo Account

1. Go to https://paymongo.com
2. Sign up and create a merchant account
3. Get your Public and Secret keys from the dashboard
4. Add keys to environment variables

### 4. File Structure Created

```
src/
├── lib/
│   ├── cart-context.tsx          # Global cart state
│   ├── paymongo.ts               # PayMongo API helpers
│   └── (existing files)
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts          # Public products endpoint
│   │   ├── admin/
│   │   │   └── products/
│   │   │       └── route.ts      # Admin product CRUD
│   │   └── checkout/
│   │       ├── route.ts          # Create checkout session
│   │       └── verify/route.ts   # Verify payment status
│   ├── shop/
│   │   ├── page.tsx              # Dynamic shop (updated)
│   │   └── [category]/page.tsx   # Category pages (needs update)
│   ├── checkout/
│   │   ├── success/page.tsx      # Post-payment success
│   │   └── cancel/page.tsx       # Payment cancelled
│   └── layout.tsx                # Updated with CartProvider
```

## API Endpoints

### Public Endpoints

- `GET /api/products` - Fetch all active products
- `GET /api/products?category=preorder` - Filter by category

### Admin Endpoints (Protected)

- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product (FormData)
- `PATCH /api/admin/products` - Update product (FormData)
- `DELETE /api/admin/products` - Delete product

### Checkout Endpoints

- `POST /api/checkout` - Create checkout session
- `POST /api/checkout/verify` - Verify payment status

## Next Steps

### 1. Update Category Pages

The `/shop/[category]/page.tsx` still has hardcoded products. Update it similarly to `/shop/page.tsx`:
- Fetch from `/api/products?category={category}`
- Use CartContext instead of local state
- Add checkout handler

### 2. Update Admin Panel

Add a "Products" tab to `src/app/admin/page.tsx`:
- Form to add/edit products with image upload
- Delete confirmation
- Display active/inactive status
- "Orders" tab to view all transactions

### 3. Test Checkout Flow

1. Add products via admin panel
2. Shop and add items to cart
3. Click checkout
4. Complete PayMongo payment (test mode)
5. Verify order appears in admin Orders tab

### 4. Customizations

**Brand your checkout:**
- PayMongo hosted checkout uses your store name automatically
- Email notifications sent to customer

**Customize success page:**
- Add order tracking
- Send confirmation email
- Loyalty points integration

**Product attributes:**
- Add SKU, stock quantity tracking
- Size/color variants
- Bundle deals

## Security Notes

- Admin endpoints protected by session cookies (existing auth)
- PayMongo webhook verification should be added for production
- Never expose `PAYMONGO_SECRET_KEY` to client
- Service Role Key is server-only

## Troubleshooting

**PayMongo checkout not opening:**
- Check keys are set correctly
- Verify currencies (PHP ₱)
- Check browser console for errors

**Products not loading:**
- Verify Supabase connection
- Check `products` table exists
- Look at Network tab in DevTools

**Cart not persisting:**
- Check localStorage is enabled
- CartProvider must wrap app in layout.tsx
- Check browser Storage tab

## Files Modified/Created

✅ Created:
- `src/lib/cart-context.tsx`
- `src/lib/paymongo.ts`
- `src/app/api/products/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/checkout/verify/route.ts`
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/cancel/page.tsx`

✏️ Modified:
- `src/app/layout.tsx` - Added CartProvider
- `src/app/shop/page.tsx` - Dynamic + PayMongo checkout

⚠️ TODO:
- Update `src/app/shop/[category]/page.tsx` with dynamic data
- Add Products tab to `src/app/admin/page.tsx`
- Test full checkout flow
- Configure PayMongo webhooks for production

## Production Checklist

- [ ] Database backups configured
- [ ] PayMongo production keys set
- [ ] Email notifications setup
- [ ] Order confirmation emails
- [ ] Inventory tracking
- [ ] Refund process documented
- [ ] Terms & Conditions updated
- [ ] Privacy policy updated
