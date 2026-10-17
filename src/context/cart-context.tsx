"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id?: string;
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  size?: string | null;
  colour?: string | null;
  price: number;
  salePrice?: number | null;
  quantity: number;
  maxStock: number;
  imageUrl?: string | null;
  slug: string;
  customizations?: any;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (idOrVariantId: string) => void;
  updateQuantity: (idOrVariantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "thaagai_cart_items_v1";

function getItemKey(item: { variantId: string; id?: string; customizations?: any }): string {
  if (item.id) return item.id;
  if (item.customizations) {
    return `${item.variantId}-${JSON.stringify(item.customizations)}`;
  }
  return item.variantId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore storage read errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore storage write errors
      }
    }
  }, [items, mounted]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    const key = getItemKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => getItemKey(i) === key);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.maxStock);
        return prev.map((i) =>
          getItemKey(i) === key ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { ...item, id: key, quantity: Math.min(quantity, item.maxStock) }];
    });
  };

  const removeItem = (idOrVariantId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== idOrVariantId && i.variantId !== idOrVariantId));
  };

  const updateQuantity = (idOrVariantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(idOrVariantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === idOrVariantId || i.variantId === idOrVariantId) {
          const validQty = Math.min(quantity, i.maxStock);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
