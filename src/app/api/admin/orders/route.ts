import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | null;
  const q = searchParams.get("q")?.trim() || "";

  const where: any = {};

  if (status && Object.values(OrderStatus).includes(status)) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q } },
    ];
  }

  try {
    const [orders, statusCounts] = await Promise.all([
      db.orderRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          history: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      db.orderRequest.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const countsMap = statusCounts.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {});

    return NextResponse.json({
      orders,
      counts: countsMap,
      total: orders.length,
    });
  } catch (err: any) {
    console.error("Error fetching admin orders:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
