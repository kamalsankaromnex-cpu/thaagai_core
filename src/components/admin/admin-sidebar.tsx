"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Users,
  Package,
  Layers,
  Boxes,
  Tag,
  Globe,
  IndianRupee,
  UserCheck,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  Sparkles,
  FileText,
  Truck,
} from "lucide-react";
import { AdminSession } from "@/server/auth/auth";

interface AdminSidebarProps {
  user: AdminSession;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  user,
  isMobileOpen,
  onMobileClose,
  pendingOrdersCount = 0,
  lowStockCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop collapsed state
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Sections definition matching exact requirements
  const sections: NavSection[] = [
    {
      id: "sales_customers",
      title: "Sales & Customers",
      items: [
        {
          href: "/admin/orders",
          label: "Orders",
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: "bg-amber-600 text-white",
        },
        {
          href: "/admin/customers",
          label: "Customers",
          icon: Users,
        },
      ],
    },
    {
      id: "products",
      title: "Products",
      items: [
        {
          href: "/admin/products",
          label: "Products",
          icon: Package,
        },
        {
          href: "/admin/categories",
          label: "Categories",
          icon: Layers,
        },
        {
          href: "/admin/inventory",
          label: "Inventory",
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: "bg-rose-600 text-white",
        },
        {
          href: "/admin/purchases",
          label: "Purchases",
          icon: FileText,
        },
        {
          href: "/admin/suppliers",
          label: "Suppliers",
          icon: Truck,
        },
        {
          href: "/admin/fabrics",
          label: "3D Fabrics",
          icon: Sparkles,
        },
      ],
    },
    {
      id: "store_management",
      title: "Store Management",
      items: [
        {
          href: "/admin/promotions",
          label: "Promotions",
          icon: Tag,
        },
        {
          href: "/admin/content",
          label: "Website & Content",
          icon: Globe,
        },
      ],
    },
    {
      id: "finance",
      title: "Finance",
      items: [
        {
          href: "/admin/finance",
          label: "Income & Expenses",
          icon: IndianRupee,
        },
      ],
    },
    {
      id: "administration",
      title: "Administration",
      items: [
        {
          href: "/admin/staff",
          label: "Staff & Permissions",
          icon: UserCheck,
        },
        {
          href: "/admin/settings",
          label: "Store Settings",
          icon: Settings,
        },
      ],
    },
  ];

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sales_customers: true,
    products: true,
    store_management: true,
    finance: true,
    administration: true,
  });

  // Automatically expand parent section if active page matches
  useEffect(() => {
    sections.forEach((section) => {
      const hasActiveChild = section.items.some(
        (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
      );
      if (hasActiveChild) {
        setExpandedSections((prev) => ({ ...prev, [section.id]: true }));
      }
    });
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    if (isDesktopCollapsed) {
      setIsDesktopCollapsed(false);
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
      return;
    }
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const renderContent = (isMobile: boolean = false) => {
    const collapsed = !isMobile && isDesktopCollapsed;

    return (
      <div className="flex h-full flex-col justify-between overflow-y-auto">
        <div>
          {/* Branding Header: Logo navigates to Admin Dashboard. Completely decoupled from collapse toggle so icons never overlap the logo */}
          {collapsed ? (
            /* Collapsed Desktop State: Centered Emblem ONLY (no toggle button crammed in 72px header) */
            <div className="flex h-16 w-full items-center justify-center border-b border-thaagai-line/70 px-2 dark:border-thaagai-line/30">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine"
                title="THAAGAI Admin Overview"
              >
                <Image
                  src="/logo-icon.png"
                  alt="THAAGAI Emblem"
                  width={709}
                  height={629}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
          ) : (
            /* Expanded Desktop State & Mobile Drawer: Logo + Wordmark with dedicated right-aligned toggle/close */
            <div className="flex h-16 items-center justify-between border-b border-thaagai-line/70 px-4 dark:border-thaagai-line/30">
              <Link
                href="/admin"
                onClick={() => isMobile && onMobileClose()}
                className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine rounded-md"
                title="THAAGAI Admin Overview"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <Image
                    src="/logo-icon.png"
                    alt="THAAGAI Emblem"
                    width={709}
                    height={629}
                    className="h-8 w-auto object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0 shrink">
                  <Image
                    src="/wordmark.png"
                    alt="THAAGAI"
                    width={1024}
                    height={309}
                    className="h-5.5 w-auto object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/wordmark-white.png"
                    alt="THAAGAI"
                    width={1024}
                    height={313}
                    className="h-5.5 w-auto object-contain hidden dark:block"
                    priority
                  />
                  <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60 truncate">
                    Boutique Admin
                  </span>
                </div>
              </Link>

              {/* Dedicated toggle / close action separated cleanly with margin */}
              {isMobile ? (
                <button
                  onClick={onMobileClose}
                  className="shrink-0 ml-2 rounded-lg p-1.5 text-thaagai-ink/60 hover:bg-thaagai-sand/60 hover:text-thaagai-ink dark:text-thaagai-inkDark/60 dark:hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsDesktopCollapsed(true)}
                  className="shrink-0 ml-2 hidden rounded-lg p-1.5 text-thaagai-ink/50 hover:bg-thaagai-sand/60 hover:text-thaagai-ink lg:block dark:text-thaagai-inkDark/50 dark:hover:text-white"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Structure */}
          <nav className="space-y-4 px-3 py-4" aria-label="Admin Sections">
            {sections.map((section) => {
              const isExpanded = expandedSections[section.id] ?? true;

              return (
                <div key={section.id} className="space-y-1">
                  {/* Section Title Heading */}
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="group flex w-full items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-thaagai-ink/50 transition-colors hover:text-thaagai-wine dark:text-thaagai-inkDark/50 dark:hover:text-thaagai-gold"
                    >
                      <span>{section.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-thaagai-ink/40 group-hover:text-thaagai-wine dark:text-thaagai-inkDark/40" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-thaagai-ink/40 group-hover:text-thaagai-wine dark:text-thaagai-inkDark/40" />
                      )}
                    </button>
                  ) : (
                    <div className="mx-auto my-2 h-px w-8 bg-thaagai-line/60 dark:bg-thaagai-line/30" />
                  )}

                  {/* Section Items */}
                  {(isExpanded || collapsed) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href ||
                          (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => isMobile && onMobileClose()}
                            title={collapsed ? item.label : undefined}
                            className={`group relative flex h-10 items-center rounded-lg px-3 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine ${
                              collapsed ? "justify-center px-0" : "justify-between"
                            } ${
                              active
                                ? "bg-thaagai-wine text-white shadow-xs"
                                : "text-thaagai-ink/80 hover:bg-thaagai-sand/70 hover:text-thaagai-wine dark:text-thaagai-inkDark/80 dark:hover:bg-thaagai-sandDark/40 dark:hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`h-4 w-4 shrink-0 transition-colors ${
                                  active
                                    ? "text-white"
                                    : "text-thaagai-ink/60 group-hover:text-thaagai-wine dark:text-thaagai-inkDark/60 dark:group-hover:text-thaagai-gold"
                                }`}
                              />
                              {!collapsed && <span>{item.label}</span>}
                            </div>

                            {/* Badge Indicator */}
                            {item.badge !== undefined && !collapsed && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  item.badgeColor || "bg-thaagai-gold text-thaagai-wine"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.badge !== undefined && collapsed && (
                              <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-rose-500" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Administration Footer: User, Desktop Toggle & Logout */}
        <div className="border-t border-thaagai-line/70 p-3 dark:border-thaagai-line/30">
          <div
            className={`flex items-center rounded-lg p-1.5 ${
              collapsed ? "flex-col gap-2 justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <div className="overflow-hidden pr-2">
                <p className="truncate text-xs font-bold text-thaagai-ink dark:text-white">
                  {user.name}
                </p>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-thaagai-gold">
                  <Shield className="h-3 w-3" />
                  <span>{user.role}</span>
                </div>
              </div>
            )}

            <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-1"}`}>
              {/* Desktop Expand/Collapse button in footer */}
              {!isMobile && (
                <button
                  onClick={() => setIsDesktopCollapsed((prev) => !prev)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-thaagai-ink/60 transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thaagai-wine dark:text-thaagai-inkDark/60 dark:hover:bg-thaagai-sandDark/40 dark:hover:text-white"
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              )}

              <button
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out of admin session"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-thaagai-ink/60 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-thaagai-line/80 bg-thaagai-sand/30 transition-all duration-200 lg:block dark:border-thaagai-line/30 dark:bg-thaagai-cardDark ${
          isDesktopCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Accessible slide-out) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer container */}
          <div className="relative flex w-72 max-w-[85vw] flex-1 flex-col bg-white shadow-2xl transition-transform dark:bg-thaagai-cardDark">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
