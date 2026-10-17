"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  Search,
  Layers,
  RefreshCw,
  Plus,
  PackageCheck,
  PackageX,
  Sparkles,
} from "lucide-react";
import { STANDARD_CHURIDAR_SIZES } from "@/lib/sizing";

interface Variant {
  id: string;
  sku: string;
  size: string | null;
  colour: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  product: {
    id: string;
    name: string;
    sku?: string | null;
    status: string;
    productType?: string;
  };
}

interface ProductMatrixItem {
  productId: string;
  productName: string;
  productSku: string | null;
  productType: string;
  status: string;
  primaryImage: { storageKey: string; altText: string } | null;
  totalStock: number;
  hasOutOfStock: boolean;
  hasLowStock: boolean;
  variants: {
    id: string;
    sku: string;
    size: string | null;
    colour: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    isOutOfStock: boolean;
    isLowStock: boolean;
  }[];
}

interface Movement {
  id: string;
  type: string;
  delta: number;
  reason: string;
  createdAt: string;
  variant: {
    sku: string;
    size: string | null;
    colour: string | null;
    product: { name: string };
  };
  actor?: { name: string; email: string } | null;
}

export default function AdminInventoryPage() {
  const [viewMode, setViewMode] = useState<"matrix" | "ledger">("matrix");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [productMatrices, setProductMatrices] = useState<ProductMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Single Adjustment Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    sku: string;
    productName: string;
    size: string | null;
    colour: string | null;
    stockQuantity: number;
  } | null>(null);
  const [singleDelta, setSingleDelta] = useState<number>(0);
  const [singleReason, setSingleReason] = useState("");
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // Batch Product Restock Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchProduct, setBatchProduct] = useState<ProductMatrixItem | null>(null);
  const [batchDeltas, setBatchDeltas] = useState<Record<string, number>>({});
  const [batchReason, setBatchReason] = useState("");
  const [submittingBatch, setSubmittingBatch] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (sizeFilter !== "all") params.set("size", sizeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
        setMovements(data.movements || []);
        setProductMatrices(data.productMatrices || []);
      } else {
        setError("Failed to load inventory data.");
      }
    } catch {
      setError("Network error loading inventory records.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sizeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  // Open single adjust modal
  const openSingleAdjust = (v: {
    id: string;
    sku: string;
    productName: string;
    size: string | null;
    colour: string | null;
    stockQuantity: number;
  }) => {
    setSelectedVariant(v);
    setSingleDelta(0);
    setSingleReason("");
    setError("");
    setSuccess("");
    setIsSingleModalOpen(true);
  };

  const handleSingleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    if (singleDelta === 0) {
      setError("Adjustment delta cannot be 0.");
      return;
    }

    if (selectedVariant.stockQuantity + singleDelta < 0) {
      setError(`Adjustment would cause negative stock (Current: ${selectedVariant.stockQuantity}).`);
      return;
    }

    setSubmittingSingle(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          delta: Number(singleDelta),
          reason: singleReason.trim() || `Manual adjustment for ${selectedVariant.sku}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to adjust stock.");
        return;
      }

      setSuccess(`Adjusted ${selectedVariant.sku} (${selectedVariant.size || "Free"}) by ${singleDelta > 0 ? "+" + singleDelta : singleDelta}.`);
      setIsSingleModalOpen(false);
      fetchInventory();
    } catch {
      setError("Network error adjusting inventory.");
    } finally {
      setSubmittingSingle(false);
    }
  };

  // Open batch restock modal
  const openBatchRestock = (p: ProductMatrixItem) => {
    setBatchProduct(p);
    const initialDeltas: Record<string, number> = {};
    p.variants.forEach((v) => {
      initialDeltas[v.id] = 0;
    });
    setBatchDeltas(initialDeltas);
    setBatchReason("Workshop batch arrival / size restock");
    setError("");
    setSuccess("");
    setIsBatchModalOpen(true);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchProduct) return;

    const updates = Object.entries(batchDeltas)
      .filter(([, delta]) => delta !== 0)
      .map(([variantId, delta]) => ({
        variantId,
        delta: Number(delta),
        reason: batchReason.trim() || `Batch size adjustment for ${batchProduct.productName}`,
      }));

    if (updates.length === 0) {
      setError("Please specify a non-zero adjustment delta for at least one size.");
      return;
    }

    // Check for negative stock
    for (const u of updates) {
      const v = batchProduct.variants.find((item) => item.id === u.variantId);
      if (v && v.stockQuantity + u.delta < 0) {
        setError(`Cannot deduct ${Math.abs(u.delta)} pieces from Size ${v.size || "One Size"} (Current on hand: ${v.stockQuantity}).`);
        return;
      }
    }

    setSubmittingBatch(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to complete batch adjustment.");
        return;
      }

      setSuccess(`Successfully updated stock for ${updates.length} sizes of ${batchProduct.productName}.`);
      setIsBatchModalOpen(false);
      fetchInventory();
    } catch {
      setError("Network error during batch adjustment.");
    } finally {
      setSubmittingBatch(false);
    }
  };

  // Metrics
  const totalVariantsCount = variants.length;
  const totalUnitsOnHand = variants.reduce((acc, v) => acc + v.stockQuantity, 0);
  const outOfStockCount = variants.filter((v) => v.stockQuantity <= 0).length;
  const lowStockCount = variants.filter((v) => v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-thaagai-ink dark:text-white sm:text-3xl">
              Size-Wise Stock Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Real-time Churidar size matrix, multi-size restock ledger, and atomic audit tracking.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 rounded-xl border border-thaagai-line bg-white p-1 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "matrix"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink/70 hover:text-thaagai-wine dark:text-thaagai-inkDark"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Size Matrix View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("ledger")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "ledger"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink/70 hover:text-thaagai-wine dark:text-thaagai-inkDark"
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Variant Ledger View</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-thaagai-line bg-white p-4 shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <span className="text-[11px] font-semibold text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Total Tracked Variants
          </span>
          <div className="mt-1 font-mono text-2xl font-bold text-thaagai-ink dark:text-white">
            {totalVariantsCount}
          </div>
        </div>

        <div className="rounded-xl border border-thaagai-line bg-white p-4 shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <span className="text-[11px] font-semibold text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Total Pieces on Hand
          </span>
          <div className="mt-1 font-mono text-2xl font-bold text-thaagai-wine dark:text-thaagai-gold">
            {totalUnitsOnHand}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">
              Low Stock Sizes
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">
            {lowStockCount}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-900 dark:text-rose-300">
              Sold Out Sizes
            </span>
            <PackageX className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-rose-700 dark:text-rose-400">
            {outOfStockCount}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-thaagai-line bg-white p-3.5 shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-thaagai-ink/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Churidar Name or SKU..."
            className="h-9 w-full rounded-lg border border-thaagai-line bg-white pl-9 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-hidden dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white dark:placeholder:text-stone-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="h-9 rounded-lg border border-thaagai-line bg-white px-2.5 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-hidden dark:bg-thaagai-cardDark dark:text-white"
          >
            <option value="all">All Sizes</option>
            {STANDARD_CHURIDAR_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                Size {sz}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-thaagai-line bg-white px-2.5 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-hidden dark:bg-thaagai-cardDark dark:text-white"
          >
            <option value="all">All Stock Statuses</option>
            <option value="out_of_stock">Out of Stock (0)</option>
            <option value="low_stock">Low Stock (≤ 2)</option>
            <option value="in_stock">Healthy Stock (&gt; 2)</option>
          </select>

          <button
            type="button"
            onClick={() => fetchInventory()}
            className="flex h-9 items-center gap-1 rounded-lg border border-thaagai-line px-3 text-xs font-semibold text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:text-white"
            title="Refresh inventory"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: SIZE-WISE MATRIX VIEW */}
      {viewMode === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">
              Product Size Matrix &amp; Live Stock Ledger
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> In Stock (&gt;2)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Low Stock (1–2)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Sold Out (0)
              </span>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-thaagai-line bg-white p-12 text-center text-xs text-thaagai-ink/60 dark:bg-thaagai-cardDark">
              Loading Churidar size matrix...
            </div>
          ) : productMatrices.length === 0 ? (
            <div className="rounded-xl border border-thaagai-line bg-white p-12 text-center dark:bg-thaagai-cardDark">
              <Boxes className="mx-auto h-8 w-8 text-thaagai-ink/30" />
              <p className="mt-2 text-sm font-semibold">No products matching current filters</p>
              <p className="mt-1 text-xs text-thaagai-ink/60">Try clearing search or filter selections</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {productMatrices.map((p) => (
                <div
                  key={p.productId}
                  className="rounded-xl border border-thaagai-line bg-white p-4 shadow-2xs transition-all hover:border-thaagai-gold/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    {/* Product Basic Info */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-thaagai-line bg-thaagai-sand/30 font-serif text-sm font-bold text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/30">
                        {p.productName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-thaagai-ink dark:text-white">
                            {p.productName}
                          </h3>
                          {p.productType === "CUSTOM_MADE" && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                              <Sparkles className="h-2.5 w-2.5" /> Bespoke
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                          <span className="font-mono">{p.productSku || "NO-SKU"}</span>
                          <span>•</span>
                          <span>Total: <strong className="font-mono text-thaagai-ink dark:text-white">{p.totalStock}</strong> pcs</span>
                          {p.hasOutOfStock && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                              Sizes Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Size Matrix Chips & Batch Button */}
                    <div className="flex flex-wrap items-center gap-2">
                      {p.variants.map((v) => {
                        const isOos = v.stockQuantity <= 0;
                        const isLow = v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold;

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() =>
                              openSingleAdjust({
                                id: v.id,
                                sku: v.sku,
                                productName: p.productName,
                                size: v.size,
                                colour: v.colour,
                                stockQuantity: v.stockQuantity,
                              })
                            }
                            className={`group flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all hover:scale-105 ${
                              isOos
                                ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                                : isLow
                                ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                                : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                            }`}
                            title={`Click to adjust stock for ${p.productName} (${v.size || "Free Size"})`}
                          >
                            <span className="font-bold">{v.size || "Free"}</span>
                            <span className="font-mono text-[11px] opacity-80">
                              ({v.stockQuantity})
                            </span>
                            <ArrowUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        );
                      })}

                      {/* Batch Restock Action */}
                      <button
                        type="button"
                        onClick={() => openBatchRestock(p)}
                        className="flex h-8 items-center gap-1 rounded-lg border border-thaagai-wine bg-thaagai-sand/30 px-3 text-xs font-semibold text-thaagai-wine hover:bg-thaagai-wine hover:text-white dark:border-thaagai-gold/60 dark:text-thaagai-gold"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Restock All Sizes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: DETAILED LEDGER VIEW */}
      {viewMode === "ledger" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            {loading ? (
              <div className="p-12 text-center text-xs text-thaagai-ink/60">Loading variant ledger...</div>
            ) : variants.length === 0 ? (
              <div className="p-12 text-center">
                <Boxes className="mx-auto h-8 w-8 text-thaagai-ink/40" />
                <p className="mt-2 text-sm font-semibold">No variant items match the criteria</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-thaagai-line bg-thaagai-sand/30 font-semibold text-thaagai-ink dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white">
                  <tr>
                    <th className="px-4 py-3">Variant SKU</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Colour</th>
                    <th className="px-4 py-3">Stock On Hand</th>
                    <th className="px-4 py-3">Threshold</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-thaagai-line/40">
                  {variants.map((v) => {
                    const isOos = v.stockQuantity <= 0;
                    const isLow = v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold;

                    return (
                      <tr key={v.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/20">
                        <td className="px-4 py-3.5 font-mono font-semibold text-thaagai-ink dark:text-white">
                          {v.sku}
                        </td>
                        <td className="px-4 py-3.5 font-medium">{v.product.name}</td>
                        <td className="px-4 py-3.5 font-bold text-thaagai-wine dark:text-thaagai-gold">
                          {v.size || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                          {v.colour || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`font-mono text-sm font-bold ${
                              isOos
                                ? "text-rose-600 dark:text-rose-400"
                                : isLow
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {v.stockQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-thaagai-ink/60">{v.lowStockThreshold}</td>
                        <td className="px-4 py-3.5">
                          {isOos ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                              <PackageX className="h-3 w-3" />
                              SOLD OUT
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                              <AlertTriangle className="h-3 w-3" />
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                              IN STOCK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openSingleAdjust({
                                id: v.id,
                                sku: v.sku,
                                productName: v.product.name,
                                size: v.size,
                                colour: v.colour,
                                stockQuantity: v.stockQuantity,
                              })
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-thaagai-line bg-white px-2.5 text-xs font-semibold text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:bg-thaagai-cardDark dark:text-white"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Movement Audit History */}
          <div className="space-y-4 pt-4">
            <h2 className="text-base font-bold text-thaagai-ink dark:text-white">
              Inventory Movement Audit Ledger (Last 100 Transactions)
            </h2>

            <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
              {movements.length === 0 ? (
                <div className="p-8 text-center text-xs text-thaagai-ink/60">
                  No inventory movements recorded yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-thaagai-line bg-thaagai-sand/30 font-semibold text-thaagai-ink dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Variant (Size)</th>
                      <th className="px-4 py-3">Delta</th>
                      <th className="px-4 py-3">Reason / Reference</th>
                      <th className="px-4 py-3">Actor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-thaagai-line/40">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/20">
                        <td className="px-4 py-3 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                          {new Date(m.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-thaagai-gold">
                          {m.type}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-semibold">{m.variant.sku}</span>
                          <span className="ml-1 text-thaagai-ink/60">
                            ({m.variant.size ? `Size ${m.variant.size}` : m.variant.product.name})
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          <span className={m.delta > 0 ? "text-emerald-600" : "text-rose-600"}>
                            {m.delta > 0 ? `+${m.delta}` : m.delta}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                          {m.reason}
                        </td>
                        <td className="px-4 py-3 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                          {m.actor ? m.actor.name : "System"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SINGLE VARIANT ADJUSTMENT */}
      {isSingleModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-thaagai-line bg-white p-6 shadow-xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="text-base font-bold text-thaagai-ink dark:text-white">
              Stock Adjustment — {selectedVariant.size ? `Size ${selectedVariant.size}` : selectedVariant.sku}
            </h2>
            <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              {selectedVariant.productName} ({selectedVariant.sku})
            </p>

            <form onSubmit={handleSingleAdjustSubmit} className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-thaagai-sand/30 p-3 text-xs dark:bg-thaagai-sandDark/40">
                <div>
                  <span className="text-thaagai-ink/70">Current on hand: </span>
                  <span className="font-mono text-sm font-bold text-thaagai-wine">
                    {selectedVariant.stockQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-thaagai-ink/70">New total: </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      selectedVariant.stockQuantity + singleDelta < 0
                        ? "text-rose-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {selectedVariant.stockQuantity + singleDelta}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  Adjustment Delta (+ for restock, - for audit deduction) *
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleDelta((d) => d - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-thaagai-line font-bold hover:bg-thaagai-sand/30"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    value={singleDelta}
                    onChange={(e) => setSingleDelta(Number(e.target.value))}
                    className="h-9 flex-1 rounded-lg border border-thaagai-line bg-white px-3 text-center font-mono text-sm font-bold text-thaagai-ink focus:border-thaagai-wine focus:outline-hidden dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSingleDelta((d) => d + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-thaagai-line font-bold hover:bg-thaagai-sand/30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  Audit Reason / Note *
                </label>
                <input
                  type="text"
                  required
                  value={singleReason}
                  onChange={(e) => setSingleReason(e.target.value)}
                  placeholder="e.g. Master tailor workshop delivery / Inventory audit"
                  className="mt-1 h-9 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-hidden dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/30 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSingle || singleDelta === 0}
                  className="rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submittingSingle ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH RESTOCK SIZES MODAL */}
      {isBatchModalOpen && batchProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-thaagai-line bg-white p-6 shadow-xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-thaagai-ink dark:text-white">
                  Restock All Sizes — {batchProduct.productName}
                </h2>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Update quantities across sizes in one atomic transaction.
                </p>
              </div>
              <span className="rounded-full bg-thaagai-sand/60 px-2.5 py-1 font-mono text-xs font-bold text-thaagai-wine dark:bg-thaagai-sandDark/50">
                {batchProduct.productSku || "CHURIDAR"}
              </span>
            </div>

            <form onSubmit={handleBatchSubmit} className="mt-4 space-y-4">
              {/* Size rows */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {batchProduct.variants.map((v) => {
                  const current = v.stockQuantity;
                  const delta = batchDeltas[v.id] || 0;
                  const newTotal = current + delta;

                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-xl border border-thaagai-line/70 bg-thaagai-sand/20 p-2.5 text-xs dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20"
                    >
                      <div className="w-24">
                        <span className="font-bold text-thaagai-wine dark:text-thaagai-gold">
                          Size {v.size || "Free"}
                        </span>
                        <div className="font-mono text-[10px] text-thaagai-ink/60">{v.sku}</div>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-thaagai-ink/60">Current</span>
                        <div className="font-mono font-bold">{current}</div>
                      </div>

                      {/* Delta Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-thaagai-ink/70">Add/Deduct:</span>
                        <input
                          type="number"
                          value={delta}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBatchDeltas((prev) => ({ ...prev, [v.id]: val }));
                          }}
                          className="h-8 w-16 rounded border border-thaagai-line bg-white px-2 text-center font-mono text-xs font-bold text-thaagai-ink focus:border-thaagai-wine focus:outline-hidden dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                        />
                      </div>

                      <div className="w-16 text-right">
                        <span className="text-[10px] text-thaagai-ink/60">New</span>
                        <div
                          className={`font-mono font-bold ${
                            newTotal < 0 ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {newTotal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                  Audit Reason / Shipment Reference *
                </label>
                <input
                  type="text"
                  required
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  placeholder="e.g. Master Tailor Batch Delivery #12"
                  className="mt-1 h-9 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-hidden dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/30 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBatch}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <PackageCheck className="h-3.5 w-3.5" />
                  <span>{submittingBatch ? "Restocking..." : "Confirm Batch Restock"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
