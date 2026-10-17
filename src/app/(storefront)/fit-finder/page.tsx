import type { Metadata } from "next";
import { FitFinderQuiz } from "@/components/storefront/fit-finder-quiz";
import { Sparkles, Scissors, Ruler, ShieldCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getSiteUrl, generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Churidar Fit Finder & Size Recommender | ${SITE_CONFIG.brandName}`,
  description:
    "Find your ideal South Indian churidar size, optimal kurta hemline, and ankle gathers based on your height and body silhouette.",
  alternates: {
    canonical: `${siteUrl}/fit-finder`,
  },
  openGraph: {
    title: `Churidar Fit Finder & Size Recommender | ${SITE_CONFIG.brandName}`,
    description:
      "Find your ideal South Indian churidar size, optimal kurta hemline, and ankle gathers based on your height and body silhouette.",
    url: `${siteUrl}/fit-finder`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Churidar Fit Finder | ${SITE_CONFIG.brandName}`,
    description:
      "Find your ideal South Indian churidar size, optimal kurta hemline, and ankle gathers based on your height and body silhouette.",
  },
};

export default function FitFinderPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Fit Finder", url: "/fit-finder" },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Page Header */}
      <div className="text-center">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-thaagai-gold">
          Atelier Sizing Intelligence
        </span>
        <h1 className="mt-2 font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-5xl">
          Smart Churidar Fit Finder
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-thaagai-ink/75 dark:text-thaagai-inkDark/75">
          Answer 3 quick questions about your height, drape preference, and usual sizing to find your flawless South Indian Churidar fit.
        </p>
      </div>

      {/* Interactive Quiz Component */}
      <div className="mt-8 sm:mt-10">
        <FitFinderQuiz />
      </div>

      {/* Sizing Guarantees & Atelier Principles */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-thaagai-line/60 pt-10">
        <div className="flex flex-col items-center text-center p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
            <Ruler className="h-6 w-6 text-thaagai-gold" />
          </div>
          <h3 className="mt-3 font-brand text-base font-bold text-thaagai-ink dark:text-white">
            Proportional Kurta Hemlines
          </h3>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70 leading-relaxed">
            Unlike mass-produced apparel, every THAAGAI kurta length is calibrated to hit 2 inches below the knee for balanced South Indian proportions.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
            <Scissors className="h-6 w-6 text-thaagai-gold" />
          </div>
          <h3 className="mt-3 font-brand text-base font-bold text-thaagai-ink dark:text-white">
            Generous Inseam Seam Allowances
          </h3>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70 leading-relaxed">
            All our bespoke and ready-to-wear garments include 2 inches of inner margin fabric for effortless future tailoring adjustments.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white">
            <ShieldCheck className="h-6 w-6 text-thaagai-gold" />
          </div>
          <h3 className="mt-3 font-brand text-base font-bold text-thaagai-ink dark:text-white">
            Authentic Churidar Churis
          </h3>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70 leading-relaxed">
            Cut with bias grain stretch to ensure comfortable ankle gathers without restrictive tightness during puja rituals or festive seating.
          </p>
        </div>
      </div>

      {/* WhatsApp Atelier Consultation Callout */}
      <div className="mt-10 rounded-2xl border border-thaagai-line bg-thaagai-sand/40 p-6 text-center dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30 sm:p-8">
        <h3 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
          Need Guidance from our Master Tailor?
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Have an upcoming bridal trousseau or unusual size requirements? Chat directly with our Chennai atelier master tailor on WhatsApp.
        </p>
        <div className="mt-4 flex items-center justify-center">
          <a
            href="https://api.whatsapp.com/send?phone=919876543210&text=Hello%20THAAGAI%20Atelier!%20I%20would%20like%20guidance%20with%20custom%20churidar%20sizing%20and%20tailoring."
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-2 rounded-md bg-[#25D366] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#1EBE5D] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat with Master Tailor on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
