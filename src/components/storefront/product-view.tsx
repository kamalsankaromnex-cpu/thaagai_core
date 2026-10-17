"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Scissors,
  Ruler,
  CheckCircle2,
  Star,
  Truck,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  RotateCcw,
  Shirt,
  Briefcase,
  Users,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { LotusMotif } from "@/components/storefront/tamil-motifs";
import { SizeGuideModal } from "@/components/storefront/size-guide-modal";
import { PincodeDeliveryChecker } from "@/components/storefront/pincode-delivery-checker";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { FullscreenImageModal } from "@/components/storefront/fullscreen-image-modal";
import { SizeToLengthPreview } from "@/components/storefront/size-to-length-preview";
import { SizeChartData } from "@/server/services/size-chart-service";
import { DeliveryEstimateResult } from "@/server/services/delivery-service";
import { sortVariantsBySize } from "@/lib/sizing";

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number;
  description?: string | null;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options: CustomizationOption[];
}

export interface RelatedProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  productType: "READY_TO_WEAR" | "CUSTOM_MADE";
  imageUrl?: string | null;
}

export interface StyleItWithItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  variantId: string;
  sku: string;
  size: string;
  colour: string;
  stockQuantity: number;
  imageUrl?: string | null;
}

export interface ProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    productType?: "READY_TO_WEAR" | "CUSTOM_MADE";
    basePrice: number;
    salePrice: number | null;
    department: string;
    sku?: string | null;
    fabricCare?: string | null;
    shippingInfo?: string | null;
    category?: { name: string; slug: string } | null;
    customizationGroups?: CustomizationGroup[];
    images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
    variants: {
      id: string;
      sku: string;
      size: string | null;
      colour: string | null;
      price: number | null;
      salePrice: number | null;
      stockQuantity: number;
    }[];
  };
  whatsappNumber: string;
  sizeChart?: SizeChartData;
  initialRatingStats?: {
    averageRating: number;
    totalReviews: number;
    distribution?: { 5: number; 4: number; 3: number; 2: number; 1: number };
    verifiedPurchasesCount?: number;
    withPhotosCount?: number;
  };
  initialReviews?: any[];
  relatedProducts?: RelatedProductItem[];
  styleItWithProducts?: StyleItWithItem[];
  salesCount?: number;
}

// Color palette mapping helper
export function getColorHex(colourName?: string | null): string {
  if (!colourName) return "#B85D43";
  const lower = colourName.toLowerCase();
  if (lower.includes("terracotta") || lower.includes("rust")) return "#B85D43";
  if (lower.includes("sand") || lower.includes("beige") || lower.includes("cream")) return "#D6C7A1";
  if (lower.includes("olive") || lower.includes("green")) return "#5B6A47";
  if (lower.includes("indigo") || lower.includes("blue")) return "#4A6184";
  if (lower.includes("wine") || lower.includes("plum") || lower.includes("purple")) return "#7A4156";
  if (lower.includes("maroon") || lower.includes("marron")) return "#800020";
  if (lower.includes("ochre") || lower.includes("amber") || lower.includes("yellow")) return "#D4AC0D";
  if (lower.includes("gold")) return "#C4975A";
  if (lower.includes("black")) return "#222222";
  if (lower.includes("white")) return "#F8F6F0";
  if (lower.includes("pink") || lower.includes("rose")) return "#D87093";
  return "#B85D43";
}

