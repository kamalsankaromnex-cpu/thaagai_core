import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Scissors, Sparkles, Ruler, ArrowRight, MessageSquare, CheckCircle2, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { LotusMotif, TempleBorder, HeritageBadge } from "@/components/storefront/tamil-motifs";
import { CustomChuridarBuilder } from "@/components/storefront/custom-churidar-builder";
import { getSiteUrl, generateBreadcrumbJsonLd, generateFaqJsonLd, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: `Bespoke Churidar Tailoring & Custom Suits | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`,
  description:
    "Bespoke Tamil tailoring and made-to-measure churidar sets, anarkali suits, and celebratory silk ensembles crafted to your exact height, bust, waist, and pant preferences.",
  alternates: {
    canonical: `${siteUrl}/custom-made`,
  },
  openGraph: {
    title: `Bespoke Churidar Atelier & Custom Tailoring | ${SITE_CONFIG.brandName}`,
    description:
      "Crafted to your exact measurements with generous 1.5-inch inner alteration margins. Choose custom kurtas, gathered churidars, straight pants, or salwars.",
    url: `${siteUrl}/custom-made`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Bespoke Churidar Tailoring | ${SITE_CONFIG.brandName}`,
    description:
      "Crafted to your exact measurements with generous 1.5-inch inner alteration margins. Choose custom kurtas, gathered churidars, straight pants, or salwars.",
  },
};

const MEASUREMENT_TIPS = [
  {
    step: "1",
    label: "Kurta Top Length",
        desc: "Measure from the high point of the shoulder down over the bust to your desired hemline (knee or mid-calf; typical is 40 to 45 inches).",
  },
  {
    step: "2",
    label: "Bust Measurement",
        desc: "Measure around the fullest part of the bust, keeping the measuring tape comfortably snug and horizontal across your back.",
  },
  {
    step: "3",
    label: "Natural Waist",
        desc: "Measure around your natural waistline, usually 1 to 2 inches above your navel at the narrowest point of your torso.",
  },
  {
    step: "4",
    label: "Hip / Seat",
        desc: "Stand with your heels together and measure around the fullest part of your hips and rear.",
  },
  {
    step: "5",
    label: "Bottom / Pant Length",
        desc: "For gathered churidars or cigarette pants, measure from your waist/belly down to your ankle bone (standard is 38 to 42 inches).",
  },
  {
    step: "6",
    label: "Shoulder Width",
        desc: "Measure straight across the back from the tip of one shoulder bone to the tip of the other.",
  },
];

export default async function CustomMadePage() {
  // Query custom-made churidar products from the database
  let customProducts: any[] = [];
  try {
    customProducts = await db.product.findMany({
      where: {
        status: "ACTIVE",
        productType: "CUSTOM_MADE",
      },
      include: {
        customizationGroups: {
          where: { active: true },
          include: {
            options: { where: { active: true } },
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching custom products:", err);
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Bespoke Churidar Atelier", url: "/custom-made" },
  ]);

  const customMadeFaqJsonLd = generateFaqJsonLd([
    {
      question: "How does bespoke made-to-measure tailoring work at THAAGAI?",
      answer:
        "Select your silhouette and fabric, choose necklines and sleeve options, and enter your bust, waist, hip, and length measurements. After submitting your request, our master tailor connects with you on WhatsApp for exact pattern drafting verification.",
    },
    {
      question: "Do bespoke garments include inner margins for future alterations?",
      answer:
        "Yes! Every bespoke kurta and churidar bottom tailored by THAAGAI includes a generous 1.5-inch inner alteration margin, ensuring longevity and accommodating future body changes effortlessly.",
    },
    {
      question: "What bottom styles can I choose with my custom churidar suit?",
      answer:
        "You can customize your set with traditional gathered churidars with ankle gathers, modern straight-cut cigarette trousers with pockets, airy pleated salwars, or wide-leg palazzos.",
    },
  ]);

  return (
    <div className="flex flex-col gap-16 py-6 sm:gap-20 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(customMadeFaqJsonLd) }}
      />
      {/* 1. Atelier Header */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-thaagai-line bg-[#FAF7F2] p-8 text-center sm:p-12 dark:border-thaagai-line/30 dark:bg-[#1A1114]">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-thaagai-gold/60 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-thaagai-wine shadow-xs dark:bg-thaagai-cardDark dark:text-thaagai-gold">
              <Sparkles className="h-3.5 w-3.5 text-thaagai-gold" />
              <span>The Bespoke Churidar Atelier</span>
            </span>
          </div>

          <h1 className="mx-auto max-w-3xl font-serif text-3xl font-bold tracking-tight text-thaagai-wine sm:text-5xl dark:text-white">
            Tailored to Your Exact Posture &amp; Silhouette
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-thaagai-ink/75 dark:text-thaagai-inkDark/75">
            Every woman’s proportions are unique. Choose your handloom weave, kurta flare, neckline contour, and signature gathered churidar bottoms with generous 1.5-inch inner alteration margins.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-thaagai-line/60 dark:bg-thaagai-cardDark">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Handloom Weavers
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-thaagai-line/60 dark:bg-thaagai-cardDark">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 1.5&quot; Inner Alteration Margins
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-thaagai-line/60 dark:bg-thaagai-cardDark">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Pattern Verification
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Silhouette Configurator */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <CustomChuridarBuilder />
      </section>

      {/* 2. How Bespoke Tailoring Works */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
            The Bespoke Journey
          </span>
          <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
            Three Steps to a Flawless Churidar Fit
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-7 text-center dark:bg-thaagai-cardDark">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-maroon text-thaagai-gold font-serif font-bold text-lg">
              1
            </div>
            <h3 className="mt-5 font-serif text-lg font-bold text-thaagai-wine">
              Choose Kurta & Bottom Cut
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Select straight cut or flared anarkali, neckline style, sleeve length, and whether you prefer traditional gathered churidars or cigarette pants.
            </p>
          </div>

          <div className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-7 text-center dark:bg-thaagai-cardDark">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-maroon text-thaagai-gold font-serif font-bold text-lg">
              2
            </div>
            <h3 className="mt-5 font-serif text-lg font-bold text-thaagai-wine">
              Provide Measurements
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Enter your kurta length, bust, waist, hips, bottom length, and ankle round directly, or pick a standard size and verify with our tailor.
            </p>
          </div>

          <div className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-7 text-center dark:bg-thaagai-cardDark">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-maroon text-thaagai-gold font-serif font-bold text-lg">
              3
            </div>
            <h3 className="mt-5 font-serif text-lg font-bold text-thaagai-wine">
              WhatsApp Verification
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Your exact customization snapshot is verified by our boutique master tailor on WhatsApp before any fabric is cut. Zero risk.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Custom-Made Catalog */}
      <section id="custom-catalog" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-thaagai-line pb-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
              Available For Customization
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
              Bespoke Churidar Catalog
            </h2>
          </div>
          <p className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Select a design to launch the interactive live configurator
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {customProducts.map((prod) => {
            const basePrice = Number(prod.basePrice || 0);
            const groupsCount = prod.customizationGroups?.length || 0;
            const rawKey = prod.images?.[0]?.storageKey || prod.images?.[0]?.url;
            const primaryImage = rawKey
              ? (rawKey.startsWith("http") || rawKey.startsWith("/") ? rawKey : `/uploads/${rawKey}`)
              : null;

            return (
              <div
                key={prod.id}
                className="group flex flex-col justify-between rounded-2xl border-2 border-thaagai-line bg-white p-6 shadow-sm transition-all duration-300 hover:border-thaagai-gold hover:shadow-lg dark:bg-thaagai-cardDark"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-thaagai-line/60 bg-gradient-to-b from-[#F7F2EB] to-[#FAF7F2] dark:from-thaagai-cardDark dark:to-thaagai-sandDark/40">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={prod.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                        <LotusMotif className="h-10 w-10 text-thaagai-gold/60" />
                        <span className="mt-2 text-xs font-semibold text-thaagai-wine">
                          Bespoke Tailored Churidar
                        </span>
                        <span className="mt-1 font-tamil text-[11px] text-thaagai-gold">
                          Custom Tailoring
                        </span>
                      </div>
                    )}

                    <span className="absolute right-3 top-3 z-10 rounded-full border border-amber-300 bg-amber-100/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-950/90 dark:text-amber-200">
                      {groupsCount} Customizable Step{groupsCount === 1 ? "" : "s"}
                    </span>
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-thaagai-maroon/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      Bespoke Atelier
                    </span>
                  </div>

                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-thaagai-gold">
                      Made-To-Measure
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-bold text-thaagai-wine group-hover:text-thaagai-maroon">
                      {prod.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {prod.shortDescription || prod.description}
                    </p>

                    {/* Preview of customization options */}
                    {prod.customizationGroups && prod.customizationGroups.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {prod.customizationGroups.map((grp: any) => (
                          <span
                            key={grp.id}
                            className="rounded bg-thaagai-sand/60 px-2 py-0.5 text-[10px] font-medium text-thaagai-ink dark:bg-thaagai-sandDark/40 dark:text-thaagai-inkDark"
                          >
                            {grp.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-thaagai-line/60 pt-4">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                      Starting from
                    </span>
                    <span className="font-sans text-xl font-bold text-thaagai-wine">
                      ₹{basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Link
                    href={`/product/${prod.slug}`}
                    className="inline-flex h-11 items-center gap-1.5 rounded-md bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    <span>Customize & Tailor</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Measurement Guide */}
      <section id="measurement-guide" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-thaagai-line bg-[#FAF7F2] p-8 sm:p-14 dark:bg-thaagai-cardDark">
          <div className="text-center">
            <span className="font-serif text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
              Precision Churidar Tailoring
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl">
              How to Take Your Churidar Measurements
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              For best results, use a soft fabric tape measure over fitted clothing, or have someone assist you.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEASUREMENT_TIPS.map((tip) => (
              <div
                key={tip.step}
                className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:bg-thaagai-cardDark/80"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-gold font-bold text-thaagai-wine text-xs">
                    {tip.step}
                  </span>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-thaagai-wine">
                      {tip.label}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                  {tip.desc}
                </p>
              </div>
            ))}

            {/* Extra Tailor Guidance Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-thaagai-gold/60 bg-gradient-to-br from-[#741832] to-[#5E1028] p-6 text-white">
              <div>
                <Sparkles className="h-6 w-6 text-thaagai-gold" />
                <h3 className="mt-3 font-serif text-base font-bold">
                  Need Personalized Help?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  If you are unsure about any churidar measurement or bottom styling, send a message to our master tailor on WhatsApp. We will assist you step-by-step.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Thaagai!%20I%20would%20like%20tailoring%20guidance%20for%20my%20churidar%20measurements."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-thaagai-gold text-xs font-bold text-thaagai-wine hover:bg-amber-300"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat with Master Tailor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Concierge & Ordering Protocol */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 dark:bg-thaagai-cardDark">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-thaagai-wine">
                  Bespoke Churidar Commitment
                </h4>
                <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  No fabric is cut until our boutique tailor reviews your measurements on WhatsApp. Every custom churidar includes 1.5-inch inner margins for future adjustments.
                </p>
              </div>
            </div>

            <Link
              href="/shop?type=READY_TO_WEAR"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-thaagai-wine px-5 text-xs font-semibold text-thaagai-wine transition-colors hover:bg-thaagai-wine hover:text-white"
            >
              <span>Explore Ready-to-Wear</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
