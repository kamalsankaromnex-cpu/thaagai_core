import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_CONFIG.brandName}`,
  description:
    "THAAGAI customer privacy policy regarding personal details, address information, secure WhatsApp communications, and data confidentiality.",
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI customer privacy policy: confidential order processing, strict data protection, and customer contact security.",
    url: `${siteUrl}/privacy-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${SITE_CONFIG.brandName}`,
    description:
      "THAAGAI customer privacy policy: confidential order processing, strict data protection, and customer contact security.",
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <h1 className="font-brand text-3xl font-bold tracking-tight text-thaagai-wine">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-thaagai-ink/60">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            1. Information We Collect
          </h2>
          <p>
            When you place an order request on THAAGAI, we collect your name, phone number, shipping address, and order selections to coordinate delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            2. Confidentiality & WhatsApp Security
          </h2>
          <p>
            We do not sell, rent, or share your contact information with third-party advertisers. Your phone number is strictly used for order confirmation, delivery updates, and customer support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
            3. Data Retention
          </h2>
          <p>
            Order records are retained securely for accounting and legal purposes. You may request data deletion at any time by contacting our care team.
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
