import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  const standardDisallow = [
    "/admin/",
    "/api/admin/",
    "/account/",
    "/checkout/",
    "/order-success/",
    "/cart/",
    "/login/",
    "/wishlist/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: standardDisallow,
      },
      // Search Engine Crawlers
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot"],
        allow: "/",
        disallow: standardDisallow,
      },
      // AI Search & Answer Engine Crawlers (AEO discoverability)
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: [
          "/",
          "/shop",
          "/product/",
          "/category/",
          "/custom-made",
          "/lookbook",
          "/about",
          "/contact",
          "/shipping-policy",
          "/return-refund-policy",
          "/privacy-policy",
          "/terms",
          "/llms.txt",
        ],
        disallow: standardDisallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
