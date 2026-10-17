import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, generateFaqJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Shipping Policy | ${SITE_CONFIG.brandName}`,
  description:
    "Learn about THAAGAI delivery timelines, domestic courier shipping across India, physical quality inspections, and WhatsApp dispatch tracking.",
  alternates: {
    canonical: `${siteUrl}/shipping-policy`,
  },
  openGraph: {
    title: `Shipping Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI shipping policy: 2 business days physical inspection & dispatch following WhatsApp confirmation; delivery in 3-7 business days across India.",
    url: `${siteUrl}/shipping-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Shipping Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI shipping policy: 2 business days physical inspection & dispatch following WhatsApp confirmation; delivery in 3-7 business days across India.",
  },
};

export default function ShippingPolicyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Shipping Policy", url: "/shipping-policy" },
  ]);

  const shippingFaqJsonLd = generateFaqJsonLd([
    {
      question: "How long does it take to dispatch an order from THAAGAI?",
      answer:
        "Because all THAAGAI pieces are handloom weaves and tailored churidars, each piece is physically inspected prior to dispatch. Once your order request is confirmed on WhatsApp, items are dispatched within 2 business days.",
    },
    {
      question: "What are the domestic delivery timelines across India?",
      answer:
        "Standard shipping across South India typically delivers within 2–4 business days. Delivery to the rest of India takes 4–7 business days depending on delivery pin code accessibility.",
    },
    {
      question: "How do I track my THAAGAI shipment?",
      answer:
        "As soon as your package is dispatched, our concierge team shares the live courier tracking number directly to your WhatsApp chat and updates your order tracking page.",
    },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shippingFaqJsonLd) }}
      />

      <h1 className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine">
        Shipping Policy
      </h1>
      <p className="mt-2 text-xs text-thaagai-ink/60">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            1. Order Verification & Dispatch
          </h2>
          <p>
            Because all THAAGAI pieces are handloom weaves and tailored churidars, each piece is physically inspected prior to dispatch. Once your order request is confirmed on WhatsApp, items are dispatched within 2 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            2. Domestic Delivery Timelines
          </h2>
          <p>
            Standard shipping across South India typically delivers within 2–4 business days. Delivery to the rest of India takes 4–7 business days depending on pin code accessibility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            3. Tracking Your Shipment
          </h2>
          <p>
            As soon as your package is dispatched, our team shares the live courier tracking number directly to your WhatsApp chat.
          </p>
        </section>

        <div className="mt-10 rounded-xl bg-thaagai-sand/40 p-4 text-center dark:bg-thaagai-sandDark/30">
          <p className="text-xs font-semibold text-thaagai-wine">
            Orders are requests until the seller confirms them on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
