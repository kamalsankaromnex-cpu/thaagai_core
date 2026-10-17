"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

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
    desktopImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90",
    mobileImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90",
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
    desktopImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=2000&q=90",
    mobileImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=1000&q=90",
    altText: "Festive celebration anarkali churidar suit with pure zari",
    textAlignment: "left",
    overlayOpacity: 10,
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
    desktopImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90",
    mobileImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=90",
    altText: "Bespoke made-to-measure churidar atelier and tailoring guide",
    textAlignment: "left",
    overlayOpacity: 10,
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
    desktopImage: "https://images.unsplash.com/photo-1610189012906-4c6b3a7b4a8e?auto=format&fit=crop&w=2000&q=90",
    mobileImage: "https://images.unsplash.com/photo-1610189012906-4c6b3a7b4a8e?auto=format&fit=crop&w=1000&q=90",
    altText: "Breathable cotton dailywear churidar sets",
    textAlignment: "left",
    overlayOpacity: 10,
  },
];

interface HeroCarouselProps {
  slides?: CarouselSlide[];
}

function renderStyledTitle(title: string) {
  // If title has explicit newline, split by newline
  if (title.includes("\n")) {
    const lines = title.split("\n");
    const mainLines = lines.slice(0, -1);
    const lastLine = lines[lines.length - 1];
    return (
      <>
        {mainLines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
        <span className="block italic text-[#9b5151]">{lastLine}</span>
      </>
    );
  }

  // Prepositional or accent phrase matching for editorial luxury style
  const accentPatterns = [
    /^(.*?\b)(for Every Woman)$/i,
    /^(.*?\b)(in Every Weave)$/i,
    /^(.*?\b)(with Pure Zari)$/i,
    /^(.*?\b)(Specifically for You)$/i,
    /^(.*?\b)(for You)$/i,
    /^(.*?\b)(in Pure Cotton)$/i,
  ];

  for (const pattern of accentPatterns) {
    const match = title.match(pattern);
    if (match) {
      return (
        <>
          <span className="block sm:inline">{match[1]}</span>{" "}
          <span className="block sm:inline italic text-[#9b5151]">{match[2]}</span>
        </>
      );
    }
  }

  return title;
}

export function HeroCarousel({ slides: propSlides }: HeroCarouselProps) {
  // Use passed slides or fallback to safe defaults
  const activeSlides = propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;

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
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage Hero Carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="group relative w-full overflow-hidden bg-[#fffdfa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#842f3b]"
    >
      {/* Slides Container - Exactly full width and matching min-h-[590px] lg:min-h-[650px] */}
      <div
        className="relative min-h-[590px] lg:min-h-[650px] w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={slide.id || idx}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Responsive Image - Full width 100vw */}
              <div className="absolute inset-0">
                <Image
                  src={slide.desktopImage}
                  alt={slide.altText || slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>

              {/* Warm Ivory / Blush Gradient Overlay matching About Us */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#f8eee5]/95 via-[#f8eee5]/80 to-transparent" />

              {/* Real HTML Content Container - Centered max-w-7xl matching About Us */}
              <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-6 py-20 sm:px-10 lg:min-h-[650px] lg:px-14">
                <div
                  className={`max-w-xl text-[#4a2023] ${
                    slide.textAlignment === "center"
                      ? "mx-auto text-center"
                      : slide.textAlignment === "right"
                      ? "ml-auto text-right"
                      : "text-left"
                  }`}
                >
                  {/* Eyebrow Label */}
                  {slide.eyebrow && (
                    <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-[#9a4d48]">
                      {slide.eyebrow}
                    </p>
                  )}

                  {/* Heading */}
                  <h1 className="font-serif text-5xl leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl text-[#4a2023]">
                    {renderStyledTitle(slide.title)}
                  </h1>

                  {/* Description */}
                  <p className="mt-6 max-w-lg text-base leading-7 text-[#655454] sm:text-lg">
                    {slide.description}
                  </p>

                  {/* Call to Actions */}
                  <div
                    className={`mt-8 flex flex-wrap items-center gap-4 ${
                      slide.textAlignment === "center"
                        ? "justify-center"
                        : slide.textAlignment === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <Link
                      href={slide.primaryCtaUrl}
                      className="inline-flex items-center gap-3 rounded-full bg-[#842f3b] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#65232d] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline"
                    >
                      <span>{slide.primaryCtaLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {slide.secondaryCtaLabel && slide.secondaryCtaUrl && (
                      <Link
                        href={slide.secondaryCtaUrl}
                        className="inline-flex items-center gap-2 rounded-full border border-[#b45b50] bg-white/70 px-6 py-3.5 text-sm font-medium text-[#842f3b] backdrop-blur-xs transition hover:bg-white hover:scale-[1.02] active:scale-[0.98] focus-visible:outline"
                      >
                        <span>{slide.secondaryCtaLabel}</span>
                      </Link>
                    )}
                  </div>

                  {/* Signature Slider Indicator directly below CTAs */}
                  {totalSlides > 1 && (
                    <div
                      role="tablist"
                      aria-label="Carousel pagination"
                      className={`mt-10 flex items-center gap-2 ${
                        slide.textAlignment === "center"
                          ? "justify-center"
                          : slide.textAlignment === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {activeSlides.map((_, pIdx) => {
                        const isCurrent = pIdx === currentIndex;
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            role="tab"
                            aria-selected={isCurrent}
                            aria-label={`Go to slide ${pIdx + 1} of ${totalSlides}`}
                            onClick={() => goToSlide(pIdx)}
                            className={`transition-all duration-300 rounded-full focus-visible:outline ${
                              isCurrent
                                ? "h-2.5 w-8 bg-[#842f3b]"
                                : "h-2.5 w-2.5 bg-[#d9bdb0] hover:bg-[#842f3b]/60"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
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
            className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#eadbd3] bg-white/80 text-[#842f3b] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-[#65232d] hover:scale-105 active:scale-95 focus-visible:outline sm:left-8"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#eadbd3] bg-white/80 text-[#842f3b] shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-[#65232d] hover:scale-105 active:scale-95 focus-visible:outline sm:right-8"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}
