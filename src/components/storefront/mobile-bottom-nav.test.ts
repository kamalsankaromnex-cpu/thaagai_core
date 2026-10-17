import { describe, it, expect } from "vitest";
import {
  shouldShowMobileBottomNav,
  getActiveMobileNavId,
} from "./mobile-bottom-nav";
import { buildWhatsAppLink } from "@/lib/whatsapp";

describe("MobileBottomNav — Smartphone Navigation Bar", () => {
  describe("Visibility Logic (shouldShowMobileBottomNav)", () => {
    it("is visible on general storefront browse and brand pages", () => {
      expect(shouldShowMobileBottomNav("/")).toBe(true);
      expect(shouldShowMobileBottomNav("/shop")).toBe(true);
      expect(shouldShowMobileBottomNav("/category/churidars")).toBe(true);
      expect(shouldShowMobileBottomNav("/custom-made")).toBe(true);
      expect(shouldShowMobileBottomNav("/wishlist")).toBe(true);
      expect(shouldShowMobileBottomNav("/cart")).toBe(true);
      expect(shouldShowMobileBottomNav("/contact")).toBe(true);
      expect(shouldShowMobileBottomNav("/about")).toBe(true);
      expect(shouldShowMobileBottomNav("/track-order")).toBe(true);
    });

    it("hides on Product Detail Pages (PDP) so dedicated quick-action bar has full prominence", () => {
      expect(shouldShowMobileBottomNav("/product/chettinad-cotton-straight-churidar")).toBe(false);
      expect(shouldShowMobileBottomNav("/product/festive-chanderi-anarkali")).toBe(false);
      expect(shouldShowMobileBottomNav("/product/any-slug")).toBe(false);
    });

    it("hides on checkout and order success pages to avoid distractions", () => {
      expect(shouldShowMobileBottomNav("/checkout")).toBe(false);
      expect(shouldShowMobileBottomNav("/checkout/address")).toBe(false);
      expect(shouldShowMobileBottomNav("/order-success/TG-20261016-1234")).toBe(false);
    });
  });

  describe("Active Navigation Item Logic (getActiveMobileNavId)", () => {
    it("highlights Home when pathname is '/'", () => {
      expect(getActiveMobileNavId("/")).toBe("mobile-nav-home");
    });

    it("highlights Churidars when browsing catalog and categories", () => {
      expect(getActiveMobileNavId("/category/churidars")).toBe("mobile-nav-churidars");
      expect(getActiveMobileNavId("/category/silk-churidars")).toBe("mobile-nav-churidars");
      expect(getActiveMobileNavId("/shop")).toBe("mobile-nav-churidars");
      
      const mockParamsNew = { get: (k: string) => (k === "filter" ? "new" : null) };
      expect(getActiveMobileNavId("/shop", mockParamsNew)).toBe("mobile-nav-churidars");

      const mockParamsOffers = { get: (k: string) => (k === "filter" ? "offers" : null) };
      expect(getActiveMobileNavId("/shop", mockParamsOffers)).toBe("mobile-nav-churidars");
    });

    it("highlights Atelier when visiting /custom-made or custom filter", () => {
      expect(getActiveMobileNavId("/custom-made")).toBe("mobile-nav-custom-made");
      
      const mockParamsCustom = { get: (k: string) => (k === "type" ? "CUSTOM_MADE" : null) };
      expect(getActiveMobileNavId("/shop", mockParamsCustom)).toBe("mobile-nav-custom-made");
    });

    it("highlights Wishlist when on /wishlist", () => {
      expect(getActiveMobileNavId("/wishlist")).toBe("mobile-nav-wishlist");
    });

    it("highlights Bag when on /cart", () => {
      expect(getActiveMobileNavId("/cart")).toBe("mobile-nav-cart");
    });
  });

  describe("Badge Formatting & Counters", () => {
    it("correctly hides badge when counter is zero and formats counts > 99", () => {
      const formatBadge = (count: number) =>
        count > 0 ? (count > 99 ? "99+" : count) : null;

      expect(formatBadge(0)).toBeNull();
      expect(formatBadge(1)).toBe(1);
      expect(formatBadge(12)).toBe(12);
      expect(formatBadge(99)).toBe(99);
      expect(formatBadge(105)).toBe("99+");
    });
  });

  describe("WhatsApp Floating Concierge Link Generator", () => {
    it("generates valid direct WhatsApp link with polite Tamil greeting", () => {
      const phone = "919876543210";
      const greeting = "Hello Thaagai! I have a question about your Churidar collections.";
      const link = buildWhatsAppLink(phone, greeting);

      expect(link.startsWith("https://wa.me/919876543210?text=")).toBe(true);
      expect(link).toContain(encodeURIComponent("Hello Thaagai!"));
    });
  });
});
