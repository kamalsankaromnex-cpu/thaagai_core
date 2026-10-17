import type { Metadata } from "next";
import Link from "next/link";
import { TempleBorder, HeritageBadge } from "@/components/storefront/tamil-motifs";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`,
  description:
    "Terms and conditions governing the use of the THAAGAI website, catalog browsing, made-to-measure tailoring, and WhatsApp ordering protocol.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: `Terms of Service | ${SITE_CONFIG.brandName}`,
    description:
      "Terms and conditions governing the use of the THAAGAI website, catalog browsing, made-to-measure tailoring, and WhatsApp ordering protocol.",
    url: `${siteUrl}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms of Service | ${SITE_CONFIG.brandName}`,
    description:
      "Terms and conditions governing the use of the THAAGAI website, catalog browsing, made-to-measure tailoring, and WhatsApp ordering protocol.",
  },
};

export default function TermsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mb-6">
        <HeritageBadge text="THAAGAI · Terms & Conditions" />
      </div>

      <h1 className="font-serif text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-thaagai-ink/60">Effective Date: October 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or placing an order request through THAAGAI (referred to as &quot;Thaagai&quot;, &quot;we&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            2. Order Protocol & Confirmation
          </h2>
          <p>
            <strong>Orders submitted on this website are requests until confirmed directly by our seller via WhatsApp.</strong> No automated credit card charges or binding sales agreements occur on this platform without explicit boutique consultation. We reserve the right to verify fabric availability, shipping reachability, and measurement specifications prior to accepting an order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            3. Bespoke & Made-to-Measure Churidars
          </h2>
          <p>
            For custom-made clothing (bespoke churidars, made-to-measure anarkali suits, and tailored pant sets), garments are tailored individually according to the customer’s submitted or confirmed measurements. Once cutting has commenced following mutual WhatsApp approval, custom orders cannot be cancelled or altered without applicable material fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            4. Handloom Artistry & Colour Variations
          </h2>
          <p>
            Because our textiles are crafted by traditional weavers using natural fibers and handloom looms, minor variations in weave texture, slub character, and natural dye tones are inherent markers of authentic handloom art and are not deemed defects.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            5. Pricing and Payment
          </h2>
          <p>
            All prices listed on the site are in Indian Rupees (₹ INR). Customization option deltas are added to base prices in real time. Final shipping charges are calculated transparently based on destination PIN code and communicated prior to payment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-thaagai-wine">
            6. Governing Law & Jurisdiction
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with orders shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
          </p>
        </section>

        <div className="mt-10 rounded-xl bg-thaagai-sand/40 p-5 text-center dark:bg-thaagai-sandDark/30">
          <p className="text-xs font-semibold text-thaagai-wine">
            Orders are requests until confirmed on WhatsApp by the seller.
          </p>
          <div className="mt-3">
            <Link
              href="/contact"
              className="text-xs font-medium text-thaagai-maroon underline hover:text-thaagai-wine"
            >
              Have questions regarding our terms? Contact our concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
