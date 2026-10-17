import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";
import { setDefaultAddress, AddressError } from "@/server/services/address-service";

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

    const updated = await setDefaultAddress(session.customerId, id);
    return NextResponse.json({ success: true, address: updated });
  } catch (err: any) {
    if (err instanceof AddressError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("Set default address error:", err);
    return NextResponse.json({ error: "Failed to set default address." }, { status: 500 });
  }
}
