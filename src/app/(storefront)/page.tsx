import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles, Scissors, Heart, Layers, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { KolamPattern, LotusMotif, HeritageBadge } from "@/components/storefront/tamil-motifs";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { PromotionalBanner } from "@/components/storefront/promotional-banner";
import { getSiteUrl, generateOrganizationJsonLd, generateWebSiteJsonLd, SITE_CONFIG } from "@/lib/seo";

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

// Rich metadata for the 6 dedicated Churidar categories
const CATEGORY_META: Record<string, { badge: string; defaultImage: string; description: string }> = {
  "straight-cut-churidars": {
        badge: "Classic Fit",
    defaultImage: "/categories/straight-cut.svg",
    description: "Classic straight-cut kurtas paired with matching gathered churidars and elegant dupattas.",
  },
  "anarkali-churidars": {
        badge: "Festive Flair",
    defaultImage: "/categories/anarkali.svg",
    description: "Flowing multi-kali flared anarkalis accompanied by gathered churidars and rich dupattas.",
  },
  "cotton-churidars": {
        badge: "Pure Cotton",
    defaultImage: "/categories/cotton.svg",
    description: "Breathable pure Chettinad and mulmul cotton churidar sets for effortless everyday elegance.",
  },
  "silk-churidars": {
        badge: "Royal Silk",
    defaultImage: "/categories/silk.svg",
    description: "Opulent Kanchipuram silk, Chanderi, and raw silk celebration churidar suits with gold zari.",
  },
  "custom-churidars": {
        badge: "Bespoke Atelier",
    defaultImage: "/categories/custom.svg",
    description: "Made-to-measure churidar sets drafted to your exact height, bust, waist, and pant preferences.",
  },
  "unstitched-materials": {
        badge: "3-Piece Material",
    defaultImage: "/categories/unstitched.svg",
    description: "Authentic 3-piece handloom fabric sets (top, churidar bottom, dupatta) for personalized stitching.",
  },
};

