import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { mobileNumber: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            id: true,
            reference: true,
            subtotal: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        addresses: {
          orderBy: { isDefault: "desc" },
        },
      },
    });

    const clientRows = customers.map((c) => {
      const nonCancelledOrders = c.orders.filter((o) => o.status !== "CANCELLED");
      const totalSpend = nonCancelledOrders.reduce(
        (sum, o) => sum + Number(o.subtotal || 0),
        0
      );
      const defaultAddr = c.addresses.find((a) => a.isDefault) || c.addresses[0] || null;

      return {
        id: c.id,
        mobileNumber: c.mobileNumber,
        fullName: c.fullName || "Thaagai Customer",
        email: c.email || null,
        status: c.status,
        mobileVerifiedAt: c.mobileVerifiedAt,
        createdAt: c.createdAt,
        ordersCount: c.orders.length,
        totalSpend,
        addressesCount: c.addresses.length,
        defaultAddress: defaultAddr
          ? {
              city: defaultAddr.city,
              state: defaultAddr.state,
              pinCode: defaultAddr.pinCode,
              locality: defaultAddr.locality,
            }
          : null,
      };
    });

    const totalCount = await db.customer.count();
    const verifiedCount = await db.customer.count({
      where: { mobileVerifiedAt: { not: null } },
    });

    return NextResponse.json({
      customers: clientRows,
      stats: {
        total: totalCount,
        verified: verifiedCount,
      },
    });
  } catch (err: any) {
    console.error("Error fetching customers for admin:", err);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
