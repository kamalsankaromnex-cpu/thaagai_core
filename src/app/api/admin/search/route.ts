import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        query: q,
        results: {
          products: [],
          orders: [],
          customers: [],
          inventory: [],
          finance: [],
        },
      });
    }

    // Run parallel scoped queries with limits
    const [products, orders, customers, inventory, finance] = await Promise.all([
      // Products search
      db.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          sku: true,
          basePrice: true,
          status: true,
        },
      }),

      // Orders search
      db.orderRequest.findMany({
        where: {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customerPhone: { contains: q } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerPhone: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),

      // Customers search
      db.customer.findMany({
        where: {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { mobileNumber: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          email: true,
        },
      }),

      // Inventory / Variants search
      db.productVariant.findMany({
        where: {
          OR: [
            { sku: { contains: q, mode: "insensitive" } },
            { size: { contains: q, mode: "insensitive" } },
            { colour: { contains: q, mode: "insensitive" } },
            { product: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 5,
        select: {
          id: true,
          sku: true,
          size: true,
          colour: true,
          stockQuantity: true,
          lowStockThreshold: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Finance Transactions search
      db.financeTransaction.findMany({
        where: {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { paymentMethod: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { transactionDate: "desc" },
        select: {
          id: true,
          type: true,
          category: true,
          amount: true,
          description: true,
          transactionDate: true,
          status: true,
        },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.sku ? `SKU: ${p.sku}` : `₹${Number(p.basePrice).toLocaleString("en-IN")}`,
      status: p.status,
      badge: "Product",
      url: `/admin/products/${p.id}`,
    }));

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      title: o.reference,
      subtitle: `${o.customerName} · ₹${Number(o.total).toLocaleString("en-IN")}`,
      status: o.status.replace(/_/g, " "),
      badge: "Order",
      url: `/admin/orders/${o.id}`,
    }));

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      title: c.fullName || `Customer +91 ${c.mobileNumber}`,
      subtitle: `+91 ${c.mobileNumber}${c.email ? ` · ${c.email}` : ""}`,
      status: "Active",
      badge: "Customer",
      url: `/admin/customers/${c.id}`,
    }));

    const formattedInventory = inventory.map((v) => ({
      id: v.id,
      title: `${v.product.name} (${v.size || "Free Size"})`,
      subtitle: `SKU: ${v.sku} · Stock: ${v.stockQuantity} units`,
      status: v.stockQuantity <= v.lowStockThreshold ? "Low Stock" : "In Stock",
      badge: "Inventory",
      url: `/admin/inventory?search=${encodeURIComponent(v.sku)}`,
    }));

    const formattedFinance = finance.map((f) => ({
      id: f.id,
      title: f.description,
      subtitle: `${f.type === "INCOME" ? "+" : "-"}₹${Number(f.amount).toLocaleString("en-IN")} · ${f.category}`,
      status: f.status,
      badge: f.type === "INCOME" ? "Income" : "Expense",
      url: `/admin/finance?search=${encodeURIComponent(f.description)}`,
    }));

    return NextResponse.json({
      query: q,
      results: {
        products: formattedProducts,
        orders: formattedOrders,
        customers: formattedCustomers,
        inventory: formattedInventory,
        finance: formattedFinance,
      },
    });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json(
      { error: "Failed to perform admin search" },
      { status: 500 }
    );
  }
}
