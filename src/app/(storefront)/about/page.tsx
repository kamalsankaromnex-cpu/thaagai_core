import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Flower2,
  Heart,
  Sparkles,
  Scissors,
  Gem,
} from "lucide-react";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `About Us | ${SITE_CONFIG.brandName} - Where Every Thread Tells a Story`,
  description:
    "Discover the story of THAAGAI. Celebrating the beauty of Indian ethnic wear, the art of stitching, bespoke made-to-measure tailoring, and the individuality of every woman.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: `About Our Heritage & Craftsmanship | ${SITE_CONFIG.brandName}`,
    description:
      "Thaagai celebrates the beauty of Indian ethnic wear, the art of stitching, and the individuality of every woman. Every thread, a touch of you.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_CONFIG.brandName}`,
    description:
      "Thaagai celebrates the beauty of Indian ethnic wear, the art of stitching, and the individuality of every woman. Every thread, a touch of you.",
  },
};

const categories = [
  {
    title: "Kurti Neck Designs",
    description:
      "Explore elegant necklines, from simple cuts to decorative patterns.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=neck",
  },
  {
    title: "Sleeve Designs",
    description:
      "Discover sleeve patterns that bring character to every kurti.",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=sleeve",
  },
  {
    title: "Back-Neck Patterns",
    description:
      "Find distinctive back designs and beautiful finishing details.",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=700&q=85",
    href: "/shop?q=back",
  },
  {
    title: "Design Collections",
    description:
      "Browse curated designs for different occasions and moods.",
    image:
      "https://images.unsplash.com/photo-1610189012906-4c6b3a7b4a8e?auto=format&fit=crop&w=700&q=85",
    href: "/shop",
  },
  {
    title: "Traditional & Modern",
    description:
      "Explore timeless Indian details with a contemporary touch.",
    image:
      "https://images.unsplash.com/photo-1610030469668-8e9f641a8a4e?auto=format&fit=crop&w=700&q=85",
    href: "/category/churidars",
  },
];

