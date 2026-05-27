'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string; // unique cart item ID
  productId: string; // product ID from DB
  title: string;
  price: number;
  quantity: number;
  image?: string;
  stockQuantity?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: string; title: string; price: number; image?: string; stockQuantity?: number }, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (product: { id: string; title: string; price: number; image?: string; stockQuantity?: number }, quantity = 1) => {
    setCartItems((prev) => {
      // Check if product already in cart
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const capped = product.stockQuantity != null ? Math.min(newQty, product.stockQuantity) : newQty;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: capped, stockQuantity: product.stockQuantity ?? item.stockQuantity }
            : item
        );
      }
      // Add new item
      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}-${Math.random()}`,
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: quantity,
          image: product.image,
          stockQuantity: product.stockQuantity,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;
        const capped = item.stockQuantity != null ? Math.min(quantity, item.stockQuantity) : quantity;
        return { ...item, quantity: capped };
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
