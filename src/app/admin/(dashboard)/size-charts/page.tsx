"use client";

import { useState, useEffect } from "react";
import {
  Ruler,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";
import { DEFAULT_CHURIDAR_SIZE_CHART } from "@/server/services/size-chart-service";

interface AdminSizeChart {
  id: string;
  name: string;
  categorySlug: string | null;
  productId: string | null;
  gender: string;
  measurements: any;
  customFitGuide: string | null;
  createdAt: string;
  product?: { id: string; name: string } | null;
}

export default function AdminSizeChartsPage() {
  const [charts, setCharts] = useState<AdminSizeChart[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<AdminSizeChart | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [customFitGuide, setCustomFitGuide] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [chartsRes, catsRes] = await Promise.all([
        fetch("/api/admin/size-charts"),
        fetch("/api/admin/categories"),
      ]);

      if (chartsRes.ok) {
        const data = await chartsRes.json();
        setCharts(data);
      }
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
      }
    } catch {
      setError("Failed to load size charts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingChart(null);
    setName("Standard Churidar Size Chart");
    setCategorySlug(categories[0]?.slug || "straight-cut-churidars");
    setCustomFitGuide(DEFAULT_CHURIDAR_SIZE_CHART.customFitGuide);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (chart: AdminSizeChart) => {
    setEditingChart(chart);
    setName(chart.name);
    setCategorySlug(chart.categorySlug || "");
    setCustomFitGuide(chart.customFitGuide || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: name.trim(),
      categorySlug: categorySlug.trim() || null,
      gender: "WOMEN",
      measurements: editingChart?.measurements || DEFAULT_CHURIDAR_SIZE_CHART,
      howToMeasure: DEFAULT_CHURIDAR_SIZE_CHART.howToMeasure,
      customFitGuide: customFitGuide.trim() || null,
    };

    try {
      if (editingChart) {
        const res = await fetch(`/api/admin/size-charts/${editingChart.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update size chart.");
        }
        setSuccess("Size chart updated.");
      } else {
        const res = await fetch("/api/admin/size-charts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create size chart.");
        }
        setSuccess("Size chart created.");
      }

      setIsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size chart?")) return;

    try {
      const res = await fetch(`/api/admin/size-charts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCharts(charts.filter((c) => c.id !== id));
        setSuccess("Size chart deleted.");
        setTimeout(() => setSuccess(""), 2500);
      }
    } catch {
      setError("Failed to delete chart.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            Size Charts Management
          </h1>
          <p className="mt-1 text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Maintain measurement charts, category defaults, and alteration guides for the storefront size guide modal.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover focus-visible:outline"
        >
          <Plus className="h-4 w-4" /> Add Size Chart
        </button>
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

      {/* Standard Size Chart Notice */}
      <div className="rounded-2xl border border-thaagai-gold/60 bg-[#FAF7F2] p-5 dark:bg-thaagai-sandDark/20 text-xs">
        <div className="flex items-center gap-2 font-serif text-sm font-bold text-thaagai-wine">
          <Ruler className="h-4 w-4 text-thaagai-gold" />
          <span>Default Active System Size Chart</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
          The storefront automatically serves the comprehensive <strong>Churidar Standard Measurements</strong> (XS to 3XL for Kurta Bust, Waist, Hips, Kurta Length, Churidar Pant Gathers, and Shoulder in both Inches and Centimetres). Any custom chart created below can override specific categories or products.
        </p>
      </div>

      {/* Charts List */}
      {loading ? (
        <div className="rounded-2xl border border-thaagai-line bg-white p-12 text-center text-sm text-thaagai-ink/50 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          Loading size charts...
        </div>
      ) : charts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-thaagai-gold/60 bg-white p-10 text-center dark:bg-thaagai-cardDark">
          <Sparkles className="mx-auto h-8 w-8 text-thaagai-gold" />
          <h3 className="mt-3 font-serif text-lg font-bold text-thaagai-wine">
            Using System Default Size Chart
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            No category overrides are currently created. All products are using the built-in Tamil churidar sizing table. Click &quot;Add Size Chart&quot; to configure category-specific dimensions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {charts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border border-thaagai-line bg-white p-5 shadow-xs dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-thaagai-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-thaagai-maroon">
                    {c.categorySlug || "Product Override"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="rounded p-1 text-thaagai-ink/60 hover:text-thaagai-wine"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  {c.name}
                </h3>
                {c.customFitGuide && (
                  <p className="mt-2 line-clamp-2 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {c.customFitGuide}
                  </p>
                )}
              </div>

              <div className="mt-4 border-t border-thaagai-line/40 pt-3 text-[11px] text-thaagai-ink/50">
                Created: {new Date(c.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Size Chart */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:p-8">
            <h3 className="font-serif text-xl font-bold text-thaagai-wine dark:text-white">
              {editingChart ? "Edit Size Chart" : "Create Category Size Chart"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Chart Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anarkali Churidar Sizing"
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white px-3.5 py-2 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Target Category
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white px-3.5 py-2 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  <option value="">Global Default</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Custom Fit & Alteration Advice
                </label>
                <textarea
                  rows={3}
                  value={customFitGuide}
                  onChange={(e) => setCustomFitGuide(e.target.value)}
                  placeholder="Seam allowance notes, alteration tips, or drape instructions..."
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-thaagai-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-thaagai-wine px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingChart ? "Update Chart" : "Create Chart"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
