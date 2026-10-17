import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Track Your Handcrafted Order | ${SITE_CONFIG.brandName}`,
  description:
    "Check live delivery progress, tailoring inspection status, and courier dispatch updates for your THAAGAI handcrafted churidar order.",
  alternates: {
    canonical: `${siteUrl}/track-order`,
  },
  openGraph: {
    title: `Track Your Order | ${SITE_CONFIG.brandName}`,
    description:
      "Check live delivery progress, tailoring inspection status, and courier dispatch updates for your THAAGAI handcrafted churidar order.",
    url: `${siteUrl}/track-order`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Track Your Order | ${SITE_CONFIG.brandName}`,
    description:
      "Check live delivery progress, tailoring inspection status, and courier dispatch updates for your THAAGAI handcrafted churidar order.",
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Track Order", url: "/track-order" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
