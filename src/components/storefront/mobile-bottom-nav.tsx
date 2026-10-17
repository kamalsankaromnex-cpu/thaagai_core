"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Sparkles, Scissors, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";

export interface MobileNavItem {
  id: string;
  name: string;
  href: string;
  icon: typeof Home;
  isActive: boolean;
  badge?: number | string | null;
  ariaLabel: string;
}

export function shouldShowMobileBottomNav(pathname: string | null): boolean {
  if (!pathname) return true;
  // Hide on Product Detail Pages (dedicated sticky buy/WhatsApp bar takes precedence)
  if (pathname.startsWith("/product/")) return false;
  // Hide on Checkout flow and Order Success pages to keep purchase flow focused
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return false;
  if (pathname.startsWith("/order-success/")) return false;
  return true;
}

export function getActiveMobileNavId(
  pathname: string,
  searchParams?: { get: (key: string) => string | null } | null
): string {
  if (pathname === "/") return "mobile-nav-home";
  if (pathname === "/custom-made") return "mobile-nav-custom-made";
  if (pathname === "/wishlist") return "mobile-nav-wishlist";
  if (pathname === "/cart") return "mobile-nav-cart";

  const filter = searchParams?.get("filter");
  const category = searchParams?.get("category");
  const type = searchParams?.get("type");

  if (type === "CUSTOM_MADE") return "mobile-nav-custom-made";

  if (
    pathname.startsWith("/category/churidars") ||
    pathname.startsWith("/category/") ||
    pathname === "/shop" ||
    category === "churidars" ||
    filter === "new" ||
    filter === "offers"
  ) {
    return "mobile-nav-churidars";
  }

  return "";
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  if (!shouldShowMobileBottomNav(pathname)) {
    return null;
  }

  const activeId = getActiveMobileNavId(pathname, searchParams);

  const navItems: MobileNavItem[] = [
    {
      id: "mobile-nav-home",
      name: "Home",
      href: "/",
      icon: Home,
      isActive: activeId === "mobile-nav-home",
      ariaLabel: "Go to Home",
    },
    {
      id: "mobile-nav-churidars",
      name: "Churidars",
      href: "/category/churidars",
      icon: Sparkles,
      isActive: activeId === "mobile-nav-churidars",
      ariaLabel: "Browse Churidar collections",
    },
    {
      id: "mobile-nav-custom-made",
      name: "Atelier",
      href: "/custom-made",
      icon: Scissors,
      isActive: activeId === "mobile-nav-custom-made",
      ariaLabel: "Bespoke Custom Made Atelier",
    },
    {
      id: "mobile-nav-wishlist",
      name: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: activeId === "mobile-nav-wishlist",
      badge: wishlistCount > 0 ? (wishlistCount > 99 ? "99+" : wishlistCount) : null,
      ariaLabel: `Wishlist with ${wishlistCount} items`,
    },
    {
      id: "mobile-nav-cart",
      name: "Bag",
      href: "/cart",
      icon: ShoppingBag,
      isActive: activeId === "mobile-nav-cart",
      badge: itemCount > 0 ? (itemCount > 99 ? "99+" : itemCount) : null,
      ariaLabel: `Shopping bag with ${itemCount} items`,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-thaagai-line/60 bg-[#FAF7F2]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] transition-all dark:bg-stone-900/95 dark:border-stone-800"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.ariaLabel}
              aria-current={item.isActive ? "page" : undefined}
              className={`tap-bounce group relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
                item.isActive
                  ? "text-[#8A4A38] dark:text-amber-400 font-bold"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-115 ${
                    item.isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8A4A38] px-1 text-[10px] font-bold text-white shadow-xs dark:bg-amber-600 animate-scale-in"
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-tight leading-none transition-colors">
                {item.name}
              </span>
              {item.isActive && (
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-1 w-1 rounded-full bg-[#8A4A38] dark:bg-amber-400 animate-scale-in"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
