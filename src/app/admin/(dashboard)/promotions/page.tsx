"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  PlusCircle,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string | number;
  minOrderAmount?: string | number | null;
  startDate?: string | null;
  endDate?: string | null;
  timesUsed: number;
  active: boolean;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data.promotions || []);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Discount value must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          description: description.trim() || undefined,
          discountType,
          discountValue: val,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create promo code");
        return;
      }

      setCode("");
      setTitle("");
      setDescription("");
      setDiscountValue("");
      setMinOrderAmount("");
      setIsModalOpen(false);
      fetchPromotions();
    } catch (err) {
      console.error("Failed to create promotion:", err);
      setFormError("A network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Promotions & Vouchers
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Create festive coupon codes, bridal campaign incentives, and client appreciation vouchers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-thaagai-wineHover"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Promotions List */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="mx-auto h-10 w-10 text-thaagai-ink/30 dark:text-thaagai-inkDark/30" />
            <h3 className="mt-3 text-sm font-bold text-thaagai-ink dark:text-white">
              No active promotions yet
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Create your first boutique discount code (e.g. WELCOME10 or FESTIVE2026).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-thaagai-line/60 sm:grid-cols-2 sm:divide-y-0 sm:gap-4 sm:p-4 md:grid-cols-3 dark:divide-thaagai-line/30">
            {promotions.map((p) => (
              <div
                key={p.id}
                className="relative flex flex-col justify-between rounded-xl border border-thaagai-line/70 bg-thaagai-sand/10 p-5 transition-all hover:border-thaagai-wine/50 hover:bg-white hover:shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:hover:bg-thaagai-cardDark"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-thaagai-wine/10 px-2 py-0.5 font-mono text-xs font-bold text-thaagai-wine dark:bg-thaagai-wine/30 dark:text-thaagai-gold">
                      {p.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(p.code)}
                      title="Copy code"
                      className="rounded p-1 text-thaagai-ink/40 hover:text-thaagai-wine dark:text-thaagai-inkDark/40"
                    >
                      {copiedCode === p.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="mt-3 font-brand text-sm font-bold text-thaagai-ink dark:text-white">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 border-t border-thaagai-line/50 pt-3 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-thaagai-wine dark:text-thaagai-gold">
                      {p.discountType === "PERCENTAGE"
                        ? `${Number(p.discountValue)}% OFF`
                        : `₹${Number(p.discountValue)} OFF`}
                    </span>
                    <span className="text-[11px] text-thaagai-ink/60">
                      Used {p.timesUsed} times
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                Create Promotion Voucher
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. THAAGAI10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 h-10 w-full font-mono uppercase rounded-lg border border-thaagai-line bg-white px-3 text-xs font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Promotion Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inaugural Boutique Welcome Voucher"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 500"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Minimum Order Spend (₹ Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2999"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Promotion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
