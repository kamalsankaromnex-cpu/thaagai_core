"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Heart,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { BrandLogo } from "@/components/storefront/brand-logo";

export interface NavigationCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
  active?: boolean;
}

interface NavbarProps {
  categories?: NavigationCategory[];
  tagline?: string;
}

export interface StorefrontNavItem {
  id: string;
  name: string;
  href: string;
  isActive: boolean;
}

export function Navbar({ categories: initialCategories = [], tagline }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [categories, setCategories] = useState<NavigationCategory[]>(initialCategories);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // If initialCategories was empty or client needs refresh, fetch from /api/categories
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    } else {
      fetch("/api/categories")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: NavigationCategory[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        })
        .catch((err) => console.error("Error loading categories in Navbar:", err));
    }
  }, [initialCategories]);

  // Focus search input when desktop or mobile search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  /**
   * Row 2 Navigation Items:
   * Displays ONLY: New Arrivals | Offers | Churidars | Custom Made
   * Respects database category records, IDs, and active/visibility rules for Churidars.
   * Completely excludes removed categories (Kurtis, Sarees, Dupattas, Sets).
   */
  const row2NavItems = useMemo<StorefrontNavItem[]>(() => {
    const isNewActive =
      pathname === "/shop" &&
      (searchParams?.get("filter") === "new" || searchParams?.get("sort") === "newest");
    const isOffersActive =
      pathname === "/shop" &&
      (searchParams?.get("filter") === "offers" || searchParams?.get("filter") === "sale");
    const isChuridarsActive =
      pathname === "/category/churidars" ||
      (pathname === "/shop" && searchParams?.get("category") === "churidars");
    const isCustomMadeActive =
      pathname === "/custom-made" ||
      (pathname === "/shop" && searchParams?.get("type") === "CUSTOM_MADE");

    // Look up database category for Churidars to respect admin display name and active status
    const churidarCategory = categories.find(
      (c) =>
        c.slug.toLowerCase() === "churidars" ||
        c.name.trim().toLowerCase() === "churidars"
    );

    // If Churidars category exists in DB but was set to inactive, follow visibility rules
    const showChuridars = churidarCategory ? churidarCategory.active !== false : true;
    const churidarName = churidarCategory?.name || "Churidars";
    const churidarSlug = churidarCategory?.slug || "churidars";

    const items: StorefrontNavItem[] = [
      {
        id: "nav-new-arrivals",
        name: "New Arrivals",
        href: "/shop?filter=new",
        isActive: isNewActive,
      },
      {
        id: "nav-offers",
        name: "Offers",
        href: "/shop?filter=offers",
        isActive: isOffersActive,
      },
    ];

    if (showChuridars) {
      items.push({
        id: churidarCategory?.id || "nav-churidars",
        name: churidarName,
        href: `/category/${churidarSlug}`,
        isActive: isChuridarsActive,
      });
    }

    items.push({
      id: "nav-custom-made",
      name: "Custom Made",
      href: "/custom-made",
      isActive: isCustomMadeActive,
    });

    return items;
  }, [categories, pathname, searchParams]);

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xs">
      {/* =========================================================================
          ROW 1 — MAIN HEADER (Warm Ivory Background)
         ========================================================================= */}
      <div className="border-b border-thaagai-line/60 bg-[#F7F2EB]/95 backdrop-blur-md dark:border-thaagai-line/20 dark:bg-thaagai-cardDark/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[68px] sm:px-6 lg:px-8">
          
          {/* Left: Mobile Menu Toggle & Brand Logo with Tagline */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button (Mobile only, sidebar menu trigger) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg text-thaagai-ink transition-colors hover:text-thaagai-wine focus-visible:outline md:hidden dark:text-thaagai-inkDark"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>

            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BrandLogo
                iconClassName="h-8 sm:h-10 w-auto object-contain shrink-0"
                wordmarkClassName="h-5.5 sm:h-7 w-auto object-contain"
              />
              <span className="hidden border-l border-thaagai-gold/40 pl-3.5 text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#9E7345] lg:inline-block dark:border-thaagai-gold/30 dark:text-thaagai-gold">
                {tagline || "EXQUISITE READY-MADE & BESPOKE CHURIDARS"}
              </span>
            </div>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md mx-6 md:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-thaagai-ink/40 dark:text-thaagai-inkDark/40" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for churidars, bespoke suits, new arrivals..."
                aria-label="Search storefront products"
                className="h-10 w-full rounded-full border border-thaagai-line/80 bg-white/95 px-4 pl-10 pr-9 text-xs text-thaagai-ink placeholder:text-thaagai-ink/50 shadow-2xs transition-all focus:border-thaagai-wine focus:bg-white focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/30 dark:bg-thaagai-sandDark dark:text-white dark:placeholder:text-thaagai-inkDark/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search text"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-thaagai-ink/40 hover:text-thaagai-wine dark:text-thaagai-inkDark/40"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right: Actions (Search Mobile, Account, Wishlist, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={searchOpen ? "Close search bar" : "Open search bar"}
              aria-expanded={searchOpen}
              className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full text-thaagai-ink transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-wine focus-visible:outline md:hidden dark:text-thaagai-inkDark"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Account Icon */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              aria-label={isAuthenticated ? (customer?.fullName ? `Account: ${customer.fullName}` : "Customer Account") : "Sign in / Register"}
              className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full text-thaagai-ink transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-wine focus-visible:outline dark:text-thaagai-inkDark"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} item${wishlistCount === 1 ? "" : "s"}`}
              className="relative flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full text-thaagai-ink transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-wine focus-visible:outline dark:text-thaagai-inkDark"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Item Badge */}
            <Link
              href="/cart"
              aria-label={`Shopping Bag with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className="relative flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full text-thaagai-ink transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-wine focus-visible:outline dark:text-thaagai-inkDark"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#9E7345] px-1 text-[10px] font-bold text-white shadow-xs">
                {itemCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Dropdown Search Field */}
        {searchOpen && (
          <div className="border-t border-thaagai-line/60 bg-white px-4 py-3 md:hidden dark:border-thaagai-line/20 dark:bg-thaagai-sandDark">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-thaagai-ink/40 dark:text-thaagai-inkDark/40" />
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for churidars, bespoke suits, new arrivals..."
                  className="h-11 w-full rounded-md border border-thaagai-line bg-[#FAF7F2] px-3 pl-9 text-xs text-thaagai-ink placeholder:text-thaagai-ink/50 focus:border-thaagai-wine focus:bg-white focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="flex h-11 min-h-[44px] items-center rounded-md bg-thaagai-wine px-4 text-xs font-semibold text-white transition-colors hover:bg-thaagai-wineHover"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          ROW 2 — NAVIGATION STRIP (Rich Dark Bronze / Chocolate Brown)
          Displays ONLY: NEW ARRIVALS | OFFERS | CHURIDARS | CUSTOM MADE
         ========================================================================= */}
      <nav
        aria-label="Storefront Navigation"
        className="border-b border-[#3B221B]/40 bg-[#482820] shadow-sm backdrop-blur-xs dark:border-black/30 dark:bg-[#251511]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 lg:gap-9 overflow-x-auto py-2.5 sm:py-3 no-scrollbar whitespace-nowrap">
            {row2NavItems.map((item, index) => {
              return (
                <li key={item.id} className="flex items-center gap-4 sm:gap-7 lg:gap-9">
                  <Link
                    href={item.href}
                    className={`relative text-xs sm:text-[13px] font-semibold uppercase tracking-[0.15em] transition-colors hover:text-[#DA9F63] ${
                      item.isActive
                        ? "text-white font-bold"
                        : "text-[#FAF7F2]/90 hover:text-[#DA9F63]"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-[#DA9F63]" />
                    )}
                  </Link>

                  {/* Elegant subtle divider between items (except after the last one) */}
                  {index < row2NavItems.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="text-white/25 select-none text-xs font-light"
                    >
                      |
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* =========================================================================
          MOBILE DRAWER (Hamburger Menu)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-thaagai-line bg-[#FAF7F2] px-5 py-6 shadow-xl md:hidden dark:border-thaagai-line/20 dark:bg-thaagai-cardDark">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="mb-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-thaagai-ink/40 dark:text-thaagai-inkDark/40" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for churidars, bespoke suits, new arrivals..."
                className="h-11 w-full rounded-md border border-thaagai-line bg-white px-3 pl-9 text-xs text-thaagai-ink placeholder:text-thaagai-ink/50 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/30 dark:bg-thaagai-sandDark dark:text-white"
              />
            </div>
            <button
              type="submit"
              aria-label="Submit search"
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-thaagai-wine text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Navigation Section in Mobile Menu */}
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-bold tracking-widest uppercase text-thaagai-gold">
              Navigation
            </p>
            <div className="divide-y divide-thaagai-line/40 rounded-xl border border-thaagai-line/60 bg-white dark:border-thaagai-line/20 dark:bg-thaagai-sandDark">
              {row2NavItems.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex h-12 items-center justify-between px-4 text-sm transition-colors ${
                      item.isActive
                        ? "font-bold text-thaagai-wine bg-thaagai-sand/30"
                        : "font-medium text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronRight className="h-4 w-4 text-thaagai-ink/30" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Store Links */}
          <div className="space-y-1 border-t border-thaagai-line/60 pt-4 dark:border-thaagai-line/20">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-between text-sm font-medium text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
            >
              <span>All Products</span>
              <ChevronRight className="h-4 w-4 text-thaagai-ink/30" />
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-between text-sm font-medium text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 ? (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              ) : (
                <ChevronRight className="h-4 w-4 text-thaagai-ink/30" />
              )}
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-between text-sm font-medium text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-thaagai-wine" />
                <span>{isAuthenticated ? (customer?.fullName || "My Account") : "Login / Register"}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-thaagai-ink/30" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-between text-sm font-medium text-thaagai-ink hover:text-thaagai-wine dark:text-thaagai-inkDark"
            >
              <span>Contact Us</span>
              <ChevronRight className="h-4 w-4 text-thaagai-ink/30" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
