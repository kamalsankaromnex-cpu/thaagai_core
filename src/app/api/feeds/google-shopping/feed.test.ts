import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("Google Shopping XML Product Feed — /api/feeds/google-shopping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://thaagai.com";
  });

  it("generates a valid RSS 2.0 XML feed with Google Merchant namespace and product items", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        name: "Chettinad Cotton Straight Cut Churidar",
        slug: "chettinad-cotton-straight-cut-churidar",
        description: "Breathable pure handloom cotton churidar set.",
        shortDescription: "Cotton churidar set",
        basePrice: 1699,
        salePrice: 1499,
        sku: "TG-CHUR-001",
        productType: "READY_TO_WEAR",
        images: [
          { storageKey: "chettinad-churidar-1.jpg", sortOrder: 0 },
          { storageKey: "chettinad-churidar-2.jpg", sortOrder: 1 },
        ],
        variants: [
          {
            id: "var-1",
            sku: "TG-CHUR-001-M",
            size: "M",
            colour: "Madder Red",
            stockQuantity: 5,
            priceOverride: null,
            salePriceOverride: null,
          },
          {
            id: "var-2",
            sku: "TG-CHUR-001-L",
            size: "L",
            colour: "Madder Red",
            stockQuantity: 0,
            priceOverride: null,
            salePriceOverride: null,
          },
        ],
        categories: [
          {
            category: { name: "Churidars", slug: "churidars" },
          },
        ],
      },
    ];

    (db.product.findMany as any).mockResolvedValue(mockProducts);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/xml");

    const xml = await response.text();

    // Verify XML structure and Google Shopping namespace
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml).toContain("<title>THAAGAI</title>");
    expect(xml).toContain("<link>https://thaagai.com</link>");

    // Verify In Stock variant
    expect(xml).toContain("<g:id>prod-1_TG-CHUR-001-M</g:id>");
    expect(xml).toContain("Chettinad Cotton Straight Cut Churidar - Size M - Madder Red");
    expect(xml).toContain("<g:availability>in_stock</g:availability>");
    expect(xml).toContain("<g:price>1699.00 INR</g:price>");
    expect(xml).toContain("<g:sale_price>1499.00 INR</g:sale_price>");
    expect(xml).toContain("<g:brand>THAAGAI</g:brand>");
    expect(xml).toContain("<g:condition>new</g:condition>");
    expect(xml).toContain("<g:item_group_id>prod-1</g:item_group_id>");
    expect(xml).toContain("<g:google_product_category>5322</g:google_product_category>");
    expect(xml).toContain("<g:size><![CDATA[M]]></g:size>");
    expect(xml).toContain("<g:color><![CDATA[Madder Red]]></g:color>");

    // Verify Out of Stock variant
    expect(xml).toContain("<g:id>prod-1_TG-CHUR-001-L</g:id>");
    expect(xml).toContain("<g:availability>out_of_stock</g:availability>");
  });

  it("handles empty catalog gracefully by returning an empty valid channel", async () => {
    (db.product.findMany as any).mockResolvedValue([]);

    const response = await GET();
    expect(response.status).toBe(200);

    const xml = await response.text();
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<title>THAAGAI</title>");
    expect(xml).not.toContain("<item>");
  });
});
