import { describe, it, expect } from "vitest";
import {
  STANDARD_CHURIDAR_SIZES,
  normalizeSize,
  getSizeRank,
  sortVariantsBySize,
} from "@/lib/sizing";

describe("Size-Wise Stock Management — Sizing Standards & Natural Ordering", () => {
  it("defines standard South Indian Churidar boutique sizes (XS through 3XL)", () => {
    expect(STANDARD_CHURIDAR_SIZES).toEqual(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
    expect(STANDARD_CHURIDAR_SIZES.length).toBe(7);
  });

  it("normalizes size representations (casing, trimming, and 2XL -> XXL alias)", () => {
    expect(normalizeSize("  xs  ")).toBe("XS");
    expect(normalizeSize("m")).toBe("M");
    expect(normalizeSize("2xl")).toBe("XXL");
    expect(normalizeSize("2XL")).toBe("XXL");
    expect(normalizeSize("xxl")).toBe("XXL");
    expect(normalizeSize(null)).toBe("");
    expect(normalizeSize(undefined)).toBe("");
  });

  it("assigns correct ascending numerical ranks for standard sizes", () => {
    expect(getSizeRank("XS")).toBe(0);
    expect(getSizeRank("S")).toBe(1);
    expect(getSizeRank("M")).toBe(2);
    expect(getSizeRank("L")).toBe(3);
    expect(getSizeRank("XL")).toBe(4);
    expect(getSizeRank("XXL")).toBe(5);
    expect(getSizeRank("2XL")).toBe(5); // 2XL alias shares rank with XXL
    expect(getSizeRank("3XL")).toBe(6);
    expect(getSizeRank("Free Size")).toBe(999); // custom/unknown sizes at end
  });

  it("sorts shuffled product variants into natural boutique sizing sequence", () => {
    const shuffledVariants = [
      { id: "1", sku: "TG-3XL", size: "3XL", stockQuantity: 2 },
      { id: "2", sku: "TG-M", size: "M", stockQuantity: 5 },
      { id: "3", sku: "TG-XS", size: "XS", stockQuantity: 3 },
      { id: "4", sku: "TG-XL", size: "XL", stockQuantity: 4 },
      { id: "5", sku: "TG-S", size: "S", stockQuantity: 6 },
      { id: "6", sku: "TG-XXL", size: "XXL", stockQuantity: 1 },
      { id: "7", sku: "TG-L", size: "L", stockQuantity: 8 },
    ];

    const sorted = sortVariantsBySize(shuffledVariants);
    const sortedSizes = sorted.map((v) => v.size);

    expect(sortedSizes).toEqual(["XS", "S", "M", "L", "XL", "XXL", "3XL"]);
  });

  it("places custom and non-standard sizes gracefully at the end", () => {
    const variants = [
      { id: "1", sku: "TG-FREE", size: "Free Size", stockQuantity: 10 },
      { id: "2", sku: "TG-L", size: "L", stockQuantity: 2 },
      { id: "3", sku: "TG-CUSTOM", size: "Bespoke Fit", stockQuantity: 0 },
      { id: "4", sku: "TG-S", size: "S", stockQuantity: 5 },
      { id: "5", sku: "TG-NO-SIZE", size: null, stockQuantity: 1 },
    ];

    const sorted = sortVariantsBySize(variants);
    const sortedSizes = sorted.map((v) => v.size);

    // Standard sizes first (S, L), then remaining in order
    expect(sortedSizes[0]).toBe("S");
    expect(sortedSizes[1]).toBe("L");
    expect(sortedSizes.slice(2)).toContain("Free Size");
    expect(sortedSizes.slice(2)).toContain("Bespoke Fit");
    expect(sortedSizes.slice(2)).toContain(null);
  });
});

describe("Size-Wise Stock Management — Batch Inventory Transaction Simulation", () => {
  it("validates multi-size batch adjustment calculations without negative balances", () => {
    const mockVariants = [
      { id: "v1", sku: "TG-CHUR-XS", size: "XS", stockQuantity: 4 },
      { id: "v2", sku: "TG-CHUR-S", size: "S", stockQuantity: 2 },
      { id: "v3", sku: "TG-CHUR-M", size: "M", stockQuantity: 0 },
    ];

    const batchUpdates = [
      { variantId: "v1", delta: 5, reason: "Workshop batch #1" },
      { variantId: "v2", delta: -1, reason: "Boutique display sample" },
      { variantId: "v3", delta: 10, reason: "Workshop batch #1" },
    ];

    const result = batchUpdates.map((u) => {
      const v = mockVariants.find((item) => item.id === u.variantId)!;
      const newStock = v.stockQuantity + u.delta;
      if (newStock < 0) throw new Error(`Negative stock on ${v.sku}`);
      return { ...v, stockQuantity: newStock };
    });

    expect(result.find((v) => v.id === "v1")?.stockQuantity).toBe(9);
    expect(result.find((v) => v.id === "v2")?.stockQuantity).toBe(1);
    expect(result.find((v) => v.id === "v3")?.stockQuantity).toBe(10);
  });

  it("aborts when any size adjustment would result in a negative stock balance", () => {
    const mockVariants = [
      { id: "v1", sku: "TG-CHUR-XS", size: "XS", stockQuantity: 1 },
    ];

    const invalidBatchUpdates = [
      { variantId: "v1", delta: -5, reason: "Excessive deduction" },
    ];

    expect(() => {
      for (const u of invalidBatchUpdates) {
        const v = mockVariants.find((item) => item.id === u.variantId)!;
        const newStock = v.stockQuantity + u.delta;
        if (newStock < 0) {
          throw new Error(`NEGATIVE_STOCK:${v.sku}:${v.stockQuantity}`);
        }
      }
    }).toThrowError(/NEGATIVE_STOCK:TG-CHUR-XS:1/);
  });
});
