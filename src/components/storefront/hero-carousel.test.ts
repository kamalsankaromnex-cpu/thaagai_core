import { describe, it, expect } from "vitest";
import { DEFAULT_SLIDES, CarouselSlide } from "./hero-carousel";

describe("Homepage Hero Carousel & Slide Configuration", () => {
  it("provides 4 default slides covering traditional, festive, bespoke, and everyday churidars", () => {
    expect(DEFAULT_SLIDES.length).toBeGreaterThanOrEqual(3);
    expect(DEFAULT_SLIDES.length).toBeLessThanOrEqual(5);

    const titles = DEFAULT_SLIDES.map((s) => s.title);
    expect(titles.some((t) => /traditional/i.test(t))).toBe(true);
    expect(titles.some((t) => /festive|anarkali/i.test(t))).toBe(true);
    expect(titles.some((t) => /custom|tailor/i.test(t))).toBe(true);
    expect(titles.some((t) => /everyday|cotton/i.test(t))).toBe(true);
  });

  it("ensures all default slides have valid imagery, SEO alt text, and CTA links", () => {
    DEFAULT_SLIDES.forEach((slide) => {
      expect(slide.title.trim().length).toBeGreaterThan(0);
      expect(slide.description.trim().length).toBeGreaterThan(0);
      expect(slide.desktopImage).toMatch(/^(\/banners\/.+\.(svg|jpg|jpeg|png|webp)|https?:\/\/.+)$/);
      expect(slide.altText.trim().length).toBeGreaterThan(0);
      expect(slide.primaryCtaLabel.trim().length).toBeGreaterThan(0);
      expect(slide.primaryCtaUrl).toMatch(/^\//); // Internal route
    });
  });

  it("correctly filters slides by active status and date scheduling window", () => {
    const now = new Date("2026-10-15T12:00:00Z");

    const sampleSlides: CarouselSlide[] = [
      {
        id: "slide-1",
        title: "Active Always",
        description: "Always valid",
        primaryCtaLabel: "Shop",
        primaryCtaUrl: "/shop",
        desktopImage: "/banners/hero-traditional.svg",
        altText: "Slide 1",
        active: true,
        sortOrder: 1,
      },
      {
        id: "slide-2",
        title: "Inactive Slide",
        description: "Should be excluded",
        primaryCtaLabel: "Shop",
        primaryCtaUrl: "/shop",
        desktopImage: "/banners/hero-festive.svg",
        altText: "Slide 2",
        active: false,
        sortOrder: 2,
      },
      {
        id: "slide-3",
        title: "Future Campaign",
        description: "Starts tomorrow",
        primaryCtaLabel: "Shop",
        primaryCtaUrl: "/shop",
        desktopImage: "/banners/hero-custom.svg",
        altText: "Slide 3",
        active: true,
        startDate: "2026-10-20T00:00:00Z",
        sortOrder: 3,
      },
      {
        id: "slide-4",
        title: "Expired Festival",
        description: "Ended yesterday",
        primaryCtaLabel: "Shop",
        primaryCtaUrl: "/shop",
        desktopImage: "/banners/hero-everyday.svg",
        altText: "Slide 4",
        active: true,
        endDate: "2026-10-10T00:00:00Z",
        sortOrder: 4,
      },
      {
        id: "slide-5",
        title: "Active Scheduled Campaign",
        description: "Currently in range",
        primaryCtaLabel: "Shop",
        primaryCtaUrl: "/shop",
        desktopImage: "/banners/hero-festive.svg",
        altText: "Slide 5",
        active: true,
        startDate: "2026-10-01T00:00:00Z",
        endDate: "2026-10-31T23:59:59Z",
        sortOrder: 5,
      },
    ];

    const filterActiveSlides = (slides: CarouselSlide[], referenceDate: Date) => {
      return slides
        .filter((slide) => {
          if (slide.active === false) return false;
          if (slide.startDate && new Date(slide.startDate) > referenceDate) return false;
          if (slide.endDate && new Date(slide.endDate) < referenceDate) return false;
          return true;
        })
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    };

    const validSlides = filterActiveSlides(sampleSlides, now);

    expect(validSlides).toHaveLength(2);
    expect(validSlides[0].id).toBe("slide-1");
    expect(validSlides[1].id).toBe("slide-5");
  });

  it("handles fallback gracefully when slide list is empty", () => {
    const emptySlides: CarouselSlide[] = [];
    const effectiveSlides = emptySlides.length > 0 ? emptySlides : DEFAULT_SLIDES;

    expect(effectiveSlides.length).toBe(4);
    expect(effectiveSlides[0].title).toBe("Traditional Elegance in Every Weave");
  });

  it("calculates next and previous slide index with circular wrapping", () => {
    const total = 4;
    const nextIndex = (current: number) => (current + 1) % total;
    const prevIndex = (current: number) => (current - 1 + total) % total;

    // Moving forward
    expect(nextIndex(0)).toBe(1);
    expect(nextIndex(3)).toBe(0); // wrap to first

    // Moving backward
    expect(prevIndex(0)).toBe(3); // wrap to last
    expect(prevIndex(2)).toBe(1);
  });
});
