"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  RefreshCw,
  Truck,
  PackageCheck,
  XCircle,
  AlertTriangle,
  Scissors,
} from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal / input state for shipping
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [courier, setCourier] = useState("DTDC");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        setError("Could not load order details.");
      }
    } catch {
      setError("Network error loading order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handlePaymentStatusChange = async (paymentStatus: string) => {
    setError("");
    setSuccess("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update payment status.");
      } else {
        setSuccess(`Payment status updated to ${paymentStatus}`);
        fetchOrder();
      }
    } catch {
      setError("Network error updating payment status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransition = async (to: string, note?: string, extraData?: any) => {
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, note, ...extraData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update order status.");
        setActionLoading(false);
        return;
      }

      setSuccess(`Order successfully updated to ${to}`);
      setShippingModalOpen(false);
      fetchOrder();
    } catch {
      setError("Network error while updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-thaagai-wine" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="font-semibold text-rose-700">Order not found.</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-xs font-semibold text-thaagai-wine underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-thaagai-line bg-white text-thaagai-ink hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
                {order.reference}
              </h1>
              <span className="rounded-full bg-thaagai-sand px-2.5 py-0.5 text-xs font-bold text-thaagai-wine dark:bg-thaagai-sandDark">
                {order.status}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  order.paymentStatus === "PAID"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              >
                Payment: {order.paymentStatus || "UNPAID"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-thaagai-ink/60">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* WhatsApp Customer Button */}
        <a
          href={`https://wa.me/91${order.customerPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat with Customer (+91 {order.customerPhone})</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Action Toolbar for Order Status */}
      <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <h2 className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Available Status Transitions
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {order.status === "PENDING_WHATSAPP" && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirm(`Confirm order ${order.reference}? This will atomically deduct stock from live inventory.`)) {
                    handleTransition("CONFIRMED", "Confirmed by admin after WhatsApp verification");
                  }
                }}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Order (Deduct Stock)</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  const reason = prompt("Enter cancellation reason:");
                  if (reason !== null) {
                    handleTransition("CANCELLED", reason || "Cancelled by admin");
                  }
                }}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject / Cancel</span>
              </button>
            </>
          )}

          {order.status === "CONFIRMED" && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleTransition("PROCESSING", "Marked as processing")}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Mark as Processing</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleTransition("READY_FOR_DISPATCH", "Ready for dispatch")}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-cyan-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Mark Ready for Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => setShippingModalOpen(true)}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Truck className="h-4 w-4" />
                <span>Ship Order (Enter Tracking)</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirm("Cancel this confirmed order? The reserved inventory will be automatically restored.")) {
                    handleTransition("CANCELLED", "Cancelled after confirmation; stock restored");
                  }
                }}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel & Restock</span>
              </button>
            </>
          )}

          {order.status === "PROCESSING" && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleTransition("READY_FOR_DISPATCH", "Order packed and ready for courier pickup")}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-cyan-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Mark Ready for Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => setShippingModalOpen(true)}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Truck className="h-4 w-4" />
                <span>Ship Order (Enter Tracking)</span>
              </button>
            </>
          )}

          {order.status === "READY_FOR_DISPATCH" && (
            <>
              <button
                type="button"
                onClick={() => setShippingModalOpen(true)}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Truck className="h-4 w-4" />
                <span>Ship Order (Enter Tracking)</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirm("Cancel this order? Reserved stock will be restored.")) {
                    handleTransition("CANCELLED", "Cancelled from ready for dispatch; stock restored");
                  }
                }}
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel & Restock</span>
              </button>
            </>
          )}

          {order.status === "SHIPPED" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleTransition("DELIVERED", "Confirmed delivery to customer")}
              className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-md bg-purple-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Mark as Delivered</span>
            </button>
          )}

          {["DELIVERED", "CANCELLED"].includes(order.status) && (
            <p className="text-xs text-thaagai-ink/60">
              No further transitions available for this finalized order.
            </p>
          )}
        </div>

        {/* Payment Status Quick Toggle */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-thaagai-line/40 pt-3">
          <span className="text-xs font-bold text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Payment Status:
          </span>
          {order.paymentStatus !== "PAID" ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handlePaymentStatusChange("PAID")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Mark as PAID</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handlePaymentStatusChange("UNPAID")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              <span>Mark as UNPAID</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Items List */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
              Requested Items ({order.items.length})
            </h2>

            <div className="mt-4 divide-y divide-thaagai-line/40">
              {order.items.map((it: any) => {
                const cust = it.customizations as any;
                return (
                  <div key={it.id} className="py-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-thaagai-ink dark:text-white">
                          {it.productName}
                        </p>
                        <p className="text-xs text-thaagai-ink/60 font-mono">
                          SKU: {it.sku} {it.variantLabel ? `· Option: ${it.variantLabel}` : ""}
                        </p>
                        <p className="text-xs text-thaagai-ink/70">
                          ₹{Number(it.unitPrice).toLocaleString("en-IN")} × {it.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-bold text-thaagai-wine">
                        ₹{Number(it.lineTotal).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Bespoke Customization Snapshot */}
                    {cust && (
                      <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="flex items-center gap-1 font-bold text-thaagai-maroon">
                          <Scissors className="h-3.5 w-3.5 text-thaagai-gold" />
                          <span>Bespoke Tailoring Snapshot</span>
                        </div>

                        {cust.selections && cust.selections.length > 0 && (
                          <div className="mt-1 space-y-0.5 text-[11px]">
                            {cust.selections.map((s: any, sIdx: number) => (
                              <div key={sIdx}>
                                • {s.groupName}: <strong>{s.optionName}</strong>
                                {s.priceDelta && s.priceDelta > 0 ? ` (+₹${s.priceDelta})` : ""}
                              </div>
                            ))}
                          </div>
                        )}

                        {cust.measurements && (
                          <div className="mt-2 border-t border-amber-200/60 pt-1.5 text-[11px]">
                            <span className="font-semibold text-thaagai-maroon block">
                              Tailoring Measurements:
                            </span>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                              {cust.measurements.bust && <span>Bust: <strong>{cust.measurements.bust}&quot;</strong></span>}
                              {cust.measurements.waist && <span>Waist: <strong>{cust.measurements.waist}&quot;</strong></span>}
                              {cust.measurements.hips && <span>Hips: <strong>{cust.measurements.hips}&quot;</strong></span>}
                              {cust.measurements.length && <span>Length: <strong>{cust.measurements.length}&quot;</strong></span>}
                              {cust.measurements.shoulder && <span>Shoulder: <strong>{cust.measurements.shoulder}&quot;</strong></span>}
                            </div>
                            {cust.measurements.notes && (
                              <p className="mt-1 italic">
                                Special instructions: &quot;{cust.measurements.notes}&quot;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-thaagai-line/60 pt-4 flex justify-between font-bold text-sm">
              <span>Catalog Subtotal</span>
              <span className="font-mono text-thaagai-wine">
                ₹{Number(order.subtotal).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
              Audit Timeline
            </h2>

            <div className="mt-4 space-y-4">
              {order.history?.map((h: any) => (
                <div key={h.id} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-thaagai-ink dark:text-white">
                        {h.previousStatus ? `${h.previousStatus} → ` : ""}{h.newStatus}
                      </span>
                      <span className="text-[11px] text-thaagai-ink/50">
                        {new Date(h.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {h.note && <p className="mt-0.5 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">{h.note}</p>}
                    {h.actor?.name && (
                      <p className="text-[10px] text-thaagai-ink/50">By: {h.actor.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Customer & Shipping Destination */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="text-sm font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
              Customer Details
            </h2>
            <div className="mt-4 space-y-2 text-xs">
              <div>
                <span className="text-thaagai-ink/60">Order Contact Name:</span>
                <p className="font-semibold text-sm text-thaagai-ink dark:text-white">{order.customerName}</p>
              </div>
              <div>
                <span className="text-thaagai-ink/60">WhatsApp Phone:</span>
                <p className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  +91 {order.customerPhone}
                </p>
              </div>
              {order.customer && (
                <div className="mt-3 rounded-lg border border-thaagai-line/60 bg-thaagai-sand/30 p-2.5 dark:bg-thaagai-cardDark">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-thaagai-wine">
                    Registered Customer Profile
                  </span>
                  <p className="font-semibold text-thaagai-ink dark:text-white">
                    {order.customer.fullName || "Thaagai Customer"}
                  </p>
                  <p className="text-[11px] text-thaagai-ink/70">
                    +91 {order.customer.mobileNumber}
                  </p>
                  {order.customer.email && (
                    <p className="text-[11px] text-thaagai-ink/70">
                      {order.customer.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-thaagai-line/60 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/60">
                  Delivery Address Snapshot
                </h3>
                {order.deliverySnapshot?.addressType && (
                  <span className="rounded bg-thaagai-sand px-1.5 py-0.5 text-[10px] font-bold text-thaagai-wine dark:bg-thaagai-sandDark">
                    {order.deliverySnapshot.addressType}
                  </span>
                )}
              </div>

              {order.deliverySnapshot ? (
                <div className="mt-2 space-y-1 text-xs leading-relaxed text-thaagai-ink/90 dark:text-thaagai-inkDark/90">
                  <p className="font-bold text-thaagai-ink dark:text-white">
                    {order.deliverySnapshot.recipientName || order.customerName}
                    {order.deliverySnapshot.mobileNumber && (
                      <span className="ml-2 font-mono font-normal text-thaagai-ink/60">
                        (+91 {order.deliverySnapshot.mobileNumber})
                      </span>
                    )}
                  </p>
                  <p>
                    {[order.deliverySnapshot.houseOrFlat, order.deliverySnapshot.buildingName]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.deliverySnapshot.street && <p>{order.deliverySnapshot.street}</p>}
                  <p>
                    {[order.deliverySnapshot.locality || order.deliverySnapshot.postOffice, order.deliverySnapshot.landmark ? `Near ${order.deliverySnapshot.landmark}` : null]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="font-medium">
                    {[order.deliverySnapshot.city || order.deliverySnapshot.district, order.deliverySnapshot.state]
                      .filter(Boolean)
                      .join(", ")}{" "}
                    - <span className="font-mono font-bold">{order.deliverySnapshot.pinCode || order.pinCode}</span>
                  </p>
                  <p className="text-[11px] text-thaagai-ink/60">
                    {order.deliverySnapshot.country || "India"}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                  {order.address}<br />
                  {order.city}, {order.state} - <span className="font-mono font-bold">{order.pinCode}</span>
                </p>
              )}
            </div>

            {order.trackingNumber && (
              <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                  Courier Tracking
                </span>
                <p className="mt-1 font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                  {order.courier || "Courier"}: <span className="font-mono">{order.trackingNumber}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Details Modal */}
      {shippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-thaagai-line bg-white p-6 shadow-xl dark:bg-thaagai-cardDark">
            <h3 className="font-brand text-lg font-bold text-thaagai-wine">
              Ship Order {order.reference}
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/70">
              Enter courier partner and tracking ID before updating status to SHIPPED.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">Courier Partner</label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. DTDC, Delhivery, BlueDart, India Post"
                  className="mt-1 h-10 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-thaagai-ink dark:text-white">Tracking Number / AWB</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. D12345678"
                  className="mt-1 h-10 w-full rounded-md border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShippingModalOpen(false)}
                className="h-10 rounded-md border border-thaagai-line px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !trackingNumber.trim()}
                onClick={() =>
                  handleTransition("SHIPPED", `Dispatched via ${courier} (${trackingNumber})`, {
                    courier,
                    trackingNumber,
                  })
                }
                className="h-10 rounded-md bg-indigo-600 px-5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Confirm Shipment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
