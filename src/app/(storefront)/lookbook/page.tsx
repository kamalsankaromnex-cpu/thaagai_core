"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useCurrency } from "@/context/currency-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingBag, Heart, Sparkles, Check, ArrowRight, X, ChevronRight } from "lucide-react";

interface HotspotItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  top: number; // percentage
  left: number; // percentage
  sizes: string[];
}

interface LookStory {
  id: string;
  title: string;
  season: string;
  description: string;
  image: string;
  hotspots: HotspotItem[];
}

const LOOKBOOK_STORIES: LookStory[] = [
  {
    id: "story-1",
    title: "The Chettinad Courtyard Raw Silk Edit",
        season: "Festive & Bridal Collection",
    description:
      "Handloomed in pure Mulberry raw silk with sacred temple border motifs. Styled with deep wine tones, gathered churidar ripples, and antique gold zari.",
    image: "/uploads/1792078049257-411cf3c9-GoldenHourattheTempleCourtyard.png",
    hotspots: [
      {
        id: "cmvabhis2001kuz9wn7ltb39d",
        name: "Royal Chettinad Raw Silk Kurta",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 5499,
        category: "Silk Kurti",
        top: 36,
        left: 48,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      {
        id: "look-item-silk-churidar",
        name: "Kanchipuram Silk Gathered Churidar",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 2999,
        category: "Churidar Bottom",
        top: 72,
        left: 52,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      {
        id: "look-item-gold-dupatta",
        name: "Antique Gold Zari Woven Dupatta",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 1899,
        category: "Drape & Dupatta",
        top: 48,
        left: 64,
        sizes: ["Free Size"],
      },
    ],
  },
  {
    id: "story-2",
    title: "Festive Anarkali Kalidar Twilight",
        season: "Grand Reception & Sangeet",
    description:
      "A 32-kali flared silhouette tailored with structured bodice and flowy floor-length panels. Accented with intricate hand-embroidered neckline.",
    image: "/banners/hero-festive.svg",
    hotspots: [
      {
        id: "look-anarkali-suit",
        name: "Royal Anarkali Kalidar Churidar Suit",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 6899,
        category: "Anarkali Suit",
        top: 42,
        left: 50,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      {
        id: "look-trousers",
        name: "Tailored Silk Cigarette Trousers",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 2499,
        category: "Bottom",
        top: 78,
        left: 47,
        sizes: ["S", "M", "L", "XL"],
      },
    ],
  },
  {
    id: "story-3",
    title: "Summer Coimbatore Cotton Voile Pastels",
        season: "Everyday Atelier Elegance",
    description:
      "Featherweight 100s count pure Coimbatore cotton spun by artisan weavers. Breathable, breezy, and tailored with effortless South Indian grace.",
    image: "/banners/hero-traditional.svg",
    hotspots: [
      {
        id: "look-cotton-kurti",
        name: "Coimbatore Organic Cotton Handloom Kurti",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 2799,
        category: "Cotton Kurti",
        top: 38,
        left: 51,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      {
        id: "look-cotton-churidar",
        name: "Pure Malmal Gathered Churidar",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
        price: 1499,
        category: "Churidar Bottom",
        top: 70,
        left: 49,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      },
    ],
  },
];

export default function LookbookPage() {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotItem | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [lookAdded, setLookAdded] = useState(false);

  const activeStory = LOOKBOOK_STORIES[activeStoryIndex];

  const handleSizeSelect = (itemId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleAddSingleItem = (item: HotspotItem) => {
    const size = selectedSizes[item.id] || item.sizes[0] || "M";
    addItem({
      productId: item.id,
      variantId: `${item.id}-${size}`,
      name: item.name,
      sku: `${item.id}-${size}`,
      size: size === "Free Size" ? "Free Size" : size,
      price: item.price,
      maxStock: 10,
      imageUrl: activeStory.image,
      slug: item.slug,
    });

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleShopEntireLook = () => {
    activeStory.hotspots.forEach((item) => {
      const size = selectedSizes[item.id] || item.sizes[0] || "M";
      addItem({
        productId: item.id,
        variantId: `${item.id}-${size}`,
        name: item.name,
        sku: `${item.id}-${size}`,
        size: size === "Free Size" ? "Free Size" : size,
        price: item.price,
        maxStock: 10,
        imageUrl: activeStory.image,
        slug: item.slug,
      });
    });

    setLookAdded(true);
    setTimeout(() => setLookAdded(false), 2500);
  };

  const entireLookTotal = activeStory.hotspots.reduce((acc, it) => acc + it.price, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Editorial Header */}
      <div className="text-center">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-thaagai-gold">
          THAAGAI Editorial Spreads
        </span>
        <h1 className="mt-2 font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-5xl">
          Shop The Look 
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Immerse yourself in our atelier curated ensembles. Tap any gold coordinate pin on the model photography to explore the cut, pure silk weaves, and instant trousseau additions.
        </p>

        {/* Story Selector Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {LOOKBOOK_STORIES.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                setActiveStoryIndex(idx);
                setSelectedHotspot(null);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeStoryIndex === idx
                  ? "bg-thaagai-wine text-white shadow-sm"
                  : "border border-thaagai-line bg-white text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
              }`}
            >
              <span>{story.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Lookbook Container */}
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Interactive Image Spread with Pulsing Hotspots (7 cols) */}
        <div className="relative overflow-hidden rounded-2xl border border-thaagai-line bg-black shadow-lg lg:col-span-7">
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={activeStory.image}
              alt={activeStory.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Editorial Caption on Image */}
            <div className="absolute bottom-5 left-5 right-5 pointer-events-none text-white">
              <span className="text-[10px] font-bold tracking-widest uppercase text-thaagai-gold">
                {activeStory.season}
              </span>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl drop-shadow-sm">
                {activeStory.title}
              </h2>
            </div>

            {/* Interactive Coordinate Hotspots */}
            {activeStory.hotspots.map((hs, index) => {
              const isSelected = selectedHotspot?.id === hs.id;

              return (
                <div
                  key={hs.id}
                  style={{ top: `${hs.top}%`, left: `${hs.left}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedHotspot(isSelected ? null : hs)}
                    aria-label={`View hotspot for ${hs.name}`}
                    className="relative flex items-center justify-center group"
                  >
                    {/* Pulsing Outer Waves */}
                    <span className="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-thaagai-gold opacity-60" />
                    {/* Middle Glow Ring */}
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-thaagai-gold/90 text-thaagai-wine font-bold text-xs shadow-lg backdrop-blur-xs transition-transform group-hover:scale-125">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </span>
                  </button>

                  {/* Hotspot Tag Preview (Desktop Hover) */}
                  <div className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden whitespace-nowrap rounded-lg bg-black/80 px-2.5 py-1 text-[11px] text-white backdrop-blur-xs group-hover:block z-30">
                    <p className="font-bold">{hs.name}</p>
                    <p className="text-thaagai-gold font-mono text-[10px]">{formatPrice(hs.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Garment Pieces Breakdown & 1-Click Complete Look (5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Story Narrative Box */}
          <div className="rounded-2xl border border-thaagai-line bg-white p-5 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-gold">
                  Ensemble Breakdown
                </span>
                <h3 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
                  {activeStory.title}
                </h3>
              </div>
              <span className="rounded-full bg-thaagai-sand px-2.5 py-0.5 text-[11px] font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
                {activeStory.hotspots.length} Pieces
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-thaagai-ink/75 dark:text-thaagai-inkDark/75">
              {activeStory.description}
            </p>

            {/* 1-Click "Shop Entire Ensemble" CTA */}
            <div className="mt-5 rounded-xl border border-thaagai-gold/50 bg-gradient-to-r from-thaagai-sand/60 to-white p-4 dark:from-thaagai-sandDark/40 dark:to-thaagai-cardDark">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                    Complete 3-Piece Ensemble Total
                  </span>
                  <div className="text-lg font-bold font-sans text-thaagai-wine dark:text-thaagai-gold">
                    {formatPrice(entireLookTotal)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleShopEntireLook}
                  className={`flex h-11 items-center gap-2 rounded-lg px-5 text-xs font-bold transition-all shadow-md ${
                    lookAdded
                      ? "bg-emerald-700 text-white"
                      : "bg-thaagai-wine text-white hover:bg-thaagai-wineHover"
                  }`}
                >
                  {lookAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Ensemble Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add Entire Look</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Individual Hotspot Pieces List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Featured Items in this Spread:
            </h4>

            {activeStory.hotspots.map((hs, index) => {
              const currentSize = selectedSizes[hs.id] || hs.sizes[0] || "M";
              const isSelected = selectedHotspot?.id === hs.id;
              const isAdded = addedIds[hs.id];
              const wishlisted = isInWishlist(hs.id);

              return (
                <div
                  key={hs.id}
                  onClick={() => setSelectedHotspot(hs)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-thaagai-wine bg-thaagai-sand/40 ring-1 ring-thaagai-wine/40 dark:border-thaagai-gold dark:bg-thaagai-sandDark/30"
                      : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-thaagai-sand text-[10px] font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-gold">
                          {hs.category}
                        </span>
                      </div>
                      <h5 className="mt-1 font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                        {hs.name}
                      </h5>
                      <div className="mt-1 font-sans text-sm font-bold text-thaagai-wine dark:text-thaagai-gold">
                        {formatPrice(hs.price)}
                      </div>
                    </div>

                    {/* Wishlist toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                          id: hs.id,
                          name: hs.name,
                          slug: hs.slug,
                          image: activeStory.image,
                          basePrice: hs.price,
                          salePrice: null,
                          categoryName: hs.category,
                        });
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-thaagai-ink/60 hover:text-rose-600 dark:text-white"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          wishlisted ? "fill-rose-600 text-rose-600" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Size Selector & Add Button */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-thaagai-line/50 pt-3 dark:border-thaagai-line/30">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                        Size:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hs.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSizeSelect(hs.id, sz);
                            }}
                            className={`h-6 px-2 rounded text-[10px] font-semibold transition-all ${
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

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingleItem(hs);
                      }}
                      className={`flex h-8 items-center gap-1 rounded-md px-3 text-[11px] font-semibold transition-all ${
                        isAdded
                          ? "bg-emerald-700 text-white"
                          : "bg-thaagai-wine text-white hover:bg-thaagai-wineHover"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3 w-3" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
