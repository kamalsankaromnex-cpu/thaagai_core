import { db } from "@/lib/db";
import { isValidIndianPin, lookupPostalCode } from "./postal-service";

export interface DeliveryEstimateResult {
  valid: boolean;
  isServiceable: boolean;
  pinCode: string;
  city?: string;
  district?: string;
  state?: string;
  readyMade: {
    minDays: number;
    maxDays: number;
    dispatchText: string;
    deliveryDateRange: string;
  };
  customMade: {
    minDays: number;
    maxDays: number;
    dispatchText: string;
    deliveryDateRange: string;
  };
  shippingFee: number;
  freeShippingThreshold: number;
  shippingFeeText: string;
  notes?: string;
  error?: string;
}

/**
 * Calculates a future business date range skipping Sundays
 */
function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) {
      // Not Sunday
      added++;
    }
  }
  return result;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Validates PIN code, checks postal details, and computes delivery estimates
 */
export async function getDeliveryEstimate(
  rawPin: string
): Promise<DeliveryEstimateResult> {
  const pinCode = (rawPin || "").trim();

  // 1. Format validation
  if (!isValidIndianPin(pinCode)) {
    return {
      valid: false,
      isServiceable: false,
      pinCode,
      readyMade: { minDays: 3, maxDays: 7, dispatchText: "1-2 days", deliveryDateRange: "" },
      customMade: { minDays: 10, maxDays: 16, dispatchText: "7-10 days", deliveryDateRange: "" },
      shippingFee: 99,
      freeShippingThreshold: 1499,
      shippingFeeText: "Standard ₹99 (Free above ₹1,499)",
      error: "Please enter a valid 6-digit Indian PIN code.",
    };
  }

  // 2. Postal verification lookup
  const postal = await lookupPostalCode(pinCode);
  if (!postal.valid) {
    return {
      valid: false,
      isServiceable: false,
      pinCode,
      readyMade: { minDays: 3, maxDays: 7, dispatchText: "1-2 days", deliveryDateRange: "" },
      customMade: { minDays: 10, maxDays: 16, dispatchText: "7-10 days", deliveryDateRange: "" },
      shippingFee: 99,
      freeShippingThreshold: 1499,
      shippingFeeText: "Standard ₹99 (Free above ₹1,499)",
      error: postal.error || "Unable to confirm delivery to this PIN code.",
    };
  }

  // 3. Fetch delivery rules from store settings
  let rules: any = {
    readyMadeDispatchMin: 1,
    readyMadeDispatchMax: 2,
    customStitchingMin: 7,
    customStitchingMax: 10,
    sameStateTransitMin: 2,
    sameStateTransitMax: 3,
    nationalTransitMin: 3,
    nationalTransitMax: 5,
    freeShippingThreshold: 1499,
    standardShippingFee: 99,
  };

  try {
    const setting = await db.storeSetting.findUnique({
      where: { key: "delivery_rules" },
    });
    if (setting && typeof setting.value === "object") {
      rules = { ...rules, ...(setting.value as any) };
    }
  } catch (err) {
    console.error("Failed to load delivery_rules setting:", err);
  }

  // 4. Determine transit time based on location
  const isSouthIndia =
    postal.state &&
    ["Tamil Nadu", "Puducherry", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"].some(
      (st) => postal.state?.toLowerCase().includes(st.toLowerCase())
    );

  const transitMin = isSouthIndia ? rules.sameStateTransitMin : rules.nationalTransitMin;
  const transitMax = isSouthIndia ? rules.sameStateTransitMax : rules.nationalTransitMax;

  // 5. Compute Ready-Made estimates
  const readyMinDays = rules.readyMadeDispatchMin + transitMin;
  const readyMaxDays = rules.readyMadeDispatchMax + transitMax;
  const today = new Date();
  const readyMinDate = addBusinessDays(today, readyMinDays);
  const readyMaxDate = addBusinessDays(today, readyMaxDays);
  const readyDateRange = `${formatDateDisplay(readyMinDate)} – ${formatDateDisplay(readyMaxDate)}`;

  // 6. Compute Custom-Made estimates
  const customMinDays = rules.customStitchingMin + transitMin;
  const customMaxDays = rules.customStitchingMax + transitMax;
  const customMinDate = addBusinessDays(today, customMinDays);
  const customMaxDate = addBusinessDays(today, customMaxDays);
  const customDateRange = `${formatDateDisplay(customMinDate)} – ${formatDateDisplay(customMaxDate)}`;

  return {
    valid: true,
    isServiceable: true,
    pinCode,
    city: postal.city,
    district: postal.district,
    state: postal.state,
    readyMade: {
      minDays: readyMinDays,
      maxDays: readyMaxDays,
      dispatchText: "Dispatches in 24-48 hours",
      deliveryDateRange: readyDateRange,
    },
    customMade: {
      minDays: customMinDays,
      maxDays: customMaxDays,
      dispatchText: "Handcrafted & dispatched in 7-10 days",
      deliveryDateRange: customDateRange,
    },
    shippingFee: rules.standardShippingFee,
    freeShippingThreshold: rules.freeShippingThreshold,
    shippingFeeText: `Free Delivery on orders above ₹${rules.freeShippingThreshold.toLocaleString("en-IN")}`,
    notes: isSouthIndia
      ? "Expedited courier available for South India orders."
      : "Standard India Post / Air Express courier delivery across India.",
  };
}
