import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await db.orderRequest.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            mobileNumber: true,
            fullName: true,
            email: true,
          },
        },
        items: true,
        history: {
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, role: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Error fetching admin order by id:", err);
    return NextResponse.json({ error: "Failed to fetch order details." }, { status: 500 });
  }
}

export async function PATCH(
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
    const { paymentStatus } = body;

    const updated = await db.orderRequest.update({
      where: { id },
      data: {
        ...(paymentStatus ? { paymentStatus } : {}),
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err: any) {
    console.error("Error updating order:", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
