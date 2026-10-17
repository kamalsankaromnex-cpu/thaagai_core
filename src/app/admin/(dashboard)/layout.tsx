import { getAdminSession } from "@/server/auth/auth";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch real database counts for notification badges
  let pendingOrdersCount = 0;
  let lowStockCount = 0;

  try {
    const [pending, lowStock] = await Promise.all([
      db.orderRequest.count({
        where: {
          status: {
            in: [
              "PENDING_WHATSAPP",
              "PENDING_WHATSAPP_CONFIRMATION",
              "SUBMITTED_BY_CUSTOMER",
            ],
          },
        },
      }),
      db.productVariant.count({
        where: {
          stockQuantity: { lte: 2 },
          active: true,
          product: { status: "ACTIVE" },
        },
      }),
    ]);
    pendingOrdersCount = pending;
    lowStockCount = lowStock;
  } catch (err) {
    console.error("Layout badge counts error:", err);
  }

  return (
    <AdminLayoutShell
      user={session}
      pendingOrdersCount={pendingOrdersCount}
      lowStockCount={lowStockCount}
    >
      {children}
    </AdminLayoutShell>
  );
}
