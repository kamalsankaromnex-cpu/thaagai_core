import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Sparkles, SlidersHorizontal, ArrowUpDown, Tag } from "lucide-react";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { PriceDisplay } from "@/components/storefront/price-display";
import { getSiteUrl, generateBreadcrumbJsonLd, generateCollectionJsonLd, SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    filter?: string;
    type?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = getSiteUrl();
  const q = params.q?.trim();
  const hasFilters = Boolean(params.sort || params.filter || params.type || params.category);

  let title = `Shop Handloom Churidars, Kurtis & Sarees | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`;
  let description = "Browse our complete collection of handcrafted Tamil churidar sets, pure Chettinad cotton suits, festive silk anarkalis, and unstitched materials.";

  if (q) {
    title = `Search results for "${q}" | Shop | ${SITE_CONFIG.brandName}`;
    description = `Explore search results for "${q}" at ${SITE_CONFIG.brandName}.`;
  } else if (params.category) {
    const catName = params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${catName} | Shop | ${SITE_CONFIG.brandName}`;
  }

  // Parameter-aware indexation: If search query or sort/filter combinations exist,
  // set robots noindex to prevent crawl bloat and duplicate indexing while keeping link equity flowing.
  const isFilteredOrSearch = Boolean(q || hasFilters);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/shop`,
    },
    robots: isFilteredOrSearch
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/shop`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const categorySlug = params.category?.trim() || "";
  const typeFilter = params.type?.trim() || "";
  const filter = params.filter?.trim() || "";
  const isOffers = filter === "offers" || filter === "sale";
  const isNewArrivals = params.sort?.trim() === "newest" || filter === "new";
  const sort = params.sort?.trim() || (isNewArrivals ? "newest" : "featured");

  // Determine Prisma ordering
  let orderBy: any = [{ featured: "desc" }, { createdAt: "desc" }];
  if (sort === "price_asc") {
    orderBy = [{ basePrice: "asc" }];
  } else if (sort === "price_desc") {
    orderBy = [{ basePrice: "desc" }];
  } else if (sort === "newest") {
    orderBy = [{ createdAt: "desc" }];
  }

  // Where filter
  const where: any = {
    status: "ACTIVE",
  };

  if (isOffers) {
    where.OR = [
      { salePrice: { not: null } },
      { featured: true },
    ];
  }

  if (typeFilter === "READY_TO_WEAR" || typeFilter === "CUSTOM_MADE") {
    where.productType = typeFilter;
  }

  if (categorySlug) {
    where.categories = {
      some: {
        category: {
          OR: [
            { slug: categorySlug, active: true },
            { parent: { slug: categorySlug, active: true } },
          ],
        },
      },
    };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  // Query database with fallback
  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        include: {
          categories: {
            include: {
              category: { select: { name: true, slug: true } },
            },
          },
          images: { orderBy: { sortOrder: "asc" } },
          variants: { where: { active: true } },
        },
      }),
      db.category.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (err) {
    console.error("Error fetching shop products:", err);
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ]);

  const collectionJsonLd = generateCollectionJsonLd({
    categoryName: categorySlug ? (categories.find((c) => c.slug === categorySlug)?.name || "Catalog") : "All Churidars & Ensembles",
    categoryDescription: "Explore our complete collection of handcrafted churidars and bespoke tailoring sets.",
    url: "/shop",
    products: products.slice(0, 20).map((p) => ({
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
      {/* Header & Title */}
      <div className="flex flex-col gap-2 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
              {isOffers
                ? "Special Offers & Festive Discounts"
                : isNewArrivals
                ? "New Arrivals"
                : categorySlug
                ? `${categories.find((c) => c.slug === categorySlug)?.name || "Catalog"}`
                : "Shop All"}
            </span>
            {isOffers && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Tag className="h-3 w-3" /> Festive Offers
              </span>
            )}
            {isNewArrivals && !isOffers && (
              <span className="inline-flex items-center gap-1 rounded-full bg-thaagai-wine/10 px-2.5 py-0.5 text-xs font-semibold text-thaagai-wine">
                <Sparkles className="h-3 w-3" /> Fresh In
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            {q
              ? `Showing results for "${q}" (${products.length} pieces found)`
              : isOffers
              ? "Discover handcrafted churidars and custom tailoring sets with special seasonal prices"
              : isNewArrivals
              ? "Latest handcrafted churidars and bespoke tailoring sets added to the collection"
              : "Explore our complete collection of handcrafted churidars and bespoke tailoring sets."}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <ArrowUpDown className="h-4 w-4 text-thaagai-ink/50" />
          <div className="flex flex-wrap gap-1 text-xs">
            <Link
              href={`/shop?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(q ? { q } : {}), sort: "featured" }).toString()}`}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                sort === "featured"
                  ? "bg-thaagai-wine text-white"
                  : "bg-thaagai-sand/60 text-thaagai-ink hover:text-thaagai-wine dark:bg-thaagai-sandDark"
              }`}
            >
              Featured
            </Link>
            <Link
              href={`/shop?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(q ? { q } : {}), sort: "newest" }).toString()}`}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                sort === "newest"
                  ? "bg-thaagai-wine text-white"
                  : "bg-thaagai-sand/60 text-thaagai-ink hover:text-thaagai-wine dark:bg-thaagai-sandDark"
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/shop?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(q ? { q } : {}), sort: "price_asc" }).toString()}`}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                sort === "price_asc"
                  ? "bg-thaagai-wine text-white"
                  : "bg-thaagai-sand/60 text-thaagai-ink hover:text-thaagai-wine dark:bg-thaagai-sandDark"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/shop?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(q ? { q } : {}), sort: "price_desc" }).toString()}`}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                sort === "price_desc"
                  ? "bg-thaagai-wine text-white"
                  : "bg-thaagai-sand/60 text-thaagai-ink hover:text-thaagai-wine dark:bg-thaagai-sandDark"
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {/* Category & Type Pills Filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <div className="flex rounded-full border border-thaagai-line bg-white p-0.5 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
          <Link
            href={`/shop?${new URLSearchParams({ ...(categorySlug ? { category: categorySlug } : {}), ...(sort !== "featured" ? { sort } : {}), ...(q ? { q } : {}) }).toString()}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              !typeFilter
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
            }`}
          >
            All Types
          </Link>
          <Link
            href={`/shop?${new URLSearchParams({ type: "READY_TO_WEAR", ...(categorySlug ? { category: categorySlug } : {}), ...(sort !== "featured" ? { sort } : {}), ...(q ? { q } : {}) }).toString()}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === "READY_TO_WEAR"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
            }`}
          >
            Ready-to-Wear
          </Link>
          <Link
            href={`/shop?${new URLSearchParams({ type: "CUSTOM_MADE", ...(categorySlug ? { category: categorySlug } : {}), ...(sort !== "featured" ? { sort } : {}), ...(q ? { q } : {}) }).toString()}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              typeFilter === "CUSTOM_MADE"
                ? "bg-thaagai-wine text-white shadow-xs"
                : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
            }`}
          >
            Custom-Made
          </Link>
        </div>

        <span className="h-4 w-px bg-thaagai-line mx-1" />

        <Link
          href={`/shop?${new URLSearchParams({ ...(typeFilter ? { type: typeFilter } : {}), ...(sort !== "featured" ? { sort } : {}), ...(q ? { q } : {}) }).toString()}`}
          className={`h-8 min-h-[32px] flex items-center rounded-full px-3.5 text-xs font-semibold transition-all ${
            !categorySlug
              ? "bg-thaagai-sand text-thaagai-wine border border-thaagai-gold/60"
              : "border border-thaagai-line bg-white text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          }`}
        >
          All Categories
        </Link>
        {categories.map((c) => {
          const active = categorySlug === c.slug;
          return (
            <Link
              key={c.id}
              href={`/shop?${new URLSearchParams({ category: c.slug, ...(typeFilter ? { type: typeFilter } : {}), ...(sort !== "featured" ? { sort } : {}), ...(q ? { q } : {}) }).toString()}`}
              className={`h-8 min-h-[32px] flex items-center rounded-full px-3.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-thaagai-sand text-thaagai-wine border border-thaagai-gold/60"
                  : "border border-thaagai-line bg-white text-thaagai-ink hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-thaagai-line p-12 text-center">
          <p className="font-brand text-2xl font-bold text-thaagai-wine">No Pieces Found</p>
          <p className="mt-2 text-xs text-thaagai-ink/70">
            {q ? `We could not find anything matching "${q}". Try clearing filters.` : "No items match your selected filters."}
          </p>
          <Link
            href="/shop"
            className="mt-6 flex h-11 min-h-[44px] items-center rounded-md bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            Clear All Filters
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const rawKey = product.images?.[0]?.storageKey || product.images?.[0]?.url;
            const primaryImage = rawKey
              ? (rawKey.startsWith("http") || rawKey.startsWith("/") ? rawKey : `/uploads/${rawKey}`)
              : null;
            const basePrice = Number(product.basePrice);
            const salePrice = product.salePrice ? Number(product.salePrice) : null;
            const hasSale = salePrice !== null && salePrice < basePrice;
            const displayPrice = hasSale && salePrice !== null ? salePrice : basePrice;
            const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stockQuantity, 0);
            const categoryLabel = product.categories?.[0]?.category?.name || product.productType || "Collection";
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
                      alt={product.images?.[0]?.altText || product.name}
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

                  {/* Wishlist Button */}
                  <div className="absolute right-2.5 top-2.5 z-10">
                    <WishlistButton
                      item={{
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        image: primaryImage,
                        basePrice,
                        salePrice,
                        productType: product.productType,
                        categoryName: categoryLabel,
                      }}
                      size="sm"
                    />
                  </div>

                  {totalStock <= 0 && (
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
                    {categoryLabel}
                  </span>
                  <h3 className="mt-1 line-clamp-1 font-serif text-base font-bold text-thaagai-ink transition-colors group-hover:text-thaagai-wine dark:text-white">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <PriceDisplay
                      amount={displayPrice}
                      className="font-sans text-sm font-bold text-thaagai-wine"
                    />
                    {hasSale && (
                      <PriceDisplay
                        amount={basePrice}
                        className="font-sans text-xs text-thaagai-ink/40 line-through"
                      />
                    )}
                  </div>

                  <p className="mt-2 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                    {product.variants.length > 1
                      ? `${product.variants.length} options available`
                      : totalStock > 0
                      ? "In Stock"
                      : "Out of Stock"}
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
