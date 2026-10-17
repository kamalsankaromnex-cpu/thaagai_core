import { NextResponse } from "next/server";
import { z } from "zod";
import { getDeliveryEstimate } from "@/server/services/delivery-service";

const estimateSchema = z.object({
  pinCode: z.string().trim().min(6, "PIN code must be 6 digits").max(6, "PIN code must be 6 digits"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPin = searchParams.get("pinCode") || "";
    const parsed = estimateSchema.safeParse({ pinCode: rawPin });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid PIN code format. Please provide a 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    const result = await getDeliveryEstimate(parsed.data.pinCode);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Shipping estimate GET route error:", err);
    return NextResponse.json(
      {
        valid: false,
        isServiceable: false,
        error: "Unable to calculate delivery estimates at this time.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = estimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid PIN code format. Please provide a 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    const result = await getDeliveryEstimate(parsed.data.pinCode);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Shipping estimate route error:", err);
    return NextResponse.json(
      {
        valid: false,
        isServiceable: false,
        error: "Unable to calculate delivery estimates at this time.",
      },
      { status: 500 }
    );
  }
}
