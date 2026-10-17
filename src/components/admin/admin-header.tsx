"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  ExternalLink,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";
import { AdminSession } from "@/server/auth/auth";
import { GlobalSearchModal } from "./global-search-modal";

interface AdminHeaderProps {
  user: AdminSession;
  onMobileMenuToggle: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export function AdminHeader({
  user,
  onMobileMenuToggle,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Generate breadcrumb items from current pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  // e.g. ["admin", "products", "new"] -> [{ label: "Admin", href: "/admin" }, ...]
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    let label = segment.replace(/-/g, " ");
    if (segment === "admin") label = "Dashboard";
    else if (segment === "products") label = "Products";
    else if (segment === "categories") label = "Categories";
    else if (segment === "inventory") label = "Inventory";
    else if (segment === "orders") label = "Orders";
    else if (segment === "customers") label = "Customers";
    else if (segment === "promotions") label = "Promotions";
    else if (segment === "content") label = "Website & Content";
    else if (segment === "finance") label = "Income & Expenses";
    else if (segment === "staff") label = "Staff & Permissions";
    else if (segment === "settings") label = "Store Settings";
    else if (segment === "hero-slides") label = "Hero Slides";
    else if (segment === "size-charts") label = "Size Charts";
    else if (segment === "reviews") label = "Reviews";
    else if (segment === "new") label = "New";
    else if (segment.length > 15) label = segment.slice(0, 10) + "…";

    return { label, href, isLast: index === pathSegments.length - 1 };
  });

  const totalAlerts = pendingOrdersCount + lowStockCount;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-thaagai-line bg-white/95 px-4 backdrop-blur-md sm:px-6 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark/95">
        {/* Left Section: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-thaagai-line text-thaagai-ink hover:bg-thaagai-sand/60 lg:hidden dark:border-thaagai-line/40 dark:text-white"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-thaagai-ink/40 dark:text-thaagai-inkDark/40" />}
                {crumb.isLast ? (
                  <span className="font-bold capitalize text-thaagai-wine dark:text-thaagai-gold">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="capitalize text-thaagai-ink/60 hover:text-thaagai-wine dark:text-thaagai-inkDark/60 dark:hover:text-white"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="group flex h-10 w-full items-center justify-between rounded-lg border border-thaagai-line/80 bg-thaagai-sand/30 px-3 text-xs text-thaagai-ink/60 transition-all hover:border-thaagai-wine/60 hover:bg-white hover:text-thaagai-ink focus:outline-none focus:ring-2 focus:ring-thaagai-wine/20 dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60 dark:hover:bg-thaagai-cardDark"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Search className="h-4 w-4 shrink-0 text-thaagai-gold" />
              <span className="truncate">Search orders, products, inventory, finance...</span>
            </div>
            <kbd className="hidden shrink-0 rounded border border-thaagai-line/80 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-thaagai-ink/60 shadow-xs sm:inline-block dark:border-thaagai-line/40 dark:bg-thaagai-sandDark dark:text-thaagai-inkDark">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          </button>
        </div>

        {/* Right Section: View Storefront, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-thaagai-line px-2.5 py-1.5 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine sm:flex dark:border-thaagai-line/40 dark:text-white"
            title="View Live Storefront"
          >
            <ExternalLink className="h-3.5 w-3.5 text-thaagai-gold" />
            <span className="hidden md:inline">Storefront</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-thaagai-line text-thaagai-ink hover:bg-thaagai-sand/50 dark:border-thaagai-line/40 dark:text-white"
            >
              <Bell className="h-4 w-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {totalAlerts}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-thaagai-line bg-white p-3 shadow-xl dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
                    Operational Alerts
                  </h4>
                  <span className="text-[10px] font-semibold text-thaagai-gold">Live Status</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  {pendingOrdersCount > 0 ? (
                    <Link
                      href="/admin/orders?status=PENDING_WHATSAPP"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2 rounded-lg p-2 hover:bg-thaagai-sand/40 dark:hover:bg-thaagai-sandDark/40"
                    >
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-thaagai-ink dark:text-white">
                          {pendingOrdersCount} Pending Order{pendingOrdersCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                          Awaiting WhatsApp confirmation
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <p className="p-2 text-[11px] text-thaagai-ink/60">No pending orders awaiting review.</p>
                  )}

                  {lowStockCount > 0 && (
                    <Link
                      href="/admin/inventory"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="flex items-start gap-2 rounded-lg p-2 hover:bg-thaagai-sand/40 dark:hover:bg-thaagai-sandDark/40"
                    >
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-thaagai-ink dark:text-white">
                          {lowStockCount} Low Stock Item{lowStockCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                          Review inventory thresholds
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-thaagai-line/60 dark:border-thaagai-line/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-wine text-xs font-bold text-white shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-xs font-bold leading-none text-thaagai-ink dark:text-white">
                {user.name}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-thaagai-gold">
                <Shield className="h-2.5 w-2.5" />
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
