import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Ruler, Scissors, Sparkles, ShieldCheck } from "lucide-react";
import { SizeToLengthPreview } from "@/components/storefront/size-to-length-preview";
import { LotusMotif, TempleBorder } from "@/components/storefront/tamil-motifs";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Size to Length & Drape Preview Guide | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`,
  description:
    "Interactive South Indian churidar size-to-length calibrator. Discover proportional kurta lengths, straight pant hems, and ankle gathers tailored to your height.",
  alternates: {
    canonical: `${siteUrl}/size-to-length`,
  },
  openGraph: {
    title: `Size to Length Guide | ${SITE_CONFIG.brandName}`,
    description:
      "Interactive South Indian churidar size-to-length calibrator. Discover proportional kurta lengths, straight pant hems, and ankle gathers tailored to your height.",
    url: `${siteUrl}/size-to-length`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Size to Length Guide | ${SITE_CONFIG.brandName}`,
    description:
      "Interactive South Indian churidar size-to-length calibrator. Discover proportional kurta lengths, straight pant hems, and ankle gathers tailored to your height.",
  },
};

export default function SizeToLengthPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Size to Length Guide", url: "/size-to-length" },
  ]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-stone-500"
        >
          <Link href="/" className="hover:text-[#8A4A38] transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-stone-400" />
          <Link href="/shop" className="hover:text-[#8A4A38] transition">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3 text-stone-400" />
          <span className="text-stone-900 font-semibold">Size to Length Preview</span>
        </nav>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-10 text-center shadow-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] border border-[#8A4A38]/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8A4A38]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Proportional Drape Intelligence</span>
          </div>

          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            Churidar Size to Length & Silhouette Guide
          </h1>
          <p className="mt-1 font-tamil text-xs text-[#8A4A38] font-medium">
            Churidar Sizing, Height & Tailoring Length Guide
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-stone-600 leading-relaxed">
            South Indian handloom churidars achieve their timeless grace through proportional drape.
            Use our interactive size-to-length visualizer to preview where your kurta hemline falls
            relative to your height and knees, and view exact ankle gather specifications.
          </p>
        </div>

        {/* Interactive Size to Length Preview Component */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-10 shadow-xs">
          <SizeToLengthPreview initialSize="M" />
        </div>

        {/* 3 Pillars of Thaagai Sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-[#8A4A38]">
              <Ruler className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-bold text-stone-900">
              Below-Knee Proportions
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every Thaagai kurta is cut to drape 2 inches below the knee for modesty, balanced silhouettes, and comfortable movement.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-[#8A4A38]">
              <Scissors className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-bold text-stone-900">
              1.5&quot; Inner Seam Margin
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every garment contains generous inner fabric margins on both side seams to allow easy local alteration if your body fluctuates.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-[#8A4A38]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-serif text-sm font-bold text-stone-900">
              Bias-Cut Ankle Gathers
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Our traditional gathered churidar bottoms feature bias-cut stretch with 6 to 8 ankle ripples that stay comfortable during seating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
