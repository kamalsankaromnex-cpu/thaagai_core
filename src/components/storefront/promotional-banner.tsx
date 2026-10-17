import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface PromotionalBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  badge?: string;
  imageUrl: string;
  altText?: string;
  className?: string;
}

export function PromotionalBanner({
  title,
  description,
  ctaLabel,
  ctaUrl,
  badge = "Special Festive Curation",
  imageUrl,
  altText,
  className = "",
}: PromotionalBannerProps) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      <Link
        href={ctaUrl}
        className="group relative block overflow-hidden rounded-3xl border border-thaagai-gold/50 shadow-md transition-all hover:shadow-xl focus-visible:outline"
      >
        {/* Background Image */}
        <div className="relative h-64 w-full sm:h-72 md:h-80">
          <Image
            src={imageUrl}
            alt={altText || title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
          />

          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 md:px-16">
            <div className="max-w-xl text-white">
              {badge && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-thaagai-gold/60 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-thaagai-gold backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  <span>{badge}</span>
                </span>
              )}

              <h2 className="mt-3 font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {title}
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-white/90 sm:text-sm">
                {description}
              </p>

              <div className="mt-5">
                <span className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-gold px-6 text-xs font-bold text-thaagai-wine shadow-sm transition-all group-hover:bg-amber-300">
                  <span>{ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
