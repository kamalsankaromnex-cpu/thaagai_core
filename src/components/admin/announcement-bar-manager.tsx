"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Link as LinkIcon,
  Palette,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { LotusMotif } from "@/components/storefront/tamil-motifs";
import {
  DEFAULT_ANNOUNCEMENT_BAR,
  AnnouncementBarConfig,
} from "@/components/storefront/announcement-bar";

const PRESET_TEMPLATES = [
  {
    label: "Heritage Weaves & WhatsApp",
    text: "Handloom Weaves & Bespoke Churidar Tailoring · WhatsApp Confirmation Across India",
    link: "/shop",
    bgColor: "#5E1624",
  },
  {
    label: "Festive Season Offers",
    text: "Festive Celebrations · Special Discounts on Pure Silk & Anarkali Churidar Suits · Limited Stock",
    link: "/shop?filter=offers",
    bgColor: "#482820",
  },
  {
    label: "Complimentary Shipping",
    text: "Complimentary Insured Shipping Across India on Orders Above ₹1,499 · Secure Packaging Guaranteed",
    link: "/shipping-policy",
    bgColor: "#9E7345",
  },
  {
    label: "Bespoke Custom Stitching",
    text: "Bespoke Made-to-Measure Churidars · Exact Fit Tailoring with 1.5-inch Alteration Margins",
    link: "/custom-made",
    bgColor: "#1C3D2E",
  },
];

const COLOR_OPTIONS = [
  { label: "Royal Wine", value: "#5E1624", class: "bg-[#5E1624]" },
  { label: "Espresso Brown", value: "#482820", class: "bg-[#482820]" },
  { label: "Antique Gold", value: "#9E7345", class: "bg-[#9E7345]" },
  { label: "Forest Emerald", value: "#1C3D2E", class: "bg-[#1C3D2E]" },
  { label: "Deep Maroon", value: "#450E18", class: "bg-[#450E18]" },
];

