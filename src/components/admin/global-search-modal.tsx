"use client";

import { useEffect, useState, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  IndianRupee,
  X,
  Loader2,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  badge: string;
  url: string;
}

interface SearchResponse {
  query: string;
  results: {
    products: SearchResultItem[];
    orders: SearchResultItem[];
    customers: SearchResultItem[];
    inventory: SearchResultItem[];
    finance: SearchResultItem[];
  };
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse["results"] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
    } else {
      setQuery("");
      setData(null);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const json: SearchResponse = await res.json();
          setData(json.results);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [query, isOpen]);

  // Flattened array for keyboard navigation
  const flatItems: (SearchResultItem & { groupTitle: string })[] = [];
  if (data) {
    if (data.products?.length) {
      data.products.forEach((i) => flatItems.push({ ...i, groupTitle: "Products" }));
    }
    if (data.orders?.length) {
      data.orders.forEach((i) => flatItems.push({ ...i, groupTitle: "Orders" }));
    }
    if (data.customers?.length) {
      data.customers.forEach((i) => flatItems.push({ ...i, groupTitle: "Customers" }));
    }
    if (data.inventory?.length) {
      data.inventory.forEach((i) => flatItems.push({ ...i, groupTitle: "Inventory" }));
    }
    if (data.finance?.length) {
      data.finance.forEach((i) => flatItems.push({ ...i, groupTitle: "Finance" }));
    }
  }

  const navigateTo = useCallback(
    (url: string) => {
      onClose();
      startTransition(() => {
        router.push(url);
      });
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (flatItems.length ? (prev + 1) % flatItems.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (flatItems.length ? (prev - 1 + flatItems.length) % flatItems.length : 0));
      } else if (e.key === "Enter") {
        if (flatItems.length && flatItems[activeIndex]) {
          e.preventDefault();
          navigateTo(flatItems[activeIndex].url);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatItems, activeIndex, navigateTo, onClose]);

  if (!isOpen) return null;

  const totalResults = flatItems.length;

  const getGroupIcon = (group: string) => {
    switch (group) {
      case "Products":
        return <Package className="h-4 w-4 text-thaagai-wine" />;
      case "Orders":
        return <ShoppingCart className="h-4 w-4 text-emerald-700" />;
      case "Customers":
        return <Users className="h-4 w-4 text-blue-700" />;
      case "Inventory":
        return <Boxes className="h-4 w-4 text-amber-700" />;
      case "Finance":
        return <IndianRupee className="h-4 w-4 text-purple-700" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Admin Global Search"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-thaagai-line bg-white shadow-2xl transition-all dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-thaagai-line/70 px-4 py-3 dark:border-thaagai-line/30">
          <Search className="h-5 w-5 text-thaagai-ink/50 dark:text-thaagai-inkDark/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, inventory, finance..."
            className="w-full bg-transparent px-3 text-sm font-medium text-thaagai-ink placeholder-thaagai-ink/40 outline-none dark:text-white dark:placeholder-thaagai-inkDark/40"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-thaagai-gold" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded p-1 text-thaagai-ink/40 hover:text-thaagai-ink dark:text-thaagai-inkDark/40 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden rounded border border-thaagai-line/80 bg-thaagai-sand/50 px-2 py-0.5 text-[10px] font-semibold text-thaagai-ink/60 sm:inline-block dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/40 dark:text-thaagai-inkDark/60">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div
          ref={resultsContainerRef}
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {query.trim().length > 0 && query.trim().length < 2 && (
            <div className="py-8 text-center text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Type at least 2 characters to search across boutique records...
            </div>
          )}

          {query.trim().length >= 2 && !loading && totalResults === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-thaagai-ink/30 dark:text-thaagai-inkDark/30" />
              <p className="mt-2 text-sm font-semibold text-thaagai-ink dark:text-white">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                Check SKU spellings, customer phone numbers, or order reference tags.
              </p>
            </div>
          )}

          {/* Grouped results rendering */}
          {totalResults > 0 && (
            <div className="space-y-4 py-2">
              {(["Products", "Orders", "Customers", "Inventory", "Finance"] as const).map((grp) => {
                const groupItems = flatItems.filter((i) => i.groupTitle === grp);
                if (groupItems.length === 0) return null;

                return (
                  <div key={grp} className="space-y-1">
                    <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                      {getGroupIcon(grp)}
                      <span>{grp}</span>
                    </div>

                    <div className="space-y-1">
                      {groupItems.map((item) => {
                        const itemGlobalIndex = flatItems.findIndex(
                          (fi) => fi.id === item.id && fi.groupTitle === item.groupTitle
                        );
                        const isSelected = itemGlobalIndex === activeIndex;

                        return (
                          <div
                            key={`${item.groupTitle}-${item.id}`}
                            onClick={() => navigateTo(item.url)}
                            onMouseEnter={() => setActiveIndex(itemGlobalIndex)}
                            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                              isSelected
                                ? "bg-thaagai-wine text-white"
                                : "hover:bg-thaagai-sand/60 dark:hover:bg-thaagai-sandDark/40"
                            }`}
                          >
                            <div className="min-w-0 pr-3">
                              <p
                                className={`truncate text-xs font-semibold ${
                                  isSelected
                                    ? "text-white"
                                    : "text-thaagai-ink dark:text-white"
                                }`}
                              >
                                {item.title}
                              </p>
                              <p
                                className={`truncate text-[11px] ${
                                  isSelected
                                    ? "text-white/80"
                                    : "text-thaagai-ink/60 dark:text-thaagai-inkDark/60"
                                }`}
                              >
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {item.status && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    isSelected
                                      ? "bg-white/20 text-white"
                                      : "bg-thaagai-sand text-thaagai-ink dark:bg-thaagai-sandDark dark:text-white"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              )}
                              <ArrowRight
                                className={`h-3.5 w-3.5 ${
                                  isSelected ? "text-white" : "text-thaagai-ink/30"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Default Quick Navigation when empty */}
          {!query && (
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                Quick Shortcuts
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={() => navigateTo("/admin/orders")}
                  className="flex flex-col items-start rounded-lg border border-thaagai-line/70 p-3 text-left transition-colors hover:border-thaagai-wine hover:bg-thaagai-sand/30 dark:border-thaagai-line/30"
                >
                  <ShoppingCart className="h-4 w-4 text-thaagai-wine" />
                  <span className="mt-2 text-xs font-bold text-thaagai-ink dark:text-white">Orders</span>
                  <span className="text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Manage sales</span>
                </button>
                <button
                  onClick={() => navigateTo("/admin/inventory")}
                  className="flex flex-col items-start rounded-lg border border-thaagai-line/70 p-3 text-left transition-colors hover:border-thaagai-wine hover:bg-thaagai-sand/30 dark:border-thaagai-line/30"
                >
                  <Boxes className="h-4 w-4 text-thaagai-gold" />
                  <span className="mt-2 text-xs font-bold text-thaagai-ink dark:text-white">Inventory</span>
                  <span className="text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Stock matrix</span>
                </button>
                <button
                  onClick={() => navigateTo("/admin/finance")}
                  className="flex flex-col items-start rounded-lg border border-thaagai-line/70 p-3 text-left transition-colors hover:border-thaagai-wine hover:bg-thaagai-sand/30 dark:border-thaagai-line/30"
                >
                  <IndianRupee className="h-4 w-4 text-emerald-700" />
                  <span className="mt-2 text-xs font-bold text-thaagai-ink dark:text-white">Finance</span>
                  <span className="text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Income & expenses</span>
                </button>
                <button
                  onClick={() => navigateTo("/admin/products")}
                  className="flex flex-col items-start rounded-lg border border-thaagai-line/70 p-3 text-left transition-colors hover:border-thaagai-wine hover:bg-thaagai-sand/30 dark:border-thaagai-line/30"
                >
                  <Package className="h-4 w-4 text-purple-700" />
                  <span className="mt-2 text-xs font-bold text-thaagai-ink dark:text-white">Products</span>
                  <span className="text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">Catalog editor</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Legend */}
        <div className="flex items-center justify-between border-t border-thaagai-line/70 bg-thaagai-sand/20 px-4 py-2.5 text-[11px] text-thaagai-ink/60 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-thaagai-line/80 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
                ↑
              </kbd>
              <kbd className="rounded border border-thaagai-line/80 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-thaagai-line/80 bg-white px-1.5 py-0.5 text-[10px] font-mono dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
                <CornerDownLeft className="h-2.5 w-2.5 inline" />
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>Boutique Command Center</span>
        </div>
      </div>
    </div>
  );
}
