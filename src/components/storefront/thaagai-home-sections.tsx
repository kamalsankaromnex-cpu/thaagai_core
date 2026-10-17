import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Scissors,
  Flower2,
} from "lucide-react";

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  basePrice?: number | string | any;
  salePrice?: number | string | null | any;
  productType?: string;
  shortDescription?: string | null;
  images?: Array<{ url?: string; storageKey?: string }>;
  categories?: Array<{ category?: { name?: string; slug?: string } }>;
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface ThaagaiHomeSectionsProps {
  categories?: BackendCategory[];
  featuredProducts?: BackendProduct[];
}

const DEFAULT_CATEGORIES = [
  {
    title: "Neck Designs",
    subtitle: "The detail that defines your style",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=neck",
  },
  {
    title: "Sleeve Designs",
    subtitle: "Small details, beautiful statements",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=sleeve",
  },
  {
    title: "Back-Neck Designs",
    subtitle: "A beautiful view from every angle",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=back",
  },
  {
    title: "Fabric & Prints",
    subtitle: "Find the fabric that feels like you",
    image:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=700&q=85",
    href: "/category/unstitched-materials",
  },
];

export function ThaagaiHomeSections({
  categories: _propCategories,
  featuredProducts = [],
}: ThaagaiHomeSectionsProps) {
  // Map real backend products into The Thaagai Edit trending cards with graceful fallback
  const displayTrending =
    featuredProducts && featuredProducts.length > 0
      ? featuredProducts.slice(0, 4).map((prod) => {
          const rawKey = prod.images?.[0]?.storageKey || prod.images?.[0]?.url;
          const primaryImage = rawKey
            ? rawKey.startsWith("http") || rawKey.startsWith("/")
              ? rawKey
              : `/uploads/${rawKey}`
            : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85";
          const catName = prod.categories?.[0]?.category?.name;
          const typeLabel = catName
            ? catName
            : prod.productType === "CUSTOM_MADE"
            ? "Bespoke • Tailored"
            : "Ready-to-Wear • Pure Handloom";
          const price = Number(prod.salePrice || prod.basePrice || 0);

          return {
            id: prod.id,
            name: prod.name,
            type: typeLabel,
            price,
            image: primaryImage,
            href: `/product/${prod.slug}`,
          };
        })
      : [
          {
            id: "trend-1",
            name: "The Everyday Classic",
            type: "Minimal • Timeless",
            price: 2299,
            image:
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85",
            href: "/shop",
          },
          {
            id: "trend-2",
            name: "Blush Garden",
            type: "Floral • Feminine",
            price: 3499,
            image:
              "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=85",
            href: "/shop",
          },
          {
            id: "trend-3",
            name: "The Festive Edit",
            type: "Elegant • Occasion",
            price: 4200,
            image:
              "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=700&q=85",
            href: "/shop",
          },
          {
            id: "trend-4",
            name: "Modern Heritage",
            type: "Traditional • Contemporary",
            price: 4850,
            image:
              "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=700&q=85",
            href: "/shop",
          },
        ];

  return (
    <div className="overflow-hidden bg-[#fffdfa] text-[#492326]">
      {/* 1. PROMISE — BRAND PROMISE */}
      <section className="px-5 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-9 md:grid-cols-4">
          {[
            {
              icon: Flower2,
              title: "Inspired Designs",
              text: "Ideas for every style",
            },
            {
              icon: Scissors,
              title: "Every Detail",
              text: "Designed with care",
            },
            {
              icon: Sparkles,
              title: "Your Creativity",
              text: "Make it your own",
            },
            {
              icon: Heart,
              title: "Made for You",
              text: "Express your identity",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group flex flex-col items-center px-3 text-center transition-transform duration-300 hover:-translate-y-1 md:border-r md:border-[#eee2da] last:md:border-r-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8efe9] text-[#a24d50] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#f2e1d7] group-hover:rotate-6">
                <Icon
                  size={26}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mt-3 font-serif text-lg text-[#492326] transition-colors group-hover:text-[#843640]">{title}</h3>
              <p className="mt-1 text-sm text-[#82716e]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LIST PRODUCT — THE THAAGAI EDIT (REAL BACKEND PRODUCTS) */}
      <section
        id="trending"
        className="px-5 py-16 sm:px-10 lg:px-16 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#aa5b51]">
                Curated for You
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl text-[#492326]">
                The Thaagai Edit
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-2 text-sm font-medium text-[#843640] transition-all hover:translate-x-1 hover:underline sm:inline-flex"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {displayTrending.map((item) => (
              <Link href={item.href} key={item.id} className="card-lift group flex flex-col justify-between rounded-2xl p-2 transition-all hover:bg-stone-50/50">
                <div>
                  <div className="relative overflow-hidden rounded-2xl bg-[#f3e7df]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={600}
                      height={800}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                    <span
                      aria-label="Wishlist"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#843640] shadow-sm backdrop-blur-xs transition-all duration-300 tap-bounce hover:scale-110 active:scale-90"
                    >
                      <Heart size={17} strokeWidth={1.5} className="transition-colors hover:fill-rose-500 hover:text-rose-500" />
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-lg text-[#492326] group-hover:text-[#843640] transition line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#82716e] sm:text-sm">
                    {item.type} {item.price > 0 && <span className="font-semibold text-[#843640]"> • ₹{item.price.toLocaleString("en-IN")}</span>}
                  </p>
                </div>

                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#9a4a4d] transition-all duration-300 group-hover:translate-x-1.5">
                  Discover Piece <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EXPLORE BY DETAIL — SHOP BY CATEGORY / EXPLORE BY DESIGN */}
      <section id="categories" className="px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#aa5b51]">
                Find Your Inspiration
              </p>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl text-[#492326]">
                Explore by Design
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-[#82716e]">
              From statement necklines to intricate details,
              find the little things that make your kurti special.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {DEFAULT_CATEGORIES.map((item) => (
              <Link
                href={item.href}
                key={item.title}
                className="card-lift group rounded-2xl p-2 transition-all hover:bg-stone-50/50"
              >
                <div className="overflow-hidden rounded-2xl bg-[#f4e9e2] shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={700}
                    height={875}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex items-start justify-between gap-2 pt-4">
                  <div>
                    <h3 className="font-serif text-lg text-[#492326] group-hover:text-[#843640] transition-colors sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#82716e] sm:text-sm">
                      {item.subtitle}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 shrink-0 text-[#a24d50] transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CUSTOM — CUSTOM KURTI FEATURE */}
      <section
        id="custom-studio"
        className="bg-[#f5e9e1] px-5 py-16 sm:px-10 lg:px-16 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a24d50]">
              Your Design, Your Rules
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#492326] sm:text-5xl">
              Create a Kurti That&apos;s Uniquely Yours
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#796966]">
              Your imagination, your fabric, your favourite details.
              Bring your ideas together and create a style that
              feels personal from the very first stitch.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Choose your fabric and colour",
                "Customise neckline and sleeves",
                "Explore the back design",
                "Preview your personalised style",
              ].map((step, index) => (
                <div key={step} className="group/step flex items-center gap-3 transition-transform duration-200 hover:translate-x-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c38a7c] font-serif text-sm text-[#492326] transition-all duration-300 group-hover/step:scale-110 group-hover/step:bg-[#843640] group-hover/step:text-white group-hover/step:border-[#843640]">
                    0{index + 1}
                  </span>
                  <p className="text-sm text-[#654d49] transition-colors group-hover/step:text-[#492326] font-medium">{step}</p>
                </div>
              ))}
            </div>

            <Link
              href="/custom-made"
              className="shimmer-sweep tap-bounce mt-9 inline-flex items-center gap-3 rounded-full bg-[#843640] px-8 py-4 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-[#65232d] hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Enter Custom Studio <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85"
                alt="Indian ethnic fashion inspiration"
                width={1000}
                height={1250}
                loading="lazy"
                className="aspect-[4/5] max-h-[600px] w-full rounded-[28px] object-cover shadow-sm"
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/85 p-4 backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-[#a24d50]">
                  Your personal style
                </p>
                <p className="mt-1 font-serif text-xl text-[#492326]">
                  Every detail, chosen by you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STORY — OUR STORY */}
      <section
        id="our-story"
        className="bg-[#fcf6f1] px-5 py-16 sm:px-10 lg:px-16 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-[28px]">
            <Image
              src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=85"
              alt="Textile craftsmanship and fashion details"
              width={1000}
              height={800}
              loading="lazy"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#aa5b51]">
              The Meaning of Thaagai
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#492326] sm:text-5xl">
              Every Thread Has a Story
            </h2>

            <p className="mt-5 leading-8 text-[#796966]">
              A thread connects fabric, craft, creativity, and
              personal expression. Thaagai celebrates the beauty
              of Indian clothing and the details that make every
              design special.
            </p>

            <p className="mt-4 leading-8 text-[#796966]">
              We believe finding your next kurti design should
              feel inspiring, effortless, and entirely your own.
            </p>

            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 border-b border-[#a24d50] pb-2 text-sm font-medium text-[#492326] transition hover:text-[#843640] hover:border-[#843640]"
            >
              Discover Our Story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ThaagaiHomeSections;
