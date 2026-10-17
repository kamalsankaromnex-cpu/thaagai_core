"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload, AlertCircle, CheckCircle2, ArrowLeft, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { STANDARD_CHURIDAR_SIZES } from "@/lib/sizing";

interface Category {
  id: string;
  name: string;
}

interface VariantRow {
  id?: string;
  sku: string;
  size: string;
  colour: string;
  priceOverride: string;
  salePriceOverride: string;
  stockQuantity: number;
  lowStockThreshold: number;
  active: boolean;
}

interface ImageRow {
  storageKey: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductEditorProps {
  productId?: string;
}

export function ProductEditor({ productId }: ProductEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState<"READY_TO_WEAR" | "CUSTOM_MADE">("READY_TO_WEAR");
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [fabricCare, setFabricCare] = useState("");
  const [shippingInfo, setShippingInfo] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noindex, setNoindex] = useState(false);

  const [variants, setVariants] = useState<VariantRow[]>([
    {
      sku: "",
      size: "",
      colour: "",
      priceOverride: "",
      salePriceOverride: "",
      stockQuantity: 10,
      lowStockThreshold: 2,
      active: true,
    },
  ]);

  const [images, setImages] = useState<ImageRow[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load available categories
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableCategories(data);
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Load existing product if in edit mode
  useEffect(() => {
    if (!productId) return;

    fetch(`/api/admin/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setName(data.name);
          setSlug(data.slug);
          setSku(data.sku || "");
          setProductType(data.productType === "CUSTOM_MADE" ? "CUSTOM_MADE" : "READY_TO_WEAR");
          setBasePrice(String(data.basePrice));
          setSalePrice(data.salePrice ? String(data.salePrice) : "");
          setStatus(data.status);
          setFeatured(data.featured);
          setShortDescription(data.shortDescription || "");
          setDescription(data.description || "");
          setFabricCare(data.fabricCare || "");
          setShippingInfo(data.shippingInfo || "");
          setSeoTitle(data.seoTitle || "");
          setSeoDescription(data.seoDescription || "");
          setCanonicalUrl(data.canonicalUrl || "");
          setNoindex(data.noindex ?? false);
          setCategoryIds(data.categories.map((c: any) => c.category.id));

          if (data.variants && data.variants.length > 0) {
            setVariants(
              data.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                size: v.size || "",
                colour: v.colour || "",
                priceOverride: v.priceOverride ? String(v.priceOverride) : "",
                salePriceOverride: v.salePriceOverride ? String(v.salePriceOverride) : "",
                stockQuantity: v.stockQuantity,
                lowStockThreshold: v.lowStockThreshold,
                active: v.active,
              }))
            );
          }

          if (data.images && data.images.length > 0) {
            setImages(
              data.images.map((img: any, idx: number) => ({
                storageKey: img.storageKey,
                altText: img.altText,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder ?? idx,
              }))
            );
          }
        }
      })
      .catch(() => setError("Failed to load product details."))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const generateStandardChuridarSizes = () => {
    const baseSku = (sku || name || "TG-CHUR")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newVariants: VariantRow[] = STANDARD_CHURIDAR_SIZES.map((sz) => {
      const existing = variants.find((v) => v.size?.toUpperCase() === sz);
      if (existing) return existing;

      return {
        sku: `${baseSku}-${sz}`,
        size: sz,
        colour: variants[0]?.colour || "",
        priceOverride: "",
        salePriceOverride: "",
        stockQuantity: 5,
        lowStockThreshold: 2,
        active: true,
      };
    });

    setVariants(newVariants);
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: `${sku ? sku + "-" : ""}${prev.length + 1}`,
        size: "",
        colour: "",
        priceOverride: "",
        salePriceOverride: "",
        stockQuantity: 5,
        lowStockThreshold: 2,
        active: true,
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) {
      alert("A product must have at least one variant.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantRow = (index: number, field: keyof VariantRow, value: any) => {
    setVariants((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload image.");
        return;
      }

      setImages((prev) => [
        ...prev,
        {
          storageKey: data.storageKey,
          altText: name ? `${name} photo` : "Product image",
          isPrimary: prev.length === 0, // first image is primary by default
          sortOrder: prev.length,
        },
      ]);
    } catch {
      setError("Network error uploading image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const toggleCategory = (catId: string) => {
    setCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const parsedBasePrice = Number(basePrice);
    if (!basePrice || isNaN(parsedBasePrice) || parsedBasePrice <= 0) {
      setError("Base price must be a valid number greater than ₹0.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (variants.length === 0) {
      setError("Product must have at least one variant/size.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    const baseProductSku = (sku || name || "TG-CHUR")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const cleanedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const payload = {
      name: name.trim(),
      slug: cleanedSlug,
      sku: sku.trim() || null,
      productType,
      basePrice: parsedBasePrice,
      salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : null,
      status,
      featured,
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      fabricCare: fabricCare.trim() || null,
      shippingInfo: shippingInfo.trim() || null,
      categoryIds,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      noindex,
      variants: variants.map((v, idx) => ({
        id: v.id,
        sku: v.sku.trim() || `${baseProductSku}-${v.size || idx + 1}`,
        size: v.size.trim() || null,
        colour: v.colour.trim() || null,
        priceOverride: v.priceOverride && Number(v.priceOverride) > 0 ? Number(v.priceOverride) : null,
        salePriceOverride: v.salePriceOverride && Number(v.salePriceOverride) > 0 ? Number(v.salePriceOverride) : null,
        stockQuantity: Math.max(0, Number(v.stockQuantity) || 0),
        lowStockThreshold: Math.max(0, Number(v.lowStockThreshold) || 2),
        active: v.active,
      })),
      images: images.map((img) => ({
        storageKey: img.storageKey,
        altText: img.altText.trim() || `${name} photo`,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };

    try {
      const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.error || "Failed to save product.";
        if (data.details?.fieldErrors) {
          const fieldErrors = Object.entries(data.details.fieldErrors)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("; ");
          errorMsg = `${errorMsg} (${fieldErrors})`;
        }
        setError(errorMsg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setSaving(false);
        return;
      }

      setSuccess(`Product "${name}" saved successfully.`);
      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 1000);
    } catch {
      setError("Network error saving product.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-thaagai-ink/60">Loading editor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-thaagai-line pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-thaagai-line bg-white hover:bg-thaagai-sand/60 dark:bg-thaagai-cardDark"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {productId ? `Edit Product: ${name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Manage variants, pricing, inventory stock, and photography
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
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

      {/* Main Grid: Form Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Details & Variants */}
        <div className="space-y-8 lg:col-span-2">
          {/* General Information */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">General Information</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Handloom Cotton Kurta"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="handloom-cotton-kurta"
                    className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 font-mono text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold">Master SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TG-HLK-BASE"
                    className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 font-mono text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief 1-sentence summary"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Full Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed material, weave, wash care, and sizing notes..."
                  className="mt-1 w-full rounded border border-thaagai-line p-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold">Fabric & Care Instructions</label>
                  <input
                    type="text"
                    value={fabricCare}
                    onChange={(e) => setFabricCare(e.target.value)}
                    placeholder="Dry clean only / Pure handloom cotton wash cold"
                    className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Shipping Timeline / Info</label>
                  <input
                    type="text"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    placeholder="Dispatches in 2 days / Bespoke tailoring 7-10 days"
                    className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">Pricing (INR &#8377;)</h2>
            <p className="mt-1 text-xs text-thaagai-ink/60">
              Prices are calculated strictly server-side. Variants can override these prices below.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold">Base Price (&#8377;) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="1890.00"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs font-bold focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Sale Price (&#8377;) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Leave empty if regular price"
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs font-semibold text-rose-700 focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark dark:text-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Variants Manager */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">
                    Variants &amp; Size-Wise Stock
                  </h2>
                  <span className="rounded-full bg-thaagai-sand/60 px-2 py-0.5 text-[11px] font-bold text-thaagai-wine dark:bg-thaagai-sandDark/60">
                    Total: {variants.reduce((acc, v) => acc + (Number(v.stockQuantity) || 0), 0)} pcs
                  </span>
                </div>
                <p className="mt-1 text-xs text-thaagai-ink/60">
                  Manage standard sizes (XS through 3XL), stock quantities, and price overrides.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={generateStandardChuridarSizes}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-thaagai-gold/60 bg-thaagai-gold/10 px-3 text-xs font-semibold text-thaagai-wine hover:bg-thaagai-gold/20 dark:text-thaagai-gold"
                  title="Automatically generate rows for standard sizes XS, S, M, L, XL, XXL, and 3XL"
                >
                  <Sparkles className="h-3.5 w-3.5 text-thaagai-gold" />
                  <span>Generate Churidar Sizes (XS–3XL)</span>
                </button>

                <button
                  type="button"
                  onClick={addVariantRow}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-thaagai-line bg-thaagai-sand/40 px-3 text-xs font-semibold text-thaagai-wine hover:bg-thaagai-sand dark:bg-thaagai-cardDark"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Custom Size</span>
                </button>
              </div>
            </div>

            {/* Datalist for standard sizes */}
            <datalist id="churidar-standard-sizes">
              {STANDARD_CHURIDAR_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  Size {sz}
                </option>
              ))}
              <option value="Free Size">One Size / Free Size</option>
            </datalist>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-thaagai-line bg-thaagai-sand/20 font-semibold dark:border-thaagai-line/30">
                  <tr>
                    <th className="px-3 py-2">SKU *</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Colour</th>
                    <th className="px-3 py-2">Stock *</th>
                    <th className="px-3 py-2">Price Over.</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-thaagai-line/30">
                  {variants.map((v, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={v.sku}
                          onChange={(e) => updateVariantRow(idx, "sku", e.target.value)}
                          placeholder="TG-VAR-1"
                          className="h-8 w-28 rounded border border-thaagai-line px-2 font-mono text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          list="churidar-standard-sizes"
                          value={v.size}
                          onChange={(e) => updateVariantRow(idx, "size", e.target.value.toUpperCase())}
                          placeholder="e.g. M"
                          className="h-8 w-20 rounded border border-thaagai-line px-2 text-xs font-bold focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={v.colour}
                          onChange={(e) => updateVariantRow(idx, "colour", e.target.value)}
                          placeholder="Maroon"
                          className="h-8 w-24 rounded border border-thaagai-line px-2 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={v.stockQuantity}
                          onChange={(e) => updateVariantRow(idx, "stockQuantity", Number(e.target.value))}
                          className="h-8 w-16 rounded border border-thaagai-line px-2 text-xs font-bold focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={v.priceOverride}
                          onChange={(e) => updateVariantRow(idx, "priceOverride", e.target.value)}
                          placeholder="Base"
                          className="h-8 w-20 rounded border border-thaagai-line px-2 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={v.active}
                          onChange={(e) => updateVariantRow(idx, "active", e.target.checked)}
                          className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="p-1 text-thaagai-ink/50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Photography */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">Photography</h2>
            <p className="mt-1 text-xs text-thaagai-ink/60">
              Upload product photos. Choose a primary image and write descriptive alt text for accessibility.
            </p>

            <div className="mt-4">
              <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-thaagai-line bg-thaagai-sand/20 hover:border-thaagai-wine hover:bg-thaagai-sand/40 dark:bg-thaagai-cardDark">
                <Upload className="h-6 w-6 text-thaagai-ink/40" />
                <span className="mt-2 text-xs font-semibold text-thaagai-wine">
                  {uploadingImage ? "Uploading..." : "Click to upload product image"}
                </span>
                <span className="text-[10px] text-thaagai-ink/50">JPEG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Images List */}
            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.map((img, idx) => (
                  <div
                    key={img.storageKey}
                    className={`relative rounded-lg border p-2 ${
                      img.isPrimary ? "border-thaagai-wine ring-2 ring-thaagai-wine/20" : "border-thaagai-line"
                    }`}
                  >
                    <div className="flex aspect-square w-full items-center justify-center rounded bg-thaagai-sand/30 font-mono text-[10px] text-thaagai-ink/60">
                      {img.storageKey.slice(0, 20)}...
                    </div>

                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        value={img.altText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImages((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, altText: val } : item))
                          );
                        }}
                        placeholder="Alt text (mandatory)"
                        className="h-7 w-full rounded border border-thaagai-line px-2 text-[11px] focus:outline-none focus:border-thaagai-wine dark:bg-thaagai-cardDark"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className={`flex items-center gap-1 text-[10px] font-semibold ${
                            img.isPrimary ? "text-thaagai-wine" : "text-thaagai-ink/50 hover:text-thaagai-ink"
                          }`}
                        >
                          <Star className={`h-3 w-3 ${img.isPrimary ? "fill-thaagai-wine" : ""}`} />
                          <span>{img.isPrimary ? "Primary" : "Set Primary"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Categories, Status & SEO */}
        <div className="space-y-8">
          {/* Status & Visibility */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">Status & Type</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs font-semibold focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active (Live on store)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold">Garment Category & Workflow</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs font-semibold focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                >
                  <option value="READY_TO_WEAR">Ready-to-Wear (Standard Sizes & Stock)</option>
                  <option value="CUSTOM_MADE">Custom-Made (Bespoke Tailoring Atelier)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                />
                <label htmlFor="prod-featured" className="text-xs font-semibold">
                  Featured on Homepage
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">Categories</h2>
            <p className="mt-1 text-xs text-thaagai-ink/60">Assign to one or more storefront categories.</p>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {availableCategories.length === 0 ? (
                <p className="text-xs text-thaagai-ink/50">No categories found.</p>
              ) : (
                availableCategories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                    />
                    <span>{c.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">SEO Metadata</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold">Page Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to product name | Thaagai"
                  className="mt-1 h-9 w-full rounded border border-thaagai-line px-2 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Meta Description</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to short description"
                  className="mt-1 w-full rounded border border-thaagai-line p-2 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold">Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://thaagai.com/product/..."
                  className="mt-1 h-9 w-full rounded border border-thaagai-line px-2 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prod-noindex"
                  checked={noindex}
                  onChange={(e) => setNoindex(e.target.checked)}
                  className="h-4 w-4 rounded border-thaagai-line text-thaagai-wine focus:ring-thaagai-wine"
                />
                <label htmlFor="prod-noindex" className="text-xs font-semibold">
                  Discourage search engines from indexing this product (noindex)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
