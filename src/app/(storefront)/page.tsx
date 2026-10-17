import type { Metadata } from "next";
import { db } from "@/lib/db";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { ThaagaiHomeSections } from "@/components/storefront/thaagai-home-sections";
import { getSiteUrl, generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "THAAGAI — Exquisite Ready-Made & Bespoke Churidars",
  description:
    "Discover authentic Tamil handloom cotton and festive silk churidars, bespoke made-to-measure tailoring, and unstitched churidar sets from THAAGAI.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "THAAGAI — Exquisite Ready-Made & Bespoke Churidars",
    description:
      "Discover authentic Tamil handloom cotton and festive silk churidars, bespoke made-to-measure tailoring, and unstitched churidar sets from THAAGAI.",
    url: getSiteUrl(),
    type: "website",
  },
};

export default async function HomePage() {
  // 1. Fetch active hero slides from DB
  let heroSlides: any[] = [];
  try {
    const rawSlides = await db.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    heroSlides = JSON.parse(JSON.stringify(rawSlides));
  } catch (err) {
    console.error("Error fetching hero slides:", err);
  }

  // 2. Fetch active categories from DB
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
  }

  // 3. Fetch real featured products from DB with variants, images, and categories
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      include: {
        variants: {
          where: { active: true },
          take: 5,
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching homepage products:", err);
  }

  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className="overflow-hidden bg-[#fffdfa] text-[#492326]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* 1. Hero Carousel (Full-Width, Matching Height) */}
      <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : undefined} />

      {/* 2. Thaagai Home Sections (Brand Promise, Explore by Design, Custom Studio, The Thaagai Edit, Our Story, Final CTA) */}
      <ThaagaiHomeSections
        categories={categories}
        featuredProducts={featuredProducts}
      />
    </div>
  );
}
