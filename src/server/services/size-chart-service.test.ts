import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_CHURIDAR_SIZE_CHART, getSizeChart } from "./size-chart-service";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    sizeChart: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Size Chart Service — Churidar Fit Specifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("contains all standard Churidar sizes from XS through 3XL", () => {
    expect(DEFAULT_CHURIDAR_SIZE_CHART.sizes).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "3XL",
    ]);
  });

  it("provides comprehensive measurements for bust, waist, hip, and lengths in both Inches and CM", () => {
    const bustRow = DEFAULT_CHURIDAR_SIZE_CHART.rows.find((r) => r.label === "Kurta Bust");
    expect(bustRow).toBeDefined();
    expect(bustRow?.tamilLabel).toBe("");

    // Check inches progression (e.g. 32 to 44)
    expect(bustRow?.valuesInches["XS"]).toBe("32");
    expect(bustRow?.valuesInches["M"]).toBe("36");
    expect(bustRow?.valuesInches["3XL"]).toBe("44");

    // Check cm progression (e.g. 81 to 112)
    expect(bustRow?.valuesCm["XS"]).toBe("81");
    expect(bustRow?.valuesCm["M"]).toBe("91");
    expect(bustRow?.valuesCm["3XL"]).toBe("112");

    // All sizes exist in each row
    for (const row of DEFAULT_CHURIDAR_SIZE_CHART.rows) {
      for (const size of DEFAULT_CHURIDAR_SIZE_CHART.sizes) {
        expect(row.valuesInches[size]).toBeTruthy();
        expect(row.valuesCm[size]).toBeTruthy();
      }
    }
  });

  it("includes bilingual measuring instructions and bespoke 1.5-inch inner margin guidance", () => {
    expect(DEFAULT_CHURIDAR_SIZE_CHART.howToMeasure.length).toBeGreaterThan(0);
    const bustGuide = DEFAULT_CHURIDAR_SIZE_CHART.howToMeasure.find((g) => g.part === "Bust");
    expect(bustGuide?.tamilPart).toBe("");
    expect(bustGuide?.instruction).toContain("fullest part of your bust");

    expect(DEFAULT_CHURIDAR_SIZE_CHART.customFitGuide).toContain("1.5-inch inner alteration margin");
  });

  it("falls back to default churidar size chart when no product override is configured", async () => {
    (db.sizeChart.findFirst as any).mockResolvedValue(null);

    const chart = await getSizeChart("prod-123", "churidars");
    expect(chart.sizes).toEqual(DEFAULT_CHURIDAR_SIZE_CHART.sizes);
    expect(chart.rows.length).toBe(DEFAULT_CHURIDAR_SIZE_CHART.rows.length);
  });

  it("loads custom size chart when saved in database", async () => {
    const customChartData = {
      sizes: ["S", "M", "L"],
      rows: [
        {
          label: "Chest",
          tamilLabel: "",
          valuesInches: { S: "36", M: "38", L: "40" },
          valuesCm: { S: "91", M: "96", L: "101" },
        },
      ],
      howToMeasure: [],
      customFitGuide: "Custom guide test",
    };

    (db.sizeChart.findFirst as any).mockResolvedValue({
      id: "chart-1",
      name: "Special Silk Churidar Chart",
      measurements: customChartData,
    });

    const chart = await getSizeChart("prod-custom");
    expect(chart.sizes).toEqual(["S", "M", "L"]);
    expect(chart.customFitGuide).toBe("Custom guide test");
  });
});
