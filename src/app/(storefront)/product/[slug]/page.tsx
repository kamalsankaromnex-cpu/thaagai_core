import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductView } from "@/components/storefront/product-view";
import { getSizeChart } from "@/server/services/size-chart-service";
import { getProductReviews } from "@/server/services/review-service";
import { ReviewStatus } from "@prisma/client";
import { getSiteUrl, getAbsoluteImageUrl, generateFaqJsonLd, SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!product) {
    return { title: `Product Not Found | ${SITE_CONFIG.brandName}` };
  }

  const rawImage = product.images[0]?.storageKey;
  const primaryImage = rawImage
    ? getAbsoluteImageUrl(
        rawImage.startsWith("http") || rawImage.startsWith("/")
          ? rawImage
          : `/uploads/${rawImage}`
      )
    : `${siteUrl}/og-image.jpg`;

  const title = product.seoTitle || `${product.name} — Handcrafted Churidar Set | ${SITE_CONFIG.brandName}`;
  const description = product.seoDescription || (product.description || "").slice(0, 160);
  const canonical = product.canonicalUrl || `${siteUrl}/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: product.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: primaryImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: any = null;
  try {
    product = await db.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        categories: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { active: true },
          orderBy: { sku: "asc" },
        },
        customizationGroups: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              where: { active: true },
              orderBy: { priceDelta: "asc" },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
  }

  if (!product) {
    notFound();
  }

  // 1. Fetch Size Chart
  const categorySlug = product.categories?.[0]?.category?.slug;
  let sizeChart: any = null;
  try {
    sizeChart = await getSizeChart(product.id, categorySlug);
  } catch (err) {
    console.error("Error fetching size chart:", err);
  }

  // 2. Fetch Approved Reviews for Aggregate Rating & Structured Data
  let approvedReviews: any[] = [];
  let ratingStats = {
    averageRating: 0,
    totalReviews: 0,
    verifiedPurchasesCount: 0,
    withPhotosCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };
  try {
    const reviewData = await getProductReviews(product.id, "newest");
    approvedReviews = reviewData.reviews;
    ratingStats = reviewData.stats;
  } catch (err) {
    console.error("Error fetching approved reviews:", err);
  }

  const totalReviews = ratingStats.totalReviews;
  const averageRating = ratingStats.averageRating;

  // 3. Fetch Related Products (5 items for grid)
  let relatedProducts: any[] = [];
  try {
    const rawRelated = await db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: product.id },
        ...(categorySlug
          ? {
              categories: {
                some: { category: { slug: categorySlug } },
              },
            }
          : {}),
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    let combined = [...rawRelated];
    if (combined.length < 5) {
      const extra = await db.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: [product.id, ...combined.map((p) => p.id)] },
        },
        take: 5 - combined.length,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      });
      combined = [...combined, ...extra];
    }

    relatedProducts = combined.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      productType: p.productType,
      imageUrl: p.images[0]?.storageKey?.startsWith("http") || p.images[0]?.storageKey?.startsWith("/")
        ? p.images[0]?.storageKey
        : p.images[0]?.storageKey
        ? `/uploads/${p.images[0]?.storageKey}`
        : null,
    }));
  } catch (err) {
    console.error("Error fetching related products:", err);
  }

  // 4. Fetch Companion Products for "Style It With"
  let styleItWithProducts: any[] = [];
  try {
    const rawStyle = await db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: product.id },
      },
      take: 4,
      orderBy: { basePrice: "asc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        variants: {
          where: { active: true, stockQuantity: { gt: 0 } },
          take: 1,
        },
      },
    });
    styleItWithProducts = rawStyle.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: Number(p.basePrice),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      variantId: p.variants[0]?.id || p.id,
      sku: p.variants[0]?.sku || p.sku || "TG-ACC",
      size: p.variants[0]?.size || "Free Size",
      colour: p.variants[0]?.colour || "Classic",
      stockQuantity: p.variants[0]?.stockQuantity || 10,
      imageUrl: p.images[0]?.storageKey?.startsWith("http") || p.images[0]?.storageKey?.startsWith("/")
        ? p.images[0]?.storageKey
        : p.images[0]?.storageKey
        ? `/uploads/${p.images[0]?.storageKey}`
        : null,
    }));
  } catch (err) {
    console.error("Error fetching style it with products:", err);
  }

  // 5. Fetch Genuine Sales Count
  let salesCount = 0;
  try {
    const salesAgg = await db.orderItem.aggregate({
      where: { productId: product.id },
      _sum: { quantity: true },
    });
    salesCount = salesAgg._sum.quantity || 0;
  } catch (err) {
    console.error("Error fetching sales count:", err);
  }

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    shortDescription: product.shortDescription || null,
    department: product.productType || "READY_TO_WEAR",
    productType: (product.productType || "READY_TO_WEAR") as "READY_TO_WEAR" | "CUSTOM_MADE",
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    sku: product.sku || null,
    fabricCare: product.fabricCare || null,
    shippingInfo: product.shippingInfo || null,
    category: product.categories?.[0]?.category
      ? {
          name: product.categories[0].category.name,
          slug: product.categories[0].category.slug,
        }
      : null,
    customizationGroups: (product.customizationGroups || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      required: g.required,
      options: (g.options || []).map((o: any) => ({
        id: o.id,
        name: o.name,
        priceDelta: Number(o.priceDelta),
        description: o.description || null,
      })),
    })),
    images: product.images.map((img: any) => ({
      id: img.id,
      url: img.storageKey?.startsWith("http") || img.storageKey?.startsWith("/")
        ? img.storageKey
        : `/uploads/${img.storageKey}`,
      altText: img.altText || product.name,
      isPrimary: img.isPrimary,
    })),
    variants: product.variants.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size || null,
      colour: v.colour || null,
      price: v.priceOverride ? Number(v.priceOverride) : Number(product.basePrice),
      salePrice: v.salePriceOverride
        ? Number(v.salePriceOverride)
        : product.salePrice
        ? Number(product.salePrice)
        : null,
      stockQuantity: v.stockQuantity,
    })),
  };

  const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || "919876543210";
  const siteUrl = getSiteUrl();
  const inStock = formattedProduct.variants.some((v: any) => v.stockQuantity > 0);
  const effectivePrice = formattedProduct.salePrice || formattedProduct.basePrice;

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/shop`,
      },
      ...(formattedProduct.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: formattedProduct.category.name,
              item: `${siteUrl}/category/${formattedProduct.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: formattedProduct.name,
              item: `${siteUrl}/product/${formattedProduct.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: formattedProduct.name,
              item: `${siteUrl}/product/${formattedProduct.slug}`,
            },
          ]),
    ],
  };

  // JSON-LD Product Schema
  const productJsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: formattedProduct.name,
    description: formattedProduct.description,
    image: formattedProduct.images.map((img: any) => getAbsoluteImageUrl(img.url)),
    sku: formattedProduct.sku || formattedProduct.variants[0]?.sku || `TG-${formattedProduct.id.slice(0, 8)}`,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.brandName,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${formattedProduct.slug}`,
      priceCurrency: "INR",
      price: effectivePrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.brandName,
      },
    },
  };

  // Include genuine aggregate ratings and reviews only when eligible
  if (totalReviews > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: totalReviews,
      bestRating: 5,
      worstRating: 1,
    };

    productJsonLd.review = approvedReviews.map((r) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: r.customerName,
      },
      datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.content,
      name: r.title,
    }));
  }

  // Answer Engine Optimization (AEO) Product FAQs
  const productFaqJsonLd = generateFaqJsonLd([
    {
      question: `What is the inner alteration margin on this ${formattedProduct.name}?`,
      answer:
        "Every stitched churidar kurta and bottom from THAAGAI is crafted with a generous 1.5-inch inner alteration margin, allowing you to easily adjust the bust, waist, or hips for a custom, personalized fit.",
    },
    {
      question: "How does the ordering and WhatsApp confirmation process work?",
      answer:
        "After submitting your order request online, our boutique concierge connects directly with you on WhatsApp to verify your sizing measurements and delivery details before dispatch.",
    },
    {
      question: "What are the recommended fabric care and washing instructions?",
      answer:
        formattedProduct.fabricCare ||
        "For pure handloom cotton churidars, gentle hand washing in cold water with mild detergent is recommended. For silk and zari celebration suits, professional dry cleaning is recommended to preserve the handloom weave.",
    },
    {
      question: "How long does shipping and delivery take across India?",
      answer:
        "Each handcrafted garment is physically inspected and dispatched within 2 business days after WhatsApp confirmation. Delivery across India takes 3 to 7 business days via insured domestic couriers.",
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqJsonLd) }}
      />
      <ProductView
        product={formattedProduct}
        whatsappNumber={whatsappNumber}
        sizeChart={sizeChart}
        initialRatingStats={ratingStats}
        initialReviews={approvedReviews.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title,
          content: r.content,
          images: r.images,
          verifiedPurchase: r.verifiedPurchase,
          createdAt: new Date(r.createdAt).toISOString(),
        }))}
        relatedProducts={relatedProducts}
        styleItWithProducts={styleItWithProducts}
        salesCount={salesCount}
      />
    </>
  );
}
