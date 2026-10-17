import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const customer = await db.customer.findUnique({
      where: { id: session.customerId, status: "ACTIVE" },
      include: {
        _count: {
          select: {
            addresses: true,
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        mobileNumber: customer.mobileNumber,
        fullName: customer.fullName,
        email: customer.email,
        mobileVerifiedAt: customer.mobileVerifiedAt,
        createdAt: customer.createdAt,
        addressesCount: customer._count.addresses,
        ordersCount: customer._count.orders,
      },
    });
  } catch (err) {
    console.error("Customer fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch customer profile." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateProfileSchema.parse(body);

    const updated = await db.customer.update({
      where: { id: session.customerId },
      data: {
        ...(parsed.fullName !== undefined ? { fullName: parsed.fullName || null } : {}),
        ...(parsed.email !== undefined ? { email: parsed.email || null } : {}),
      },
      select: {
        id: true,
        mobileNumber: true,
        fullName: true,
        email: true,
        mobileVerifiedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Customer update error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
