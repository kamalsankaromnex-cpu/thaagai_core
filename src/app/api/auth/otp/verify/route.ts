import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, OtpError } from "@/server/auth/otp-service";
import { CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mobileNumber, otp } = body;

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { error: "Mobile number and OTP are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(String(mobileNumber), String(otp));

    const res = NextResponse.json({
      success: true,
      customer: result.customer,
      token: result.token,
    });

    res.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (err: any) {
    if (err instanceof OtpError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("OTP verification error:", err);
    return NextResponse.json({ error: "Failed to verify OTP." }, { status: 500 });
  }
}
