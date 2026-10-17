import { db } from "@/lib/db";

export interface MeasurementRow {
  label: string;
  tamilLabel: string;
  valuesInches: Record<string, string>;
  valuesCm: Record<string, string>;
}

export interface SizeChartData {
  sizes: string[];
  rows: MeasurementRow[];
  howToMeasure: {
    part: string;
    tamilPart: string;
    instruction: string;
  }[];
  customFitGuide: string;
}

import {
  STANDARD_CHURIDAR_SIZES,
  type StandardChuridarSize,
  normalizeSize,
  getSizeRank,
  sortVariantsBySize,
} from "@/lib/sizing";

export {
  STANDARD_CHURIDAR_SIZES,
  type StandardChuridarSize,
  normalizeSize,
  getSizeRank,
  sortVariantsBySize,
};

export const DEFAULT_CHURIDAR_SIZE_CHART: SizeChartData = {
  sizes: [...STANDARD_CHURIDAR_SIZES],
  rows: [
    {
      label: "Kurta Bust",
      tamilLabel: "",
      valuesInches: { XS: "32", S: "34", M: "36", L: "38", XL: "40", XXL: "42", "3XL": "44" },
      valuesCm: { XS: "81", S: "86", M: "91", L: "97", XL: "102", XXL: "107", "3XL": "112" },
    },
    {
      label: "Kurta Waist",
      tamilLabel: "",
      valuesInches: { XS: "28", S: "30", M: "32", L: "34", XL: "36", XXL: "38", "3XL": "40" },
      valuesCm: { XS: "71", S: "76", M: "81", L: "86", XL: "91", XXL: "97", "3XL": "102" },
    },
    {
      label: "Kurta Hip / Seat",
      tamilLabel: "",
      valuesInches: { XS: "36", S: "38", M: "40", L: "42", XL: "44", XXL: "46", "3XL": "48" },
      valuesCm: { XS: "91", S: "97", M: "102", L: "107", XL: "112", XXL: "117", "3XL": "122" },
    },
    {
      label: "Kurta Length",
      tamilLabel: "",
      valuesInches: { XS: "42", S: "43", M: "44", L: "44", XL: "45", XXL: "45", "3XL": "46" },
      valuesCm: { XS: "107", S: "109", M: "112", L: "112", XL: "114", XXL: "114", "3XL": "117" },
    },
    {
      label: "Churidar Pant Length (with gathers)",
      tamilLabel: "",
      valuesInches: { XS: "44", S: "45", M: "46", L: "46", XL: "47", XXL: "47", "3XL": "48" },
      valuesCm: { XS: "112", S: "114", M: "117", L: "117", XL: "119", XXL: "119", "3XL": "122" },
    },
    {
      label: "Straight Pant Length",
      tamilLabel: "",
      valuesInches: { XS: "37", S: "37.5", M: "38", L: "38.5", XL: "39", XXL: "39.5", "3XL": "40" },
      valuesCm: { XS: "94", S: "95", M: "97", L: "98", XL: "99", XXL: "100", "3XL": "102" },
    },
    {
      label: "Shoulder Width",
      tamilLabel: "",
      valuesInches: { XS: "13.5", S: "14", M: "14.5", L: "15", XL: "15.5", XXL: "16", "3XL": "16.5" },
      valuesCm: { XS: "34", S: "36", M: "37", L: "38", XL: "39", XXL: "41", "3XL": "42" },
    },
  ],
  howToMeasure: [
    {
      part: "Bust",
      tamilPart: "",
      instruction: "Measure around the fullest part of your bust, keeping the measuring tape comfortably snug and parallel to the floor.",
    },
    {
      part: "Waist",
      tamilPart: "",
      instruction: "Measure around your natural waistline, usually 1 to 2 inches above your navel at the narrowest point of your torso.",
    },
    {
      part: "Hips",
      tamilPart: "",
      instruction: "Stand with your feet together and measure around the fullest part of your hips and seat.",
    },
    {
      part: "Kurta Length",
      tamilPart: "",
      instruction: "Measure vertically from the highest point of your shoulder down to your desired hemline (below the knee or mid-calf).",
    },
    {
      part: "Bottom / Pant Length",
      tamilPart: "",
      instruction: "For gathered churidars, we add 6-8 inches extra for elegant ankle gathers. For cigarette pants, measure from natural waist to ankle bone.",
    },
  ],
  customFitGuide: "Every Thaagai churidar is tailored with a generous 1.5-inch inner alteration margin on both sides of the side-slits, allowing effortless local adjustments if needed. For custom bespoke orders, select 'Custom Fit' on the product page.",
};

