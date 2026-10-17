"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "INR" | "USD" | "SGD" | "AED" | "MYR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // multiplier relative to 1 INR
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee (INR)", flag: "🇮🇳", rate: 1.0, decimals: 0 },
  USD: { code: "USD", symbol: "$", label: "US Dollar (USD)", flag: "🇺🇸", rate: 0.012, decimals: 2 },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore Dollar (SGD)", flag: "🇸🇬", rate: 0.016, decimals: 2 },
  AED: { code: "AED", symbol: "د.إ", label: "UAE Dirham (AED)", flag: "🇦🇪", rate: 0.044, decimals: 2 },
  MYR: { code: "MYR", symbol: "RM", label: "Malaysian Ringgit (MYR)", flag: "🇲🇾", rate: 0.054, decimals: 2 },
  GBP: { code: "GBP", symbol: "£", label: "British Pound (GBP)", flag: "🇬🇧", rate: 0.0094, decimals: 2 },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  config: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (inrAmount: number) => number;
  formatPrice: (inrAmount: number) => string;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "thaagai_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency] = useState<CurrencyCode>("INR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "INR");
    } catch {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  const setCurrency = (_code: CurrencyCode) => {
    // Multi-currency disabled: strictly use INR
  };

  const activeConfig = SUPPORTED_CURRENCIES[mounted ? currency : "INR"];

  const convertPrice = (inrAmount: number): number => {
    const raw = inrAmount * activeConfig.rate;
    if (activeConfig.decimals === 0) {
      return Math.round(raw);
    }
    return Number(raw.toFixed(activeConfig.decimals));
  };

  const formatPrice = (inrAmount: number): string => {
    const converted = convertPrice(inrAmount);
    if (activeConfig.code === "INR") {
      return `${activeConfig.symbol}${converted.toLocaleString("en-IN")}`;
    }
    return `${activeConfig.symbol}${converted.toLocaleString("en-US", {
      minimumFractionDigits: activeConfig.decimals,
      maximumFractionDigits: activeConfig.decimals,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: mounted ? currency : "INR",
        config: activeConfig,
        setCurrency,
        convertPrice,
        formatPrice,
        availableCurrencies: Object.values(SUPPORTED_CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
