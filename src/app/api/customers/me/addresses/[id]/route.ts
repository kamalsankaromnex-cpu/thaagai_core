import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";
import { updateAddress, deleteAddress, AddressError } from "@/server/services/address-service";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const updated = await updateAddress(session.customerId, id, body);

    return NextResponse.json({ success: true, address: updated });
  } catch (err: any) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Update address error:", err);
    return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const result = await deleteAddress(session.customerId, id);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("Delete address error:", err);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