/**
 * Resolves the applicable size chart for a given product or category
 */
export async function getSizeChart(productId?: string, categorySlug?: string): Promise<SizeChartData> {
  // 1. Product-specific override
  if (productId) {
    const productChart = await db.sizeChart.findFirst({
      where: { productId },
    });
    if (productChart && productChart.measurements) {
      const raw = productChart.measurements as any;
      return {
        sizes: raw.sizes || DEFAULT_CHURIDAR_SIZE_CHART.sizes,
        rows: raw.rows || DEFAULT_CHURIDAR_SIZE_CHART.rows,
        howToMeasure: (productChart.howToMeasure as any) || raw.howToMeasure || DEFAULT_CHURIDAR_SIZE_CHART.howToMeasure,
        customFitGuide: productChart.customFitGuide || raw.customFitGuide || DEFAULT_CHURIDAR_SIZE_CHART.customFitGuide,
      };
    }
  }

  // 2. Category default
  if (categorySlug) {
    const categoryChart = await db.sizeChart.findFirst({
      where: { categorySlug },
    });
    if (categoryChart && categoryChart.measurements) {
      const raw = categoryChart.measurements as any;
      return {
        sizes: raw.sizes || DEFAULT_CHURIDAR_SIZE_CHART.sizes,
        rows: raw.rows || DEFAULT_CHURIDAR_SIZE_CHART.rows,
        howToMeasure: (categoryChart.howToMeasure as any) || raw.howToMeasure || DEFAULT_CHURIDAR_SIZE_CHART.howToMeasure,
        customFitGuide: categoryChart.customFitGuide || raw.customFitGuide || DEFAULT_CHURIDAR_SIZE_CHART.customFitGuide,
      };
    }
  }

  // 3. Fallback to standard Churidar size chart
  return DEFAULT_CHURIDAR_SIZE_CHART;
}

/**
 * Admin: List all configured size charts
 */
export async function getAllSizeCharts() {
  return db.sizeChart.findMany({
    include: {
      product: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Admin: Create or update a size chart
 */
export async function upsertSizeChart(data: {
  id?: string;
  name: string;
  categorySlug?: string | null;
  productId?: string | null;
  gender?: string;
  measurements?: any;
  howToMeasure?: any;
  customFitGuide?: string | null;
}) {
  if (data.id) {
    return db.sizeChart.update({
      where: { id: data.id },
      data: {
        name: data.name,
        categorySlug: data.categorySlug || null,
        productId: data.productId || null,
        gender: data.gender || "WOMEN",
        ...(data.measurements !== undefined ? { measurements: data.measurements } : {}),
        howToMeasure: data.howToMeasure || null,
        customFitGuide: data.customFitGuide || null,
      },
    });
  }

  return db.sizeChart.create({
    data: {
      name: data.name,
      categorySlug: data.categorySlug || null,
      productId: data.productId || null,
      gender: data.gender || "WOMEN",
      measurements: data.measurements || DEFAULT_CHURIDAR_SIZE_CHART,
      howToMeasure: data.howToMeasure || null,
      customFitGuide: data.customFitGuide || null,
    },
  });
}

/**
 * Admin: Delete a size chart
 */
export async function deleteSizeChart(id: string) {
  return db.sizeChart.delete({
    where: { id },
  });
}
