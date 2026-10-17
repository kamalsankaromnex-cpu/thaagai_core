import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isTamilInput,
  extractOrderReference,
  extractMobileNumber,
  extractOtpCode,
  mapOrderStatusToDisplay,
  searchCatalog,
  buildCustomizationSummary,
  lookupOrderWithSecurity,
  processChat,
} from "./ai-assistant-service";
import { db } from "@/lib/db";
import { requestOtp, verifyOtp } from "@/server/auth/otp-service";
import { OrderStatus } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    orderRequest: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/server/auth/otp-service", () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  normalizeIndianMobile: vi.fn((m: string) => m.replace(/\D/g, "").slice(-10)),
  OtpError: class OtpError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));

describe("AI Assistant Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Utility & Parser Functions", () => {
    it("detects Tamil unicode and transliterated Tamil", () => {
      expect(isTamilInput("வணக்கம்")).toBe(true);
      expect(isTamilInput("குர்த்தி விலை என்ன?")).toBe(true);
      expect(isTamilInput("vanakkam, how are you?")).toBe(true);
      expect(isTamilInput("Hello, I need an office kurti")).toBe(false);
    });

    it("extracts order references in various formats", () => {
      expect(extractOrderReference("Where is my order TG-AB12CD?")).toBe("TG-AB12CD");
      expect(extractOrderReference("Status for THA-2026-X999 please")).toBe("THA-2026-X999");
      expect(extractOrderReference("Hello there")).toBeNull();
    });

    it("extracts 10-digit Indian mobile numbers", () => {
      expect(extractMobileNumber("Track order for +91 9876543210")).toBe("9876543210");
      expect(extractMobileNumber("My number is 8765432109")).toBe("8765432109");
      expect(extractMobileNumber("No number here")).toBeNull();
    });

    it("extracts 6-digit OTP codes", () => {
      expect(extractOtpCode("My code is 654321")).toBe("654321");
      expect(extractOtpCode("Verify with 123456 please")).toBe("123456");
      expect(extractOtpCode("123")).toBeNull();
    });

    it("correctly maps order statuses to human-readable steps", () => {
      expect(mapOrderStatusToDisplay(OrderStatus.PENDING_WHATSAPP).step).toBe(1);
      expect(mapOrderStatusToDisplay(OrderStatus.CONFIRMED).step).toBe(2);
      expect(mapOrderStatusToDisplay(OrderStatus.PROCESSING).step).toBe(2);
      expect(mapOrderStatusToDisplay(OrderStatus.SHIPPED).step).toBe(3);
      expect(mapOrderStatusToDisplay(OrderStatus.DELIVERED).step).toBe(4);
    });
  });

  describe("Catalog Search Subsystem", () => {
    it("filters products by search terms and maps card properties", async () => {
      vi.mocked(db.product.findMany).mockResolvedValueOnce([
        {
          id: "prod-1",
          name: "Daily Comfort Mulmul Cotton Churidar Set",
          slug: "daily-mulmul-cotton-churidar",
          basePrice: 1650 as any,
          salePrice: null,
          productType: "READY_TO_WEAR",
          shortDescription: "Soft breathable handloom cotton",
          sku: "TG-CHU-MUL01",
          images: [{ isPrimary: true, storageKey: "mulmul-cotton.jpg" }] as any,
          variants: [
            { id: "var-1", size: "M", colour: "Natural Ochre", sku: "TG-CHU-MUL01-M", stockQuantity: 12 },
          ] as any,
          categories: [],
        } as any,
      ]);

      const results = await searchCatalog("cotton kurti under 2000");
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain("Mulmul Cotton");
      expect(results[0].price).toBe(1650);
      expect(results[0].primaryVariantId).toBe("var-1");
      expect(results[0].imageUrl).toContain("mulmul-cotton.jpg");
    });
  });

  describe("Customization Subsystem", () => {
    it("computes accurate configuration and price deltas for bespoke choices", async () => {
      vi.mocked(db.product.findFirst).mockResolvedValueOnce({
        basePrice: 5400 as any,
        name: "Bespoke Kanchipuram Silk Bridal Churidar Suit",
        slug: "bespoke-kanchipuram-silk-bridal-churidar",
      } as any);

      const summary = await buildCustomizationSummary(
        "I want an anarkali with high boat neck, full sleeves, cigarette pant, and santoon lining"
      );

      expect(summary.topStyle).toBe("Flared Anarkali Silhouette");
      expect(summary.neckline).toBe("High Boat Neck with Zari Piping");
      expect(summary.sleeve).toBe("Full Sleeves with Gathered Cuffs");
      expect(summary.bottomCut).toBe("Tailored Slim Cigarette Pants");
      expect(summary.lining).toBe("Heavy Royal Santoon Lining");
      expect(summary.totalPrice).toBeGreaterThan(5400);
      expect(summary.priceDelta).toBe(600 + 150 + 350 + 150 + 300); // 1550
      expect(summary.totalPrice).toBe(5400 + 1550);
    });
  });

  describe("Guest Order Lookup & Privacy Subsystem", () => {
    it("protects guest customer privacy by requiring OTP verification before revealing details", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-99",
        reference: "TG-TEST99",
        customerName: "Priya Sundaram",
        customerPhone: "9876543210",
        address: "123 Anna Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pinCode: "600040",
        courier: "DTDC",
        trackingNumber: "DTDC12345",
        total: 2800 as any,
        status: OrderStatus.SHIPPED,
        createdAt: new Date("2026-10-10"),
        items: [],
      } as any);

      vi.mocked(requestOtp).mockResolvedValueOnce({
        success: true,
        mobileNumber: "9876543210",
        expiresInSeconds: 600,
        cooldownSeconds: 60,
        devOtp: "123456",
      });

      const res = await lookupOrderWithSecurity("TG-TEST99", {});
      expect(res.otpPrompt).toBeDefined();
      expect(res.otpPrompt?.step).toBe("REQUESTED");
      expect(res.otpPrompt?.maskedPhone).toBe("+91 ******3210");
      expect(res.otpPrompt?.devOtp).toBe("123456");
      expect(res.order).toBeUndefined(); // Sensitive order info NOT exposed without OTP!
    });

    it("reveals full verified order status once OTP is validated", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-99",
        reference: "TG-TEST99",
        customerName: "Priya Sundaram",
        customerPhone: "9876543210",
        address: "123 Anna Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pinCode: "600040",
        courier: "DTDC",
        trackingNumber: "DTDC12345",
        total: 2800 as any,
        status: OrderStatus.SHIPPED,
        createdAt: new Date("2026-10-10"),
        items: [
          {
            productName: "Daily Comfort Mulmul Cotton Churidar Set",
            quantity: 1,
            unitPrice: 2800 as any,
            lineTotal: 2800 as any,
          },
        ],
      } as any);

      vi.mocked(verifyOtp).mockResolvedValueOnce({} as any);

      const res = await lookupOrderWithSecurity("TG-TEST99", {
        otpCode: "123456",
        pendingOtpPhone: "9876543210",
      });

      expect(res.order).toBeDefined();
      expect(res.order?.reference).toBe("TG-TEST99");
      expect(res.order?.status).toBe(OrderStatus.SHIPPED);
      expect(res.order?.courier).toBe("DTDC");
      expect(res.order?.trackingNumber).toBe("DTDC12345");
      expect(res.order?.items).toHaveLength(1);
    });
  });

  describe("Conversational Intent Processing", () => {
    it("handles welcome greetings with featured products and quick replies", async () => {
      vi.mocked(db.product.findMany).mockResolvedValueOnce([]);
      const res = await processChat([{ role: "user", content: "Hi" }]);
      expect(res.message).toContain("Welcome to Thaagai");
      expect(res.quickReplies.length).toBeGreaterThan(0);
    });

    it("handles cancellation and return policy questions accurately", async () => {
      const res = await processChat([{ role: "user", content: "How do I return a dress if size does not fit?" }]);
      expect(res.message).toContain("48-Hour");
      expect(res.message).toContain("unboxing");
      expect(res.quickReplies).toContain("Chat with Concierge");
    });

    it("handles human concierge escalation requests with WhatsApp handover", async () => {
      const res = await processChat([{ role: "user", content: "Can I speak to a human or master tailor?" }]);
      expect(res.whatsappHandover).toBeDefined();
      expect(res.whatsappHandover?.url).toContain("wa.me");
    });

    it("responds in Tamil when the customer speaks Tamil", async () => {
      const res = await processChat([{ role: "user", content: "வணக்கம், ஆர்டர் நிலை என்ன?" }]);
      expect(res.language).toBe("ta");
      expect(res.message).toContain("ஆர்டர்");
    });
  });
});
