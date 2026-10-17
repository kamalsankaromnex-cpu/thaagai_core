"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ruler,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function CustomerMeasurementsPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();

  const [unit, setUnit] = useState<"INCHES" | "CM">("INCHES");
  const [kurtaLength, setKurtaLength] = useState("");
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [shoulderWidth, setShoulderWidth] = useState("");
  const [sleeveLength, setSleeveLength] = useState("");
  const [bottomLength, setBottomLength] = useState("");
  const [ankleRound, setAnkleRound] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account/measurements");
      return;
    }

    if (isAuthenticated) {
      fetch("/api/customers/measurements")
        .then((res) => res.json())
        .then((data) => {
          if (data.measurements) {
            const m = data.measurements;
            setUnit(m.unit || "INCHES");
            setKurtaLength(m.kurtaLength || "");
            setBust(m.bust || "");
            setWaist(m.waist || "");
            setHips(m.hips || "");
            setShoulderWidth(m.shoulderWidth || "");
            setSleeveLength(m.sleeveLength || "");
            setBottomLength(m.bottomLength || "");
            setAnkleRound(m.ankleRound || "");
            setNotes(m.notes || "");
          }
        })
        .catch((err) => console.error("Error loading measurements:", err))
        .finally(() => setLoading(false));
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/customers/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit,
          kurtaLength,
          bust,
          waist,
          hips,
          shoulderWidth,
          sleeveLength,
          bottomLength,
          ankleRound,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save measurements.");
      }

      setSavedMsg("Bespoke measurements saved successfully! They will automatically apply to your custom tailoring requests.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save measurements.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-thaagai-ink/70 hover:text-thaagai-wine dark:text-thaagai-inkDark/70 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Account</span>
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl dark:text-white">
              Bespoke Measurements Vault
            </h1>
            <span className="font-tamil text-xs font-semibold text-thaagai-gold">
              Tailoring Measurements
            </span>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Save your exact tailoring measurements once to ensure flawless fit on all custom-made churidars.
          </p>
        </div>

        {/* Unit Selector */}
        <div className="flex rounded-lg border border-thaagai-line bg-thaagai-sand/30 p-1 dark:border-thaagai-line/30">
          <button
            type="button"
            onClick={() => setUnit("INCHES")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              unit === "INCHES"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink/70 hover:text-thaagai-wine dark:text-thaagai-inkDark/70"
            }`}
          >
            Inches (&quot;)
          </button>
          <button
            type="button"
            onClick={() => setUnit("CM")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              unit === "CM"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink/70 hover:text-thaagai-wine dark:text-thaagai-inkDark/70"
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {/* Kurta & Upper Body */}
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center gap-2 border-b border-thaagai-line/60 pb-3 dark:border-thaagai-line/30">
            <Ruler className="h-4 w-4 text-thaagai-gold" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
              1. Kurta & Upper Body Measurements ({unit})
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Kurta Top Length
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 42" : "e.g. 106"}
                value={kurtaLength}
                onChange={(e) => setKurtaLength(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">High shoulder to knee / mid-calf</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Bust Circumference
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 36" : "e.g. 91"}
                value={bust}
                onChange={(e) => setBust(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Fullest part of bust horizontally</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Natural Waist
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 30" : "e.g. 76"}
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">1–2&quot; above navel narrowest point</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Hip / Seat
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 40" : "e.g. 101"}
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Widest part of hips/seat</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Shoulder Width
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 14.5" : "e.g. 37"}
                value={shoulderWidth}
                onChange={(e) => setShoulderWidth(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Tip of one shoulder to the other</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Sleeve Length
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 17" : "e.g. 43"}
                value={sleeveLength}
                onChange={(e) => setSleeveLength(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Shoulder edge down to wrist/elbow</span>
            </div>
          </div>
        </div>

        {/* Bottom & Pant Measurements */}
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center gap-2 border-b border-thaagai-line/60 pb-3 dark:border-thaagai-line/30">
            <Ruler className="h-4 w-4 text-thaagai-gold" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
              2. Bottom & Pant Silhouette ({unit})
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Bottom / Pant Length
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 39" : "e.g. 99"}
                value={bottomLength}
                onChange={(e) => setBottomLength(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Waist/navel down to ankle bone</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Ankle Round / Bottom Opening
              </label>
              <input
                type="text"
                placeholder={unit === "INCHES" ? "e.g. 12" : "e.g. 30"}
                value={ankleRound}
                onChange={(e) => setAnkleRound(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
              <span className="mt-1 block text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Circumference at ankle</span>
            </div>
          </div>
        </div>

        {/* Fit Preferences & Notes */}
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <label className="block text-xs font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
            Personal Fit Preferences & Notes
          </label>
          <p className="mt-0.5 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Let our master tailor know if you prefer relaxed ease, higher necklines, deeper back cuts, or specific sleeve openings.
          </p>
          <textarea
            rows={3}
            placeholder="e.g. Prefer 1 inch extra ease around the bust for comfort; high boat neck preferred on all suits."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-3 w-full rounded-lg border border-thaagai-line bg-white p-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg bg-thaagai-wine px-6 text-xs font-bold text-white shadow-md transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Sparkles className="h-4 w-4 text-thaagai-gold" />
            <span>Save Bespoke Measurements</span>
          </button>
        </div>
      </form>
    </div>
  );
}
