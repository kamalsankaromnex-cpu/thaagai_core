"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

export interface CarouselSlide {
  id: string;
  eyebrow?: string | null;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel?: string | null;
  secondaryCtaUrl?: string | null;
  desktopImage: string;
  mobileImage?: string | null;
  altText: string;
  textAlignment?: string; // "left" | "center" | "right"
  overlayOpacity?: number;
  sortOrder?: number;
  active?: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

export const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: "default-1",
    eyebrow: "Handloom Heritage",
    title: "Traditional Elegance in Every Weave",
    description: "Handwoven Chettinad cotton and pure silk straight cut churidar sets crafted with timeless Tamil artistry.",
    primaryCtaLabel: "Shop Ready-to-Wear",
    primaryCtaUrl: "/shop?type=READY_TO_WEAR",
    secondaryCtaLabel: "Explore Straight Cut",
    secondaryCtaUrl: "/shop?category=straight-cut-churidars",
    desktopImage: "/banners/hero-traditional-clean.jpg",
    mobileImage: "/banners/hero-traditional-clean.jpg",
    altText: "Traditional Tamil handloom straight cut churidar collection",
    textAlignment: "left",
    overlayOpacity: 10,
  },
  {
    id: "default-2",
    eyebrow: "Celebration Suits",
    title: "Festive Anarkalis with Pure Zari",
    description: "Regal celebratory suits tailored in deep jewel tones with delicate gold temple motifs and gathered churidars.",
    primaryCtaLabel: "Explore Festive Suits",
    primaryCtaUrl: "/shop?category=anarkali-churidars",
    secondaryCtaLabel: "View All Silks",
    secondaryCtaUrl: "/shop?category=silk-churidars",
    desktopImage: "/banners/hero-festive.svg",
    mobileImage: "/banners/hero-festive.svg",
    altText: "Festive celebration anarkali churidar suit with pure zari",
    textAlignment: "left",
    overlayOpacity: 40,
  },
  {
    id: "default-3",
    eyebrow: "Bespoke Tailoring",
    title: "Custom-Made Specifically for You",
    description: "Experience made-to-measure tailoring. Select your kurta silhouette, neckline, sleeve cut, and preferred bottom style.",
    primaryCtaLabel: "Bespoke Atelier",
    primaryCtaUrl: "/custom-made",
    secondaryCtaLabel: "Tailor WhatsApp Help",
    secondaryCtaUrl: "/contact",
    desktopImage: "/banners/hero-custom.svg",
    mobileImage: "/banners/hero-custom.svg",
    altText: "Bespoke made-to-measure churidar atelier and tailoring guide",
    textAlignment: "left",
    overlayOpacity: 40,
  },
  {
    id: "default-4",
    eyebrow: "Everyday Comfort",
    title: "Everyday Grace in Pure Cotton",
    description: "Breathable hand-block printed mulmul and Chettinad cotton churidar sets designed for all-day comfort in tropical weather.",
    primaryCtaLabel: "Shop Dailywear",
    primaryCtaUrl: "/shop?category=cotton-churidars",
    secondaryCtaLabel: "Unstitched Materials",
    secondaryCtaUrl: "/shop?category=unstitched-materials",
    desktopImage: "/banners/hero-everyday.svg",
    mobileImage: "/banners/hero-everyday.svg",
    altText: "Breathable cotton dailywear churidar sets",
    textAlignment: "left",
    overlayOpacity: 45,
  },
];

interface HeroCarouselProps {
  slides?: CarouselSlide[];
}

