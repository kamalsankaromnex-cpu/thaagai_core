import Link from "next/link";
import {
  Package,
  Layers,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  ShoppingCart,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let totalProducts = 0;
  let activeProducts = 0;
  let totalCategories = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalCustomers = 0;
  let totalRevenue = 0;
  let lowStockVariants: any[] = [];
  let recentOrders: any[] = [];
  let dbError: string | null = null;

  try {
    const [
      prodCount,
      activeProdCount,
      catCount,
      orderCount,
      pendingCount,
      custCount,
      paidOrders,
      lowStock,
      recent,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { status: "ACTIVE" } }),
      db.category.count({ where: { active: true } }),
      db.orderRequest.count(),
      db.orderRequest.count({
        where: {
          status: {
            in: ["PENDING_WHATSAPP", "PENDING_WHATSAPP_CONFIRMATION", "SUBMITTED_BY_CUSTOMER"],
          },
        },
      }),
      db.customer.count(),
      db.orderRequest.findMany({
        where: {
          OR: [{ paymentStatus: "PAID" }, { status: "CONFIRMED" }],
        },
        select: { total: true },
      }),
      db.productVariant.findMany({
        where: {
          stockQuantity: { lte: 2 },
          active: true,
          product: { status: "ACTIVE" },
        },
        include: { product: { select: { name: true } } },
        take: 5,
      }),
      db.orderRequest.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          items: { take: 3 },
          customer: { select: { fullName: true, mobileNumber: true } },
        },
      }),
    ]);

    totalProducts = prodCount;
    activeProducts = activeProdCount;
    totalCategories = catCount;
    totalOrders = orderCount;
    pendingOrders = pendingCount;
    totalCustomers = custCount;
    totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    lowStockVariants = lowStock;
    recentOrders = recent;
  } catch (error) {
    console.error("Admin dashboard DB error:", error);
    dbError = "Database connectivity notice: Please verify your PostgreSQL connection.";
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Boutique Operations Overview
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Real-time status of orders, verified revenue, registered clients, and active inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-md border border-thaagai-line bg-white px-4 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
          >
            <Users className="h-4 w-4 text-thaagai-gold" />
            <span>Clients Directory</span>
          </Link>
        </div>
      </div>

      {dbError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-sm">Notice</p>
            <p className="mt-1 leading-relaxed">{dbError}</p>
          </div>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Orders Card */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Pending Orders
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-amber-700 dark:text-amber-400">
              {pendingOrders}
            </span>
            <span className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              of {totalOrders} total
            </span>
          </div>
          <Link
            href="/admin/orders?status=PENDING_WHATSAPP"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
          >
            Review awaiting orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Verified Revenue Card */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Verified Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              confirmed orders
            </span>
          </div>
          <Link
            href="/admin/orders?status=CONFIRMED"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
          >
            Confirmed orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Registered Clients / Customers Card */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Registered Clients
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-thaagai-ink dark:text-white">
              {totalCustomers}
            </span>
            <span className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              verified profiles
            </span>
          </div>
          <Link
            href="/admin/customers"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
          >
            Open clients directory <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Active Products & Catalog Card */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Active Garments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-thaagai-ink dark:text-white">
              {activeProducts}
            </span>
            <span className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              {totalCategories} categories
            </span>
          </div>
          <Link
            href="/admin/products"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-thaagai-wine hover:underline"
          >
            Manage inventory <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Orders & Low Stock alerts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders Table (2 Cols) */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm lg:col-span-2 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-4">
            <div>
              <h2 className="font-brand text-base font-bold tracking-tight text-thaagai-ink dark:text-white">
                Recent Order Requests
              </h2>
              <p className="text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                Latest customer order inquiries needing WhatsApp verification
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-thaagai-wine hover:underline"
            >
              View all orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-6 text-center text-xs text-thaagai-ink/60">
              No orders have been submitted yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-thaagai-line/40">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="font-mono text-xs font-bold text-thaagai-wine hover:underline"
                      >
                        {ord.reference}
                      </Link>
                      <span className="rounded bg-thaagai-sand px-2 py-0.5 text-[10px] font-semibold text-thaagai-ink">
                        {ord.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-thaagai-ink/80 dark:text-white">
                      <strong>{ord.customerName}</strong> · +91 {ord.customerPhone} ({ord.city})
                    </p>
                    <p className="text-[11px] text-thaagai-ink/60">
                      {ord.items.map((i: any) => i.productName).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <span className="font-sans text-sm font-bold text-thaagai-ink dark:text-white">
                      ₹{Number(ord.total).toLocaleString("en-IN")}
                    </span>
                    <a
                      href={`https://wa.me/91${ord.customerPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="rounded-xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/30">
          <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-4">
            <h2 className="font-brand text-base font-bold tracking-tight text-thaagai-ink dark:text-white">
              Low Stock Warnings
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-thaagai-wine hover:underline"
            >
              Inventory
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <p className="mt-6 text-center text-xs text-thaagai-ink/60">
              All variant stock levels are currently healthy.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-thaagai-line/40">
              {lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-semibold text-thaagai-ink dark:text-white">
                      {v.product.name}
                    </p>
                    <p className="text-[11px] font-mono text-thaagai-ink/60">
                      SKU: {v.sku}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    {v.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
