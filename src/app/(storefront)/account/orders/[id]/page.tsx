"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  RotateCw,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  MapPin,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const { id } = use(params);
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useCustomerAuth();
  const { addItem } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=/account/orders/${id}`);
      return;
    }
    if (isAuthenticated) {
      fetch(`/api/orders/${id}`)
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to load order.");
          }
          return res.json();
        })
        .then((data) => {
          setOrder(data.order);
          setWhatsappUrl(data.whatsappUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isAuthenticated, isLoading, router]);

  const handleReorder = async () => {
    setReordering(true);
    try {
      const res = await fetch(`/api/orders/${id}?action=reorder`);
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
      setReordering(false);
    }
  };

  const STEPS = [
    { key: "PENDING_WHATSAPP", label: "Request Placed", desc: "Awaiting seller confirmation on WhatsApp" },
    { key: "CONFIRMED", label: "Confirmed", desc: "Seller confirmed order & verified inventory" },
    { key: "PROCESSING", label: "In Crafting", desc: "Handloom tailoring & quality inspection" },
    { key: "READY_FOR_DISPATCH", label: "Ready for Dispatch", desc: "Packed and ready for courier pickup" },
    { key: "SHIPPED", label: "Dispatched", desc: "In transit with courier tracking" },
    { key: "DELIVERED", label: "Delivered", desc: "Handed over to customer" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED" || status === "RETURNED" || status === "REFUNDED") return -1;
    switch (status) {
      case "PENDING_WHATSAPP":
      case "PENDING_WHATSAPP_CONFIRMATION":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PROCESSING":
        return 2;
      case "READY_FOR_DISPATCH":
        return 3;
      case "SHIPPED":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 0;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <RotateCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
        <p className="mt-2 text-xs text-thaagai-ink/60">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <XCircle className="mx-auto h-8 w-8 text-red-500" />
        <h1 className="mt-3 text-base font-bold text-thaagai-ink">Order Not Found</h1>
        <p className="mt-1 text-xs text-thaagai-ink/70">{error || "Could not retrieve order details."}</p>
        <Link
          href="/account/orders"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";
  const snapshot = order.deliverySnapshot as any;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col gap-3 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Orders
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
              Order {order.reference}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                isCancelled
                  ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                  : "bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-white"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Placed on {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat on WhatsApp</span>
            </a>
          )}

          <button
            onClick={handleReorder}
            disabled={reordering}
            className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-lg border border-thaagai-line bg-white px-4 text-xs font-semibold text-thaagai-ink shadow-sm hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${reordering ? "animate-spin" : ""}`} />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>

      {/* Visual Status Timeline */}
      {!isCancelled ? (
        <div className="mt-8 rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <h2 className="text-xs font-bold uppercase tracking-wider text-thaagai-gold">
            Fulfilment Timeline
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {STEPS.map((step, idx) => {
              const isPast = currentStep >= idx;
              const isCurrent = currentStep === idx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isPast
                        ? "bg-thaagai-wine text-white shadow-sm"
                        : "border border-thaagai-line bg-thaagai-sand/30 text-thaagai-ink/40 dark:bg-thaagai-sandDark/20"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                  </div>
                  <h3
                    className={`mt-2.5 text-xs font-bold ${
                      isCurrent
                        ? "text-thaagai-wine"
                        : isPast
                        ? "text-thaagai-ink dark:text-white"
                        : "text-thaagai-ink/40"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-tight text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mt-6 rounded-lg border border-thaagai-line/60 bg-thaagai-sand/20 p-3.5 text-xs dark:bg-thaagai-sandDark/10">
              <span className="font-semibold text-thaagai-ink dark:text-white">Courier Tracking: </span>
              <span className="font-mono">{order.courier ? `${order.courier} — ` : ""}{order.trackingNumber}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2 font-bold">
            <XCircle className="h-4 w-4" />
            <span>Order Cancelled</span>
          </div>
          <p className="mt-1">This order request was cancelled. If you need any assistance, reach out to us on WhatsApp.</p>
        </div>
      )}

      {/* Two Column Section: Delivery Snapshot & Items Breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Delivery Address Snapshot Card */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-thaagai-gold">
              <MapPin className="h-4 w-4" />
              <span>Delivery Address Snapshot</span>
            </div>

            <div className="mt-3 text-xs leading-relaxed text-thaagai-ink dark:text-white">
              <p className="font-bold">{order.customerName}</p>
              <p className="font-mono text-thaagai-ink/80 dark:text-thaagai-inkDark/80">+91 {order.customerPhone}</p>
              <div className="mt-2 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                {snapshot ? (
                  <>
                    <p>{snapshot.houseOrFlat}{snapshot.buildingName ? `, ${snapshot.buildingName}` : ""}</p>
                    <p>{snapshot.street}</p>
                    <p>{snapshot.locality}</p>
                    <p>{snapshot.city}, {snapshot.state} - <strong className="font-semibold text-thaagai-ink dark:text-white">{snapshot.pinCode}</strong></p>
                    {snapshot.landmark && <p className="text-[11px] italic">Landmark: {snapshot.landmark}</p>}
                  </>
                ) : (
                  <>
                    <p>{order.address}</p>
                    <p>{order.city}, {order.state} - <strong className="font-semibold">{order.pinCode}</strong></p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-thaagai-line/60 pt-3 text-[11px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
              <ShieldCheck className="inline h-3.5 w-3.5 text-emerald-600 mr-1" />
              Immutable address recorded at order creation time
            </div>
          </div>
        </div>

        {/* Items & Financial Summary (2 Columns) */}
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 md:col-span-2 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <h2 className="text-sm font-bold text-thaagai-ink dark:text-white">
            Ordered Items ({order.items.length})
          </h2>

          <div className="mt-4 divide-y divide-thaagai-line/40">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <h3 className="font-semibold text-thaagai-ink dark:text-white">{item.productName}</h3>
                  {item.variantLabel && (
                    <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                      Selection: {item.variantLabel}
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

          {/* Pricing Breakdown */}
          <div className="mt-6 border-t border-thaagai-line/60 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              <span>Subtotal</span>
              <span>&#8377;{Number(order.subtotal).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              <span>Shipping Charges</span>
              <span>{order.shippingAmount ? `₹${Number(order.shippingAmount).toLocaleString("en-IN")}` : "To be confirmed on WhatsApp"}</span>
            </div>
            <div className="flex justify-between border-t border-thaagai-line/60 pt-2 text-sm font-bold text-thaagai-wine">
              <span>Final Total</span>
              <span>&#8377;{Number(order.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
