import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, generateFaqJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Return & Refund Policy | ${SITE_CONFIG.brandName}`,
  description:
    "Guidelines on returns, replacements, transit damage, cancellations, and refund processing for THAAGAI ready-to-wear and bespoke churidars.",
  alternates: {
    canonical: `${siteUrl}/return-refund-policy`,
  },
  openGraph: {
    title: `Return & Refund Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI return and refund policy: 48-hour return notification window, handloom fabric nuances, replacement guarantee, and 3-day refund processing.",
    url: `${siteUrl}/return-refund-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Return & Refund Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI return and refund policy: 48-hour return notification window, handloom fabric nuances, replacement guarantee, and 3-day refund processing.",
  },
};

export default function ReturnRefundPolicyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Return & Refund Policy", url: "/return-refund-policy" },
  ]);

  const returnFaqJsonLd = generateFaqJsonLd([
    {
      question: "What is the return window for THAAGAI garments?",
      answer:
        "If your garment arrives with a defect, wrong size compared to the agreed WhatsApp measurements, or transit damage, please notify us within 48 hours of delivery by sharing an unboxing photo or video on WhatsApp.",
    },
    {
      question: "Are natural fabric slubs considered defects in handloom churidars?",
      answer:
        "Subtle slubs in handloom cotton fabric, natural yarn character, and minor tonal variations are intrinsic markers of authentic artisan weaving, not defects.",
    },
    {
      question: "How long does refund processing take?",
      answer:
        "Upon physical inspection of the returned piece, approved claims will receive an immediate replacement piece or full refund processed back to your original payment mode within 3 business days.",
    },
    {
      question: "Can I cancel my order before dispatch?",
      answer:
        "Orders for ready-to-wear pieces may be cancelled prior to dispatch confirmation via WhatsApp. For custom-tailored bespoke garments, cancellations are accepted free of charge prior to fabric cutting and pattern drafting.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(returnFaqJsonLd) }}
      />

      <h1 className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine">
        Return & Refund Policy
      </h1>
      <p className="mt-2 text-xs text-thaagai-ink/60">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            1. Handloom & Fabric Nuances
          </h2>
          <p>
            Subtle slubs in handloom cotton fabric, natural yarn character, and minor tonal variations are intrinsic markers of authentic artisan weaving, not defects.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            2. 48-Hour Return Request Window
          </h2>
          <p>
            If your garment arrives with a defect, wrong size compared to the agreed WhatsApp measurements, or transit damage, please notify us within 48 hours of delivery by sharing an unboxing photo or video on WhatsApp.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            3. Refunds & Replacements
          </h2>
          <p>
            Upon inspection, approved claims will receive an immediate replacement piece or full refund processed back to your original payment mode within 3 business days.
          </p>
        </section>

        <section id="cancellation" className="space-y-2 scroll-mt-24">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            4. Cancellation Policy
          </h2>
          <p>
            Orders for ready-to-wear pieces may be cancelled prior to seller dispatch confirmation via WhatsApp. Once an order has been packed and handed over to our logistics partner, it cannot be cancelled in transit but remains eligible for our return protocol upon arrival. For custom-tailored bespoke garments, cancellations are accepted free of charge prior to fabric cutting and pattern drafting.
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
