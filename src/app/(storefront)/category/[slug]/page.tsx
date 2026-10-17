import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ChevronRight, Sparkles, Scissors, ArrowRight } from "lucide-react";
import { LotusMotif, TempleBorder } from "@/components/storefront/tamil-motifs";
import { getSiteUrl, getAbsoluteImageUrl, generateBreadcrumbJsonLd, generateCollectionJsonLd, SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = getSiteUrl();
  const category = await db.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: `Category Not Found | ${SITE_CONFIG.brandName}` };
  }

  const title = category.seoTitle || `${category.name} | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`;
  const description =
    category.seoDescription ||
    category.description ||
    `Explore authentic ${category.name} handcrafted by master artisans at ${SITE_CONFIG.brandName}.`;
  const canonical = category.canonicalUrl || `${siteUrl}/category/${category.slug}`;
  const ogImage = category.imageUrl ? getAbsoluteImageUrl(category.imageUrl) : `${siteUrl}/og-image.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: category.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const siteUrl = getSiteUrl();

  let category: any = null;
  let siblingCategories: any[] = [];

  try {
    const [fetchedCategory, allActiveCategories] = await Promise.all([
      db.category.findUnique({
        where: { slug, active: true },
        include: {
          children: { where: { active: true }, select: { id: true, name: true, slug: true } },
          products: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: "asc" }, take: 1 },
                  variants: { where: { active: true } },
                },
              },
            },
          },
        },
      }),
      db.category.findMany({
        where: { active: true, parentId: null },
        select: { id: true, name: true, slug: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    category = fetchedCategory;
    siblingCategories = allActiveCategories.filter((c) => c.slug !== slug);

    if (category && category.children?.length > 0) {
      const childIds = category.children.map((c: any) => c.id);
      const childProducts = await db.productCategory.findMany({
        where: { categoryId: { in: childIds } },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              variants: { where: { active: true } },
            },
          },
        },
      });
      const existingProductIds = new Set(category.products.map((p: any) => p.product?.id));
      for (const cp of childProducts) {
        if (cp.product && !existingProductIds.has(cp.product.id)) {
          category.products.push(cp);
          existingProductIds.add(cp.product.id);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching category:", err);
  }

  if (!category) {
    notFound();
  }

  const activeProducts = category.products
    .map((p: any) => p.product)
    .filter((p: any) => p && p.status === "ACTIVE");

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: category.name, url: `/category/${category.slug}` },
  ]);

  const collectionJsonLd = generateCollectionJsonLd({
    categoryName: category.name,
    categoryDescription: category.description,
    url: `/category/${category.slug}`,
    products: activeProducts.map((p: any) => ({
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
    })),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Accessible Semantic Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60"
      >
        <Link href="/" className="hover:text-thaagai-wine">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-thaagai-wine">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-thaagai-ink dark:text-white">
          {category.name}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-3xl border border-thaagai-line bg-[#FAF7F2] p-8 sm:p-12 dark:bg-thaagai-cardDark">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
                Collection
              </span>
              <LotusMotif className="h-3.5 w-3.5 text-thaagai-gold" />
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold text-thaagai-wine sm:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-thaagai-ink/80 sm:text-sm dark:text-thaagai-inkDark/80">
                {category.description}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-thaagai-ink/60">
              {activeProducts.length} piece{activeProducts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <TempleBorder className="mt-8 text-thaagai-gold/30" />
      </div>

      {/* Sibling Categories Contextual Navigation */}
      {siblingCategories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-thaagai-line/40 pb-4">
          <span className="text-xs font-medium text-thaagai-ink/60 mr-1">Other Collections:</span>
          {siblingCategories.map((sc) => (
            <Link
              key={sc.id}
              href={`/category/${sc.slug}`}
              className="rounded-full border border-thaagai-line bg-white px-3 py-1 text-xs font-medium text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine transition-colors dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
            >
              {sc.name}
            </Link>
          ))}
          <Link
            href="/custom-made"
            className="rounded-full border border-thaagai-gold/50 bg-[#FAF7F2] px-3 py-1 text-xs font-medium text-thaagai-wine hover:bg-thaagai-gold/10 transition-colors"
          >
            Bespoke Tailoring
          </Link>
        </div>
      )}

      {/* Products Grid */}
      {activeProducts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-thaagai-line p-12 text-center">
          <p className="font-brand text-2xl font-bold text-thaagai-wine">No Pieces Currently in this Collection</p>
          <p className="mt-2 text-xs text-thaagai-ink/70">
            Our artisans are weaving new inventory. Explore all other collections in the boutique.
          </p>
          <Link
            href="/shop"
            className="mt-6 flex h-11 items-center rounded-md bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            Browse All Pieces
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {activeProducts.map((product: any) => {
            const rawKey = product.images?.[0]?.storageKey || product.images?.[0]?.url;
            const primaryImage = rawKey
              ? (rawKey.startsWith("http") || rawKey.startsWith("/") ? rawKey : `/uploads/${rawKey}`)
              : null;
            const basePrice = Number(product.basePrice);
            const salePrice = product.salePrice ? Number(product.salePrice) : null;
            const hasSale = salePrice !== null && salePrice < basePrice;
            const displayPrice = hasSale && salePrice !== null ? salePrice : basePrice;
            const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stockQuantity, 0);
            const isCustom = product.productType === "CUSTOM_MADE";

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm transition-all hover:border-thaagai-wine/50 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-thaagai-sand/30 dark:bg-thaagai-sandDark/20">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.images?.[0]?.altText || `${product.name} - Handcrafted ${category.name}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-thaagai-ink/40">
                      {product.name}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
                    {isCustom ? (
                      <span className="rounded bg-amber-800 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm">
                        Bespoke
                      </span>
                    ) : product.featured ? (
                      <span className="rounded bg-thaagai-wine px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm">
                        Featured
                      </span>
                    ) : null}
                    {hasSale && (
                      <span className="rounded bg-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                        Sale
                      </span>
                    )}
                  </div>

                  {!isCustom && totalStock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="rounded bg-white/90 px-3 py-1 text-xs font-bold text-thaagai-ink">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-gold">
                    {category.name}
                  </span>
                  <h3 className="mt-1 line-clamp-1 font-serif text-base font-bold text-thaagai-ink transition-colors group-hover:text-thaagai-wine dark:text-white">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-sans text-sm font-bold text-thaagai-wine">
                      {isCustom ? "Starting from " : ""}₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    {hasSale && (
                      <span className="font-sans text-xs text-thaagai-ink/40 line-through">
                        ₹{basePrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                    {isCustom ? "Custom Tailored Fit" : totalStock > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
