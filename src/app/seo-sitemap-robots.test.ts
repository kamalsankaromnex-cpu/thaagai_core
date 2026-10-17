import { describe, it, expect, vi, beforeEach } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe("Sitemap & Robots — Technical SEO Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://thaagai.com";
  });

  it("sitemap includes canonical static pages, canonical category pages, and active products", async () => {
    const mockDate = new Date("2026-10-15T12:00:00Z");
    (db.product.findMany as any).mockResolvedValue([
      { slug: "anarkali-suit", updatedAt: mockDate },
    ]);
    (db.category.findMany as any).mockResolvedValue([
      { slug: "churidars", updatedAt: mockDate },
      { slug: "kurtis", updatedAt: mockDate },
    ]);

    const result = await sitemap();

    // Verify static routes
    const urls = result.map((r) => r.url);
    expect(urls).toContain("https://thaagai.com");
    expect(urls).toContain("https://thaagai.com/shop");
    expect(urls).toContain("https://thaagai.com/custom-made");
    expect(urls).toContain("https://thaagai.com/about");
    expect(urls).toContain("https://thaagai.com/contact");
    expect(urls).toContain("https://thaagai.com/shipping-policy");
    expect(urls).toContain("https://thaagai.com/return-refund-policy");
    expect(urls).toContain("https://thaagai.com/privacy-policy");
    expect(urls).toContain("https://thaagai.com/terms");

    // Strictly excludes private / transactional pages
    expect(urls).not.toContain("https://thaagai.com/wishlist");
    expect(urls).not.toContain("https://thaagai.com/cart");
    expect(urls).not.toContain("https://thaagai.com/checkout");
    expect(urls).not.toContain("https://thaagai.com/account");
    expect(urls).not.toContain("https://thaagai.com/login");

    // Verifies canonical category landing pages (NOT query param URLs)
    expect(urls).toContain("https://thaagai.com/category/churidars");
    expect(urls).toContain("https://thaagai.com/category/kurtis");
    expect(urls).not.toContain("https://thaagai.com/shop?category=churidars");

    // Verifies product pages
    expect(urls).toContain("https://thaagai.com/product/anarkali-suit");

    // Verifies real DB timestamps
    const productEntry = result.find((r) => r.url === "https://thaagai.com/product/anarkali-suit");
    expect(productEntry?.lastModified).toEqual(mockDate);
  });

  it("robots configures search bots, AI bots, disallow list, and sitemap URL", () => {
    const result = robots();

    expect(result.sitemap).toBe("https://thaagai.com/sitemap.xml");

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules.length).toBeGreaterThanOrEqual(2);

    // Checks disallows across all rules
    for (const rule of rules) {
      const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
      expect(disallows).toContain("/admin/");
      expect(disallows).toContain("/cart/");
      expect(disallows).toContain("/checkout/");
      expect(disallows).toContain("/account/");
    }

    // AI Bots rule allows public pages and llms.txt
    const aiRule = rules.find((r) =>
      Array.isArray(r.userAgent) && r.userAgent.includes("GPTBot")
    );
    expect(aiRule).toBeDefined();
    const aiAllows = Array.isArray(aiRule?.allow) ? aiRule?.allow : [aiRule?.allow];
    expect(aiAllows).toContain("/product/");
    expect(aiAllows).toContain("/category/");
    expect(aiAllows).toContain("/llms.txt");
  });
});
