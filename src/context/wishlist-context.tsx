"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  basePrice: number;
  salePrice: number | null;
  productType?: string;
  categoryName?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "thaagai_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read wishlist from localStorage:", e);
    }
    setMounted(true);
  }, []);

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist wishlist to localStorage:", e);
    }
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((it) => it.id === item.id);
    if (exists) {
      saveWishlist(wishlist.filter((it) => it.id !== item.id));
    } else {
      saveWishlist([...wishlist, item]);
    }
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((it) => it.id === id);
  };

  const removeFromWishlist = (id: string) => {
    saveWishlist(wishlist.filter((it) => it.id !== id));
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: mounted ? wishlist : [],
        wishlistCount: mounted ? wishlist.length : 0,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
