"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CustomFabric, FabricPlacementMode, FabricTypeCategory } from "@/server/services/fabric-service";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  ExternalLink,
  Sparkles,
  Ruler,
  IndianRupee,
  Boxes,
  X,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function AdminFabricsPage() {
  const [fabrics, setFabrics] = useState<CustomFabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<Partial<CustomFabric> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadFabrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/fabrics");
      if (!res.ok) throw new Error("Failed to load fabrics");
      const data = await res.json();
      setFabrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load fabrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFabrics();
  }, []);

  const handleOpenAdd = () => {
    setEditingFabric({
      fabricId: `FAB-NEW-${Date.now().toString().slice(-4)}`,
      name: "",
      fabricType: "COTTON",
      placementMode: "ALL_OVER_REPEAT",
      description: "",
      originalPhoto: "/fabrics/chettinad-maroon-butta.svg",
      textureUrl: "/fabrics/chettinad-maroon-butta.svg",
      repeatWidthCm: 15,
      repeatHeightCm: 15,
      roughness: 0.85,
      metalness: 0.0,
      pricePerMeter: 450,
      stockMeters: 50,
      status: "ACTIVE",
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fabric: CustomFabric) => {
    setEditingFabric({ ...fabric });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete fabric "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/fabrics?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete fabric");
      setSuccess(`Fabric "${name}" was deleted successfully.`);
      setTimeout(() => setSuccess(null), 3000);
      loadFabrics();
    } catch (err: any) {
      setError(err.message || "Failed to delete fabric");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPEG, PNG, WebP, or SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image exceeds 5MB limit. Please upload a smaller image file.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      const data = await res.json();
      setEditingFabric((prev) => ({
        ...prev,
        originalPhoto: data.url,
        textureUrl: data.url,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFabric || !editingFabric.fabricId || !editingFabric.name) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/fabrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFabric),
      });

      if (!res.ok) throw new Error("Failed to save fabric");
      setIsModalOpen(false);
      setEditingFabric(null);
      setSuccess("Fabric saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      loadFabrics();
    } catch (err: any) {
      alert(err.message || "Error saving fabric");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-thaagai-line/70 pb-5 dark:border-thaagai-line/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-thaagai-gold/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-thaagai-wine">
              3D Apparel Pipeline
            </span>
            <span className="text-xs text-stone-500">Fabric Asset Ingestion</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-thaagai-ink dark:text-white">
            3D Fabric Management
          </h1>
          <p className="mt-0.5 text-xs text-stone-500">
            Upload straight-on handloom scans, configure real-world metric repeat scales, and manage stock for the live 3D Kurti studio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/3d-studio"
            target="_blank"
            className="flex h-10 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 text-xs font-semibold text-stone-800 shadow-xs hover:bg-stone-50 transition dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
          >
            <Eye className="h-4 w-4" />
            <span>Open Live 3D Studio</span>
            <ExternalLink className="h-3 w-3 text-stone-400" />
          </Link>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex h-10 items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Fabric</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Fabrics Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line/80 bg-white shadow-2xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-thaagai-line/70 bg-stone-50/70 font-semibold text-stone-600 dark:bg-stone-800/50 dark:text-stone-300">
                <th className="py-3 px-4">Swatch</th>
                <th className="py-3 px-4">Fabric ID / Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Placement Mode</th>
                <th className="py-3 px-4">Repeat Scale</th>
                <th className="py-3 px-4">Price / Metre</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thaagai-line/60 dark:divide-thaagai-line/20">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    Loading fabric designs...
                  </td>
                </tr>
              ) : fabrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    No fabrics found. Click &quot;Add New Fabric&quot; above.
                  </td>
                </tr>
              ) : (
                fabrics.map((f) => (
                  <tr key={f.id || f.fabricId} className="hover:bg-stone-50/50 transition dark:hover:bg-stone-800/30">
                    {/* Swatch Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-2xs">
                        <Image
                          src={f.originalPhoto}
                          alt={f.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* ID & Name */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-thaagai-wine dark:text-amber-400">
                        {f.fabricId}
                      </span>
                      <p className="font-medium text-stone-900 dark:text-stone-100 line-clamp-1 mt-0.5">
                        {f.name}
                      </p>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className="rounded bg-stone-100 px-2 py-0.5 font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {f.fabricType}
                      </span>
                    </td>

                    {/* Placement Mode */}
                    <td className="py-3 px-4">
                      {f.placementMode === "BORDER_HEM" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Sparkles className="h-3 w-3" />
                          Temple Border
                        </span>
                      ) : (
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          All-Over Tile
                        </span>
                      )}
                    </td>

                    {/* Repeat Scale */}
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      <span className="font-medium">
                        {f.repeatWidthCm} × {f.repeatHeightCm} cm
                      </span>
                    </td>

                    {/* Price / Metre */}
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-white">
                      ₹{f.pricePerMeter}/m
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                      <span className={f.stockMeters <= 10 ? "font-bold text-rose-600" : ""}>
                        {f.stockMeters} m
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          f.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : f.status === "DRAFT"
                            ? "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(f)}
                          aria-label={`Edit ${f.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition dark:hover:bg-stone-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id, f.name)}
                          aria-label={`Delete ${f.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          ADD / EDIT FABRIC MODAL WITH DRAG-AND-DROP FILE UPLOAD & REPEAT PREVIEW
         ===================================================================== */}
      {isModalOpen && editingFabric && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-700">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                {editingFabric.id ? "Edit 3D Fabric Asset" : "Add New 3D Fabric Asset"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFabric} className="mt-4 space-y-4">
              {/* 1. REAL FABRIC FILE UPLOAD DROPZONE */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Fabric Image / Straight-on Photo Scan <span className="text-rose-500">*</span>
                </label>

                {/* Hidden file input supporting camera or file picker */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex flex-col sm:flex-row items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-all ${
                    isDragging
                      ? "border-[#8A4A38] bg-[#FAF7F2] dark:bg-amber-950/20"
                      : "border-stone-300 bg-stone-50/60 hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800/40"
                  }`}
                >
                  {/* Current Image Swatch Preview */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                    {editingFabric.originalPhoto ? (
                      <Image
                        src={editingFabric.originalPhoto}
                        alt="Fabric scan preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Dropzone Description & Action Buttons */}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      Drag & drop straight-on fabric scan here, or browse files
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Supports high-resolution JPEG, PNG, WebP (Camera phone photo or flatbed scanner)
                    </p>

                    {/* Upload progress & error */}
                    {isUploading && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#8A4A38]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading and optimizing fabric scan...</span>
                      </div>
                    )}

                    {uploadError && (
                      <p className="mt-1 text-xs text-rose-600 font-semibold">{uploadError}</p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 transition active:scale-95 disabled:opacity-50 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-200"
                      >
                        <UploadCloud className="h-3.5 w-3.5 text-[#8A4A38]" />
                        <span>Browse Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.setAttribute("capture", "environment");
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 transition active:scale-95 disabled:opacity-50 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-200"
                      >
                        <Camera className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Take Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. FABRIC DETAILS (ID & NAME) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Fabric ID / SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFabric.fabricId || ""}
                    onChange={(e) => setEditingFabric({ ...editingFabric, fabricId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
                    placeholder="e.g. FAB-CHET-04"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Fabric Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFabric.name || ""}
                    onChange={(e) => setEditingFabric({ ...editingFabric, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs font-semibold text-stone-900 placeholder:text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
                    placeholder="e.g. Madurai Sungudi Mustard Yellow"
                  />
                </div>
              </div>

              {/* 3. TYPE, PLACEMENT MODE & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Fabric Type
                  </label>
                  <select
                    value={editingFabric.fabricType || "COTTON"}
                    onChange={(e) => {
                      const t = e.target.value as FabricTypeCategory;
                      // Auto-calibrate roughness based on fabric physics
                      const roughness = t === "RAW_SILK" ? 0.38 : t === "CHANDERI" ? 0.45 : 0.85;
                      const metalness = t === "RAW_SILK" || t === "CHANDERI" ? 0.08 : 0.0;
                      setEditingFabric({
                        ...editingFabric,
                        fabricType: t,
                        roughness,
                        metalness,
                      });
                    }}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="COTTON">Handloom Cotton (Matte)</option>
                    <option value="RAW_SILK">Raw Silk (Sheen)</option>
                    <option value="CHANDERI">Chanderi Silk (Zari Luster)</option>
                    <option value="MULMUL">Mulmul Cotton (Ultra Soft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Placement Mode
                  </label>
                  <select
                    value={editingFabric.placementMode || "ALL_OVER_REPEAT"}
                    onChange={(e) =>
                      setEditingFabric({
                        ...editingFabric,
                        placementMode: e.target.value as FabricPlacementMode,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="ALL_OVER_REPEAT">All-Over Repeat (Buttas / Florals)</option>
                    <option value="BORDER_HEM">Border Placement (Temple Hem & Cuffs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Status
                  </label>
                  <select
                    value={editingFabric.status || "ACTIVE"}
                    onChange={(e) =>
                      setEditingFabric({ ...editingFabric, status: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="ACTIVE">Active (Live in 3D Studio)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* 4. PHYSICAL METRIC REPEAT CALIBRATION & LIVE TEST BOX */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:bg-stone-800/40 dark:border-stone-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[#8A4A38]" />
                    <span>Physical Motif Repeat Calibration (Centimetres)</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">Metric scale for 3D mapping</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                      Repeat Width: {editingFabric.repeatWidthCm} cm
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={editingFabric.repeatWidthCm || 15}
                      onChange={(e) =>
                        setEditingFabric({
                          ...editingFabric,
                          repeatWidthCm: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-[#8A4A38]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                      Repeat Height: {editingFabric.repeatHeightCm} cm
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={editingFabric.repeatHeightCm || 15}
                      onChange={(e) =>
                        setEditingFabric({
                          ...editingFabric,
                          repeatHeightCm: Number(e.target.value),
                        })
                      }
                      className="mt-1 w-full accent-[#8A4A38]"
                    />
                  </div>
                </div>

                {/* LIVE SWATCH REPEAT TEST BOX (Updates immediately with uploaded image) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Live Tiling Preview (Simulated Fabric Drape):
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {editingFabric.repeatWidthCm}cm × {editingFabric.repeatHeightCm}cm Scale
                    </span>
                  </div>
                  <div
                    className="h-28 w-full rounded-lg border border-stone-300 shadow-inner transition-all"
                    style={{
                      backgroundImage: `url(${editingFabric.textureUrl || editingFabric.originalPhoto})`,
                      backgroundRepeat: "repeat",
                      backgroundSize: `${(editingFabric.repeatWidthCm || 15) * 4}px ${(editingFabric.repeatHeightCm || 15) * 4}px`,
                      backgroundColor: "#F7F2EB",
                    }}
                  />
                </div>
              </div>

              {/* 5. PRICING & STOCK */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Price per Metre (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingFabric.pricePerMeter || 350}
                    onChange={(e) =>
                      setEditingFabric({ ...editingFabric, pricePerMeter: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Stock Available (Meters) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={editingFabric.stockMeters || 50}
                    onChange={(e) =>
                      setEditingFabric({ ...editingFabric, stockMeters: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* 6. SUBMIT & ACTIONS */}
              <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploading}
                  className="flex items-center gap-2 rounded-lg bg-thaagai-wine px-5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Fabric Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