export function ProductView({
  product,
  whatsappNumber,
  sizeChart,
  initialRatingStats = { averageRating: 0, totalReviews: 0 },
  initialReviews = [],
  relatedProducts = [],
  styleItWithProducts = [],
  salesCount = 0,
}: ProductViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isCustomMade = product.productType === "CUSTOM_MADE";

  // Gallery state: strictly use product images from database
  const galleryImages = useMemo(() => {
    return product.images || [];
  }, [product.images]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "fabric" | "size" | "customisation" | "reviews"
  >("description");

  // Quantity Stepper
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [companionAddedId, setCompanionAddedId] = useState<string | null>(null);

  // Mobile Sticky Quick-Action Bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar on mobile when main purchase actions are scrolled out of view upwards
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Size Guide Modal state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Delivery Estimate state
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimateResult | null>(null);

  // Genuine review stats from database
  const totalReviews = initialRatingStats?.totalReviews || 0;
  const averageRating = initialRatingStats?.averageRating || 0;

  // 1. Ready-to-wear sorted variants
  const sortedVariants = useMemo(() => {
    return sortVariantsBySize(product.variants);
  }, [product.variants]);

  // Extract distinct colors strictly from real variants
  const availableColours = useMemo(() => {
    const colours: string[] = [];
    for (const v of product.variants) {
      if (v.colour && v.colour !== "NoColour" && !colours.includes(v.colour)) {
        colours.push(v.colour);
      }
    }
    return colours;
  }, [product.variants]);

  const displayColours = useMemo(() => {
    return availableColours.map((c) => ({
      name: c,
      hex: getColorHex(c),
    }));
  }, [availableColours]);

  const [selectedColour, setSelectedColour] = useState<string>(() => {
    return availableColours[0] || "";
  });

  // Extract distinct sizes strictly from real variants
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    for (const v of product.variants) {
      if (v.size && v.size !== "NoSize") {
        set.add(v.size);
      }
    }
    return Array.from(set);
  }, [product.variants]);

  // Selected size state
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const inStock = sortedVariants.find((v) => v.stockQuantity > 0);
    return inStock?.size || availableSizes[0] || (isCustomMade ? "M" : "");
  });

  // Variant matching selected colour & size
  const selectedVariant = useMemo(() => {
    if (isCustomMade) return sortedVariants[0];

    // Find variant matching both size and colour
    const exact = sortedVariants.find((v) => {
      const matchSize = !selectedSize || v.size === selectedSize;
      const matchColour = !selectedColour || v.colour === selectedColour;
      return matchSize && matchColour;
    });
    if (exact) return exact;

    // Fallback: match by size
    const bySize = sortedVariants.find((v) => v.size === selectedSize);
    if (bySize) return bySize;

    return sortedVariants[0];
  }, [isCustomMade, sortedVariants, selectedSize, selectedColour]);

  // Companion products: strictly use real database items
  const companionList = useMemo(() => {
    if (styleItWithProducts && styleItWithProducts.length > 0) {
      return styleItWithProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.basePrice,
        imageUrl: p.imageUrl,
        sku: p.sku || `TG-${p.id.slice(0, 6)}`,
      }));
    }
    return [];
  }, [styleItWithProducts]);

  // Custom-Made Selections: map groupId -> optionId
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.customizationGroups) {
      for (const grp of product.customizationGroups) {
        if (grp.options.length > 0) {
          initial[grp.id] = grp.options[0].id;
        }
      }
    }
    return initial;
  });

  // Custom measurement mode: "STANDARD" or "CUSTOM"
  const [sizeMode, setSizeMode] = useState<"STANDARD" | "CUSTOM">("STANDARD");
  const [customBust, setCustomBust] = useState<string>("");
  const [customWaist, setCustomWaist] = useState<string>("");
  const [customHips, setCustomHips] = useState<string>("");
  const [customLength, setCustomLength] = useState<string>("");
  const [customShoulder, setCustomShoulder] = useState<string>("");
  const [tailoringNotes, setTailoringNotes] = useState<string>("");

  // Calculate pricing from genuine database values
  const effectiveBasePrice = selectedVariant?.price ?? product.basePrice;
  const effectiveSalePrice = selectedVariant?.salePrice ?? product.salePrice;
  const hasSale = Boolean(effectiveSalePrice && effectiveSalePrice < effectiveBasePrice);

  // Custom-Made Option Price Deltas
  const { totalDelta, selectedBreakdown } = useMemo(() => {
    if (!isCustomMade || !product.customizationGroups) {
      return { totalDelta: 0, selectedBreakdown: [] };
    }
    let sum = 0;
    const breakdown: {
      groupId: string;
      groupName: string;
      optionId: string;
      optionName: string;
      priceDelta: number;
    }[] = [];

    for (const grp of product.customizationGroups) {
      const optId = selectedOptions[grp.id];
      const opt = grp.options.find((o) => o.id === optId);
      if (opt) {
        sum += opt.priceDelta;
        breakdown.push({
          groupId: grp.id,
          groupName: grp.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      }
    }
    return { totalDelta: sum, selectedBreakdown: breakdown };
  }, [isCustomMade, product.customizationGroups, selectedOptions]);

  const finalUnitPrice = hasSale
    ? (effectiveSalePrice as number) + totalDelta
    : effectiveBasePrice + totalDelta;

  const strikePrice = hasSale ? effectiveBasePrice : null;
  const discountPercent =
    hasSale && effectiveSalePrice
      ? Math.round(((effectiveBasePrice - effectiveSalePrice) / effectiveBasePrice) * 100)
      : null;

  const inStockQuantity = selectedVariant?.stockQuantity ?? 10;
  const isOutOfReadyStock = !isCustomMade && inStockQuantity <= 0;

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  // Wishlist handler for this product
  const wishlisted = isInWishlist(product.id);
  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: currentImage?.url || null,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      productType: product.productType,
      categoryName: product.category?.name,
    });
  };

  const handleOptionChange = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  const handleAddToBag = () => {
    if (isCustomMade) {
      addItem(
        {
          variantId: selectedVariant?.id || `${product.id}-custom`,
          productId: product.id,
          name: product.name,
          sku: selectedVariant?.sku || "TG-CUSTOM",
          size: sizeMode === "STANDARD" ? `Size ${selectedSize}` : "Custom Fit",
          colour: selectedColour || "Custom Configuration",
          price: finalUnitPrice,
          salePrice: null,
          maxStock: 99,
          imageUrl: currentImage?.url || null,
          slug: product.slug,
          customizations: {
            productType: "CUSTOM_MADE",
            sizeMode,
            standardSize: sizeMode === "STANDARD" ? selectedSize : null,
            selections: selectedBreakdown,
            measurements:
              sizeMode === "CUSTOM"
                ? {
                    bust: customBust || undefined,
                    waist: customWaist || undefined,
                    hips: customHips || undefined,
                    length: customLength || undefined,
                    shoulder: customShoulder || undefined,
                    notes: tailoringNotes || undefined,
                  }
                : undefined,
            totalCustomPrice: finalUnitPrice,
          },
        },
        quantity
      );
    } else {
      const activeVar = selectedVariant || sortedVariants[0];
      addItem(
        {
          variantId: activeVar?.id || product.id,
          productId: product.id,
          name: product.name,
          sku: activeVar?.sku || product.sku || "TG-CHURIDAR",
          size: activeVar?.size || selectedSize || "Standard",
          colour: activeVar?.colour || selectedColour || "Classic",
          price: effectiveBasePrice,
          salePrice: effectiveSalePrice,
          maxStock: activeVar?.stockQuantity || 10,
          imageUrl: currentImage?.url || null,
          slug: product.slug,
        },
        quantity
      );
    }

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToBag();
    router.push("/checkout");
  };

  // Add companion product directly to cart
  const handleAddCompanion = (item: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    sku: string;
  }) => {
    addItem(
      {
        variantId: `companion-${item.id}`,
        productId: item.id,
        name: item.name,
        sku: item.sku,
        size: "Free Size",
        colour: "Classic",
        price: item.price,
        salePrice: null,
        maxStock: 15,
        imageUrl: item.imageUrl || null,
        slug: product.slug,
      },
      1
    );
    setCompanionAddedId(item.id);
    setTimeout(() => setCompanionAddedId(null), 1800);
  };

  // WhatsApp Message Handlers
  const whatsAppOrderMessage = useMemo(() => {
    if (isCustomMade) {
      const selectionsText = selectedBreakdown
        .map(
          (b) =>
            `• ${b.groupName}: ${b.optionName}${b.priceDelta ? ` (+₹${b.priceDelta})` : ""}`
        )
        .join("\n");

      let measureText = "";
      if (sizeMode === "CUSTOM") {
        const mParts = [
          customBust ? `Bust: ${customBust}"` : null,
          customWaist ? `Waist: ${customWaist}"` : null,
          customHips ? `Hips: ${customHips}"` : null,
          customLength ? `Length: ${customLength}"` : null,
          customShoulder ? `Shoulder: ${customShoulder}"` : null,
        ].filter(Boolean);
        measureText =
          mParts.length > 0 ? `Custom Measurements: ${mParts.join(", ")}` : "Custom Fit";
        if (tailoringNotes) {
          measureText += `\nNotes: "${tailoringNotes}"`;
        }
      } else {
        measureText = `Standard Size: ${selectedSize}`;
      }

      return `Hello Thaagai! I would like to order this bespoke piece:
Piece: ${product.name}
Type: Bespoke Custom-Made
Calculated Price: ₹${(finalUnitPrice * quantity).toLocaleString("en-IN")} (Qty: ${quantity})
${selectedColour ? `Colour: ${selectedColour}\n` : ""}
Selections:
${selectionsText || "Default styling"}

Sizing:
${measureText}

Could our master tailor review this and confirm fabric availability?`;
    }

    return `Hello Thaagai! I would like to order this piece:
Piece: ${product.name}
SKU: ${selectedVariant?.sku || product.sku || "TG-CHURIDAR"}
Price: ₹${(finalUnitPrice * quantity).toLocaleString("en-IN")} (Qty: ${quantity})
${selectedSize ? `Size: ${selectedSize}\n` : ""}${selectedColour ? `Colour: ${selectedColour}\n` : ""}
Could you confirm availability and process my order request?`;
  }, [
    isCustomMade,
    product.name,
    product.sku,
    finalUnitPrice,
    quantity,
    selectedBreakdown,
    sizeMode,
    selectedSize,
    selectedColour,
    customBust,
    customWaist,
    customHips,
    customLength,
    customShoulder,
    tailoringNotes,
    selectedVariant,
  ]);

  const orderUrl = buildWhatsAppLink(whatsappNumber, whatsAppOrderMessage);

  return (
    <div className="bg-[#FAF7F2] text-stone-900 min-h-screen pt-6 pb-24 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600"
        >
          <Link href="/" className="hover:text-[#8A4A38] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-stone-400" />
          <Link href="/shop" className="hover:text-[#8A4A38] transition-colors">
            {product.department === "CUSTOM_MADE" ? "Custom-Made Atelier" : "Shop"}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 text-stone-400" />
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-[#8A4A38] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-stone-400" />
          <span className="text-stone-900 font-semibold line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* 2. Main Hero Two-Column Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* Desktop Vertical Thumbnail Strip (Only rendered if images exist) */}
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] pb-2 sm:pb-0 scrollbar-none shrink-0">
                {galleryImages.map((img, idx) => {
                  const isActive = selectedImageIndex === idx;
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      aria-label={`Select product image ${idx + 1}`}
                      className={`relative h-18 w-16 sm:h-20 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-stone-800 ring-2 ring-stone-800/20 shadow-xs"
                          : "border-stone-200/80 opacity-75 hover:opacity-100 hover:border-stone-400"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || `Thumbnail ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Image Container */}
            <div className="relative aspect-[3/4] w-full flex-1 overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200/70 bg-stone-100 shadow-sm group">
              {currentImage?.url ? (
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText || product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 42vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
                  <LotusMotif className="h-16 w-16 text-thaagai-gold/60" />
                  <span className="mt-4 font-serif text-2xl font-bold text-[#8A4A38]">
                    {product.name}
                  </span>
                  <span className="mt-1 text-xs text-thaagai-gold font-medium">
                    {isCustomMade ? "Bespoke Tailoring" : "Handloom Weave"}
                  </span>
                  <span className="mt-2 text-xs text-stone-500">
                    {product.category?.name || "South Indian Traditional Churidar"}
                  </span>
                </div>
              )}

              {/* Prev / Next Floating Controls (Only if multiple real images) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) =>
                        prev > 0 ? prev - 1 : galleryImages.length - 1
                      );
                    }}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) =>
                        prev < galleryImages.length - 1 ? prev + 1 : 0
                      );
                    }}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Fullscreen Zoom Trigger (If real image exists) */}
              {galleryImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFullscreenOpen(true)}
                  aria-label="Open fullscreen image preview"
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-md backdrop-blur-xs transition hover:bg-white hover:scale-110"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}

              {/* Product Badge */}
              {isCustomMade ? (
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#8A4A38] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                  <Scissors className="h-3 w-3 text-amber-200" />
                  Bespoke Atelier
                </span>
              ) : null}
            </div>
          </div>

          {/* RIGHT: Product Information */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Brand Tag & Wishlist Button */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8A4A38]">
                  THAAGAI | {product.category?.name || (isCustomMade ? "CUSTOM ATELIER" : "CHURIDARS")}
                </span>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                    wishlisted
                      ? "border-rose-300 bg-rose-50 text-rose-600 shadow-xs"
                      : "border-stone-200 bg-white text-stone-600 hover:text-rose-600 hover:border-rose-300 shadow-xs"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-rose-600" : ""}`} />
                </button>
              </div>

              {/* Product Title */}
              <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-600">
                  {product.shortDescription}
                </p>
              )}

              {/* Customer Ratings Summary Near Title */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                {totalReviews > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      document.getElementById("specifications-tabs")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 text-xs hover:opacity-85 transition-opacity"
                  >
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-stone-900">{averageRating.toFixed(1)}</span>
                    <span className="text-stone-600">({totalReviews} {totalReviews === 1 ? "rating" : "ratings"})</span>
                    {salesCount > 0 && (
                      <>
                        <span className="text-stone-300">|</span>
                        <span className="text-stone-600 font-normal">{salesCount}+ sold</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("reviews");
                      document.getElementById("specifications-tabs")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#8A4A38] transition-colors"
                  >
                    <div className="flex items-center gap-0.5 text-stone-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-stone-200 text-stone-200" />
                      ))}
                    </div>
                    <span className="font-medium text-stone-600">No ratings yet</span>
                    <span className="text-stone-300">|</span>
                    <span className="text-[#8A4A38] font-semibold underline underline-offset-2">
                      Be the first to rate & review
                    </span>
                  </button>
                )}
              </div>

              {/* Genuine Price Block (No fake discounts or inflated MRP) */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                <span className="font-sans text-3xl font-bold text-stone-900 tracking-tight">
                  ₹{finalUnitPrice.toLocaleString("en-IN")}
                </span>
                {strikePrice && strikePrice > finalUnitPrice && (
                  <span className="font-sans text-lg text-stone-400 line-through">
                    ₹{strikePrice.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPercent && (
                  <span className="rounded-md bg-[#8A4A38]/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#8A4A38]">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Inclusive of all applicable taxes
              </p>

              {/* Colour Swatches Selector (Only if real colours exist) */}
              {availableColours.length > 0 && (
                <div className="mt-6 border-t border-stone-200/80 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">Colour:</span>
                    <span className="text-xs font-medium text-stone-700">
                      {selectedColour}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {displayColours.map((col) => {
                      const isSelected =
                        selectedColour.toLowerCase() === col.name.toLowerCase();
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedColour(col.name)}
                          title={col.name}
                          aria-label={`Select colour ${col.name}`}
                          className={`group relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                            isSelected
                              ? "ring-2 ring-stone-900 ring-offset-2 scale-105"
                              : "hover:ring-2 hover:ring-stone-400 hover:ring-offset-1"
                          }`}
                        >
                          <span
                            className="h-7 w-7 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: col.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector (Only if real sizes exist) */}
              {availableSizes.length > 0 && (
                <div id="size-selector-section" className="mt-6 border-t border-stone-200/80 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Size:</span>
                      <span className="text-xs font-medium text-stone-700">
                        {selectedSize || "Select a size"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/size-to-length"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A4A38] hover:underline"
                      >
                        <Ruler className="h-3.5 w-3.5" />
                        <span>Size to Length Guide</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs text-stone-500 hover:underline"
                      >
                        (Chart)
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {availableSizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[48px] h-10 px-3 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? "border-2 border-stone-900 bg-white text-stone-900 shadow-xs ring-1 ring-stone-900/10"
                              : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status Banner */}
              <div className="mt-5 flex items-center gap-2">
                {isCustomMade ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <Scissors className="h-4 w-4 text-amber-700" />
                    Bespoke Tailoring: Dispatches in 7–10 days
                  </span>
                ) : isOutOfReadyStock ? (
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-800">
                      <Sparkles className="h-4 w-4 text-amber-700" />
                      Made-to-Order Piece
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Tailored on request • Dispatches in 5–7 days
                    </p>
                  </div>
                ) : inStockQuantity <= 2 ? (
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-800">
                      <Check className="h-4 w-4 text-amber-700 stroke-[3]" />
                      Only {inStockQuantity} left in stock — order soon
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Usually dispatches in 2–3 days
                    </p>
                  </div>
                ) : (
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                      <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
                      In stock
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Usually dispatches in 2–3 days
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity Stepper + Add to Cart + Buy Now Action Row */}
              <div
                ref={actionsRef}
                id="main-product-actions"
                className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                {/* Quantity Stepper */}
                <div className="flex h-11 items-center justify-between rounded-lg border border-stone-300 bg-white px-3 sm:w-28 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="text-stone-500 hover:text-stone-900 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-semibold text-sm text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="text-stone-500 hover:text-stone-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add to Cart (Outlined button) */}
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-stone-900 bg-white px-5 text-xs sm:text-sm font-bold text-stone-900 shadow-xs transition hover:bg-stone-50 ${
                    addedAnimation ? "border-emerald-600 text-emerald-700" : ""
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 text-stone-900" />
                      <span>{isOutOfReadyStock ? "Add to Cart (Made to Order)" : "Add to Cart"}</span>
                    </>
                  )}
                </button>

                {/* Buy Now (Solid Terracotta button) */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#8A4A38] px-5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#723B2C]"
                >
                  Buy Now
                </button>
              </div>

              {/* Direct WhatsApp Consultation */}
              <div className="mt-3 flex items-center justify-center gap-3">
                <a
                  href={orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Order via WhatsApp Consultation</span>
                </a>
              </div>

              {/* 3-Column Trust Badges Row */}
              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-stone-200/80 pt-6 text-stone-700">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-5 w-5 text-[#8A4A38] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 leading-tight">
                      Free shipping
                    </h5>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      on orders above ₹999
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="h-5 w-5 text-[#8A4A38] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 leading-tight">
                      Easy returns
                    </h5>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      within 7 days
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#8A4A38] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 leading-tight">
                      Secure payment
                    </h5>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                      100% safe checkout
                    </p>
                  </div>
                </div>
              </div>

              {/* PIN Code Delivery Checker Accordion / Card */}
              <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <PincodeDeliveryChecker
                  productType={product.productType}
                  onEstimateChange={(est) => setDeliveryEstimate(est)}
                />
                {deliveryEstimate && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>
                      Delivery to {deliveryEstimate.city}, {deliveryEstimate.state} (PIN {deliveryEstimate.pinCode}):{" "}
                      <strong>
                        {isCustomMade
                          ? deliveryEstimate.customMade.deliveryDateRange
                          : deliveryEstimate.readyMade.deliveryDateRange}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Specifications & Sizing Section */}
        <section
          id="specifications-tabs"
          className="mt-14 rounded-2xl border border-stone-200/70 bg-white shadow-xs overflow-hidden"
        >
          {/* Tab Header Navigation */}
          <div className="flex flex-wrap border-b border-stone-200 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "description"
                  ? "text-[#8A4A38] font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Description
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A4A38]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fabric")}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "fabric"
                  ? "text-[#8A4A38] font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Fabric & Care
              {activeTab === "fabric" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A4A38]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("size")}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "size"
                  ? "text-[#8A4A38] font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Size to Length Preview
              {activeTab === "size" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A4A38]" />
              )}
            </button>

            {(isCustomMade || (product.customizationGroups && product.customizationGroups.length > 0)) && (
              <button
                type="button"
                onClick={() => setActiveTab("customisation")}
                className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-semibold transition-all relative ${
                  activeTab === "customisation"
                    ? "text-[#8A4A38] font-bold"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Customisation
                {activeTab === "customisation" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A4A38]" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-3 sm:px-5 text-xs sm:text-sm font-semibold transition-all relative ${
                activeTab === "reviews"
                  ? "text-[#8A4A38] font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Reviews {totalReviews > 0 ? `(${totalReviews})` : ""}
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A4A38]" />
              )}
            </button>
          </div>

          {/* Tab Body Content */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: DESCRIPTION */}
            {activeTab === "description" && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Column 1: Genuine Narrative from Database */}
                <div className={`space-y-4 ${companionList.length > 0 ? "lg:col-span-5" : "lg:col-span-7"}`}>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Product Description & Craft
                  </h3>
                  <div className="text-xs sm:text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                    {product.description}
                  </div>
                </div>

                {/* Column 2: Garment Imagery / Craft Details */}
                <div className={`flex flex-col items-center ${companionList.length > 0 ? "lg:col-span-3" : "lg:col-span-5"}`}>
                  {galleryImages.length > 1 ? (
                    <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-stone-200 shadow-xs">
                      <Image
                        src={galleryImages[1].url}
                        alt={galleryImages[1].altText || product.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full max-w-[260px] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-[#FAF8F5] p-6 text-center">
                      <LotusMotif className="h-12 w-12 text-thaagai-gold/60" />
                      <span className="mt-3 font-serif text-sm font-bold text-[#8A4A38]">
                        South Indian Craftsmanship
                      </span>
                      <p className="mt-1 text-[11px] text-stone-500">
                        Tailored with precision seam margins in Tamil Nadu
                      </p>
                    </div>
                  )}
                </div>

                {/* Column 3: Occasions & Style It With (Only rendered if companion items exist) */}
                {companionList.length > 0 && (
                  <div className="lg:col-span-4 space-y-5">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                        Occasion
                      </h4>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="flex flex-col items-center rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
                          <Shirt className="h-4 w-4 text-[#8A4A38]" />
                          <span className="mt-1.5 text-[10px] font-semibold text-stone-700">
                            Casual Wear
                          </span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
                          <Briefcase className="h-4 w-4 text-[#8A4A38]" />
                          <span className="mt-1.5 text-[10px] font-semibold text-stone-700">
                            Office Wear
                          </span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
                          <Users className="h-4 w-4 text-[#8A4A38]" />
                          <span className="mt-1.5 text-[10px] font-semibold text-stone-700">
                            Gatherings
                          </span>
                        </div>
                        <div className="flex flex-col items-center rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
                          <Sparkles className="h-4 w-4 text-[#8A4A38]" />
                          <span className="mt-1.5 text-[10px] font-semibold text-stone-700">
                            Festive Wear
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Style It With Companion Cards */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2.5">
                        Style It With
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {companionList.map((item) => {
                          const isAdded = companionAddedId === item.id;
                          return (
                            <div
                              key={item.id}
                              className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50/70 p-2 text-center transition hover:border-[#8A4A38]"
                            >
                              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <LotusMotif className="h-5 w-5 text-stone-400" />
                                  </div>
                                )}
                              </div>
                              <h5 className="mt-1.5 text-[11px] font-semibold text-stone-800 line-clamp-1">
                                {item.name}
                              </h5>
                              <span className="text-[10px] font-bold text-stone-900">
                                ₹{item.price}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddCompanion({
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    imageUrl: item.imageUrl,
                                    sku: item.sku,
                                  })
                                }
                                className={`mt-1.5 flex h-6 w-full items-center justify-center rounded text-[10px] font-bold transition ${
                                  isAdded
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white border border-stone-300 text-stone-800 hover:border-[#8A4A38] hover:text-[#8A4A38]"
                                }`}
                              >
                                {isAdded ? "✓ Added" : "+ Add"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FABRIC & CARE */}
            {activeTab === "fabric" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-stone-700">
                <div className="space-y-3">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Fabric & Weave Characteristics
                  </h4>
                  <p className="leading-relaxed">
                    {product.fabricCare ||
                      "Authentic South Indian handloom weave crafted for tactile elegance and breathable all-day comfort in tropical weather."}
                  </p>
                  <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Department / Type:</span>
                      <span className="font-semibold text-stone-900">
                        {isCustomMade ? "Bespoke Made-to-Measure" : "Ready-to-Wear"}
                      </span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Category:</span>
                        <span className="font-semibold text-stone-900">{product.category.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-stone-500">Alteration Margin:</span>
                      <span className="font-semibold text-stone-900">1.5 Inches (Both Sides)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Care Guidelines
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Gentle hand wash in cold water or dry clean recommended for pure weaves.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Use mild liquid detergent; avoid harsh bleaches or enzyme soaks.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Dry inside out in shade to preserve handloom dye depth.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Iron on reverse side at medium-warm heat setting.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: SIZE TO LENGTH PREVIEW */}
            {activeTab === "size" && (
              <div className="space-y-6">
                <SizeToLengthPreview initialSize={selectedSize || "M"} />
              </div>
            )}

            {/* TAB 4: CUSTOMISATION (BESPOKE ATELIER) */}
            {activeTab === "customisation" && (
              <div className="space-y-6">
                <div className="border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#8A4A38]" />
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      Bespoke Tailoring & Measurements
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Customize your neckline, sleeves, and fit. Price updates dynamically.
                  </p>
                </div>

                {/* Customization Options */}
                {product.customizationGroups && product.customizationGroups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {product.customizationGroups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          {group.name}
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {group.options.map((opt) => {
                            const isSelected = selectedOptions[group.id] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleOptionChange(group.id, opt.id)}
                                className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                                  isSelected
                                    ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900"
                                    : "border-stone-200 bg-white hover:border-stone-400"
                                }`}
                              >
                                <div>
                                  <span className="text-xs font-bold text-stone-900">
                                    {opt.name}
                                  </span>
                                  {opt.description && (
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                      {opt.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-[#8A4A38]">
                                  {opt.priceDelta > 0
                                    ? `+₹${opt.priceDelta}`
                                    : opt.priceDelta < 0
                                    ? `-₹${Math.abs(opt.priceDelta)}`
                                    : "Included"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    This piece is crafted as ready-to-wear with built-in 1.5-inch alteration margins.
                  </p>
                )}

                {/* Custom Measurements Inputs */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Provide Custom Measurements (Inches)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSizeMode((m) => (m === "STANDARD" ? "CUSTOM" : "STANDARD"))}
                      className="text-xs font-semibold text-[#8A4A38] hover:underline"
                    >
                      {sizeMode === "CUSTOM" ? "Switch to Standard Sizing" : "Enter Exact Inches"}
                    </button>
                  </div>

                  {sizeMode === "CUSTOM" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700">Bust (in)</label>
                          <input
                            type="text"
                            value={customBust}
                            onChange={(e) => setCustomBust(e.target.value)}
                            placeholder="e.g. 36"
                            className="mt-1 h-9 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700">Waist (in)</label>
                          <input
                            type="text"
                            value={customWaist}
                            onChange={(e) => setCustomWaist(e.target.value)}
                            placeholder="e.g. 30"
                            className="mt-1 h-9 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700">Hips (in)</label>
                          <input
                            type="text"
                            value={customHips}
                            onChange={(e) => setCustomHips(e.target.value)}
                            placeholder="e.g. 40"
                            className="mt-1 h-9 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700">Length (in)</label>
                          <input
                            type="text"
                            value={customLength}
                            onChange={(e) => setCustomLength(e.target.value)}
                            placeholder="e.g. 42"
                            className="mt-1 h-9 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-700">Shoulder (in)</label>
                          <input
                            type="text"
                            value={customShoulder}
                            onChange={(e) => setCustomShoulder(e.target.value)}
                            placeholder="e.g. 14.5"
                            className="mt-1 h-9 w-full rounded-lg border border-stone-300 bg-white px-2.5 text-xs text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700">
                          Special Tailoring Instructions & Notes
                        </label>
                        <textarea
                          rows={2}
                          value={tailoringNotes}
                          onChange={(e) => setTailoringNotes(e.target.value)}
                          placeholder="e.g., Gathered bottom with ankle dori, 1.5-inch extra inner margin, boat neck piping"
                          className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: RATINGS & REVIEWS */}
            <div className={activeTab === "reviews" ? "block" : "hidden"}>
              <ProductReviews
                productId={product.id}
                productName={product.name}
                initialReviews={initialReviews}
                initialStats={initialRatingStats}
              />
            </div>
          </div>
        </section>

        {/* 4. "You May Also Like" Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-stone-200/80 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-normal tracking-tight text-stone-900">
                You May Also Like
              </h3>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-[#8A4A38] transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 5).map((rel) => {
                const relWishlisted = isInWishlist(rel.id);
                const relPrice = rel.salePrice || rel.basePrice;
                return (
                  <div
                    key={rel.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition hover:border-[#8A4A38] hover:shadow-sm"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                      <Link href={`/product/${rel.slug}`} className="absolute inset-0">
                        {rel.imageUrl ? (
                          <Image
                            src={rel.imageUrl}
                            alt={rel.name}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#FAF8F5]">
                            <LotusMotif className="h-10 w-10 text-stone-300" />
                          </div>
                        )}
                      </Link>

                      {/* Wishlist Button on card */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({
                            id: rel.id,
                            slug: rel.slug,
                            name: rel.name,
                            image: rel.imageUrl || null,
                            basePrice: rel.basePrice,
                            salePrice: rel.salePrice,
                            productType: rel.productType,
                          });
                        }}
                        aria-label={
                          relWishlisted
                            ? `Remove ${rel.name} from wishlist`
                            : `Add ${rel.name} to wishlist`
                        }
                        className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full transition ${
                          relWishlisted
                            ? "bg-rose-50 text-rose-600 shadow-xs"
                            : "bg-white/90 text-stone-600 hover:bg-white hover:text-rose-600 shadow-xs"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${relWishlisted ? "fill-rose-600 text-rose-600" : ""}`}
                        />
                      </button>
                    </div>

                    <div className="p-3.5">
                      <Link href={`/product/${rel.slug}`}>
                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#8A4A38] line-clamp-1">
                          {rel.name}
                        </h4>
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-sans text-xs sm:text-sm font-bold text-stone-900">
                          ₹{relPrice.toLocaleString("en-IN")}
                        </span>
                        {rel.salePrice && rel.salePrice < rel.basePrice && (
                          <span className="text-[11px] text-stone-400 line-through">
                            ₹{rel.basePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen High-Resolution Image Modal */}
      {galleryImages.length > 0 && (
        <FullscreenImageModal
          isOpen={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
          images={galleryImages}
          initialIndex={selectedImageIndex}
        />
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizeChart={sizeChart}
        isCustomMade={isCustomMade}
      />

      {/* Mobile Sticky Bottom Quick-Action Bar (Renders when scrolled past main buy actions) */}
      <aside
        aria-label="Mobile Quick Purchase Bar"
        className={`fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-stone-200/90 bg-[#FAF7F2]/98 backdrop-blur-md px-3 py-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out dark:bg-stone-900/98 dark:border-stone-800 ${
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5 max-w-lg mx-auto">
          {/* Mini Garment Thumbnail */}
          {currentImage?.url ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-2xs">
              <Image
                src={currentImage.url}
                alt={product.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-100">
              <LotusMotif className="h-5 w-5 text-thaagai-gold" />
            </div>
          )}

          {/* Product Title, Price & Size badge */}
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-serif text-xs font-semibold text-stone-900 dark:text-stone-100 leading-tight">
              {product.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-xs text-stone-900 dark:text-amber-400">
                ₹{finalUnitPrice.toLocaleString("en-IN")}
              </span>
              {strikePrice && strikePrice > finalUnitPrice && (
                <span className="text-[10px] text-stone-400 line-through">
                  ₹{strikePrice.toLocaleString("en-IN")}
                </span>
              )}
              {availableSizes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("size-selector-section")?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                  className={`ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold border transition ${
                    selectedSize
                      ? "border-stone-300 bg-white text-stone-800 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                      : "border-amber-400 bg-amber-50 text-amber-800 animate-pulse dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  <span>{selectedSize ? `Size: ${selectedSize}` : "Choose Size ▾"}</span>
                </button>
              )}
            </div>
          </div>

          {/* 1-Click WhatsApp Quick Order */}
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order via WhatsApp consultation"
            title="Instant WhatsApp Order"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white shadow-xs transition hover:bg-[#20ba5a] active:scale-95"
          >
            <MessageSquare className="h-5 w-5 fill-white text-white" />
          </a>

          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={() => {
              if (availableSizes.length > 0 && !selectedSize && !isCustomMade) {
                document.getElementById("size-selector-section")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                return;
              }
              handleAddToBag();
            }}
            className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-bold text-white shadow-xs transition active:scale-95 ${
              addedAnimation
                ? "bg-emerald-600 text-white"
                : "bg-[#8A4A38] hover:bg-[#723B2C] dark:bg-amber-700 dark:hover:bg-amber-600"
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}
