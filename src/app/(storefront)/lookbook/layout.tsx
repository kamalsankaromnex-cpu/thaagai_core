import type { Metadata } from "next";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Heritage Lookbook & Styled Ensembles | ${SITE_CONFIG.brandName}`,
  description:
    "Explore the THAAGAI interactive lookbook featuring curated handloom cotton and festive silk churidars styled with artisanal dupattas and bespoke drapes.",
  alternates: {
    canonical: `${siteUrl}/lookbook`,
  },
  openGraph: {
    title: `Heritage Lookbook | ${SITE_CONFIG.brandName}`,
    description:
      "Explore the THAAGAI interactive lookbook featuring curated handloom cotton and festive silk churidars styled with artisanal dupattas and bespoke drapes.",
    url: `${siteUrl}/lookbook`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Heritage Lookbook | ${SITE_CONFIG.brandName}`,
    description:
      "Explore the THAAGAI interactive lookbook featuring curated handloom cotton and festive silk churidars styled with artisanal dupattas and bespoke drapes.",
  },
};

export default function LookbookLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Lookbook", url: "/lookbook" },
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
