"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  ExternalLink,
  Calendar,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; verified: number }>({ total: 0, verified: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("q", search.trim());

      const res = await fetch(`/api/admin/customers?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setStats(data.stats || { total: 0, verified: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers & Clients</h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Registered customer accounts, verified phone numbers, saved addresses, and order histories
          </p>
        </div>

        <button
          onClick={() => fetchCustomers()}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md border border-thaagai-line bg-white px-4 text-xs font-semibold text-thaagai-ink hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/60">
              Total Clients
            </span>
            <Users className="h-4 w-4 text-thaagai-wine" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-thaagai-ink dark:text-white">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/60">
              Mobile Verified
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
            {stats.verified}
          </p>
        </div>

        <div className="rounded-xl border border-thaagai-line bg-white p-5 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/60">
              Active Orders Total
            </span>
            <ShoppingBag className="h-4 w-4 text-thaagai-gold" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-thaagai-ink dark:text-white">
            {customers.reduce((sum, c) => sum + c.ordersCount, 0)}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone (+91), or email..."
          className="h-11 w-full rounded-md border border-thaagai-line bg-white px-3 pl-9 text-xs text-thaagai-ink placeholder:text-stone-400 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
        />
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-thaagai-ink/40" />
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-thaagai-line/60 bg-thaagai-sand/30 text-[11px] font-bold uppercase tracking-wider text-thaagai-ink/70 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/70">
              <tr>
                <th className="px-4 py-3.5">Customer / Client</th>
                <th className="px-4 py-3.5">Contact & WhatsApp</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Orders</th>
                <th className="px-4 py-3.5">Total Spend</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thaagai-line/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-thaagai-ink/50">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
                    <p className="mt-2">Loading customer accounts...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-thaagai-ink/60">
                    <Users className="mx-auto h-8 w-8 text-thaagai-ink/30" />
                    <p className="mt-2 font-semibold">No customers found.</p>
                    <p className="text-[11px] text-thaagai-ink/50">
                      Customers who log in via Mobile OTP or place orders will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-thaagai-sand font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold">
                          {(c.fullName || "C")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-thaagai-ink dark:text-white">
                            {c.fullName}
                          </p>
                          {c.email ? (
                            <p className="text-[11px] text-thaagai-ink/60">{c.email}</p>
                          ) : (
                            <span className="text-[10px] text-thaagai-ink/40">No email registered</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-semibold text-thaagai-ink dark:text-white">
                            +91 {c.mobileNumber}
                          </span>
                          {c.mobileVerifiedAt && (
                            <span
                              title="Phone verified via OTP"
                              className="inline-flex items-center text-emerald-600 dark:text-emerald-400"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <a
                          href={`https://wa.me/91${c.mobileNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                      {c.defaultAddress ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-thaagai-wine/70" />
                          <span>
                            {c.defaultAddress.locality ? `${c.defaultAddress.locality}, ` : ""}
                            {c.defaultAddress.city}, {c.defaultAddress.state} - {c.defaultAddress.pinCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-thaagai-ink/40">No address saved</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-semibold">{c.ordersCount}</span>{" "}
                      <span className="text-[11px] text-thaagai-ink/60">orders</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-thaagai-wine">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-thaagai-ink/60">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders?q=${c.mobileNumber}`}
                        className="inline-flex h-8 items-center gap-1 rounded bg-thaagai-sand px-2.5 text-[11px] font-semibold text-thaagai-wine hover:bg-thaagai-sand/80 dark:bg-thaagai-sandDark dark:text-white"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span>View Orders</span>
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
