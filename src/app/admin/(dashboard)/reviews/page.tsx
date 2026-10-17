"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  EyeOff,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Search,
} from "lucide-react";
import { ReviewStatus } from "@prisma/client";

interface AdminReview {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  adminNotes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: { storageKey: string }[];
  };
  order: {
    id: string;
    reference: string;
    status: string;
    createdAt: string;
  } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [adminNotesText, setAdminNotesText] = useState("");

  const fetchReviews = async () => {
    try {
      const url =
        selectedStatus !== "ALL"
          ? `/api/admin/reviews?status=${selectedStatus}`
          : "/api/admin/reviews";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setError("Failed to load reviews.");
      }
    } catch {
      setError("An unexpected error occurred while loading reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedStatus]);

  const handleUpdateStatus = async (id: string, newStatus: ReviewStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReviews(
          reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setSuccess(`Review marked as ${newStatus}.`);
        setTimeout(() => setSuccess(""), 2500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update review status.");
      }
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviews.find((r) => r.id === id)?.status,
          adminNotes: adminNotesText,
        }),
      });

      if (res.ok) {
        setReviews(
          reviews.map((r) => (r.id === id ? { ...r, adminNotes: adminNotesText } : r))
        );
        setEditingNotesId(null);
        setSuccess("Admin note saved.");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch {
      setError("Failed to save note.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
        setSuccess("Review deleted.");
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch {
      setError("Failed to delete review.");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q) ||
      r.product.name.toLowerCase().includes(q) ||
      (r.order?.reference && r.order.reference.toLowerCase().includes(q))
    );
  });

  const pendingCount = reviews.filter((r) => r.status === ReviewStatus.PENDING).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            Customer Reviews & Moderation
          </h1>
          <p className="mt-1 text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Moderate submitted customer reviews, inspect genuine order verification, and manage storefront visibility.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-xs dark:bg-amber-950/40 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>{pendingCount} Pending Moderation</span>
          </span>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Controls & Filter Tabs */}
      <div className="flex flex-col gap-4 rounded-2xl border border-thaagai-line bg-white p-4 shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "FLAGGED", "HIDDEN"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? "bg-thaagai-wine text-white shadow-xs"
                  : "bg-thaagai-sand/40 text-thaagai-ink hover:bg-thaagai-sand dark:text-thaagai-inkDark"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-thaagai-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews, orders, names..."
            className="h-9 w-full rounded-lg border border-thaagai-line bg-thaagai-sand/20 pl-9 pr-3 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="rounded-2xl border border-thaagai-line bg-white p-12 text-center text-sm text-thaagai-ink/50 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          Loading customer reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-thaagai-gold/60 bg-[#FAF7F2] p-12 text-center dark:bg-thaagai-cardDark">
          <Sparkles className="mx-auto h-8 w-8 text-thaagai-gold" />
          <h3 className="mt-3 font-serif text-lg font-bold text-thaagai-wine">
            No Reviews Found
          </h3>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            No customer reviews match the selected status filter or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-5 rounded-2xl border border-thaagai-line bg-white p-5 shadow-xs transition-all dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                {/* Left: Product & Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        rev.status === ReviewStatus.APPROVED
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : rev.status === ReviewStatus.PENDING
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : rev.status === ReviewStatus.REJECTED
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : rev.status === ReviewStatus.FLAGGED
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {rev.status}
                    </span>

                    {rev.verifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" /> Verified Purchase
                      </span>
                    ) : (
                      <span className="text-[10px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                        Unverified
                      </span>
                    )}

                    <span className="text-[11px] text-thaagai-ink/40">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Rating Stars & Title */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <h3 className="font-serif text-base font-bold text-thaagai-wine dark:text-white">
                      {rev.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <p className="max-w-2xl text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                    {rev.content}
                  </p>

                  {/* Customer Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {rev.images.map((imgUrl, i) => (
                        <a
                          key={i}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative h-14 w-14 overflow-hidden rounded-lg border border-thaagai-line"
                        >
                          <Image src={imgUrl} alt="Photo" fill className="object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Customer metadata & order connection */}
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    <span>
                      <strong>Customer:</strong> {rev.customerName}
                    </span>
                    {rev.customerEmail && <span>{rev.customerEmail}</span>}
                    {rev.customerPhone && <span>{rev.customerPhone}</span>}
                    {rev.order && (
                      <span className="font-mono text-thaagai-wine dark:text-thaagai-gold">
                        Order #{rev.order.reference} ({rev.order.status})
                      </span>
                    )}
                    <span>
                      <strong>Product:</strong> {rev.product.name}
                    </span>
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex flex-wrap items-center gap-1.5 self-start">
                  {rev.status !== ReviewStatus.APPROVED && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, ReviewStatus.APPROVED)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}

                  {rev.status !== ReviewStatus.REJECTED && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, ReviewStatus.REJECTED)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}

                  {rev.status !== ReviewStatus.FLAGGED && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, ReviewStatus.FLAGGED)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 text-[11px] font-semibold text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Flag
                    </button>
                  )}

                  {rev.status !== ReviewStatus.HIDDEN && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, ReviewStatus.HIDDEN)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 px-2.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Admin Note Section */}
              <div className="border-t border-thaagai-line/40 pt-3 text-xs">
                {editingNotesId === rev.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      placeholder="Add internal moderation note..."
                      className="h-8 flex-1 rounded border border-thaagai-line px-2 text-xs"
                    />
                    <button
                      onClick={() => handleSaveNotes(rev.id)}
                      className="rounded bg-thaagai-wine px-3 text-xs font-semibold text-white"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="rounded border border-thaagai-line px-3 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-thaagai-ink/60">
                    <span>
                      {rev.adminNotes ? (
                        <>
                          <strong className="text-thaagai-wine">Admin Note:</strong> {rev.adminNotes}
                        </>
                      ) : (
                        "No internal notes attached."
                      )}
                    </span>
                    <button
                      onClick={() => {
                        setEditingNotesId(rev.id);
                        setAdminNotesText(rev.adminNotes || "");
                      }}
                      className="font-semibold text-thaagai-wine hover:underline"
                    >
                      {rev.adminNotes ? "Edit Note" : "+ Add Note"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
