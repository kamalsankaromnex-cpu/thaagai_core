/**
 * THAAGAI — Centralized SEO, AEO & Schema Markup Utilities
 * Handles canonical URL generation, metadata defaults, and Schema.org JSON-LD builders.
 */

export const SITE_CONFIG = {
  brandName: "THAAGAI",
  tamilName: "",
  fullName: "THAAGAI — Exquisite Ready-Made & Bespoke Churidars",
  tagline: "Authentic Handloom & Bespoke Churidars Crafted for Grace",
  description:
    "Explore authentic Tamil handloom cotton and festive silk churidars, bespoke made-to-measure tailoring, and unstitched churidar sets from THAAGAI.",
  defaultLocale: "en_IN",
  currency: "INR",
  supportPhone: "+919876543210",
  supportEmail: "care@thaagai.com",
  defaultOgImage: "/og-image.jpg",
  twitterHandle: "@thaagai_official",
};

/**
 * Returns the absolute, canonical HTTPS production URL.
 * Guarantees that production metadata, sitemaps, and feeds never output localhost.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  // In production, guard against any localhost / 127.0.0.1 leakage
  if (process.env.NODE_ENV === "production") {
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return "https://thaagai.com";
    }
    return envUrl.replace(/\/+$/, "");
  }

  // In local/dev/test, use envUrl or fallback to https://thaagai.com
  return (envUrl || "https://thaagai.com").replace(/\/+$/, "");
}

/**
 * Resolves an image path to an absolute HTTPS URL.
 */
export function getAbsoluteImageUrl(imagePath?: string | null): string {
  const siteUrl = getSiteUrl();
  if (!imagePath) return `${siteUrl}/categories/straight-cut.svg`;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${siteUrl}${cleanPath}`;
}

/**
 * Generates Schema.org Organization / OnlineStore JSON-LD
 */
export function generateOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${siteUrl}/#organization`,
    name: SITE_CONFIG.brandName,
    alternateName: [SITE_CONFIG.tamilName, "Thaagai Churidars"],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/categories/straight-cut.svg`,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.description,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "UPI, Bank Transfer, Card",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.supportPhone,
      contactType: "customer service",
      availableLanguage: ["en", "ta"],
      areaServed: "IN",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Tamil Nadu",
    },
  };
}

/**
 * Generates Schema.org WebSite JSON-LD with Sitelinks Searchbox
 */
export function generateWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: SITE_CONFIG.brandName,
    alternateName: SITE_CONFIG.tamilName,
    description: SITE_CONFIG.description,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}

/**
 * Generates Schema.org CollectionPage / ItemList JSON-LD
 */
export function generateCollectionJsonLd(params: {
  categoryName: string;
  categoryDescription?: string | null;
  url: string;
  products: Array<{
    name: string;
    slug: string;
    price: number | string;
    image?: string | null;
  }>;
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = params.url.startsWith("http") ? params.url : `${siteUrl}${params.url}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}#collection`,
    name: `${params.categoryName} Collection | ${SITE_CONFIG.brandName}`,
    description: params.categoryDescription || `Explore handcrafted ${params.categoryName} at ${SITE_CONFIG.brandName}.`,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: params.products.length,
      itemListElement: params.products.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };
}

/**
 * Generates Schema.org FAQPage JSON-LD for Answer Engine Optimization (AEO)
 */
export function generateFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
