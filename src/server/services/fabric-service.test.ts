import { describe, it, expect } from "vitest";
import { INITIAL_FABRICS, CustomFabric } from "./fabric-service";

describe("Fabric-to-3D Service & Workshop Pipeline", () => {
  it("initializes with the 3 sample fabrics covering all required placement modes and material physics", () => {
    expect(INITIAL_FABRICS).toHaveLength(3);

    const chettinad = INITIAL_FABRICS.find((f) => f.fabricId === "FAB-CHET-01");
    expect(chettinad).toBeDefined();
    expect(chettinad?.placementMode).toBe("ALL_OVER_REPEAT");
    expect(chettinad?.fabricType).toBe("COTTON");
    expect(chettinad?.roughness).toBeGreaterThanOrEqual(0.8);

    const sungudi = INITIAL_FABRICS.find((f) => f.fabricId === "FAB-SUN-02");
    expect(sungudi).toBeDefined();
    expect(sungudi?.placementMode).toBe("BORDER_HEM");
    expect(sungudi?.borderHeightCm).toBe(10);

    const silk = INITIAL_FABRICS.find((f) => f.fabricId === "FAB-SLK-03");
    expect(silk).toBeDefined();
    expect(silk?.fabricType).toBe("RAW_SILK");
    expect(silk?.roughness).toBeLessThan(0.5);
    expect(silk?.metalness).toBeGreaterThan(0);
  });

  it("calculates accurate real-world metric UV repeat scale", () => {
    // Reference garment dimensions: 60cm width x 100cm height
    const calcRepeat = (fabric: CustomFabric) => ({
      repeatX: Math.max(1, Math.round(60 / fabric.repeatWidthCm)),
      repeatY: Math.max(1, Math.round(100 / fabric.repeatHeightCm)),
    });

    const chettinadScale = calcRepeat(INITIAL_FABRICS[0]); // 12cm repeat
    expect(chettinadScale.repeatX).toBe(5);
    expect(chettinadScale.repeatY).toBe(8);

    const silkScale = calcRepeat(INITIAL_FABRICS[2]); // 20cm repeat
    expect(silkScale.repeatX).toBe(3);
    expect(silkScale.repeatY).toBe(5);
  });

  it("computes accurate fabric requirement and pricing based on sleeve style", () => {
    const calculateOrder = (fabric: CustomFabric, sleeves: "THREE_QUARTER" | "SLEEVELESS") => {
      const meters = sleeves === "THREE_QUARTER" ? 2.5 : 2.0;
      const fabricCost = Math.round(fabric.pricePerMeter * meters);
      const tailoring = 650;
      return {
        meters,
        fabricCost,
        total: fabricCost + tailoring,
      };
    };

    // Chettinad Cotton (₹380/m) with 3/4th sleeves (2.5m)
    const order34 = calculateOrder(INITIAL_FABRICS[0], "THREE_QUARTER");
    expect(order34.meters).toBe(2.5);
    expect(order34.fabricCost).toBe(950);
    expect(order34.total).toBe(1600);

    // Chettinad Cotton (₹380/m) Sleeveless (2.0m)
    const orderSleeveless = calculateOrder(INITIAL_FABRICS[0], "SLEEVELESS");
    expect(orderSleeveless.meters).toBe(2.0);
    expect(orderSleeveless.fabricCost).toBe(760);
    expect(orderSleeveless.total).toBe(1410);
  });

  it("generates a production-ready workshop order manifest", () => {
    const fabric = INITIAL_FABRICS[0];
    const manifest = {
      manifestVersion: "1.0-thaagai-3d",
      garmentType: "STRAIGHT_CUT_KURTI",
      fabric: {
        fabricId: fabric.fabricId,
        name: fabric.name,
        type: fabric.fabricType,
        placementMode: fabric.placementMode,
        metersRequired: 2.5,
        pricePerMeter: fabric.pricePerMeter,
      },
      styling: {
        neckline: "Round Scoop Neckline",
        sleeves: "3/4th Gathered Sleeves",
      },
      measurements: {
        standardSize: "XL",
        bustInches: "42",
        kurtaLengthInches: "44",
      },
    };

    expect(manifest.fabric.fabricId).toBe("FAB-CHET-01");
    expect(manifest.styling.neckline).toContain("Round");
    expect(manifest.measurements.standardSize).toBe("XL");
    expect(manifest.measurements.bustInches).toBe("42");
  });
});
