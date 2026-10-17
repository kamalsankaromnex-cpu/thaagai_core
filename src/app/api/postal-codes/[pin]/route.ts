import { NextRequest, NextResponse } from "next/server";
import { lookupPostalCode } from "@/server/services/postal-service";

interface RouteParams {
  params: Promise<{ pin: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { pin } = await params;
    const result = await lookupPostalCode(pin);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Postal code route error:", err);
    return NextResponse.json(
      {
        valid: false,
        pinCode: "",
        error: "Unable to process postal lookup at this time.",
        manualAllowed: true,
      },
      { status: 500 }
    );
  }
}
