"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  LogIn,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  verifiedPurchasesCount: number;
  withPhotosCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  initialReviews?: ReviewItem[];
  initialStats?: {
    averageRating: number;
    totalReviews: number;
    distribution?: { 5: number; 4: number; 3: number; 2: number; 1: number };
    verifiedPurchasesCount?: number;
    withPhotosCount?: number;
  };
}

export function ProductReviews({
  productId,
  productName,
  initialReviews = [],
  initialStats,
}: ProductReviewsProps) {
  const { customer, isAuthenticated } = useCustomerAuth();
  const pathname = usePathname();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: initialStats?.averageRating || 0,
    totalReviews: initialStats?.totalReviews || 0,
    verifiedPurchasesCount: initialStats?.verifiedPurchasesCount || 0,
    withPhotosCount: initialStats?.withPhotosCount || 0,
    distribution: initialStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(!initialReviews || initialReviews.length === 0);
  const [userReview, setUserReview] = useState<{
    id: string;
    rating: number;
    title?: string | null;
    content?: string | null;
    verifiedPurchase: boolean;
    status: string;
  } | null>(null);

  // Filters & Sorting
  const [sort, setSort] = useState<"newest" | "highest" | "lowest" | "photos">("newest");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [photosOnly, setPhotosOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Form State
  const [submissionMode, setSubmissionMode] = useState<"rating" | "review">("rating");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState(customer?.fullName || "");
  const [customerEmail, setCustomerEmail] = useState(customer?.email || "");
  const [customerPhone, setCustomerPhone] = useState(customer?.mobileNumber || "");
  const [orderReference, setOrderReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleAddPhoto = () => {
    if (photoUrl.trim() && images.length < 5) {
      setImages((prev) => [...prev, photoUrl.trim()]);
      setPhotoUrl("");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews?sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.userReview) {
          setUserReview(data.userReview);
        } else {
          setUserReview(null);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, sort]);

  const handleOpenModal = () => {
    setFormError("");
    setFormSuccess("");
    if (userReview) {
      setFormRating(userReview.rating || 5);
      setFormTitle(userReview.title || "");
      setFormContent(userReview.content || "");
    } else {
      setFormRating(5);
      setFormTitle("");
      setFormContent("");
    }
    setCustomerName(customer?.fullName || "");
    setCustomerEmail(customer?.email || "");
    setCustomerPhone(customer?.mobileNumber || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formRating || formRating < 1 || formRating > 5) {
      setFormError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: formRating,
          title: submissionMode === "review" ? formTitle.trim() : `Rating: ${formRating} Stars`,
          content: formContent.trim(),
          images,
          customerName: customerName.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          orderReference: orderReference.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setFormSuccess(
        userReview
          ? "Thank you! Your review has been updated."
          : (data.message || "Thank you! Your review has been submitted.")
      );

      // Refresh reviews list & userReview
      await fetchReviews();

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter reviews client-side: comment-free ratings count in aggregates but do not render empty cards
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const hasComment = r.content && r.content.trim().length > 0;
      const hasPhotos = r.images && r.images.length > 0;
      if (!hasComment && !hasPhotos) {
        return false;
      }
      if (starFilter !== null && r.rating !== starFilter) {
        return false;
      }
      if (verifiedOnly && !r.verifiedPurchase) {
        return false;
      }
      if (photosOnly && !hasPhotos) {
        return false;
      }
      return true;
    });
  }, [reviews, starFilter, verifiedOnly, photosOnly]);

  const renderStars = (score: number, size = "h-4 w-4") => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.round(score)
                ? "fill-amber-400 text-amber-400"
                : "fill-stone-200 text-stone-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#7A4156", "#8A4A38", "#5A6B5C", "#8B6B4A", "#4A5B7A"];
    const charCode = name && name.length > 0 ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  const formatPct = (count: number, total: number) => {
    if (total === 0) return "0%";
    const pct = (count / total) * 100;
    return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
  };

  const isAnyFilterActive = starFilter !== null || verifiedOnly || photosOnly;

  return (
    <div id="reviews-section" className="pt-1">
      {/* UNIFIED 2-COLUMN RATINGS & REVIEWS CARD */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT COLUMN: Customer Ratings */}
          <div className="lg:col-span-4 lg:border-r border-stone-200 lg:pr-8">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Customer Ratings
            </h2>

            {/* Score Row */}
            <div className="mt-4 flex items-center gap-3">
              <span className="font-sans text-5xl font-extrabold tracking-tight text-stone-900">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "0.0"}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {renderStars(stats.averageRating, "h-4 w-4")}
                </div>
                <span className="mt-1 text-xs font-medium text-stone-500">
                  out of 5
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs text-stone-500">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? "rating" : "ratings"}
            </p>

            {/* Distribution Rows */}
            <div className="mt-6 space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars as keyof typeof stats.distribution] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                const pctFormatted = formatPct(count, stats.totalReviews);
                const isSelected = starFilter === stars;

                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? null : stars)}
                    className={`group flex w-full items-center gap-2.5 rounded-lg p-1 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-[#8A4A38]/10 ring-1 ring-[#8A4A38]"
                        : "hover:bg-stone-50"
                    }`}
                  >
                    <span className="flex w-7 items-center gap-1 font-semibold text-stone-800 shrink-0">
                      <span>{stars}</span>
                      <span className="text-amber-500 text-xs">★</span>
                    </span>

                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-[#C87D55] transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="w-20 text-right shrink-0">
                      <span className="font-medium text-stone-900">{count}</span>
                      <span className="ml-1 text-[11px] text-stone-500">({pctFormatted})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Customer Reviews */}
          <div className="lg:col-span-8 lg:pl-2 flex flex-col justify-between">
            <div>
              {/* Header: Customer Reviews + Write a review button */}
              <div className="flex items-center justify-between pb-3">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Customer Reviews
                </h2>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="rounded-lg bg-[#8A4A38] hover:bg-[#733D2E] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors"
                >
                  {userReview ? "Edit your review" : "Write a review"}
                </button>
              </div>

              {/* Filter Pills Toolbar */}
              <div className="mt-2 flex flex-wrap items-center gap-2 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setStarFilter(null);
                    setVerifiedOnly(false);
                    setPhotosOnly(false);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs transition-all ${
                    !isAnyFilterActive
                      ? "bg-stone-100 border border-stone-300 font-semibold text-stone-900"
                      : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-medium"
                  }`}
                >
                  All reviews ({stats.totalReviews})
                </button>

                <button
                  type="button"
                  onClick={() => setPhotosOnly((p) => !p)}
                  className={`rounded-md px-3 py-1.5 text-xs transition-all ${
                    photosOnly
                      ? "bg-[#8A4A38] text-white font-semibold"
                      : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-medium"
                  }`}
                >
                  With photos ({stats.withPhotosCount})
                </button>

                {[5, 4, 3, 2, 1].map((s) => {
                  const count = stats.distribution[s as keyof typeof stats.distribution] || 0;
                  const isSelected = starFilter === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStarFilter(isSelected ? null : s)}
                      className={`rounded-md px-3 py-1.5 text-xs transition-all ${
                        isSelected
                          ? "bg-[#8A4A38] text-white font-semibold"
                          : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 font-medium"
                      }`}
                    >
                      <span>{s} ★</span>
                      <span className="ml-1 opacity-80">({count})</span>
                    </button>
                  );
                })}

                {isAnyFilterActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setStarFilter(null);
                      setVerifiedOnly(false);
                      setPhotosOnly(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A4A38] hover:underline ml-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Reviews List */}
              <div className="mt-2 space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.slice(0, visibleCount).map((rev) => {
                    const avatarBg = getAvatarColor(rev.customerName);
                    const formattedDate = new Date(rev.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <article
                        key={rev.id}
                        className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs"
                      >
                        {/* Header: Avatar, Name, Verified, Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              style={{ backgroundColor: avatarBg }}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm shrink-0 shadow-2xs"
                            >
                              {rev.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-900 text-sm">
                                {rev.customerName}
                              </span>
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                                  <span>Verified purchase</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <time dateTime={rev.createdAt} className="text-xs text-stone-400 font-normal">
                            {formattedDate}
                          </time>
                        </div>

                        {/* Stars */}
                        <div className="mt-2.5 flex items-center gap-0.5 text-amber-500">
                          {renderStars(rev.rating, "h-3.5 w-3.5")}
                        </div>

                        {/* Headline Title */}
                        {rev.title && (
                          <h3 className="mt-2 text-sm font-bold text-stone-900 leading-snug">
                            {rev.title}
                          </h3>
                        )}

                        {/* Review Body */}
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                          {rev.content}
                        </p>

                        {/* Photos */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-2.5">
                            {rev.images.map((imgUrl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActivePhoto(imgUrl)}
                                className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 hover:opacity-90 transition"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`Customer photo ${i + 1}`}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-8 text-center">
                    <p className="text-xs text-stone-500">
                      {isAnyFilterActive
                        ? "No reviews match your selected filter."
                        : "No written reviews yet. Be the first to share your thoughts!"}
                    </p>
                    {isAnyFilterActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setStarFilter(null);
                          setVerifiedOnly(false);
                          setPhotosOnly(false);
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8A4A38] hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Clear Filter</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Load More Button */}
                {filteredReviews.length > visibleCount && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + 10)}
                      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition"
                    >
                      Load More Reviews ({filteredReviews.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-2xl overflow-hidden rounded-2xl bg-black"
          >
            <Image
              src={activePhoto}
              alt="Customer photo enlarged"
              width={800}
              height={800}
              className="max-h-[80vh] w-auto object-contain"
            />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* COMPACT "WRITE A REVIEW" POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-7">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200/80 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A4A38]">
                  THAAGAI Storefront
                </span>
                <h3 className="mt-0.5 font-serif text-xl font-bold text-stone-900">
                  Write a Review
                </h3>
                <p className="mt-0.5 text-xs text-stone-600 line-clamp-1">{productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-[#8A4A38]">
                  <LogIn className="h-6 w-6" />
                </div>
                <h4 className="mt-3 font-serif text-base font-bold text-stone-900">
                  Sign In to Share Your Review
                </h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
                  Please log in to submit a rating or review. Verified purchase status will be automatically detected from your account orders.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(pathname || `/product/${productId}`)}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#8A4A38] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#733D2E] transition-colors"
                  >
                    Sign In to Review
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full rounded-xl border border-stone-200 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : formSuccess ? (
              <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                <h4 className="mt-2 font-serif font-bold text-emerald-900">
                  {userReview ? "Review Updated" : "Submission Received"}
                </h4>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Customer Profile Banner */}
                <div className="flex items-center justify-between rounded-xl bg-stone-50 px-3.5 py-2.5 border border-stone-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8A4A38] text-[11px] font-bold text-white">
                      {(customer?.fullName || "C").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-stone-800">
                      Reviewing as <strong className="font-semibold text-stone-900">{customer?.fullName || "Verified Customer"}</strong>
                    </span>
                  </div>
                  {userReview && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                      <Edit3 className="h-3 w-3" />
                      Editing
                    </span>
                  )}
                </div>

                {/* 1. Required Star Rating */}
                <div className="rounded-2xl border border-stone-200 bg-[#FAF7F2] p-4 text-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A4A38]">
                    Your Star Rating <span className="text-rose-600">*</span>
                  </label>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setFormRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-115"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoverRating ?? formRating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-bold text-stone-900">
                    {hoverRating ?? formRating} out of 5 stars
                    {(hoverRating ?? formRating) === 5 && " — Excellent"}
                    {(hoverRating ?? formRating) === 4 && " — Very Good"}
                    {(hoverRating ?? formRating) === 3 && " — Average"}
                    {(hoverRating ?? formRating) === 2 && " — Below Average"}
                    {(hoverRating ?? formRating) === 1 && " — Poor"}
                  </p>
                </div>

                {/* 2. Optional Review Text */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-stone-800">
                      Review <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-stone-400">
                      {formContent.length}/2000
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="How was the fabric, fit and quality?"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 text-xs leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-[#8A4A38] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-400"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    You can submit your star rating without writing a comment.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || formRating < 1}
                    className="rounded-xl bg-[#8A4A38] px-6 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#733D2E] disabled:opacity-50 transition-colors"
                  >
                    {submitting
                      ? "Saving..."
                      : userReview
                      ? "Update Review"
                      : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

