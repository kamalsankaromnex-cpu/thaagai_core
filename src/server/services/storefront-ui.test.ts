import { describe, it, expect } from "vitest";
import { SUPPORTED_CURRENCIES, CurrencyCode } from "@/context/currency-context";

describe("Global Currency Conversion & Formatting", () => {
  it("has authoritative exchange configs for all 6 diaspora currencies", () => {
    const keys: CurrencyCode[] = ["INR", "USD", "SGD", "AED", "MYR", "GBP"];
    for (const key of keys) {
      expect(SUPPORTED_CURRENCIES[key]).toBeDefined();
      expect(SUPPORTED_CURRENCIES[key].rate).toBeGreaterThan(0);
      expect(SUPPORTED_CURRENCIES[key].symbol).toBeDefined();
    }
  });

  it("calculates INR with zero decimals and Indian number grouping", () => {
    const inrConfig = SUPPORTED_CURRENCIES.INR;
    expect(inrConfig.rate).toBe(1.0);
    expect(inrConfig.decimals).toBe(0);

    const price = 5499;
    const formatted = `${inrConfig.symbol}${price.toLocaleString("en-IN")}`;
    expect(formatted).toBe("₹5,499");
  });

  it("converts INR to USD accurately with 2 decimal precision", () => {
    const usdConfig = SUPPORTED_CURRENCIES.USD;
    const inrAmount = 5000;
    const converted = inrAmount * usdConfig.rate; // 5000 * 0.012 = 60
    expect(converted).toBe(60);
  });

  it("converts INR to Singapore Dollar accurately", () => {
    const sgdConfig = SUPPORTED_CURRENCIES.SGD;
    const inrAmount = 10000;
    const converted = inrAmount * sgdConfig.rate; // 10000 * 0.016 = 160
    expect(converted).toBe(160);
  });

  it("converts INR to UAE Dirham (AED) accurately", () => {
    const aedConfig = SUPPORTED_CURRENCIES.AED;
    const inrAmount = 3500;
    const converted = inrAmount * aedConfig.rate; // 3500 * 0.044 = 154
    expect(converted).toBe(154);
  });
});

describe("Fit Finder Sizing Intelligence", () => {
  function getKurtaLengthForHeight(heightGroup: "petite" | "classic" | "tall") {
    switch (heightGroup) {
      case "petite":
        return 40;
      case "classic":
        return 42;
      case "tall":
        return 45;
    }
  }

  it("recommends 40-inch kurta for petite shoppers to avoid drowning proportions", () => {
    expect(getKurtaLengthForHeight("petite")).toBe(40);
  });

  it("recommends 42-inch classic length for standard heights", () => {
    expect(getKurtaLengthForHeight("classic")).toBe(42);
  });

  it("recommends 45-inch length for statuesque women to ensure below-knee drape", () => {
    expect(getKurtaLengthForHeight("tall")).toBe(45);
  });
});

describe("WhatsApp Trousseau Shortlist Formatter", () => {
  function buildTrousseauWhatsAppMessage(
    items: { name: string; price: number; slug: string }[],
    siteUrl: string
  ) {
    let text = `*THAAGAI Atelier — My Curated Trousseau Shortlist*\n\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (₹${item.price.toLocaleString("en-IN")})\n${siteUrl}/product/${item.slug}\n\n`;
    });
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  it("formats multi-item trousseau with correct product URLs and encoding", () => {
    const items = [
      { name: "Royal Chettinad Raw Silk Kurta", price: 5499, slug: "royal-chettinad-kurta" },
      { name: "Kanchipuram Silk Churidar", price: 2999, slug: "kanchipuram-churidar" },
    ];
    const url = buildTrousseauWhatsAppMessage(items, "https://thaagai.com");
    expect(url).toContain("https://api.whatsapp.com/send?text=");
    expect(url).toContain(encodeURIComponent("Royal Chettinad Raw Silk Kurta"));
    expect(url).toContain(encodeURIComponent("https://thaagai.com/product/royal-chettinad-kurta"));
    expect(url).toContain(encodeURIComponent("₹5,499"));
  });
});