export function AnnouncementBarManager() {
  const [config, setConfig] = useState<AnnouncementBarConfig>(DEFAULT_ANNOUNCEMENT_BAR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load current setting from API
  useEffect(() => {
    fetch("/api/admin/announcement")
      .then((res) => (res.ok ? res.json() : DEFAULT_ANNOUNCEMENT_BAR))
      .then((data: AnnouncementBarConfig) => {
        if (data) {
          setConfig({
            enabled: typeof data.enabled === "boolean" ? data.enabled : true,
            text: data.text || DEFAULT_ANNOUNCEMENT_BAR.text,
            link: data.link || "",
            bgColor: data.bgColor || DEFAULT_ANNOUNCEMENT_BAR.bgColor,
            textColor: data.textColor || DEFAULT_ANNOUNCEMENT_BAR.textColor,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load announcement config:", err);
        setError("Failed to load current announcement bar configuration.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = () => {
    setConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
    setError("");
    setSuccess("");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save announcement bar settings.");
      } else {
        setSuccess(
          config.enabled
            ? "Announcement bar is LIVE on the storefront!"
            : "Announcement bar is now DISABLED (hidden from storefront)."
        );
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: (typeof PRESET_TEMPLATES)[0]) => {
    setConfig((prev) => ({
      ...prev,
      text: template.text,
      link: template.link,
      bgColor: template.bgColor,
    }));
    setError("");
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="flex items-center gap-2 text-xs font-semibold text-thaagai-ink/60">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-thaagai-wine border-t-transparent" />
          <span>Loading announcement configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-thaagai-line bg-white p-5 sm:p-7 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
      {/* Header & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-thaagai-line/60 pb-5 dark:border-thaagai-line/30">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-thaagai-wine/10 text-thaagai-wine dark:bg-thaagai-wine/20 dark:text-thaagai-gold">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-thaagai-ink dark:text-white">
                Storefront Announcement Bar
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  config.enabled
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800"
                }`}
              >
                {config.enabled ? "Active (ON)" : "Disabled (OFF)"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Control the top announcement ticker, Tamil & English promotional notices, and customer links.
            </p>
          </div>
        </div>

        {/* ON / OFF Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine ${
              config.enabled
                ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
            }`}
            aria-pressed={config.enabled}
          >
            {config.enabled ? (
              <>
                <ToggleRight className="h-4 w-4" />
                <span>Bar is ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                <span>Bar is OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Live Preview */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-thaagai-gold" />
            <span>Live Customer Preview</span>
          </span>
          <span className="text-[11px] font-normal text-thaagai-ink/50">
            {config.enabled ? "Visible on storefront" : "Currently hidden on storefront"}
          </span>
        </div>

        {config.enabled ? (
          <div
            style={{ backgroundColor: config.bgColor || "#5E1624" }}
            className="overflow-hidden rounded-xl border border-[#DA9F63]/30 py-3 px-4 text-center text-xs font-medium text-white shadow-inner transition-colors"
          >
            <div className="flex items-center justify-center gap-2.5">
              <LotusMotif className="h-4 w-4 text-[#DA9F63] shrink-0" />
              <span className="truncate">{config.text || "Your announcement text will appear here..."}</span>
              <LotusMotif className="h-4 w-4 text-[#DA9F63] shrink-0 hidden sm:inline" />
            </div>
            {config.link && (
              <span className="mt-1 block text-[10px] text-[#DA9F63] underline">
                Destination: {config.link}
              </span>
            )}
          </div>
        ) : (
          <div className="flex h-12 items-center justify-center rounded-xl border border-dashed border-thaagai-line bg-thaagai-sand/30 text-xs text-thaagai-ink/50 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20">
            Announcement bar is turned OFF. It is completely hidden on the storefront.
          </div>
        )}
      </div>

      {/* Editing Form */}
      <form onSubmit={handleSave} className="mt-6 space-y-5">
        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
            Quick Announcement Templates
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="flex items-center gap-1.5 rounded-lg border border-thaagai-line bg-thaagai-sand/30 px-3 py-1.5 text-xs font-medium text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-white"
              >
                <Sparkles className="h-3 w-3 text-thaagai-gold" />
                <span>{tmpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Announcement Text Input */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="announcement-text" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
              Announcement Message <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
              {config.text.length} / 300 characters
            </span>
          </div>
          <textarea
            id="announcement-text"
            rows={3}
            value={config.text}
            onChange={(e) => setConfig({ ...config, text: e.target.value })}
            placeholder="Enter announcement text in Tamil, English, or bilingual..."
            maxLength={300}
            required
            className="mt-1.5 w-full rounded-xl border border-thaagai-line bg-white p-3 text-xs text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/40 dark:text-white"
          />
        </div>

        {/* Destination Link & Theme Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Optional Destination Link */}
          <div>
            <label htmlFor="announcement-link" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-thaagai-gold" />
                <span>Click Destination URL (Optional)</span>
              </span>
            </label>
            <input
              id="announcement-link"
              type="text"
              value={config.link || ""}
              onChange={(e) => setConfig({ ...config, link: e.target.value })}
              placeholder="e.g. /shop?filter=offers or /custom-made"
              className="mt-1.5 h-10 w-full rounded-xl border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/40 dark:text-white"
            />
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
              <span className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-thaagai-gold" />
                <span>Bar Background Color Theme</span>
              </span>
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              {COLOR_OPTIONS.map((col) => {
                const isSelected = (config.bgColor || "#5E1624").toLowerCase() === col.value.toLowerCase();
                return (
                  <button
                    key={col.value}
                    type="button"
                    title={col.label}
                    onClick={() => setConfig({ ...config, bgColor: col.value })}
                    className={`flex h-10 flex-1 items-center justify-center rounded-xl border text-[11px] font-semibold text-white transition-all ${
                      col.class
                    } ${
                      isSelected
                        ? "ring-2 ring-thaagai-gold ring-offset-2 scale-105 border-white"
                        : "border-transparent opacity-85 hover:opacity-100"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#DA9F63]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-between border-t border-thaagai-line/60 pt-4 dark:border-thaagai-line/30">
          <span className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Changes apply instantly across all storefront pages.
          </span>

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl bg-thaagai-wine px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-thaagai-wineHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Announcement</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
