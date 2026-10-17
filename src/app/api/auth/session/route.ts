import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const token = cookieToken || authHeader;

    const customer = await getAuthenticatedCustomer(token);

    if (!customer) {
      return NextResponse.json({ authenticated: false, customer: null });
    }

    return NextResponse.json({
      authenticated: true,
      customer,
    });
  } catch (err) {
    console.error("Session check error:", err);
    return NextResponse.json({ authenticated: false, customer: null });
  }
}
