/**
 * Shared Churidar Sizing Constants & Sorting Utilities
 * Safe for both client and server components (zero DB/Node dependencies).
 */

export const STANDARD_CHURIDAR_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type StandardChuridarSize = (typeof STANDARD_CHURIDAR_SIZES)[number];

export const CHURIDAR_SIZE_LABELS: Record<StandardChuridarSize, { bustInches: string; bustCm: string }> = {
  XS: { bustInches: '32"', bustCm: "81 cm" },
  S: { bustInches: '34"', bustCm: "86 cm" },
  M: { bustInches: '36"', bustCm: "91 cm" },
  L: { bustInches: '38"', bustCm: "97 cm" },
  XL: { bustInches: '40"', bustCm: "102 cm" },
  XXL: { bustInches: '42"', bustCm: "107 cm" },
  "3XL": { bustInches: '44"', bustCm: "112 cm" },
};

/** Normalize size representations like 2XL -> XXL, trimming and uppercase */
export function normalizeSize(size?: string | null): string {
  if (!size) return "";
  const cleaned = size.trim().toUpperCase();
  if (cleaned === "2XL") return "XXL";
  return cleaned;
}

/** Returns the 0-indexed ranking of a size for sorting; unknown sizes return 999 */
export function getSizeRank(size?: string | null): number {
  const norm = normalizeSize(size);
  const idx = (STANDARD_CHURIDAR_SIZES as readonly string[]).indexOf(norm);
  return idx >= 0 ? idx : 999;
}

/** Sort variants or items by standard boutique size order (XS -> S -> M -> L -> XL -> XXL -> 3XL) */
export function sortVariantsBySize<T extends { size?: string | null }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => {
    const rankA = getSizeRank(a.size);
    const rankB = getSizeRank(b.size);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    const labelA = a.size || "";
    const labelB = b.size || "";
    return labelA.localeCompare(labelB);
  });
}
