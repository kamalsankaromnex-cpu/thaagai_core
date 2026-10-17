export interface PostalLookupResult {
  valid: boolean;
  pinCode: string;
  state?: string;
  district?: string;
  city?: string;
  postOffices?: string[];
  error?: string;
  manualAllowed?: boolean;
}

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export function isValidIndianPin(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test((pin || "").trim());
}

/** Looks up real Indian postal code details via Government India Post API */
export async function lookupPostalCode(rawPin: string): Promise<PostalLookupResult> {
  const pin = rawPin.trim();

  // 1. Format validation
  if (!isValidIndianPin(pin)) {
    return {
      valid: false,
      pinCode: pin,
      error: "PIN code must be a valid 6-digit number starting with 1-9.",
    };
  }

  // 2. Fetch from India Post API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `https://api.postalpincode.in/pincode/${pin}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        valid: false,
        pinCode: pin,
        error: "Postal lookup service returned an unexpected error.",
        manualAllowed: true,
      };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        pinCode: pin,
        error: "No postal data found for this PIN code.",
        manualAllowed: true,
      };
    }

    const first = data[0];
    if (first.Status !== "Success" || !Array.isArray(first.PostOffice) || first.PostOffice.length === 0) {
      return {
        valid: false,
        pinCode: pin,
        error: "Invalid PIN code or no post offices found.",
        manualAllowed: true,
      };
    }

    const postOffices: string[] = first.PostOffice.map((po: any) => po.Name).filter(Boolean);
    const primary = first.PostOffice[0];
    const district = primary.District || "";
    const state = primary.State || "";
    const city = primary.Block && primary.Block !== "NA" ? primary.Block : primary.Division || district;

    return {
      valid: true,
      pinCode: pin,
      state,
      district,
      city,
      postOffices,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("Postal API error:", err?.message || err);
    return {
      valid: false,
      pinCode: pin,
      error: "Postal lookup is currently unavailable. Please enter address manually.",
      manualAllowed: true,
    };
  }
}
