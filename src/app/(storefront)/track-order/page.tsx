"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Scissors,
} from "lucide-react";
import { TempleBorder, HeritageBadge } from "@/components/storefront/tamil-motifs";

interface TrackedOrder {
  id: string;
  reference: string;
  status: string;
  customerName: string;
  createdAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  courier?: string | null;
  trackingNumber?: string | null;
  total: string | number;
  city: string;
  state: string;
  items: Array<{
    id: string;
    productName: string;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: string | number;
  }>;
}

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);

    if (!reference.trim() || !phone.trim()) {
      setError("Please provide both your Order Reference and 10-digit Mobile Number.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found.");
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to look up order.");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex: number, status: string) => {
    // 0: Order Placed
    // 1: Verified via WhatsApp / Confirmed
    // 2: Tailoring / Processing
    // 3: Dispatched / Shipped
    // 4: Delivered
    const orderHierarchy: Record<string, number> = {
      PENDING_WHATSAPP: 0,
      PENDING_WHATSAPP_CONFIRMATION: 0,
      SUBMITTED_BY_CUSTOMER: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      READY_FOR_DISPATCH: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };

    const currentLevel = orderHierarchy[status] ?? 0;
    if (currentLevel > stepIndex) return "completed";
    if (currentLevel === stepIndex) return "current";
    return "upcoming";
  };

  const steps = [
    { label: "Order Submitted", desc: "Order details received at atelier" },
    { label: "WhatsApp Verified", desc: "Confirmed with client concierge" },
    { label: "Tailoring & QC", desc: "Handloom tailoring & quality check" },
    { label: "Dispatched", desc: "Handed over to courier express" },
    { label: "Delivered", desc: "Received by client" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <HeritageBadge
          text="Order Tracking"
          className="mx-auto mb-3 bg-thaagai-sand text-thaagai-wine border-thaagai-gold/60"
        />
        <h1 className="font-serif text-3xl font-bold text-thaagai-wine sm:text-4xl">
          Track Your Churidar Order
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Enter your Order Reference tag from your receipt or WhatsApp conversation to follow its tailoring and dispatch journey.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-thaagai-line bg-white p-6 shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <form onSubmit={handleTrack} className="space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-thaagai-ink dark:text-white">
              Order Reference *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ORD-2026-0001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 font-mono text-xs font-bold uppercase text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-thaagai-ink dark:text-white">
              10-Digit Mobile Number *
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-3 font-mono text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="h-11 w-full rounded-lg border border-thaagai-line bg-white pl-12 pr-3 font-mono text-xs font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-thaagai-wine text-xs font-bold text-white shadow-md transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-thaagai-gold" />
            )}
            <span>Track Order Status</span>
          </button>
        </form>
      </div>

      {/* Result Order Details */}
      {order && (
        <div className="mt-10 space-y-8 animate-fadeIn">
          {/* Order Header Card */}
          <div className="rounded-2xl border border-thaagai-gold/60 bg-[#FAF7F2] p-6 dark:bg-thaagai-cardDark">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded bg-thaagai-wine px-2.5 py-1 font-mono text-xs font-bold text-white shadow-xs">
                  {order.reference}
                </span>
                <h3 className="mt-3 font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  Client: {order.customerName} ({order.city}, {order.state})
                </h3>
                <p className="text-xs text-thaagai-ink/60">
                  Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-thaagai-line/60 sm:pl-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60">
                  Total Amount
                </span>
                <p className="font-serif text-2xl font-bold text-thaagai-wine dark:text-thaagai-gold">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Courier Dispatch info if present */}
            {order.courier && order.trackingNumber && (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-bold">
                      Dispatched via {order.courier}
                    </p>
                    <p className="font-mono text-[11px]">
                      Tracking AWB: {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(order.courier + " " + order.trackingNumber)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 font-bold text-white hover:bg-emerald-800"
                >
                  <span>Track Courier</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 5-Step Visual Timeline */}
          <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h3 className="font-serif text-base font-bold text-thaagai-ink dark:text-white">
              Atelier Progress Journey
            </h3>

            <div className="mt-8 relative">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
                {steps.map((step, idx) => {
                  const status = getStepStatus(idx, order.status);
                  const isCompleted = status === "completed";
                  const isCurrent = status === "current";

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-thaagai-wine text-white ring-4 ring-thaagai-gold/40 animate-pulse"
                            : "bg-thaagai-sand text-thaagai-ink/40 dark:bg-thaagai-sandDark"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>

                      <h4
                        className={`mt-3 text-xs font-bold ${
                          isCurrent
                            ? "text-thaagai-wine dark:text-thaagai-gold"
                            : isCompleted
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-thaagai-ink/50"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="mt-1 text-[10px] text-thaagai-ink/60 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ordered Garments Table */}
          <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h3 className="font-serif text-base font-bold text-thaagai-ink dark:text-white">
              Ensemble Garments
            </h3>
            <div className="mt-4 divide-y divide-thaagai-line/50 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-thaagai-ink dark:text-white">
                      {item.productName}
                    </p>
                    {item.variantLabel && (
                      <span className="text-[11px] text-thaagai-gold font-medium">
                        Size: {item.variantLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-thaagai-ink dark:text-white">
                      ₹{Number(item.unitPrice).toLocaleString("en-IN")} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center border-t border-thaagai-line/60 pt-4">
              <a
                href={`https://wa.me/919443212345?text=${encodeURIComponent(
                  `Namaste THAAGAI Concierge, inquiring regarding status of order ${order.reference}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat with Atelier Concierge on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