const CRAFTSMANSHIP_PILLARS = [
  {
    icon: Scissors,
    title: "Master Cutting & Fit",
        description: "Every kurta and churidar bottom is drafted for seamless posture and graceful drape, with generous 1.5-inch inner alteration margins.",
  },
  {
    icon: Layers,
    title: "Custom Bottom Silhouettes",
        description: "Choose between traditional gathered churidars, modern straight cigarette pants, roomier salwars, or wide palazzos.",
  },
  {
    icon: Sparkles,
    title: "Handloom & Silk Heritage",
        description: "Directly sourced handwoven Chettinad cottons, breathable mulmuls, and rich Kanchipuram silk borders woven by Tamil artisan clusters.",
  },
  {
    icon: Heart,
    title: "Pure Fabrics & Comfort",
        description: "100% natural, breathable fibers and soft cotton linings selected for sublime comfort in tropical Indian weather.",
  },
];

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

  // 2. Fetch categories with imageUrl from DB
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
  }

  // 3. Fetch real featured products from DB with variants and categories
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
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching homepage products:", err);
  }

  // Prepare display categories merging DB data with rich Tamil metadata
  const displayCategories = categories.length > 0
    ? categories.map((cat) => {
        const meta = CATEGORY_META[cat.slug];
        return {
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
                    badge: meta?.badge || "Churidar",
          description: cat.description || meta?.description || "",
          imageUrl: cat.imageUrl || meta?.defaultImage || "/categories/straight-cut.svg",
          href: cat.slug === "custom-churidars" ? "/custom-made" : `/category/${cat.slug}`,
        };
      })
    : Object.entries(CATEGORY_META).map(([slug, meta]) => ({
        id: slug,
        slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                badge: meta.badge,
        description: meta.description,
        imageUrl: meta.defaultImage,
        href: slug === "custom-churidars" ? "/custom-made" : `/category/${slug}`,
      }));

  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className="flex flex-col gap-12 sm:gap-16 py-3 sm:py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* 1. Hero Carousel */}
      <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : undefined} />

      {/* 2. Ready-to-Wear Showcase */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-thaagai-line bg-gradient-to-r from-thaagai-maroon/5 via-[#FAF7F2] to-thaagai-gold/10 p-8 sm:p-12 dark:bg-thaagai-cardDark">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-thaagai-wine/10 px-3 py-1 text-xs font-semibold text-thaagai-wine">
                Standard Sizes & Immediate Dispatch
              </span>
              <h2 className="mt-3 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
                Ready-to-Wear Churidar Sets
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                Explore stitched handloom cotton straight churidars, festive anarkali suits, and 3-piece unstitched materials ready for immediate dispatch across India.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-wine" /> Verified Stock
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-wine" /> S to XXL Standard Sizes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-wine" /> 3-7 Days Delivery Across India
                </span>
              </div>
            </div>
            <div>
              <Link
                href="/shop?type=READY_TO_WEAR"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-thaagai-wine px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover"
              >
                Browse Ready-to-Wear <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Custom-Made Atelier Spotlight */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border-2 border-thaagai-gold/60 bg-[#5E1028] p-8 text-white sm:p-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-thaagai-gold/60 bg-white/10 px-3.5 py-1 text-xs font-semibold text-thaagai-gold">
                <Scissors className="h-3.5 w-3.5" />
                <span>Bespoke Churidar Atelier</span>
              </div>
              <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Bespoke Made-to-Measure Churidars
              </h2>
              <p className="text-sm leading-relaxed text-white/90">
                Experience the luxury of churidars crafted to your exact proportions. Choose your kurta silhouette, neckline, sleeve cut, bottom trouser style (gathered churidar, cigarette pants, salwar, or palazzo), and provide your measurements for an impeccable fit.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-gold" />
                  <span>Kanchipuram silk, Chettinad cotton, raw silk, and mulmul fabrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-gold" />
                  <span>Choose classic gathered churidar, cigarette pants, or salwars</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-thaagai-gold" />
                  <span>Live price adjustments & direct boutique tailor WhatsApp consultation</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/custom-made"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-thaagai-gold px-7 text-sm font-bold text-thaagai-wine shadow-md transition-all hover:bg-amber-300"
                >
                  <Sparkles className="h-4 w-4" />
                  Tailor Your Custom Churidar
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-thaagai-gold/40 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h4 className="font-serif text-lg font-bold text-thaagai-gold">
                How Custom Churidar Tailoring Works:
              </h4>
              <ol className="mt-4 space-y-4 text-xs text-white/80">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thaagai-gold font-bold text-thaagai-wine">1</span>
                  <div>
                    <strong className="block text-white font-medium">Select Styles & Bottom Cut</strong>
                    Choose straight cut or anarkali, neckline, sleeve cut, and gathered churidar vs straight pant.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thaagai-gold font-bold text-thaagai-wine">2</span>
                  <div>
                    <strong className="block text-white font-medium">Enter Exact Measurements</strong>
                    Provide kurta length, bust, waist, hips, bottom length, and ankle round with our guide.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-thaagai-gold font-bold text-thaagai-wine">3</span>
                  <div>
                    <strong className="block text-white font-medium">Tailor WhatsApp Review</strong>
                    Our master tailor reviews your customization snapshot on WhatsApp before cutting the fabric.
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Image Cards (6 Dedicated Churidar Categories) */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-thaagai-line pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
              Curated Churidar Collections
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
              Shop by Style & Fabric
            </h2>
          </div>
          <p className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Straight cut, anarkali, cotton dailywear, festive silks, and bespoke tailoring
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              href={cat.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-thaagai-line bg-[#FAF7F2] transition-all duration-300 hover:-translate-y-1 hover:border-thaagai-gold hover:shadow-lg dark:bg-thaagai-cardDark"
            >
              {/* Category Image Header */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-thaagai-sand/40">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-thaagai-maroon shadow-sm backdrop-blur-sm dark:bg-black/70 dark:text-thaagai-gold">
                  {cat.badge}
                </span>
              </div>

              {/* Category Content */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-thaagai-wine group-hover:text-thaagai-maroon">
                      {cat.name}
                    </h3>
                    <LotusMotif className="h-4 w-4 text-thaagai-gold/60 transition-transform group-hover:scale-125" />
                  </div>
                  
                  <p className="mt-2.5 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-thaagai-wine group-hover:underline">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Festive Promotional Banner */}
      <PromotionalBanner
        badge="Special Festive Curation"
        title="Royal Silk & Festive Anarkali Collections"
        description="Handcrafted pure silk anarkalis and rich Chanderi gathered suits woven with traditional Tamil gold temple motifs. Perfect for weddings, temple festivities, and special celebrations."
        ctaLabel="Explore Festive Silks"
        ctaUrl="/shop?category=silk-churidars"
        imageUrl="/banners/festive-promo.svg"
        altText="Festive Silk and Anarkali Churidar Collection"
      />

      {/* 6. Signature Thaagai Churidars (Featured Products from DB) */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-thaagai-line pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
              Featured Creations
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
              Signature Thaagai Churidars
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex h-11 items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
          >
            Explore all collection <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((prod) => {
            const isCustom = prod.productType === "CUSTOM_MADE";
            const catName = prod.categories?.[0]?.category?.name || (isCustom ? "Custom Churidar" : "Churidar Set");
            const rawKey = prod.images?.[0]?.storageKey || prod.images?.[0]?.url;
            const primaryImage = rawKey
              ? (rawKey.startsWith("http") || rawKey.startsWith("/") ? rawKey : `/uploads/${rawKey}`)
              : null;
            const basePrice = Number(prod.basePrice || 0);
            const salePrice = prod.salePrice ? Number(prod.salePrice) : null;
            const hasSale = salePrice !== null && salePrice < basePrice;
            const displayPrice = hasSale && salePrice !== null ? salePrice : basePrice;

            return (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-2xl border border-thaagai-line bg-white p-5 shadow-sm transition-all duration-300 hover:border-thaagai-gold hover:shadow-md dark:bg-thaagai-cardDark"
              >
                <div>
                  {/* Visual card header */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-thaagai-line/60 bg-gradient-to-b from-[#F7F2EB] to-[#FAF7F2] dark:from-thaagai-cardDark dark:to-thaagai-sandDark/40">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={prod.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4 text-center">
                        <LotusMotif className="h-10 w-10 text-thaagai-gold/50" />
                        <span className="absolute bottom-3 text-[11px] font-medium text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                          {isCustom ? "Bespoke Churidar" : "Handloom Churidar"}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCustom
                          ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200"
                      }`}
                    >
                      {isCustom ? "Custom-Made" : "Ready-to-Wear"}
                    </span>
                    {hasSale && (
                      <span className="absolute left-3 top-3 z-10 rounded bg-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                        Sale
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-thaagai-gold">
                      {catName}
                    </span>
                    <h3 className="mt-1 font-serif text-lg font-bold text-thaagai-wine group-hover:text-thaagai-maroon">
                      {prod.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {prod.shortDescription || prod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-thaagai-line/60 pt-4">
                  <div>
                    <span className="text-[11px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50 block">
                      {isCustom ? "Starting from" : hasSale ? "Special Offer" : "Price"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-thaagai-wine">
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-thaagai-ink/40 line-through">
                          ₹{basePrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/product/${prod.slug}`}
                    className="flex h-11 min-w-[44px] items-center justify-center gap-1.5 rounded-md bg-thaagai-wine px-4 text-xs font-semibold text-white transition-colors hover:bg-thaagai-wineHover"
                  >
                    {isCustom ? (
                      <>
                        <Scissors className="h-3.5 w-3.5" /> Customize
                      </>
                    ) : (
                      "View Piece"
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Customer Trust & 3-Step WhatsApp Ordering */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-thaagai-line bg-[#F7F2EB] p-8 sm:p-12 dark:bg-thaagai-cardDark">
          <div className="text-center">
            <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
              Transparent & Verified
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
              How Ordering with Thaagai Works
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Zero automated bot surprises. Every order is reviewed and verified by our boutique seller before payment.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-thaagai-sandDark/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-wine text-white">
                <span className="font-serif font-bold text-base">1</span>
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-thaagai-wine">
                Select Your Churidars
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Choose ready-to-wear sizes or configure custom fabrics, necklines, bottom cut, and measurements.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-thaagai-sandDark/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-thaagai-wine">
                WhatsApp Verification
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                One click generates your order request with exact customization breakdown directly into our seller chat.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-thaagai-sandDark/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-gold text-thaagai-wine">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-thaagai-wine">
                Boutique Confirmation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Seller confirms fabric availability, PIN-code delivery timeline, and collects payment securely.
              </p>
            </div>
          </div>

          {/* Quick Concierge Banner */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-thaagai-gold/60 bg-white/80 p-5 text-center sm:flex-row sm:text-left dark:bg-thaagai-sandDark/40">
            <div>
              <h4 className="font-serif text-sm font-bold text-thaagai-wine">
                Need tailoring guidance or custom churidar measurement assistance?
              </h4>
              <p className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Our master tailor is available for one-on-one WhatsApp consultation.
              </p>
            </div>
            <a
              href="https://wa.me/919876543210?text=Hello%20Thaagai,%20I%20would%20like%20guidance%20on%20churidar%20sizing%20and%20tailoring."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 8. Brand Story & Craftsmanship Pillars */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-thaagai-line bg-[#FAF7F2] p-8 sm:p-14 dark:bg-thaagai-cardDark">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <HeritageBadge text="THAAGAI · Heritage Churidar Atelier" />
            <h2 className="font-serif text-3xl font-bold text-thaagai-wine sm:text-4xl">
              Rooted in Tamil Heritage, Refined for Modern Living
            </h2>
            <p className="text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
              At <strong className="text-thaagai-maroon font-semibold">Thaagai</strong>, our name evokes poise, grace, and inner beauty. Born out of deep reverence for South India’s handloom master-weavers and bespoke craftsmanship, our boutique specializes exclusively in exquisite churidar suits.
            </p>
            <p className="text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Every ready-to-wear set and bespoke made-to-measure churidar is conceived as a slow-fashion keepsake. We honor authentic handlooms, fair artisan remuneration, and individualized customer attention.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-thaagai-wine px-5 text-xs font-semibold text-thaagai-wine transition-colors hover:bg-thaagai-wine hover:text-white"
              >
                Read Our Full Heritage Story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Kolam Divider */}
          <div className="my-10 flex justify-center">
            <KolamPattern className="w-full max-w-md h-6 text-thaagai-gold/50" />
          </div>

          {/* 4 Craftsmanship Pillars */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CRAFTSMANSHIP_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center rounded-2xl border border-thaagai-line bg-white p-6 text-center transition-all hover:border-thaagai-gold dark:bg-thaagai-sandDark/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-maroon text-thaagai-gold shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-base font-bold text-thaagai-wine">
                    {p.title}
                  </h3>
                  
                  <p className="mt-3 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
