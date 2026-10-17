import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const settingsUpdateSchema = z.object({
  storeName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(120).optional(),
  supportPhone: z.string().regex(/^\d{10,15}$/, "Valid phone number with country code"),
  orderNotice: z.string().trim().min(5).max(300),
  standardShippingText: z.string().trim().max(300).optional(),
  estimatedDeliveryDays: z.string().trim().max(60).optional(),
  deliveryRules: z
    .object({
      readyMadeDispatchMin: z.number().optional(),
      readyMadeDispatchMax: z.number().optional(),
      customStitchingMin: z.number().optional(),
      customStitchingMax: z.number().optional(),
      sameStateTransitMin: z.number().optional(),
      sameStateTransitMax: z.number().optional(),
      nationalTransitMin: z.number().optional(),
      nationalTransitMax: z.number().optional(),
      freeShippingThreshold: z.number().optional(),
      standardShippingFee: z.number().optional(),
    })
    .optional(),
  announcementBar: z
    .object({
      enabled: z.boolean(),
      text: z.string().trim().min(1).max(300),
      link: z.string().trim().max(300).optional().nullable(),
      bgColor: z.string().trim().max(30).optional().nullable(),
    })
    .optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const settings = await db.storeSetting.findMany();
    const map = settings.reduce<Record<string, any>>((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    return NextResponse.json(map);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Only OWNER can alter store settings
    await requireAdmin(Role.OWNER);

    const body = await req.json();
    const parsed = settingsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      storeName,
      tagline,
      supportPhone,
      orderNotice,
      standardShippingText,
      estimatedDeliveryDays,
      deliveryRules,
    } = parsed.data;

    const updates = [
      db.storeSetting.upsert({
        where: { key: "store_profile" },
        update: { value: { storeName, tagline, supportPhone, orderNotice } },
        create: { key: "store_profile", value: { storeName, tagline, supportPhone, orderNotice } },
      }),
      db.storeSetting.upsert({
        where: { key: "shipping_defaults" },
        update: { value: { standardShippingText, estimatedDeliveryDays } },
        create: { key: "shipping_defaults", value: { standardShippingText, estimatedDeliveryDays } },
      }),
    ];

    if (deliveryRules) {
      updates.push(
        db.storeSetting.upsert({
          where: { key: "delivery_rules" },
          update: { value: deliveryRules },
          create: { key: "delivery_rules", value: deliveryRules },
        })
      );
    }

    if (parsed.data.announcementBar) {
      updates.push(
        db.storeSetting.upsert({
          where: { key: "announcement_bar" },
          update: { value: parsed.data.announcementBar },
          create: { key: "announcement_bar", value: parsed.data.announcementBar },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ ok: true, message: "Settings saved successfully." });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
