"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  RotateCw,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";

interface OrderItem {
  id: string;
  productName: string;
  variantLabel: string | null;
  unitPrice: string | number;
  quantity: number;
  lineTotal: string | number;
}

interface Order {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  subtotal: string | number;
  total: string | number;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const { addItem } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (filter: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?status=${filter}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account/orders");
      return;
    }
    if (isAuthenticated) {
      fetchOrders(statusFilter);
    }
  }, [isLoading, isAuthenticated, statusFilter, router, fetchOrders]);

  const handleReorder = async (orderId: string) => {
    setReorderingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}?action=reorder`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reorder");

      let addedCount = 0;
      for (const it of data.items) {
        if (it.available && it.variantId) {
          addItem(
            {
              variantId: it.variantId,
              productId: it.productId,
              name: it.productName,
              sku: it.sku || it.variantId,
              price: it.unitPrice,
              salePrice: null,
              size: it.variantLabel || undefined,
              colour: undefined,
              maxStock: it.availableQuantity,
              slug: it.productSlug || "",
            },
            it.requestedQuantity
          );
          addedCount++;
        }
      }

      if (addedCount > 0) {
        router.push("/cart");
      } else {
        alert("The items from this order are currently out of stock.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to process reorder.");
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_WHATSAPP":
      case "PENDING_WHATSAPP_CONFIRMATION":
        return {
          label: "Awaiting WhatsApp Confirmation",
          className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          label: "Order Confirmed",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
          icon: CheckCircle,
        };
      case "PROCESSING":
        return {
          label: "In Crafting / Processing",
          className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
          icon: RotateCw,
        };
      case "READY_FOR_DISPATCH":
        return {
          label: "Ready for Dispatch",
          className: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
          icon: PackageCheck,
        };
      case "SHIPPED":
        return {
          label: "Dispatched & In Transit",
          className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "bg-emerald-600 text-white",
          icon: CheckCircle,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
          icon: XCircle,
        };
      default:
        return {
          label: status.replace(/_/g, " "),
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          icon: Clock,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <RotateCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
        <p className="mt-2 text-xs text-thaagai-ink/60">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Account
            </Link>
          </div>
          <h1 className="mt-2 font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            My Order Requests
          </h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Track status, delivery snapshots and chat with the seller on WhatsApp
          </p>
        </div>

        <Link
          href="/shop"
          className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Shop More Pieces</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-thaagai-line/40 pb-4">
        {(["all", "active", "delivered", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`flex h-10 items-center rounded-lg px-4 text-xs font-semibold capitalize transition-colors ${
              statusFilter === tab
                ? "bg-thaagai-wine text-white shadow-sm"
                : "border border-thaagai-line bg-white text-thaagai-ink hover:bg-thaagai-sand/30 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
            }`}
          >
            {tab === "all" ? "All Orders" : `${tab} Orders`}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-16 text-center">
          <RotateCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
          <p className="mt-2 text-xs text-thaagai-ink/60">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-thaagai-line p-12 text-center dark:border-thaagai-line/40">
          <div className="rounded-full bg-thaagai-sand/60 p-4 text-thaagai-wine dark:bg-thaagai-sandDark/40">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-base font-bold text-thaagai-ink dark:text-white">
            No {statusFilter !== "all" ? `${statusFilter} ` : ""}orders found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Browse our handloom clothing and handcrafted temple jewellery collections.
          </p>
          <Link
            href="/shop"
            className="mt-6 flex h-11 min-h-[44px] items-center rounded-lg bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
          >
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const formattedTotal = Number(order.total).toLocaleString("en-IN");
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm transition-all hover:border-thaagai-wine/40 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col gap-2 border-b border-thaagai-line/60 bg-thaagai-sand/20 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-thaagai-sandDark/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-thaagai-wine">
                      {order.reference}
                    </span>
                    <span className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                      Placed on {dateStr}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                    >
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {badge.label}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-4 sm:p-5">
                  <div className="divide-y divide-thaagai-line/40">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-thaagai-ink dark:text-white">
                            {item.productName}
                          </p>
                          {item.variantLabel && (
                            <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                              Option: {item.variantLabel}
                            </p>
                          )}
                          <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                            Qty: {item.quantity} &times; &#8377;{Number(item.unitPrice).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className="font-semibold text-thaagai-ink dark:text-white">
                          &#8377;{Number(item.lineTotal).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Total */}
                  <div className="mt-4 flex flex-col gap-3 border-t border-thaagai-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                        Total Amount:{" "}
                      </span>
                      <strong className="font-brand text-lg font-bold text-thaagai-wine">
                        &#8377;{formattedTotal}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReorder(order.id)}
                        disabled={reorderingId === order.id}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-thaagai-line bg-white px-3.5 text-xs font-semibold text-thaagai-ink shadow-sm transition-colors hover:bg-thaagai-sand/30 hover:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${reorderingId === order.id ? "animate-spin" : ""}`} />
                        <span>Reorder</span>
                      </button>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="flex h-10 items-center gap-1 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
