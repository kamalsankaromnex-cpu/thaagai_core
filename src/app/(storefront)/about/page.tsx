import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, HeartHandshake, ShieldCheck, MessageSquare, ArrowRight, Scissors } from "lucide-react";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `About Us | ${SITE_CONFIG.brandName} - Handloom & Bespoke Churidars`,
  description:
    "Learn about THAAGAI's dedication to authentic Tamil handlooms, curated churidars, bespoke made-to-measure tailoring, and personalized WhatsApp assistance.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: `About Our Heritage & Craftsmanship | ${SITE_CONFIG.brandName}`,
    description:
      "Rooted in South Indian textile heritage, THAAGAI specializes exclusively in handloom cotton and festive silk churidars with bespoke atelier tailoring.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_CONFIG.brandName}`,
    description:
      "Rooted in South Indian textile heritage, THAAGAI specializes exclusively in handloom cotton and festive silk churidars with bespoke atelier tailoring.",
  },
};

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      {/* Brand Story Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-thaagai-gold/60 bg-thaagai-sand/40 px-3.5 py-1 text-xs font-semibold tracking-wider text-thaagai-wine dark:bg-thaagai-sandDark/40">
          <Sparkles className="h-3.5 w-3.5 text-thaagai-gold" />
          OUR STORY & CRAFTSMANSHIP
        </span>
        <h1 className="mt-4 font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-5xl">
          The Soul of Thaagai
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
          Rooted in timeless South Indian aesthetic heritage, Thaagai was born from a deep reverence for the handloom weaver and the bespoke tailor. We specialize exclusively in exquisite churidar suits and made-to-measure ensembles crafted to be treasured.
        </p>
      </div>

      {/* Narrative Section */}
      <div className="mt-14 space-y-12">
        <div className="rounded-2xl border border-thaagai-line bg-white p-8 shadow-sm sm:p-10 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <h2 className="font-brand text-2xl font-bold text-thaagai-wine">
            Woven with Intention, Tailored for Grace
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            Every churidar set in our catalog is chosen for its tactile warmth, breathability, and authentic weave. From pure Chettinad and mulmul cotton daily ensembles designed for comfort in Indian weather, to richly bordered celebratory silk anarkalis, our silhouettes balance ancient handloom mastery with contemporary tailoring.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            Our bespoke atelier offers made-to-measure customization. Whether you favor traditional gathered churidars with delicate ankle gathers, modern straight cigarette pants with side pockets, or airy pleated salwars, each garment includes a generous 1.5-inch inner alteration margin for long-lasting enjoyment.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-thaagai-line bg-white p-6 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-brand text-lg font-bold text-thaagai-ink dark:text-white">
              Authentic Fabrics
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Zero synthetic compromise. We work strictly with verified handloom cotton and pure silk weaver clusters across Tamil Nadu.
            </p>
          </div>

          <div className="rounded-xl border border-thaagai-line bg-white p-6 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-brand text-lg font-bold text-thaagai-ink dark:text-white">
              WhatsApp-First Care
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              No automated chatbots. You speak directly with our styling and tailoring team for sizing advice, bottom fit, and live fabric photos.
            </p>
          </div>

          <div className="rounded-xl border border-thaagai-line bg-white p-6 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
              <Scissors className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-brand text-lg font-bold text-thaagai-ink dark:text-white">
              Master Tailoring
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Precision cutting tailored to your exact height, bust, waist, and pant preferences with complimentary fitting support.
            </p>
          </div>
        </div>

        {/* Locked Disclosure Callout */}
        <div className="rounded-2xl border border-thaagai-wine/20 bg-thaagai-sand/40 p-8 text-center dark:bg-thaagai-sandDark/30">
          <p className="font-serif text-lg font-bold text-thaagai-wine">
            Orders are requests until the seller confirms them on WhatsApp.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            This deliberate model guarantees that every churidar set is physically hand-inspected for perfection and that fabric stock is 100% verified before payment is accepted.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/shop"
              className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
            >
              <span>Explore Churidar Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
