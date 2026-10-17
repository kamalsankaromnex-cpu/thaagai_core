"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  Layers,
} from "lucide-react";

interface HeroSlide {
  id: string;
  eyebrow: string | null;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string | null;
  secondaryCtaUrl: string | null;
  desktopImage: string;
  mobileImage: string | null;
  altText: string;
  textAlignment: string;
  overlayOpacity: number;
  sortOrder: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const PRESET_BANNERS = [
  { label: "Traditional Elegance", url: "/banners/hero-traditional.svg" },
  { label: "Festive Anarkalis", url: "/banners/hero-festive.svg" },
  { label: "Custom Bespoke", url: "/banners/hero-custom.svg" },
  { label: "Everyday Grace", url: "/banners/hero-everyday.svg" },
  { label: "Festive Promo Strip", url: "/banners/festive-promo.svg" },
];

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState("");
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState("");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState("");
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState("");
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [altText, setAltText] = useState("");
  const [textAlignment, setTextAlignment] = useState("left");
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/admin/hero-slides");
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      } else {
        setError("Failed to load hero slides.");
      }
    } catch {
      setError("An unexpected error occurred while fetching slides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setEyebrow("");
    setTitle("");
    setDescription("");
    setPrimaryCtaLabel("Shop Ready-to-Wear");
    setPrimaryCtaUrl("/shop?type=READY_TO_WEAR");
    setSecondaryCtaLabel("");
    setSecondaryCtaUrl("");
    setDesktopImage("/banners/hero-traditional.svg");
    setMobileImage("");
    setAltText("Thaagai Handloom Churidar Collection");
    setTextAlignment("left");
    setOverlayOpacity(40);
    setSortOrder(slides.length + 1);
    setActive(true);
    setStartDate("");
    setEndDate("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setEyebrow(slide.eyebrow || "");
    setTitle(slide.title);
    setDescription(slide.description);
    setPrimaryCtaLabel(slide.primaryCtaLabel);
    setPrimaryCtaUrl(slide.primaryCtaUrl);
    setSecondaryCtaLabel(slide.secondaryCtaLabel || "");
    setSecondaryCtaUrl(slide.secondaryCtaUrl || "");
    setDesktopImage(slide.desktopImage);
    setMobileImage(slide.mobileImage || "");
    setAltText(slide.altText);
    setTextAlignment(slide.textAlignment || "left");
    setOverlayOpacity(slide.overlayOpacity ?? 40);
    setSortOrder(slide.sortOrder);
    setActive(slide.active);
    setStartDate(slide.startDate ? new Date(slide.startDate).toISOString().slice(0, 16) : "");
    setEndDate(slide.endDate ? new Date(slide.endDate).toISOString().slice(0, 16) : "");
    setError("");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const result = await res.json();
      setDesktopImage(result.url);
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      eyebrow: eyebrow.trim() || null,
      title: title.trim(),
      description: description.trim(),
      primaryCtaLabel: primaryCtaLabel.trim(),
      primaryCtaUrl: primaryCtaUrl.trim(),
      secondaryCtaLabel: secondaryCtaLabel.trim() || null,
      secondaryCtaUrl: secondaryCtaUrl.trim() || null,
      desktopImage: desktopImage.trim(),
      mobileImage: mobileImage.trim() || null,
      altText: altText.trim(),
      textAlignment,
      overlayOpacity: Number(overlayOpacity),
      sortOrder: Number(sortOrder),
      active,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      if (editingSlide) {
        const res = await fetch(`/api/admin/hero-slides/${editingSlide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update slide.");
        }
        setSuccess("Slide updated successfully!");
      } else {
        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create slide.");
        }
        setSuccess("New hero slide created successfully!");
      }

      setIsModalOpen(false);
      await fetchSlides();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !slide.active }),
      });
      if (res.ok) {
        setSlides(slides.map((s) => (s.id === slide.id ? { ...s, active: !s.active } : s)));
        setSuccess(`Slide ${!slide.active ? "activated" : "deactivated"}.`);
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch {
      setError("Failed to update slide status.");
    }
  };

  const handleReorder = async (slide: HeroSlide, direction: "up" | "down") => {
    const currentIndex = slides.findIndex((s) => s.id === slide.id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === slides.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetSlide = slides[targetIndex];

    const currentOrder = slide.sortOrder;
    const targetOrder = targetSlide.sortOrder;

    try {
      await Promise.all([
        fetch(`/api/admin/hero-slides/${slide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: targetOrder }),
        }),
        fetch(`/api/admin/hero-slides/${targetSlide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: currentOrder }),
        }),
      ]);

      await fetchSlides();
    } catch {
      setError("Failed to reorder slides.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;

    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSlides(slides.filter((s) => s.id !== id));
        setSuccess("Slide deleted successfully.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete slide.");
      }
    } catch {
      setError("Failed to delete slide.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            Homepage Hero Slides
          </h1>
          <p className="mt-1 text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Manage the rotating hero carousel banners, promotional headlines, CTA links, and scheduling on the storefront.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover focus-visible:outline"
        >
          <Plus className="h-4 w-4" /> Add Hero Slide
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

      {/* Slide Cards Grid / List */}
      {loading ? (
        <div className="rounded-2xl border border-thaagai-line bg-white p-12 text-center text-sm text-thaagai-ink/50 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          Loading hero carousel slides...
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-thaagai-gold/60 bg-[#FAF7F2] p-12 text-center dark:bg-thaagai-cardDark">
          <Sparkles className="mx-auto h-8 w-8 text-thaagai-gold" />
          <h3 className="mt-3 font-serif text-lg font-bold text-thaagai-wine">No Hero Slides Configured</h3>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            The storefront is currently displaying the fallback default slides. Create your first custom slide to personalize the homepage.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white transition-all hover:bg-thaagai-wineHover"
          >
            <Plus className="h-4 w-4" /> Add Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`flex flex-col gap-5 rounded-2xl border p-5 transition-all md:flex-row md:items-center md:justify-between ${
                slide.active
                  ? "border-thaagai-line bg-white shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                  : "border-gray-200 bg-gray-50/70 opacity-70 dark:border-gray-800 dark:bg-gray-900/40"
              }`}
            >
              {/* Left: Thumbnail & Content */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Image Thumbnail */}
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-thaagai-line/60 bg-thaagai-sand/30 sm:w-40">
                  <Image
                    src={slide.desktopImage}
                    alt={slide.altText || slide.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Order #{slide.sortOrder}
                  </span>
                </div>

                {/* Text Content */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {slide.eyebrow && (
                      <span className="rounded-full bg-thaagai-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-thaagai-maroon dark:bg-thaagai-gold/30 dark:text-thaagai-gold">
                        {slide.eyebrow}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        slide.active
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {slide.active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[11px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                      Align: {slide.textAlignment} · Opacity: {slide.overlayOpacity}%
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                    {slide.title}
                  </h3>
                  <p className="line-clamp-2 max-w-xl text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                    <span className="font-semibold text-thaagai-wine dark:text-thaagai-gold">
                      Primary: {slide.primaryCtaLabel} &rarr; <span className="font-mono text-[10px] text-thaagai-ink/60">{slide.primaryCtaUrl}</span>
                    </span>
                    {slide.secondaryCtaLabel && (
                      <span className="text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                        Secondary: {slide.secondaryCtaLabel} &rarr; <span className="font-mono text-[10px]">{slide.secondaryCtaUrl}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-thaagai-line/40 pt-3 md:border-t-0 md:pt-0">
                {/* Reorder Buttons */}
                <div className="flex items-center rounded-lg border border-thaagai-line bg-thaagai-sand/30 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
                  <button
                    onClick={() => handleReorder(slide, "up")}
                    disabled={idx === 0}
                    aria-label="Move slide up"
                    className="p-2 text-thaagai-ink transition-colors hover:text-thaagai-wine disabled:opacity-30"
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <span className="border-r border-thaagai-line h-4 dark:border-thaagai-line/30" />
                  <button
                    onClick={() => handleReorder(slide, "down")}
                    disabled={idx === slides.length - 1}
                    aria-label="Move slide down"
                    className="p-2 text-thaagai-ink transition-colors hover:text-thaagai-wine disabled:opacity-30"
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Toggle Active */}
                <button
                  onClick={() => handleToggleActive(slide)}
                  aria-label={slide.active ? "Deactivate slide" : "Activate slide"}
                  title={slide.active ? "Deactivate" : "Activate"}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    slide.active
                      ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                      : "border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700"
                  }`}
                >
                  {slide.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(slide)}
                  aria-label="Edit slide"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-thaagai-line bg-white px-3 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(slide.id)}
                  aria-label="Delete slide"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:p-8">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-4">
              <div>
                <h2 className="font-brand text-xl font-bold text-thaagai-wine sm:text-2xl">
                  {editingSlide ? "Edit Hero Slide" : "Create Hero Slide"}
                </h2>
                <p className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Configure visual imagery, typography, and link actions for this carousel slide.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-thaagai-ink/60 hover:bg-thaagai-sand/60 hover:text-thaagai-ink dark:text-thaagai-inkDark"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Eyebrow Label */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Eyebrow Label (Optional)
                </label>
                <input
                  type="text"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="e.g. Handloom Heritage, Festive Collection"
                  className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3.5 py-2.5 text-sm text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                />
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Slide Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Elegance in Every Weave"
                  className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3.5 py-2.5 text-sm font-serif font-bold text-thaagai-wine focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Craftsmanship details, fabric notes, or celebration highlights..."
                  className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3.5 py-2.5 text-sm text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                />
              </div>

              {/* Desktop Image URL & Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Desktop Image URL <span className="text-red-500">*</span>
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    required
                    value={desktopImage}
                    onChange={(e) => setDesktopImage(e.target.value)}
                    placeholder="/banners/hero-traditional.svg or uploaded URL"
                    className="flex-1 rounded-lg border border-thaagai-line px-3.5 py-2.5 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-thaagai-line bg-thaagai-sand/30 px-3.5 py-2.5 text-xs font-semibold text-thaagai-ink transition-colors hover:bg-thaagai-sand dark:border-thaagai-line/40 dark:text-white"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Uploading..." : "Upload File"}
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Quick Presets:</span>
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setDesktopImage(preset.url)}
                      className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        desktopImage === preset.url
                          ? "bg-thaagai-wine text-white"
                          : "bg-thaagai-sand/60 text-thaagai-ink hover:bg-thaagai-sand dark:bg-thaagai-sandDark/30 dark:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                  Alt Text (for Accessibility & SEO) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Traditional Tamil Handloom Churidar Suit"
                  className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3.5 py-2.5 text-xs text-thaagai-ink focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                />
              </div>

              {/* CTAs: Primary & Secondary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Primary CTA Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryCtaLabel}
                    onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                    placeholder="e.g. Shop Ready-to-Wear"
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Primary CTA Destination URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryCtaUrl}
                    onChange={(e) => setPrimaryCtaUrl(e.target.value)}
                    placeholder="e.g. /shop?type=READY_TO_WEAR"
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs font-mono focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Secondary CTA Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={secondaryCtaLabel}
                    onChange={(e) => setSecondaryCtaLabel(e.target.value)}
                    placeholder="e.g. Explore Straight Cut"
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Secondary CTA URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={secondaryCtaUrl}
                    onChange={(e) => setSecondaryCtaUrl(e.target.value)}
                    placeholder="e.g. /shop?category=straight-cut-churidars"
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs font-mono focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                </div>
              </div>

              {/* Layout Alignment & Overlay Opacity */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Text Alignment
                  </label>
                  <select
                    value={textAlignment}
                    onChange={(e) => setTextAlignment(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Dark Overlay: {overlayOpacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="mt-3 w-full accent-thaagai-wine"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-thaagai-line px-3 py-2 text-xs focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
                  />
                </div>
              </div>

              {/* Active Toggle & Scheduling */}
              <div className="flex flex-col gap-4 rounded-xl border border-thaagai-line/60 bg-thaagai-sand/20 p-4 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/10 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-thaagai-ink dark:text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                  />
                  <span>Active on Homepage Carousel</span>
                </label>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-thaagai-gold" />
                  <span className="text-[11px] text-thaagai-ink/60">Schedule (Optional):</span>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded border border-thaagai-line px-2 py-1 text-[11px] dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                  />
                  <span className="text-thaagai-ink/50">&rarr;</span>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded border border-thaagai-line px-2 py-1 text-[11px] dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-thaagai-line/60 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-5 py-2.5 text-xs font-semibold text-thaagai-ink transition-colors hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-thaagai-wine px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {submitting ? "Saving Slide..." : editingSlide ? "Update Slide" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
