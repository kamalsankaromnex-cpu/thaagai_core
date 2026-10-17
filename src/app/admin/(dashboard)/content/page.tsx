import Link from "next/link";
import {
  Image as ImageIcon,
  Ruler,
  Star,
  Settings,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { AnnouncementBarManager } from "@/components/admin/announcement-bar-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentHubPage() {
  let heroSlidesCount = 0;
  let sizeChartsCount = 0;
  let reviewsCount = 0;

  try {
    const [slides, charts, revs] = await Promise.all([
      db.heroSlide.count(),
      db.sizeChart.count(),
      db.review.count(),
    ]);
    heroSlidesCount = slides;
    sizeChartsCount = charts;
    reviewsCount = revs;
  } catch (err) {
    console.error("Content hub fetch error:", err);
  }

  const sections = [
    {
      title: "Hero Slides & Banners",
      description: "Manage rotating storefront hero slides, luxury banners, promotion tags, and CTA destinations.",
      href: "/admin/hero-slides",
      icon: ImageIcon,
      count: `${heroSlidesCount} Active Slides`,
      badge: "Storefront Visuals",
    },
    {
      title: "Size Charts & Fit Guides",
      description: "Configure bespoke measurements, bust-waist-hip charts, and custom tailoring fit recommendations.",
      href: "/admin/size-charts",
      icon: Ruler,
      count: `${sizeChartsCount} Size Guides`,
      badge: "Atelier Standards",
    },
    {
      title: "Customer Reviews & Ratings",
      description: "Moderate verified buyer reviews, customer testimonials, photo uploads, and rating summaries.",
      href: "/admin/reviews",
      icon: Star,
      count: `${reviewsCount} Customer Reviews`,
      badge: "Social Proof",
    },
    {
      title: "Store Settings & Policies",
      description: "Configure studio address, WhatsApp concierge numbers, GSTIN, shipping zones, and return policies.",
      href: "/admin/settings",
      icon: Settings,
      count: "System Config",
      badge: "Operations",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Website & Content
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Control visual editorial banners, bespoke size guides, verified client feedback, and brand narratives.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg border border-thaagai-line bg-white px-3.5 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <Globe className="h-4 w-4 text-thaagai-gold" />
          <span>Preview Live Site</span>
        </Link>
      </div>

      {/* Real-time Interactive Announcement Bar Manager */}
      <AnnouncementBarManager />

      {/* Grid of Content Sections */}
      <div>
        <h2 className="mb-3 font-serif text-base font-bold text-thaagai-ink dark:text-white">
          Editorial & Brand Content Modules
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-thaagai-line bg-white p-6 shadow-xs transition-all hover:border-thaagai-wine/70 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-thaagai-sand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold">
                    <Sparkles className="h-3 w-3" />
                    <span>{section.badge}</span>
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-thaagai-sand/60 text-thaagai-wine transition-colors group-hover:bg-thaagai-wine group-hover:text-white dark:bg-thaagai-sandDark dark:text-thaagai-gold">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <h3 className="mt-4 font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                  {section.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  {section.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-thaagai-line/60 pt-4 dark:border-thaagai-line/30">
                <span className="text-xs font-semibold text-thaagai-gold">
                  {section.count}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-thaagai-wine transition-transform group-hover:translate-x-1 dark:text-thaagai-gold">
                  Manage <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
