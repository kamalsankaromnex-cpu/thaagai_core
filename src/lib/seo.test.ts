import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSiteUrl,
  getAbsoluteImageUrl,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateBreadcrumbJsonLd,
  generateCollectionJsonLd,
  generateFaqJsonLd,
  SITE_CONFIG,
} from "./seo";

describe("SEO Utilities — URL Resolution & Fallbacks", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns https://thaagai.com in production if SITE_URL is localhost", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.SITE_URL = "http://localhost:3000";
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteUrl()).toBe("https://thaagai.com");
  });

  it("returns https://thaagai.com in production if 127.0.0.1 is configured", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.SITE_URL = "http://127.0.0.1:3000";
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteUrl()).toBe("https://thaagai.com");
  });

  it("returns configured production domain when valid HTTPS URL is set", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.SITE_URL = "https://custom-domain.thaagai.com";

    expect(getSiteUrl()).toBe("https://custom-domain.thaagai.com");
  });

  it("strips trailing slashes from site URLs", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.SITE_URL = "https://thaagai.com///";

    expect(getSiteUrl()).toBe("https://thaagai.com");
  });

  it("converts relative image paths to absolute HTTPS URLs", () => {
    process.env.SITE_URL = "https://thaagai.com";
    expect(getAbsoluteImageUrl("/uploads/prod1.jpg")).toBe("https://thaagai.com/uploads/prod1.jpg");
    expect(getAbsoluteImageUrl("categories/silk.svg")).toBe("https://thaagai.com/categories/silk.svg");
    expect(getAbsoluteImageUrl("https://cdn.example.com/photo.jpg")).toBe("https://cdn.example.com/photo.jpg");
    expect(getAbsoluteImageUrl(null)).toBe("https://thaagai.com/categories/straight-cut.svg");
  });
});

describe("SEO Structured Data — Schema.org JSON-LD Builders", () => {
  beforeEach(() => {
    process.env.SITE_URL = "https://thaagai.com";
  });

  it("generates valid Organization / OnlineStore schema", () => {
    const org = generateOrganizationJsonLd();
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("OnlineStore");
    expect(org.name).toBe("THAAGAI");
    expect(org.url).toBe("https://thaagai.com");
    expect(org.currenciesAccepted).toBe("INR");
    expect(org.contactPoint.telephone).toBe(SITE_CONFIG.supportPhone);
  });

  it("generates valid WebSite schema with Sitelinks Searchbox", () => {
    const site = generateWebSiteJsonLd();
    expect(site["@context"]).toBe("https://schema.org");
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBe("THAAGAI");
    expect(site.potentialAction["@type"]).toBe("SearchAction");
    expect(site.potentialAction.target.urlTemplate).toContain("/shop?q={search_term_string}");
  });

  it("generates valid BreadcrumbList schema with sequential positions", () => {
    const breadcrumbs = generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: "Churidars", url: "/category/churidars" },
    ]);

    expect(breadcrumbs["@context"]).toBe("https://schema.org");
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement).toHaveLength(3);
    expect(breadcrumbs.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://thaagai.com/",
    });
    expect(breadcrumbs.itemListElement[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "Churidars",
      item: "https://thaagai.com/category/churidars",
    });
  });

  it("generates valid CollectionPage / ItemList schema", () => {
    const collection = generateCollectionJsonLd({
      categoryName: "Kurtis",
      categoryDescription: "Handcrafted cotton kurtis.",
      url: "/category/kurtis",
      products: [
        { name: "Chettinad Cotton Kurti", slug: "chettinad-kurti", price: 1499 },
        { name: "Mulmul Festive Kurti", slug: "mulmul-kurti", price: 1899 },
      ],
    });

    expect(collection["@type"]).toBe("CollectionPage");
    expect(collection.name).toBe("Kurtis Collection | THAAGAI");
    expect(collection.mainEntity["@type"]).toBe("ItemList");
    expect(collection.mainEntity.numberOfItems).toBe(2);
    expect(collection.mainEntity.itemListElement[0].url).toBe("https://thaagai.com/product/chettinad-kurti");
  });

  it("generates valid FAQPage schema for Answer Engine Optimization (AEO)", () => {
    const faqs = generateFaqJsonLd([
      {
        question: "What is the inner alteration margin?",
        answer: "Every churidar includes a 1.5-inch inner alteration margin.",
      },
    ]);

    expect(faqs["@context"]).toBe("https://schema.org");
    expect(faqs["@type"]).toBe("FAQPage");
    expect(faqs.mainEntity).toHaveLength(1);
    expect(faqs.mainEntity[0].name).toBe("What is the inner alteration margin?");
    expect(faqs.mainEntity[0].acceptedAnswer.text).toBe("Every churidar includes a 1.5-inch inner alteration margin.");
  });
});
