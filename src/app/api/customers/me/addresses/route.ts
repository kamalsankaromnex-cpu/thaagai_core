import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";
import { getCustomerAddresses, createAddress, AddressError } from "@/server/services/address-service";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const addresses = await getCustomerAddresses(session.customerId);
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("Fetch addresses error:", err);
    return NextResponse.json({ error: "Failed to fetch addresses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const session = await getCustomerSession(cookieToken || authHeader);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newAddress = await createAddress(session.customerId, body);

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (err: any) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Create address error:", err);
    return NextResponse.json({ error: "Failed to create address." }, { status: 500 });
  }
}
