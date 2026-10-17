import { NextRequest, NextResponse } from "next/server";
import { createOrderRequest, getCustomerOrders, AppError } from "@/server/services/order-service";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in to view orders." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "all") as "all" | "active" | "delivered" | "cancelled";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const result = await getCustomerOrders(session.customerId, status, page, limit);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Customer orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Bot detection via honeypot field
    if (body.honeypot && body.honeypot.length > 0) {
      return NextResponse.json(
        { error: "Submission rejected." },
        { status: 400 }
      );
    }

    // Attach customer ID from session if authenticated
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    const orderPayload = {
      ...body,
      customerId: session?.customerId || body.customerId || undefined,
    };

    const order: any = await createOrderRequest(orderPayload);

    // Build the official WhatsApp message and link
    const waMessage = buildWhatsAppMessage({
      reference: order.reference,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      city: order.city,
      state: order.state,
      pinCode: order.pinCode,
      subtotal: Number(order.subtotal).toLocaleString("en-IN"),
      items: order.items.map((it: any) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice).toLocaleString("en-IN"),
        customizations: it.customizations,
      })),
    });

    const waLink = whatsappUrl(waMessage);

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      id: order.id,
      whatsappUrl: waLink,
    });
  } catch (err: any) {
    console.error("Order creation failed:", err);
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    if (err?.name === "ZodError") {
      const firstIssue = err.issues?.[0]?.message || "Invalid order details.";
      return NextResponse.json(
        { error: firstIssue, details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your order request." },
      { status: 500 }
    );
  }
}
