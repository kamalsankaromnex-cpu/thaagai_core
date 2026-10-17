import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { changeOrderStatus, AppError } from "@/server/services/order-service";
import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { to, note, courier, trackingNumber } = body;

    if (!to || !Object.values(OrderStatus).includes(to)) {
      return NextResponse.json(
        { error: `Invalid target order status: ${to}` },
        { status: 400 }
      );
    }

    // Perform atomic status change with stock deduction or restock
    const updatedOrder = await changeOrderStatus(id, to, session.id, note);

    // If courier or tracking number provided, save to order
    if (courier || trackingNumber) {
      await db.orderRequest.update({
        where: { id },
        data: {
          courier: courier || undefined,
          trackingNumber: trackingNumber || undefined,
          ...(to === "SHIPPED" ? { shippedAt: new Date() } : {}),
        },
      });
    }

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (err: any) {
    console.error("Order transition failed:", err);
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to transition order status." },
      { status: 500 }
    );
  }
}
