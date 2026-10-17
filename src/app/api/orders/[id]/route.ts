import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";
import { getCustomerOrderById, validateReorder, AppError } from "@/server/services/order-service";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get("action") === "reorder") {
      const reorderStatus = await validateReorder(session.customerId, id);
      return NextResponse.json(reorderStatus);
    }

    const order = await getCustomerOrderById(session.customerId, id);

    // Build the official WhatsApp message and link in case customer wants to re-open
    const waMessage = buildWhatsAppMessage({
      reference: order.reference,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      city: order.city,
      state: order.state,
      pinCode: order.pinCode,
      subtotal: Number(order.subtotal).toLocaleString("en-IN"),
      items: order.items.map((it) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice).toLocaleString("en-IN"),
      })),
    });

    const waLink = whatsappUrl(waMessage);

    return NextResponse.json({
      order,
      whatsappUrl: waLink,
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("Fetch order detail error:", err);
    return NextResponse.json({ error: "Failed to fetch order details." }, { status: 500 });
  }
}
