import { describe, it, expect, vi, beforeEach } from "vitest";
import { isValidIndianPin, lookupPostalCode } from "./postal-service";
import {
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "./address-service";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => {
  return {
    db: {
      customerAddress: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn((fn: any) => fn(db)),
    },
  };
});

describe("Postal Service & PIN Autofill", () => {
  describe("isValidIndianPin", () => {
    it("validates 6-digit Indian PIN codes starting with 1-9", () => {
      expect(isValidIndianPin("600017")).toBe(true);
      expect(isValidIndianPin("110001")).toBe(true);
      expect(isValidIndianPin("560001")).toBe(true);
    });

    it("rejects non-6-digit or zero-prefixed PIN codes", () => {
      expect(isValidIndianPin("060017")).toBe(false);
      expect(isValidIndianPin("60001")).toBe(false);
      expect(isValidIndianPin("6000001")).toBe(false);
      expect(isValidIndianPin("60001A")).toBe(false);
      expect(isValidIndianPin("")).toBe(false);
    });
  });

  describe("lookupPostalCode fallback handling", () => {
    it("gracefully falls back when PIN is invalid", async () => {
      const result = await lookupPostalCode("invalid");
      expect(result.valid).toBe(false);
      expect(result.pinCode).toBe("invalid");
      expect(result.error).toBeTruthy();
    });
  });
});

describe("Address Service & Customer Ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only addresses belonging to the customer", async () => {
    const mockAddresses = [
      { id: "addr-1", customerId: "cust-1", recipientName: "Ananya", isDefault: true },
      { id: "addr-2", customerId: "cust-1", recipientName: "Work", isDefault: false },
    ];
    vi.mocked(db.customerAddress.findMany).mockResolvedValueOnce(mockAddresses as any);

    const list = await getCustomerAddresses("cust-1");
    expect(list).toHaveLength(2);
    expect(db.customerAddress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerId: "cust-1" },
      })
    );
  });

  it("sets first address as default automatically", async () => {
    vi.mocked(db.customerAddress.count).mockResolvedValueOnce(0); // 0 existing
    vi.mocked(db.customerAddress.create).mockResolvedValueOnce({
      id: "addr-new",
      customerId: "cust-1",
      recipientName: "Ananya",
      mobileNumber: "9876543210",
      houseOrFlat: "12A",
      buildingName: null,
      street: "Temple Road",
      locality: "Mylapore",
      landmark: null,
      pinCode: "600004",
      postOffice: null,
      city: "Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      addressType: "HOME",
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await createCustomerAddress("cust-1", {
      recipientName: "Ananya",
      mobileNumber: "9876543210",
      houseOrFlat: "12A",
      street: "Temple Road",
      locality: "Mylapore",
      district: "Chennai",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600004",
      isDefault: false,
    });

    expect(result.isDefault).toBe(true);
  });

  it("unsets previous default when setting a new default", async () => {
    vi.mocked(db.customerAddress.findUnique).mockResolvedValueOnce({
      id: "addr-2",
      customerId: "cust-1",
      isDefault: false,
    } as any);
    vi.mocked(db.customerAddress.updateMany).mockResolvedValueOnce({ count: 1 });
    vi.mocked(db.customerAddress.update).mockResolvedValueOnce({
      id: "addr-2",
      customerId: "cust-1",
      isDefault: true,
    } as any);

    const res = await setDefaultCustomerAddress("cust-1", "addr-2");
    expect(db.customerAddress.updateMany).toHaveBeenCalledWith({
      where: { customerId: "cust-1", isDefault: true },
      data: { isDefault: false },
    });
    expect(res.isDefault).toBe(true);
  });

  it("strictly prevents cross-customer address modification (403)", async () => {
    vi.mocked(db.customerAddress.findUnique).mockResolvedValueOnce({
      id: "addr-victim",
      customerId: "cust-victim",
    } as any);

    await expect(
      updateCustomerAddress("cust-attacker", "addr-victim", { recipientName: "Hacked" })
    ).rejects.toThrow(/permission/i);

    vi.mocked(db.customerAddress.findUnique).mockResolvedValueOnce({
      id: "addr-victim",
      customerId: "cust-victim",
    } as any);

    await expect(
      deleteCustomerAddress("cust-attacker", "addr-victim")
    ).rejects.toThrow(/permission/i);

    vi.mocked(db.customerAddress.findUnique).mockResolvedValueOnce({
      id: "addr-victim",
      customerId: "cust-victim",
    } as any);

    await expect(
      setDefaultCustomerAddress("cust-attacker", "addr-victim")
    ).rejects.toThrow(/permission/i);
  });
});
