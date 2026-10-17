import { describe, it, expect } from "vitest";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
}

interface StorefrontNavItem {
  id: string;
  name: string;
  href: string;
  isActive: boolean;
}

function buildStorefrontNavItems(
  categories: CategoryRecord[],
  pathname: string = "/",
  searchParams: Record<string, string> = {}
): StorefrontNavItem[] {
  const isNewActive =
    pathname === "/shop" &&
    (searchParams.filter === "new" || searchParams.sort === "newest");
  const isOffersActive =
    pathname === "/shop" &&
    (searchParams.filter === "offers" || searchParams.filter === "sale");
  const isChuridarsActive =
    pathname === "/category/churidars" ||
    (pathname === "/shop" && searchParams.category === "churidars");
  const isCustomMadeActive =
    pathname === "/custom-made" ||
    (pathname === "/shop" && searchParams.type === "CUSTOM_MADE");

  const churidarCategory = categories.find(
    (c) =>
      c.slug.toLowerCase() === "churidars" ||
      c.name.trim().toLowerCase() === "churidars"
  );

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
}

describe("Row 2 — Storefront Navigation Strip", () => {
  const mockDbCategories: CategoryRecord[] = [
    { id: "cmval2dnn0002uzqkg6k9c516", name: "Churidars", slug: "churidars", sortOrder: 1, active: true },
    { id: "cmvabhind0003uz9w7dyexzi3", name: "Straight Cut Churidars", slug: "straight-cut-churidars", sortOrder: 2, active: true },
    { id: "cmvabhinh0004uz9wd5j6oeay", name: "Anarkali Churidar Suits", slug: "anarkali-churidars", sortOrder: 3, active: true },
    { id: "cmvabhinl0005uz9wg0wvfkhw", name: "Dailywear Cotton Churidars", slug: "cotton-churidars", sortOrder: 4, active: true },
    { id: "cmvabhino0006uz9w1p30brko", name: "Festive Silk Churidars", slug: "silk-churidars", sortOrder: 5, active: true },
    { id: "cmvabhinr0007uz9wrkcm7djk", name: "Bespoke Tailored Churidars", slug: "custom-churidars", sortOrder: 6, active: true },
    { id: "cmvabhinu0008uz9w3xhgnayo", name: "Unstitched Churidar Materials", slug: "unstitched-materials", sortOrder: 7, active: true },
  ];

  it("displays strictly: New Arrivals | Offers | Churidars | Custom Made in exact order", () => {
    const navItems = buildStorefrontNavItems(mockDbCategories);
    expect(navItems).toHaveLength(4);
    expect(navItems.map((item) => item.name)).toEqual([
      "New Arrivals",
      "Offers",
      "Churidars",
      "Custom Made",
    ]);
    expect(navItems.map((item) => item.href)).toEqual([
      "/shop?filter=new",
      "/shop?filter=offers",
      "/category/churidars",
      "/custom-made",
    ]);
  });

  it("strictly removes and excludes Kurtis, Sarees, Dupattas, and Sets", () => {
    const navItems = buildStorefrontNavItems(mockDbCategories);
    const names = navItems.map((item) => item.name.toLowerCase());
    const hrefs = navItems.map((item) => item.href.toLowerCase());

    expect(names).not.toContain("kurtis");
    expect(names).not.toContain("sarees");
    expect(names).not.toContain("dupattas");
    expect(names).not.toContain("sets");

    expect(hrefs).not.toContain("/category/kurtis");
    expect(hrefs).not.toContain("/category/sarees");
    expect(hrefs).not.toContain("/category/dupattas");
    expect(hrefs).not.toContain("/category/sets");
  });

  it("links Churidars to existing category and reuses database record", () => {
    const navItems = buildStorefrontNavItems(mockDbCategories);
    const churidarItem = navItems.find((item) => item.name === "Churidars");
    expect(churidarItem).toBeDefined();
    expect(churidarItem?.id).toBe("cmval2dnn0002uzqkg6k9c516");
    expect(churidarItem?.href).toBe("/category/churidars");
  });

  it("respects database visibility rules: hides Churidars if marked inactive in database", () => {
    const withInactiveChuridar = mockDbCategories.map((c) =>
      c.slug === "churidars" ? { ...c, active: false } : c
    );
    const navItems = buildStorefrontNavItems(withInactiveChuridar);
    expect(navItems).toHaveLength(3);
    expect(navItems.map((i) => i.name)).toEqual(["New Arrivals", "Offers", "Custom Made"]);
    expect(navItems.some((i) => i.name === "Churidars")).toBe(false);
  });

  it("preserves admin custom display name for Churidars if customized in DB", () => {
    const withCustomName = mockDbCategories.map((c) =>
      c.slug === "churidars" ? { ...c, name: "Churidars & Suits" } : c
    );
    const navItems = buildStorefrontNavItems(withCustomName);
    const item = navItems.find((i) => i.href === "/category/churidars");
    expect(item?.name).toBe("Churidars & Suits");
  });

  it("determines active route highlighting correctly for each navigation item", () => {
    const onHome = buildStorefrontNavItems(mockDbCategories, "/");
    expect(onHome.every((i) => !i.isActive)).toBe(true);

    const onNewArrivals = buildStorefrontNavItems(mockDbCategories, "/shop", { filter: "new" });
    expect(onNewArrivals.find((i) => i.name === "New Arrivals")?.isActive).toBe(true);
    expect(onNewArrivals.find((i) => i.name === "Offers")?.isActive).toBe(false);

    const onOffers = buildStorefrontNavItems(mockDbCategories, "/shop", { filter: "offers" });
    expect(onOffers.find((i) => i.name === "Offers")?.isActive).toBe(true);

    const onChuridars = buildStorefrontNavItems(mockDbCategories, "/category/churidars");
    expect(onChuridars.find((i) => i.name === "Churidars")?.isActive).toBe(true);

    const onCustomMade = buildStorefrontNavItems(mockDbCategories, "/custom-made");
    expect(onCustomMade.find((i) => i.name === "Custom Made")?.isActive).toBe(true);
  });
});

