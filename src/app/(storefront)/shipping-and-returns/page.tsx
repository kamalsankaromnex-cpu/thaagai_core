import type { Metadata } from "next";
import Link from "next/link";
import { Truck, RotateCcw, ShieldCheck, Clock, Scissors, MessageSquare } from "lucide-react";
import { HeritageBadge } from "@/components/storefront/tamil-motifs";
import { getSiteUrl, generateBreadcrumbJsonLd, generateFaqJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Shipping & Returns Guide | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`,
  description:
    "Comprehensive guide to THAAGAI delivery timelines across India, shipping fee calculations by PIN code, 7-day return window, and bespoke tailoring alterations.",
  alternates: {
    canonical: `${siteUrl}/shipping-and-returns`,
  },
  openGraph: {
    title: `Shipping & Returns Guide | ${SITE_CONFIG.brandName}`,
    description:
      "Comprehensive guide to THAAGAI delivery timelines across India, shipping fee calculations by PIN code, 7-day return window, and bespoke tailoring alterations.",
    url: `${siteUrl}/shipping-and-returns`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Shipping & Returns Guide | ${SITE_CONFIG.brandName}`,
    description:
      "Comprehensive guide to THAAGAI delivery timelines across India, shipping fee calculations by PIN code, 7-day return window, and bespoke tailoring alterations.",
  },
};

export default function ShippingAndReturnsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shipping & Returns Guide", url: "/shipping-and-returns" },
  ]);

  const faqJsonLd = generateFaqJsonLd([
    {
      question: "How are shipping fees calculated on THAAGAI?",
      answer:
        "Rather than inflating garment prices with built-in hidden shipping markups, THAAGAI calculates exact carrier shipping fees based on your 6-digit delivery PIN code and package volumetric weight.",
    },
    {
      question: "What is the return and exchange window for ready-to-wear churidars?",
      answer:
        "Ready-to-wear churidars and unstitched 3-piece materials enjoy a 7-day return or size exchange window from the date of delivery.",
    },
    {
      question: "Do made-to-measure bespoke garments come with alteration support?",
      answer:
        "Yes! Every bespoke kurta and churidar bottom pant includes a 1.5-inch inner fabric margin, and complimentary fitting adjustment support is provided if reported within 5 days of delivery.",
    },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-6">
        <HeritageBadge text="THAAGAI · Delivery & Returns Policy" />
      </div>

      <h1 className="font-serif text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
        Shipping & Returns Guide
      </h1>
      <p className="mt-2 text-xs text-thaagai-ink/60">Updated: October 2026</p>

      {/* Overview Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-6 dark:bg-thaagai-cardDark">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thaagai-maroon text-thaagai-gold">
            <Truck className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold text-thaagai-wine">
            Shipping & Delivery
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            <li>• <strong>South India:</strong> 2 to 4 business days</li>
            <li>• <strong>Rest of India:</strong> 4 to 7 business days</li>
            <li>• <strong>Bespoke Tailoring:</strong> 7 to 12 crafting days prior to dispatch</li>
            <li>• <strong>Carriers:</strong> India Post Speed Post, Blue Dart, DTDC with live WhatsApp tracking link</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-6 dark:bg-thaagai-cardDark">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thaagai-gold text-thaagai-wine">
            <RotateCcw className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-serif text-lg font-bold text-thaagai-wine">
            Returns & Exchanges
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            <li>• <strong>Ready-to-Wear Churidars:</strong> 7-day hassle-free return or size exchange window</li>
            <li>• <strong>Unstitched 3-Piece Material:</strong> Returns eligible in original folded condition within 7 days</li>
            <li>• <strong>Custom-Made Churidars:</strong> Made specifically to your measurements. Complimentary fitting adjustment offered; returns not eligible unless material defect.</li>
          </ul>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="mt-12 space-y-8 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-thaagai-wine">
            How Shipping Fees Are Calculated
          </h3>
          <p>
            Rather than inflating garment prices with built-in hidden shipping markups, THAAGAI calculates exact carrier shipping fees based on your 6-digit delivery PIN code and package volumetric weight.
          </p>
          <p>
            When you submit your order request, our team checks the best courier service for your locality and presents the exact shipping cost on WhatsApp before you make any payment.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-thaagai-wine">
            Custom-Made Churidar Alteration Guarantee
          </h3>
          <p>
            We take immense pride in the craftsmanship of our master tailors. Every made-to-measure churidar kurta and bottom pant includes a 1.5-inch inner fabric margin for future alterations.
          </p>
          <p>
            If any custom churidar requires minor fitting adjustments upon delivery, simply message our tailor on WhatsApp within 5 days of delivery. We will coordinate free alteration support.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-thaagai-wine">
            How to Request a Return or Exchange
          </h3>
          <ol className="list-decimal space-y-2 pl-5 text-xs">
            <li>Open your order confirmation WhatsApp chat with THAAGAI.</li>
            <li>Provide your <strong>Order Reference (e.g. TG-XXXXXX)</strong> and photograph of the item.</li>
            <li>Our team will authorize pickup or share the return shipping address within 24 hours.</li>
            <li>Upon quality receipt of unworn garments with tags attached, exchange pieces or refunds are processed promptly.</li>
          </ol>
        </section>

        {/* Locked Disclosure */}
        <div className="rounded-xl bg-thaagai-sand/40 p-5 text-center dark:bg-thaagai-sandDark/30">
          <p className="text-xs font-semibold text-thaagai-wine">
            Orders are requests until the seller confirms them on WhatsApp.
          </p>
          <div className="mt-3">
            <a
              href="https://wa.me/919876543210?text=Hello%20Thaagai,%20I%20have%20a%20query%20about%20shipping%20and%20returns."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Direct WhatsApp Help: +91 98765 43210</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
