import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Contact Us & WhatsApp Concierge | ${SITE_CONFIG.brandName}`,
  description:
    "Connect with the THAAGAI boutique concierge on WhatsApp or via our inquiry desk for bespoke tailoring consultations, sizing guidance, and order support.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: `Contact Us | ${SITE_CONFIG.brandName}`,
    description:
      "Connect with the THAAGAI boutique concierge on WhatsApp or via our inquiry desk for bespoke tailoring consultations, sizing guidance, and order support.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Us | ${SITE_CONFIG.brandName}`,
    description:
      "Connect with the THAAGAI boutique concierge on WhatsApp or via our inquiry desk for bespoke tailoring consultations, sizing guidance, and order support.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]);

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}/contact#webpage`,
    url: `${siteUrl}/contact`,
    name: `Contact ${SITE_CONFIG.brandName}`,
    description: "Contact THAAGAI for bespoke tailoring guidance, sizing support, and order confirmation.",
    mainEntity: {
      "@type": "OnlineStore",
      name: SITE_CONFIG.brandName,
      telephone: SITE_CONFIG.supportPhone,
      email: SITE_CONFIG.supportEmail,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SITE_CONFIG.supportPhone,
        contactType: "customer service",
        availableLanguage: ["en", "ta"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      {children}
    </>
  );
}