export function HeroCarousel({ slides: propSlides }: HeroCarouselProps) {
  // Use passed slides or fallback to safe defaults
  const activeSlides = (propSlides && propSlides.length > 0) ? propSlides : DEFAULT_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Touch swipe coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalSlides = activeSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Listen to browser tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 5-second Autoplay timer
  useEffect(() => {
    if (totalSlides <= 1) return;
    if (isHovered || !isTabActive || prefersReducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides, isHovered, isTabActive, prefersReducedMotion, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45; // 45px threshold

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swiped Left -> Go Next
        nextSlide();
      } else {
        // Swiped Right -> Go Prev
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="mx-auto w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] px-3 sm:px-6 lg:px-8">
      <section
        role="region"
        aria-roledescription="carousel"
        aria-label="Homepage Hero Carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-thaagai-line shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-gold dark:border-thaagai-line/30"
      >
        {/* Slides Container */}
        <div
          className="relative h-[480px] w-full sm:h-[540px] md:h-[580px] lg:h-[620px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const overlayStyle = {
            backgroundColor: `rgba(45, 12, 22, ${((slide.overlayOpacity ?? 40) / 100)})`,
          };

          return (
            <div
              key={slide.id || idx}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Responsive Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.desktopImage}
                  alt={slide.altText || slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>

              {/* Gradient & Contrast Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent"
                style={overlayStyle}
              />

              {/* Real HTML Content Container */}
              <div className="relative z-20 flex h-full items-center px-6 sm:px-12 md:px-16 lg:px-20">
                <div
                  className={`max-w-2xl text-white ${
                    slide.textAlignment === "center"
                      ? "mx-auto text-center"
                      : slide.textAlignment === "right"
                      ? "ml-auto text-right"
                      : "text-left"
                  }`}
                >
                  {/* Eyebrow Label */}
                  {slide.eyebrow && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border border-[#DA9F63]/70 bg-black/30 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#DA9F63] backdrop-blur-sm ${
                        slide.textAlignment === "center" ? "mx-auto" : ""
                      }`}
                    >
                      <Sparkles className="h-3 w-3 text-[#DA9F63]" />
                      <span>{slide.eyebrow}</span>
                    </div>
                  )}

                  {/* Heading */}
                  <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[48px] lg:leading-[1.15]">
                    {slide.title}
                  </h1>

                  {/* Subtle Gold Floral Ornament Divider */}
                  <div className="my-3 flex items-center gap-2 text-[#DA9F63]/70 text-xs">
                    <span className="h-px w-8 bg-[#DA9F63]/50" />
                    <span>❖</span>
                    <span className="h-px w-8 bg-[#DA9F63]/50" />
                  </div>

                  {/* Description */}
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#FAF7F2]/90 sm:text-sm md:text-base">
                    {slide.description}
                  </p>

                  {/* Call to Actions (Stacked on mobile, row on tablet/desktop) */}
                  <div
                    className={`mt-7 flex flex-col gap-3 sm:flex-row sm:items-center ${
                      slide.textAlignment === "center"
                        ? "justify-center"
                        : slide.textAlignment === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <Link
                      href={slide.primaryCtaUrl}
                      className="inline-flex h-11 sm:h-12 min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#DA9F63] px-6 sm:px-7 text-xs sm:text-sm font-bold text-[#2B1810] shadow-md transition-all hover:bg-[#E5AF78] hover:scale-[1.02] focus-visible:outline"
                    >
                      <span>{slide.primaryCtaLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {slide.secondaryCtaLabel && slide.secondaryCtaUrl && (
                      <Link
                        href={slide.secondaryCtaUrl}
                        className="inline-flex h-11 sm:h-12 min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#DA9F63]/50 bg-black/40 px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:border-[#DA9F63] focus-visible:outline"
                      >
                        <span>{slide.secondaryCtaLabel}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Previous / Next Arrow Controls */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 focus-visible:outline sm:left-5"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 focus-visible:outline sm:right-5"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Pagination Indicators (Dots / Active Pills) */}
      {totalSlides > 1 && (
        <div
          role="tablist"
          aria-label="Carousel pagination"
          className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 backdrop-blur-md"
        >
          {activeSlides.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Slide ${idx + 1} of ${totalSlides}`}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full focus-visible:outline ${
                  isCurrent
                    ? "h-2.5 w-2.5 bg-[#DA9F63] ring-2 ring-[#DA9F63]/40"
                    : "h-2.5 w-2.5 bg-white/60 hover:bg-white/90"
                }`}
              />
            );
          })}
        </div>
      )}
      </section>
    </div>
  );
}
