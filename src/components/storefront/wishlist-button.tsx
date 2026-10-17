"use client";

import { useWishlist, WishlistItem } from "@/context/wishlist-context";
import { Heart } from "lucide-react";
import { useState } from "react";

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({ item, className = "", size = "md" }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(item.id);
  const [bouncing, setBouncing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBouncing(true);
    toggleWishlist(item);
    setTimeout(() => setBouncing(false), 300);
  };

  const sizeClasses = {
    sm: "h-8 w-8 min-w-[32px]",
    md: "h-9 w-9 min-w-[36px]",
    lg: "h-11 w-11 min-w-[44px]",
  }[size];

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={wishlisted ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
      className={`group relative flex items-center justify-center rounded-full transition-all duration-300 tap-bounce hover:scale-110 active:scale-90 ${sizeClasses} ${
        wishlisted
          ? "bg-rose-50 text-rose-600 shadow-sm dark:bg-rose-950/60 dark:text-rose-400"
          : "bg-white/90 text-thaagai-ink/70 hover:bg-white hover:text-thaagai-wine shadow-sm backdrop-blur-xs dark:bg-thaagai-cardDark/90 dark:text-white/80 dark:hover:text-thaagai-gold"
      } ${bouncing ? "animate-heart-pop" : ""} ${className}`}
    >
      {/* Delicate floating burst halo on wishlist click */}
      {bouncing && (
        <span className="absolute -inset-1.5 rounded-full bg-rose-400/30 animate-ping pointer-events-none" />
      )}
      <Heart
        className={`${iconSizes} transition-transform duration-300 group-hover:scale-110 ${
          wishlisted
            ? "fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400"
            : "group-hover:stroke-thaagai-wine"
        }`}
      />
    </button>
  );
}