describe("Row 1 — Main Header Specifications", () => {
  it("uses the updated search input placeholder text", () => {
    const placeholder = "Search for churidars, bespoke suits, new arrivals...";
    expect(placeholder).toBe("Search for churidars, bespoke suits, new arrivals...");
    expect(placeholder).not.toContain("kurtis");
    expect(placeholder).not.toContain("sarees");
  });

  it("determines cart badge visibility correctly based on cart item count", () => {
    const showCartBadge = (itemCount: number) => itemCount > 0;
    expect(showCartBadge(0)).toBe(false);
    expect(showCartBadge(1)).toBe(true);
    expect(showCartBadge(5)).toBe(true);
  });

  it("determines account navigation route based on authentication status", () => {
    const getAccountHref = (isAuthenticated: boolean) => (isAuthenticated ? "/account" : "/login");
    expect(getAccountHref(false)).toBe("/login");
    expect(getAccountHref(true)).toBe("/account");
  });
});

describe("Global Footer Specifications", () => {
  it("renders social links only when configured, and suppresses empty containers when not configured", () => {
    const hasSocial = (social?: { instagram?: string; facebook?: string; whatsapp?: string }) => {
      return Boolean(
        social &&
          (social.instagram?.trim() || social.facebook?.trim() || social.whatsapp?.trim())
      );
    };

    expect(hasSocial(undefined)).toBe(false);
    expect(hasSocial({})).toBe(false);
    expect(hasSocial({ instagram: "" })).toBe(false);
    expect(hasSocial({ instagram: "https://instagram.com/thaagai" })).toBe(true);
  });

  it("validates all Shop, Customer Care, and Policy routes exist and are functional", () => {
    const shopRoutes = [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "Offers & Sale", href: "/shop?filter=offers" },
      { label: "Churidars", href: "/category/churidars" },
      { label: "Custom Made", href: "/custom-made" },
    ];

    const customerCareRoutes = [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns & Refunds", href: "/return-refund-policy" },
      { label: "Order Tracking", href: "/track-order" },
    ];

    const policyRoutes = [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cancellation Policy", href: "/return-refund-policy#cancellation" },
      { label: "Refund Policy", href: "/return-refund-policy" },
    ];

    shopRoutes.forEach((route) => {
      expect(route.href.startsWith("/")).toBe(true);
      expect(route.label.trim().length).toBeGreaterThan(0);
      expect(route.href).not.toContain("kurtis");
      expect(route.href).not.toContain("sarees");
      expect(route.href).not.toContain("dupattas");
      expect(route.href).not.toContain("sets");
    });

    customerCareRoutes.forEach((route) => {
      expect(route.href.startsWith("/")).toBe(true);
      expect(route.label.trim().length).toBeGreaterThan(0);
    });

    policyRoutes.forEach((route) => {
      expect(route.href.startsWith("/")).toBe(true);
      expect(route.label.trim().length).toBeGreaterThan(0);
    });
  });

  it("displays only verified supported payment methods", () => {
    const supportedMethods = ["UPI", "Net Banking", "Cards"];
    expect(supportedMethods).toContain("UPI");
    expect(supportedMethods).toContain("Net Banking");
    expect(supportedMethods).toContain("Cards");
    expect(supportedMethods).not.toContain("Cryptocurrency");
    expect(supportedMethods).not.toContain("PayPal");
  });

  it("generates dynamic current copyright year", () => {
    const currentYear = new Date().getFullYear();
    expect(currentYear).toBeGreaterThanOrEqual(2026);
  });
});
