"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnnouncementBarManager } from "@/components/admin/announcement-bar-manager";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [storeName, setStoreName] = useState("Thaagai");
  const [tagline, setTagline] = useState("");
  const [supportPhone, setSupportPhone] = useState("919876543210");
  const [orderNotice, setOrderNotice] = useState(
    "Orders are requests until the seller confirms them on WhatsApp."
  );
  const [standardShippingText, setStandardShippingText] = useState("");
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState("");

  // Delivery Rules
  const [readyMadeDispatchMin, setReadyMadeDispatchMin] = useState(1);
  const [readyMadeDispatchMax, setReadyMadeDispatchMax] = useState(2);
  const [customStitchingMin, setCustomStitchingMin] = useState(7);
  const [customStitchingMax, setCustomStitchingMax] = useState(10);
  const [sameStateTransitMin, setSameStateTransitMin] = useState(2);
  const [sameStateTransitMax, setSameStateTransitMax] = useState(3);
  const [nationalTransitMin, setNationalTransitMin] = useState(3);
  const [nationalTransitMax, setNationalTransitMax] = useState(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1499);
  const [standardShippingFee, setStandardShippingFee] = useState(99);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.store_profile) {
          setStoreName(data.store_profile.storeName || "Thaagai");
          setTagline(data.store_profile.tagline || "");
          setSupportPhone(data.store_profile.supportPhone || "919876543210");
          setOrderNotice(data.store_profile.orderNotice || "");
        }
        if (data.shipping_defaults) {
          setStandardShippingText(data.shipping_defaults.standardShippingText || "");
          setEstimatedDeliveryDays(data.shipping_defaults.estimatedDeliveryDays || "");
        }
        if (data.delivery_rules) {
          setReadyMadeDispatchMin(data.delivery_rules.readyMadeDispatchMin ?? 1);
          setReadyMadeDispatchMax(data.delivery_rules.readyMadeDispatchMax ?? 2);
          setCustomStitchingMin(data.delivery_rules.customStitchingMin ?? 7);
          setCustomStitchingMax(data.delivery_rules.customStitchingMax ?? 10);
          setSameStateTransitMin(data.delivery_rules.sameStateTransitMin ?? 2);
          setSameStateTransitMax(data.delivery_rules.sameStateTransitMax ?? 3);
          setNationalTransitMin(data.delivery_rules.nationalTransitMin ?? 3);
          setNationalTransitMax(data.delivery_rules.nationalTransitMax ?? 5);
          setFreeShippingThreshold(data.delivery_rules.freeShippingThreshold ?? 1499);
          setStandardShippingFee(data.delivery_rules.standardShippingFee ?? 99);
        }
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          tagline,
          supportPhone,
          orderNotice,
          standardShippingText,
          estimatedDeliveryDays,
          deliveryRules: {
            readyMadeDispatchMin: Number(readyMadeDispatchMin),
            readyMadeDispatchMax: Number(readyMadeDispatchMax),
            customStitchingMin: Number(customStitchingMin),
            customStitchingMax: Number(customStitchingMax),
            sameStateTransitMin: Number(sameStateTransitMin),
            sameStateTransitMax: Number(sameStateTransitMax),
            nationalTransitMin: Number(nationalTransitMin),
            nationalTransitMax: Number(nationalTransitMax),
            freeShippingThreshold: Number(freeShippingThreshold),
            standardShippingFee: Number(standardShippingFee),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update settings.");
        setSaving(false);
        return;
      }

      setSuccess("Settings updated successfully.");
    } catch {
      setError("Network error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-thaagai-ink/60">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Real-time Interactive Announcement Bar Manager */}
      <AnnouncementBarManager />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col justify-between gap-4 border-b border-thaagai-line pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Store Settings</h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Brand details, official WhatsApp contact, and storefront disclosure rules
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
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

      {/* Store Identity */}
      <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">Brand & Contact</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold">Store Brand Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Exquisite Ready-Made & Bespoke Churidars"
              className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">
              Official WhatsApp Business Phone Number *
            </label>
            <input
              type="text"
              required
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              placeholder="919876543210 (digits only with country code)"
              className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 font-mono text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
            <span className="mt-1 block text-[11px] text-thaagai-ink/50">
              Used in the wa.me customer link. Never use symbols or dashes here.
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Disclosures */}
      <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">
          Order & Delivery Policies
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold">Order Notice Banner *</label>
            <input
              type="text"
              required
              value={orderNotice}
              onChange={(e) => setOrderNotice(e.target.value)}
              className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
            <span className="mt-1 block text-[11px] text-thaagai-ink/50">
              Displayed in the storefront footer and checkout disclaimers.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold">Standard Shipping Terms</label>
            <textarea
              rows={2}
              value={standardShippingText}
              onChange={(e) => setStandardShippingText(e.target.value)}
              placeholder="Shipping fee is calculated based on destination pin code and confirmed on WhatsApp."
              className="mt-1 w-full rounded border border-thaagai-line p-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold">Estimated Delivery Timeframe</label>
            <input
              type="text"
              value={estimatedDeliveryDays}
              onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
              placeholder="e.g. 3 to 7 business days across India"
              className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
            />
          </div>
        </div>
      </div>

      {/* Lead Times & PIN-Code Delivery Configuration */}
      <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
        <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-gold">
          Lead Times & PIN-Code Delivery Rules
        </h2>
        <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
          Configure dispatch and transit lead-time calculations used by the storefront delivery estimate badge and PIN checker.
        </p>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold">
                Ready-to-Wear Dispatch Range (Days)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={readyMadeDispatchMin}
                  onChange={(e) => setReadyMadeDispatchMin(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
                <span className="text-xs text-thaagai-ink/50">to</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={readyMadeDispatchMax}
                  onChange={(e) => setReadyMadeDispatchMax(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold">
                Custom Tailoring Lead Time (Days)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={customStitchingMin}
                  onChange={(e) => setCustomStitchingMin(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
                <span className="text-xs text-thaagai-ink/50">to</span>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={customStitchingMax}
                  onChange={(e) => setCustomStitchingMax(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold">
                South India / Same-State Transit (Days)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={sameStateTransitMin}
                  onChange={(e) => setSameStateTransitMin(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
                <span className="text-xs text-thaagai-ink/50">to</span>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={sameStateTransitMax}
                  onChange={(e) => setSameStateTransitMax(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold">
                Rest of India Transit Range (Days)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={2}
                  max={14}
                  value={nationalTransitMin}
                  onChange={(e) => setNationalTransitMin(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
                <span className="text-xs text-thaagai-ink/50">to</span>
                <input
                  type="number"
                  min={3}
                  max={14}
                  value={nationalTransitMax}
                  onChange={(e) => setNationalTransitMax(Number(e.target.value))}
                  className="h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-thaagai-line/40 pt-4">
            <div>
              <label className="block text-xs font-semibold">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
              />
              <span className="mt-1 block text-[11px] text-thaagai-ink/50">
                Orders equal or exceeding this subtotal qualify for complimentary shipping.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={standardShippingFee}
                onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded border border-thaagai-line px-3 text-xs focus:border-thaagai-wine focus:outline-none dark:bg-thaagai-cardDark"
              />
              <span className="mt-1 block text-[11px] text-thaagai-ink/50">
                Applied when order subtotal is below the free shipping threshold.
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
    </div>
  );
}