const features = [
  { icon: Flower2, title: "Inspiring Designs", text: "Endless possibilities" },
  { icon: Scissors, title: "Every Style", text: "Traditional to modern" },
  { icon: Gem, title: "Thoughtful Details", text: "Every stitch matters" },
  { icon: Heart, title: "Made for You", text: "Celebrate your style" },
];

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${siteUrl}/about#webpage`,
    url: `${siteUrl}/about`,
    name: `About ${SITE_CONFIG.brandName}`,
    description: SITE_CONFIG.description,
    mainEntity: {
      "@type": "Organization",
      name: SITE_CONFIG.brandName,
      alternateName: SITE_CONFIG.tamilName,
      url: siteUrl,
    },
  };

  return (
    <div className="overflow-hidden bg-[#fffdfa] text-[#4a2023]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />

      {/* 1. HERO */}
      <section className="relative min-h-[590px] lg:min-h-[650px]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90"
            alt="Indian ethnic fashion inspiration"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#f8eee5]/95 via-[#f8eee5]/80 to-transparent" />

        <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-6 py-20 sm:px-10 lg:min-h-[650px] lg:px-14">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-[#9a4d48]">
              Where every thread tells a story
            </p>

            <h1 className="font-serif text-5xl leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Kurti Patterns
              <br />
              and Designs
              <br />
              <span className="italic text-[#9b5151]">for Every Woman</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#655454] sm:text-lg">
              Discover beautiful neckline patterns, sleeve designs,
              back-neck styles, and curated kurti collections that
              inspire your next outfit.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#designs"
                className="inline-flex items-center gap-3 rounded-full bg-[#842f3b] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#65232d]"
              >
                Explore Designs <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-[#b45b50] bg-white/70 px-6 py-3.5 text-sm font-medium text-[#842f3b] backdrop-blur-xs transition hover:bg-white"
              >
                View Shop
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-2">
              <span className="h-2.5 w-8 rounded-full bg-[#842f3b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d9bdb0]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d9bdb0]" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND VALUES */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-10">
        <div className="grid grid-cols-2 gap-5 rounded-3xl bg-[#f8f0eb] px-4 py-8 md:grid-cols-4 md:gap-0 md:px-2">
          {features.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className={`flex flex-col items-center px-3 text-center ${
                index !== 0 ? "md:border-l md:border-[#eadbd3]" : ""
              }`}
            >
              <Icon size={30} strokeWidth={1.4} className="text-[#9b414b]" />
              <h3 className="mt-3 font-serif text-lg text-[#4a2023]">{title}</h3>
              <p className="mt-1 text-sm text-[#796b68]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:px-14 lg:py-24">
        <div className="relative">
          <div className="relative h-[420px] w-full overflow-hidden rounded-[28px]">
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85"
              alt="Indian clothing design inspiration"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -right-4 rounded-2xl bg-[#f4e5dc] p-5 shadow-sm sm:-right-6">
            <Flower2 size={35} strokeWidth={1.2} className="text-[#842f3b]" />
            <p className="mt-2 font-serif text-lg italic text-[#4a2023]">
              Made with love
            </p>
          </div>
        </div>

        <div className="pt-4 lg:pt-0">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b35b50]">
            Our Story
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl text-[#4a2023]">
            A Thread of Inspiration
          </h2>

          <p className="mt-6 leading-8 text-[#766967]">
            Thaagai celebrates the beauty of Indian ethnic wear,
            the art of stitching, and the individuality of every woman.
          </p>

          <p className="mt-4 leading-8 text-[#766967]">
            A neckline can transform a simple kurti. A sleeve can
            add character. A thoughtfully designed back can make
            an outfit unique. We bring these little details into
            focus to inspire your next creation.
          </p>

          <Link
            href="#vision"
            className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#b45b50] px-6 py-3 text-sm font-medium transition hover:bg-[#842f3b] hover:text-white"
          >
            Know Our Story <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* 4. DESIGN CATEGORIES */}
      <section id="designs" className="bg-[#fcf7f3] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-14">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#b35b50]">
                What We Offer
              </p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl text-[#4a2023]">
                Explore Design Possibilities
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#796d69]">
              Discover stitching patterns and thoughtful details
              for outfits that express your individuality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <article key={category.title} className="group">
                <Link href={category.href} className="block">
                  <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-[#eee0d7]">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h3 className="mt-5 font-serif text-xl text-[#4a2023]">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#796d69]">
                    {category.description}
                  </p>

                  <span className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c47763] transition group-hover:bg-[#842f3b] group-hover:text-white">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. OUR VISION */}
      <section id="vision" className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-14">
        <div className="grid overflow-hidden rounded-[28px] bg-[#f5e9e1] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative h-72 w-full lg:h-full min-h-[300px]">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85"
              alt="Contemporary Indian ethnic style"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a74f49]">
              Our Vision
            </p>

            <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl text-[#4a2023]">
              A Trusted Destination for Kurti Designs
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#766967]">
              Our vision is to make Thaagai a destination for
              kurti patterns and design inspiration, where women
              discover fresh ideas, explore styles, and express
              their individuality through clothing.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#e3cfc4] pt-6">
              <div className="text-center">
                <Flower2 className="mx-auto text-[#9b414b]" size={27} />
                <p className="mt-2 text-xs sm:text-sm font-medium text-[#4a2023]">Fresh Ideas</p>
              </div>
              <div className="text-center">
                <Sparkles className="mx-auto text-[#9b414b]" size={27} />
                <p className="mt-2 text-xs sm:text-sm font-medium text-[#4a2023]">Different Styles</p>
              </div>
              <div className="text-center">
                <Heart className="mx-auto text-[#9b414b]" size={27} />
                <p className="mt-2 text-xs sm:text-sm font-medium text-[#4a2023]">Express You</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section id="explore" className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <Image
            src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=2000&q=85"
            alt="Beautiful fabrics and ethnic fashion inspiration"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f4e1d6]/95 via-[#f4e1d6]/80 to-[#f4e1d6]/15" />

        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#a34e48]">
              Discover Your Style
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl text-[#4a2023]">
              Every Outfit Offers an Opportunity to Express Your Story
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#715650] sm:text-base">
              Explore kurti patterns, discover details you love,
              and find inspiration for creating a style that feels
              uniquely yours.
            </p>

            <Link
              href="#designs"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#842f3b] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#65232d]"
            >
              Explore Designs <ArrowRight size={18} />
            </Link>

            <p className="mt-8 font-serif text-xl italic text-[#842f3b]">
              Thaagai — Every Thread, A Touch of You.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
