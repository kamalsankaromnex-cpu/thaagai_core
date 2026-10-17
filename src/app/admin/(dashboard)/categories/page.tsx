"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers, AlertCircle, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { products: number; children: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setSortOrder(0);
    setActive(true);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setSortOrder(cat.sortOrder || 0);
    setActive(cat.active);
    setError("");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      name,
      slug,
      description: description.trim() || null,
      parentId: parentId || null,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save category.");
        return;
      }

      setSuccess(`Category "${name}" saved successfully.`);
      setIsModalOpen(false);
      fetchCategories();
    } catch {
      setError("Network error occurred.");
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete "${cat.name}"?`)) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete category.");
        return;
      }

      setSuccess(`Category "${cat.name}" deleted.`);
      fetchCategories();
    } catch {
      setError("Network error deleting category.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Categories</h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Organize catalog into ready-to-wear and bespoke churidar collections
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
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

      {/* Category List */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        {loading ? (
          <div className="p-12 text-center text-xs text-thaagai-ink/60">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-thaagai-ink/40" />
            <p className="mt-2 text-sm font-semibold">No categories found</p>
            <p className="mt-1 text-xs text-thaagai-ink/60">Create your first category to start organizing products.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-thaagai-line bg-thaagai-sand/30 font-semibold text-thaagai-ink dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thaagai-line/40">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/20">
                  <td className="px-4 py-3.5 font-semibold text-thaagai-ink dark:text-white">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3.5 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {cat.parent ? cat.parent.name : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold">{cat._count?.products || 0}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono">{cat.sortOrder}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cat.active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {cat.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex h-9 w-9 items-center justify-center rounded text-thaagai-ink/70 hover:bg-thaagai-sand hover:text-thaagai-wine"
                        title="Edit category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="flex h-9 w-9 items-center justify-center rounded text-thaagai-ink/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-thaagai-line bg-white p-6 shadow-xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="text-lg font-bold text-thaagai-ink dark:text-white">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Straight Cut Churidars"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. straight-cut-churidars"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line bg-white px-3 font-mono text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description for category page"
                  className="mt-1 w-full rounded border border-thaagai-line bg-white p-2 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold">Parent Category</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="mt-1 h-10 w-full rounded border border-thaagai-line bg-white px-2 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  >
                    <option value="">None (Top-Level)</option>
                    {categories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold">Display Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="mt-1 h-10 w-full rounded border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                />
                <label htmlFor="cat-active" className="text-xs font-semibold">
                  Active (visible on storefront)
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-thaagai-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 min-h-[44px] rounded px-4 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 min-h-[44px] rounded bg-thaagai-wine px-5 text-xs font-semibold text-white hover:bg-thaagai-wineHover"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
