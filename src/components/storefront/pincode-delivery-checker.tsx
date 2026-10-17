"use client";

import { useState, useEffect } from "react";
import { MapPin, CheckCircle2, AlertCircle, Clock, Truck } from "lucide-react";

interface PincodeDeliveryCheckerProps {
  productType?: "READY_TO_WEAR" | "CUSTOM_MADE";
  onEstimateChange?: (estimate: any) => void;
  className?: string;
}

export function PincodeDeliveryChecker({
  productType = "READY_TO_WEAR",
  onEstimateChange,
  className = "",
}: PincodeDeliveryCheckerProps) {
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore saved PIN from session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin = localStorage.getItem("thaagai_pincode");
      if (savedPin && /^[1-9][0-9]{5}$/.test(savedPin)) {
        setPinCode(savedPin);
        checkPincode(savedPin);
      }
    }
  }, []);

  const checkPincode = async (pinToCheck?: string) => {
    const pin = (pinToCheck || pinCode).trim();
    setError(null);

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setError("Please enter a valid 6-digit Indian postal PIN code.");
      setEstimate(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/shipping/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinCode: pin }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError(data.error || "Delivery is currently unserviceable to this postal code.");
        setEstimate(null);
      } else {
        setEstimate(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("thaagai_pincode", pin);
        }
        if (onEstimateChange) {
          onEstimateChange(data);
        }
      }
    } catch {
      setError("Unable to verify delivery serviceability. Please try again.");
      setEstimate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkPincode();
    }
  };

  const isCustom = productType === "CUSTOM_MADE";
  const currentEstimate = isCustom ? estimate?.customMade : estimate?.readyMade;

  return (
    <div className={`rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-4.5 dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="pincode-input"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-thaagai-ink dark:text-thaagai-inkDark"
        >
          <Truck className="h-4 w-4 text-thaagai-wine" />
          <span>Delivery & Serviceability Check</span>
        </label>
        {estimate?.city && (
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {estimate.city}, {estimate.state}
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="mt-2.5 flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-thaagai-gold" />
          <input
            id="pincode-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pinCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPinCode(val);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter 6-digit PIN (e.g. 600004)"
            className="h-10 w-full rounded-lg border border-thaagai-line bg-white pl-9 pr-3 text-xs font-mono tracking-wider text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
          />
        </div>
        <button
          type="button"
          onClick={() => checkPincode()}
          disabled={loading || pinCode.length !== 6}
          className="shimmer-sweep tap-bounce h-10 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white transition-all duration-200 hover:bg-thaagai-wineHover hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check PIN"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 animate-slide-down">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success / Serviceable state */}
      {estimate && !error && (
        <div className="mt-3 space-y-2 border-t border-thaagai-line/60 pt-3 text-xs animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
              <span>Serviceable via Speed Post & Air Express</span>
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {estimate.shippingFeeText}
            </span>
          </div>

          {currentEstimate && (
            <div className="rounded-xl border border-thaagai-gold/40 bg-white p-3 text-xs dark:bg-thaagai-cardDark shadow-xs transition-all duration-300 hover:shadow-sm">
              <div className="flex items-center gap-1.5 font-semibold text-thaagai-wine dark:text-thaagai-gold">
                <Clock className="h-3.5 w-3.5 text-thaagai-gold" />
                <span>Estimated Delivery: {currentEstimate.deliveryDateRange}</span>
              </div>
              <p className="mt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                {currentEstimate.dispatchText} · Verified for PIN {estimate.pinCode}
              </p>
            </div>
          )}

          {estimate.notes && (
            <p className="text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              {estimate.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
