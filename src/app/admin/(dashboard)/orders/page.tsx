"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";

const STATUS_FILTERS = [
  { label: "All Orders", value: "" },
  { label: "Pending WhatsApp", value: "PENDING_WHATSAPP" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Ready for Dispatch", value: "READY_FOR_DISPATCH" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING_WHATSAPP":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          <Clock className="h-3 w-3" /> Pending WhatsApp
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-3 w-3" /> Confirmed
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
          <RefreshCw className="h-3 w-3" /> Processing
        </span>
      );
    case "READY_FOR_DISPATCH":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300">
          <PackageCheck className="h-3 w-3" /> Ready for Dispatch
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Truck className="h-3 w-3" /> Shipped
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
          <PackageCheck className="h-3 w-3" /> Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-300">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800">
          {status}
        </span>
      );
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set("status", statusFilter);
      if (search.trim()) query.set("q", search.trim());

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders & Requests</h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Review customer order requests, confirm via WhatsApp, and manage status transitions
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md border border-thaagai-line bg-white px-4 text-xs font-semibold text-thaagai-ink hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-thaagai-line/60 pb-3">
        {STATUS_FILTERS.map((f) => {
          const count = f.value ? counts[f.value] || 0 : orders.length;
          const active = statusFilter === f.value;

          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${
                active
                  ? "bg-thaagai-wine text-white shadow-sm"
                  : "bg-white text-thaagai-ink/70 hover:bg-thaagai-sand/60 hover:text-thaagai-wine dark:bg-thaagai-cardDark dark:text-thaagai-inkDark"
              }`}
            >
              <span>{f.label}</span>
              {f.value && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-thaagai-sand text-thaagai-ink"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference (TG-...), name, or phone..."
          className="h-11 w-full rounded-md border border-thaagai-line bg-white px-3 pl-9 text-xs text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        />
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-thaagai-ink/40" />
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-thaagai-line/60 bg-thaagai-sand/30 text-[11px] font-bold uppercase tracking-wider text-thaagai-ink/70 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/70">
              <tr>
                <th className="px-4 py-3.5">Reference</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Pieces</th>
                <th className="px-4 py-3.5">Subtotal</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thaagai-line/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-thaagai-ink/50">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
                    <p className="mt-2">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-thaagai-ink/60">
                    <ShoppingCart className="mx-auto h-8 w-8 text-thaagai-ink/30" />
                    <p className="mt-2 font-semibold">No orders found.</p>
                    <p className="text-[11px] text-thaagai-ink/50">
                      Orders placed on the storefront will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10">
                    <td className="px-4 py-3.5 font-mono font-bold text-thaagai-wine">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-thaagai-ink dark:text-white">{o.customerName}</p>
                      <a
                        href={`https://wa.me/91${o.customerPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>+91 {o.customerPhone}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                      {o.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3.5 font-sans font-bold text-thaagai-ink dark:text-white">
                      ₹{Number(o.subtotal).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        {getStatusBadge(o.status)}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.paymentStatus === "PAID"
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {o.paymentStatus || "UNPAID"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded bg-thaagai-wine px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-thaagai-wineHover"
                      >
                        <span>Manage</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
