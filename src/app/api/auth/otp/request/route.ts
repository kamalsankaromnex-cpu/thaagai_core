import { NextRequest, NextResponse } from "next/server";
import { requestOtp, OtpError } from "@/server/auth/otp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mobileNumber } = body;

    if (!mobileNumber) {
      return NextResponse.json(
        { error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const result = await requestOtp(String(mobileNumber));
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof OtpError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("OTP request error:", err);
    return NextResponse.json({ error: "Failed to process OTP request." }, { status: 500 });
  }
}
