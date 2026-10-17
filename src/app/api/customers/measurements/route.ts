import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/server/auth/customer-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MeasurementsSchema = z.object({
  unit: z.enum(["INCHES", "CM"]).default("INCHES"),
  kurtaLength: z.string().optional().nullable(),
  bust: z.string().optional().nullable(),
  waist: z.string().optional().nullable(),
  hips: z.string().optional().nullable(),
  shoulderWidth: z.string().optional().nullable(),
  sleeveLength: z.string().optional().nullable(),
  bottomLength: z.string().optional().nullable(),
  ankleRound: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `customer_measurements_${session.customerId}`;
    const setting = await db.storeSetting.findUnique({
      where: { key },
    });

    return NextResponse.json({
      measurements: setting?.value || null,
    });
  } catch (error) {
    console.error("Get measurements error:", error);
    return NextResponse.json(
      { error: "Failed to load saved measurements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = MeasurementsSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const key = `customer_measurements_${session.customerId}`;
    const setting = await db.storeSetting.upsert({
      where: { key },
      update: {
        value: parsed.data,
      },
      create: {
        key,
        value: parsed.data,
      },
    });

    return NextResponse.json({
      success: true,
      measurements: setting.value,
    });
  } catch (error) {
    console.error("Save measurements error:", error);
    return NextResponse.json(
      { error: "Failed to save measurements" },
      { status: 500 }
    );
  }
}
