import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TrackOrderSchema = z.object({
  reference: z.string().min(3, "Please provide an order reference"),
  phone: z.string().min(10, "Please provide a valid 10-digit mobile number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrackOrderSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue.message },
        { status: 400 }
      );
    }

    const { reference, phone } = parsed.data;
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    const order = await db.orderRequest.findFirst({
      where: {
        reference: {
          equals: reference.trim(),
          mode: "insensitive",
        },
        customerPhone: {
          contains: cleanPhone,
        },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "No matching order found. Please check your reference and phone number." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        customerName: order.customerName,
        createdAt: order.createdAt,
        confirmedAt: order.confirmedAt,
        shippedAt: order.shippedAt,
        courier: order.courier,
        trackingNumber: order.trackingNumber,
        total: order.total,
        city: order.city,
        state: order.state,
        items: order.items.map((i) => ({
          id: i.id,
          productName: i.productName,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { error: "Failed to look up order status" },
      { status: 500 }
    );
  }
}
