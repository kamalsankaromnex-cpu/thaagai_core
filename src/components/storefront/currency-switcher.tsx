"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency, CurrencyCode } from "@/context/currency-context";
import { ChevronDown, Globe } from "lucide-react";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, config, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Select currency, currently ${config.code}`}
        className="flex h-9 items-center gap-1.5 rounded-full border border-thaagai-line bg-white/80 px-2.5 text-xs font-semibold text-thaagai-ink backdrop-blur-xs transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
      >
        <span className="text-sm leading-none">{config.flag}</span>
        <span className="font-mono text-[11px] font-bold">{config.code}</span>
        <span className="text-thaagai-gold text-[10px]">{config.symbol}</span>
        <ChevronDown className={`h-3 w-3 text-thaagai-ink/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 origin-top-right rounded-xl border border-thaagai-line bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-thaagai-ink/50 dark:text-thaagai-inkDark/50 flex items-center gap-1 border-b border-thaagai-line/40 mb-1">
            <Globe className="h-3 w-3 text-thaagai-gold" />
            <span>Select Currency</span>
          </div>
          <div className="space-y-0.5">
            {availableCurrencies.map((c) => {
              const active = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-thaagai-sand text-thaagai-wine font-bold dark:bg-thaagai-sandDark dark:text-white"
                      : "text-thaagai-ink hover:bg-thaagai-sand/40 dark:text-white dark:hover:bg-thaagai-sandDark/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.flag}</span>
                    <span className="font-mono">{c.code}</span>
                  </div>
                  <span className="font-bold text-thaagai-wine dark:text-thaagai-gold">{c.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
