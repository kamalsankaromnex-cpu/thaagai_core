import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PromoSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").transform((v) => v.toUpperCase().trim()),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE"),
  discountValue: z.coerce.number().positive("Discount value must be greater than zero"),
  minOrderAmount: z.coerce.number().optional().nullable(),
  maxDiscountAmount: z.coerce.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  usageLimit: z.coerce.number().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promotions = await db.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Promotions GET error:", error);
    return NextResponse.json({ error: "Failed to load promotions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PromoSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate code
    const existing = await db.promotion.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Promo code "${data.code}" already exists.` },
        { status: 409 }
      );
    }

    const promo = await db.promotion.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount || null,
        maxDiscountAmount: data.maxDiscountAmount || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        usageLimit: data.usageLimit || null,
        active: data.active,
      },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    console.error("Promotions POST error:", error);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}
