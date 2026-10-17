"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist, WishlistItem } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useCurrency } from "@/context/currency-context";
import { Heart, Trash2, ShoppingBag, ArrowRight, Share2, Check, Sparkles } from "lucide-react";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (item: WishlistItem) => {
    const size = selectedSizes[item.id] || "M";
    addItem({
      productId: item.id,
      variantId: `${item.id}-${size}`,
      name: item.name,
      sku: `${item.id}-${size}`,
      size,
      price: item.salePrice || item.basePrice,
      maxStock: 10,
      imageUrl: item.image || undefined,
      slug: item.slug,
    });

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const generateWhatsAppShareLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://thaagai.com";
    let text = `*THAAGAI Atelier — My Curated Trousseau Shortlist*\n\n`;
    text += `Hello! Here are the bespoke South Indian churidar ensembles I've shortlisted for our upcoming festivities:\n\n`;

    wishlist.forEach((item, index) => {
      const price = formatPrice(item.salePrice || item.basePrice);
      text += `${index + 1}. *${item.name}* (${price})\n${origin}/product/${item.slug}\n\n`;
    });

    text += `Please let me know which one you think will look best!\n_Handcrafted with pure silks and artisan embroidery at THAAGAI._`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
              My Trousseau Wishlist
            </span>
            <span className="rounded-full bg-thaagai-sand px-3 py-0.5 text-xs font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
              {wishlist.length} {wishlist.length === 1 ? "Ensemble" : "Ensembles"}
            </span>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Saved pieces for your South Indian weddings, temple visits, and festive celebrations.
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-3">
            <a
              href={generateWhatsAppShareLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-2 rounded-md bg-[#25D366] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Trousseau to WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={clearWishlist}
              className="flex h-10 items-center gap-1.5 rounded-md border border-thaagai-line px-3.5 text-xs font-semibold text-thaagai-ink hover:text-rose-600 hover:border-rose-300 dark:border-thaagai-line/40 dark:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-thaagai-line p-12 text-center dark:border-thaagai-line/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-brand text-2xl font-bold text-thaagai-ink dark:text-white">
            Your Wishlist is Empty
          </h2>
          <p className="mt-2 max-w-md text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Explore our curated collections of Chettinad raw silks, pure cotton voiles, and bridal Anarkali churidars. Click the heart icon on any piece to save it here.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="flex h-11 items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
            >
              <span>Explore All Churidars</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/lookbook"
              className="flex h-11 items-center gap-2 rounded-md border border-thaagai-gold/60 bg-thaagai-sand/40 px-5 text-xs font-semibold text-thaagai-wine hover:bg-thaagai-sand dark:bg-thaagai-sandDark/40 dark:text-white"
            >
              <Sparkles className="h-4 w-4 text-thaagai-gold" />
              <span>Browse Editorial Lookbook</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => {
            const currentSize = selectedSizes[item.id] || "M";
            const price = item.salePrice || item.basePrice;
            const hasSale = item.salePrice && item.salePrice < item.basePrice;
            const isAdded = addedIds[item.id];

            return (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs transition-all hover:border-thaagai-wine/50 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-thaagai-sand/20 dark:bg-thaagai-sandDark/20">
                  <Link href={`/product/${item.slug}`}>
                    {item.image ? (
                      <Image
                        src={item.image.startsWith("http") ? item.image : `/uploads/${item.image}`}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-thaagai-ink/40">
                        {item.name}
                      </div>
                    )}
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-thaagai-ink/70 shadow-sm backdrop-blur-xs transition-colors hover:bg-rose-50 hover:text-rose-600 dark:bg-thaagai-cardDark/90 dark:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {hasSale && (
                    <span className="absolute left-3 top-3 rounded bg-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                      Sale
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  {item.categoryName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-gold">
                      {item.categoryName}
                    </span>
                  )}
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="mt-1 line-clamp-1 font-serif text-base font-bold text-thaagai-ink transition-colors hover:text-thaagai-wine dark:text-white">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-sans text-base font-bold text-thaagai-wine">
                      {formatPrice(price)}
                    </span>
                    {hasSale && (
                      <span className="font-sans text-xs text-thaagai-ink/40 line-through">
                        {formatPrice(item.basePrice)}
                      </span>
                    )}
                  </div>

                  {/* Size Pill Selector */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                      Select Size:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {SIZES.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSizeSelect(item.id, sz)}
                          className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all ${
                            currentSize === sz
                              ? "bg-thaagai-wine text-white"
                              : "border border-thaagai-line text-thaagai-ink hover:border-thaagai-wine dark:border-thaagai-line/40 dark:text-white"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-thaagai-line/40 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`flex flex-1 h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isAdded
                          ? "bg-emerald-700 text-white"
                          : "bg-thaagai-wine text-white hover:bg-thaagai-wineHover"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Move to Bag ({currentSize})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
