import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeIndianMobile, requestOtp } from "./otp-service";
import { signCustomerToken, verifyCustomerToken } from "./customer-auth";
import { db } from "@/lib/db";

// Mock database calls for unit testing
vi.mock("@/lib/db", () => {
  return {
    db: {
      otpVerification: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      customer: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

describe("Customer Authentication & Mobile OTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeIndianMobile", () => {
    it("normalizes 10-digit Indian numbers", () => {
      expect(normalizeIndianMobile("9876543210")).toBe("9876543210");
      expect(normalizeIndianMobile("8123456789")).toBe("8123456789");
      expect(normalizeIndianMobile("7987654321")).toBe("7987654321");
      expect(normalizeIndianMobile("6380123456")).toBe("6380123456");
    });

    it("strips +91 prefix and whitespace", () => {
      expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
      expect(normalizeIndianMobile("+919876543210")).toBe("9876543210");
      expect(normalizeIndianMobile("91-98765-43210")).toBe("9876543210");
    });

    it("rejects invalid lengths and invalid starting digits", () => {
      expect(() => normalizeIndianMobile("5876543210")).toThrow();
      expect(() => normalizeIndianMobile("1234567890")).toThrow();
      expect(() => normalizeIndianMobile("987654321")).toThrow();
      expect(() => normalizeIndianMobile("987654321012")).toThrow();
    });
  });

  describe("requestOtp", () => {
    it("creates an OTP verification record and returns cooldown info", async () => {
      vi.mocked(db.otpVerification.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.otpVerification.count).mockResolvedValueOnce(0);
      vi.mocked(db.otpVerification.create).mockResolvedValueOnce({
        id: "otp-1",
        mobileNumber: "9876543210",
        otpHash: "hash-123",
        expiresAt: new Date(Date.now() + 600000),
        attempts: 0,
        verified: false,
        createdAt: new Date(),
      } as any);

      const res = await requestOtp("9876543210");
      expect(res.success).toBe(true);
      expect(res.mobileNumber).toBe("9876543210");
      expect(res.cooldownSeconds).toBe(60);
      expect(db.otpVerification.create).toHaveBeenCalledTimes(1);
    });

    it("enforces 60-second cooldown period between requests", async () => {
      vi.mocked(db.otpVerification.findFirst).mockResolvedValueOnce({
        id: "otp-recent",
        mobileNumber: "9876543210",
        createdAt: new Date(Date.now() - 20000), // 20s ago (less than 60s)
      } as any);

      await expect(requestOtp("9876543210")).rejects.toThrow(/Please wait/);
    });

    it("enforces maximum 5 requests per hour rate limit", async () => {
      vi.mocked(db.otpVerification.findFirst).mockResolvedValueOnce({
        id: "otp-old",
        mobileNumber: "9876543210",
        createdAt: new Date(Date.now() - 70000), // > 60s ago
      } as any);
      vi.mocked(db.otpVerification.count).mockResolvedValueOnce(5); // reached 5/hr

      await expect(requestOtp("9876543210")).rejects.toThrow(/Too many OTP requests/);
    });
  });

  describe("Customer Session Token Management", () => {
    it("signs and verifies customer session tokens", () => {
      const payload = {
        customerId: "cust-123",
        mobileNumber: "9876543210",
      };

      const token = signCustomerToken(payload);
      expect(typeof token).toBe("string");
      expect(token).toContain(".");

      const decoded = verifyCustomerToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.customerId).toBe("cust-123");
      expect(decoded?.mobileNumber).toBe("9876543210");
    });

    it("rejects tampered or malformed tokens", () => {
      const payload = {
        customerId: "cust-123",
        mobileNumber: "9876543210",
      };

      const token = signCustomerToken(payload);
      const tampered = token.slice(0, -4) + "XXXX";
      expect(verifyCustomerToken(tampered)).toBeNull();
      expect(verifyCustomerToken("invalid.token")).toBeNull();
      expect(verifyCustomerToken("")).toBeNull();
    });
  });
});
