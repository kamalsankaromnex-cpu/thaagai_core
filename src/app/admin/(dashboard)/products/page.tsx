"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit3, Archive, Package, AlertCircle, CheckCircle2 } from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  size: string | null;
  colour: string | null;
  stockQuantity: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  productType: string;
  basePrice: string;
  salePrice: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  categories: Array<{ category: { id: string; name: string } }>;
  variants: Variant[];
  images: Array<{ id: string; storageKey: string; isPrimary: boolean }>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter]);

  const handleArchive = async (p: Product) => {
    if (!confirm(`Are you sure you want to archive "${p.name}"?`)) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess(`Product "${p.name}" archived.`);
        fetchProducts();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to archive product.");
      }
    } catch {
      setError("Network error archiving product.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
      case "DRAFT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Products</h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Catalog inventory, pricing, variants, and photography
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-thaagai-line bg-white p-4 shadow-sm sm:flex-row dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="h-10 w-full rounded border border-thaagai-line bg-white pl-9 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-thaagai-ink/40 dark:text-thaagai-inkDark/40" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        {loading ? (
          <div className="p-12 text-center text-xs text-thaagai-ink/60">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-8 w-8 text-thaagai-ink/40" />
            <p className="mt-2 text-sm font-semibold">No products found</p>
            <p className="mt-1 text-xs text-thaagai-ink/60">Create a new product to populate your store catalog.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-thaagai-line bg-thaagai-sand/30 font-semibold text-thaagai-ink dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Sale Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thaagai-line/40">
              {products.map((p) => {
                const totalStock = p.variants.reduce((acc, curr) => acc + curr.stockQuantity, 0);

                return (
                  <tr key={p.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/20">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-thaagai-ink dark:text-white">{p.name}</div>
                      <div className="font-mono text-[11px] text-thaagai-ink/60">{p.sku || p.slug}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-thaagai-gold">
                      {p.productType}
                    </td>
                    <td className="px-4 py-3.5 font-bold">&#8377;{Number(p.basePrice).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 font-semibold text-rose-700 dark:text-rose-400">
                      {p.salePrice ? `₹${Number(p.salePrice).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold ${totalStock <= 2 ? "text-amber-700" : ""}`}>
                        {totalStock} in {p.variants.length} var.
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.categories.map((c) => (
                          <span
                            key={c.category.id}
                            className="rounded bg-thaagai-sand px-1.5 py-0.5 text-[10px] font-medium dark:bg-thaagai-sandDark"
                          >
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded text-thaagai-ink/70 hover:bg-thaagai-sand hover:text-thaagai-wine"
                          title="Edit product"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        {p.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(p)}
                            className="flex h-9 w-9 items-center justify-center rounded text-thaagai-ink/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            title="Archive product"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
