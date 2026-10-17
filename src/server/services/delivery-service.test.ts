import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDeliveryEstimate } from "./delivery-service";
import * as postalService from "./postal-service";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    storeSetting: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Delivery Service — PIN Validation & Estimates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid 6-digit PIN codes immediately with a clear message", async () => {
    const invalidPins = ["123", "012345", "6000001", "abcdef", ""];

    for (const pin of invalidPins) {
      const res = await getDeliveryEstimate(pin);
      expect(res.valid).toBe(false);
      expect(res.isServiceable).toBe(false);
      expect(res.error).toBe("Please enter a valid 6-digit Indian PIN code.");
    }
  });

  it("calculates accurate ready-made and custom-made delivery estimates for Tamil Nadu destinations", async () => {
    vi.spyOn(postalService, "lookupPostalCode").mockResolvedValue({
      valid: true,
      pinCode: "600004",
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
    });

    (db.storeSetting.findUnique as any).mockResolvedValue(null); // use defaults

    const res = await getDeliveryEstimate("600004");

    expect(res.valid).toBe(true);
    expect(res.isServiceable).toBe(true);
    expect(res.city).toBe("Chennai");
    expect(res.state).toBe("Tamil Nadu");

    // Ready-to-wear lead time: 1-2 days dispatch + 2-3 days transit = 3-5 days
    expect(res.readyMade.minDays).toBe(3);
    expect(res.readyMade.maxDays).toBe(5);
    expect(res.readyMade.dispatchText).toBe("Dispatches in 24-48 hours");
    expect(res.readyMade.deliveryDateRange).toBeTruthy();

    // Custom-made bespoke lead time: 7-10 days stitching + 2-3 days transit = 9-13 days
    expect(res.customMade.minDays).toBe(9);
    expect(res.customMade.maxDays).toBe(13);
    expect(res.customMade.dispatchText).toBe("Handcrafted & dispatched in 7-10 days");
    expect(res.customMade.deliveryDateRange).toBeTruthy();

    // Free shipping threshold
    expect(res.shippingFee).toBe(99);
    expect(res.freeShippingThreshold).toBe(1499);
  });

  it("adjusts transit days for destinations outside Tamil Nadu", async () => {
    vi.spyOn(postalService, "lookupPostalCode").mockResolvedValue({
      valid: true,
      pinCode: "110001",
      city: "New Delhi",
      district: "Central Delhi",
      state: "Delhi",
    });

    (db.storeSetting.findUnique as any).mockResolvedValue(null);

    const res = await getDeliveryEstimate("110001");

    expect(res.valid).toBe(true);
    expect(res.isServiceable).toBe(true);
    expect(res.state).toBe("Delhi");

    // Rest of India transit: 3-5 days
    // Ready-made: 1-2 + 3-5 = 4-7 days
    expect(res.readyMade.minDays).toBe(4);
    expect(res.readyMade.maxDays).toBe(7);

    // Custom-made: 7-10 + 3-5 = 10-15 days
    expect(res.customMade.minDays).toBe(10);
    expect(res.customMade.maxDays).toBe(15);
  });
});
