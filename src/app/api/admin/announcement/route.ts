import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { DEFAULT_ANNOUNCEMENT_BAR, AnnouncementBarConfig } from "@/components/storefront/announcement-bar";

export const dynamic = "force-dynamic";

const announcementSchema = z.object({
  enabled: z.boolean(),
  text: z.string().trim().min(1, "Announcement text cannot be empty").max(300, "Maximum 300 characters"),
  link: z.string().trim().max(300).optional().nullable(),
  bgColor: z.string().trim().max(30).optional().nullable(),
});

/**
 * GET /api/admin/announcement
 * Returns current announcement bar configuration
 */
export async function GET() {
  try {
    const setting = await db.storeSetting.findUnique({
      where: { key: "announcement_bar" },
    });

    if (!setting || !setting.value) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT_BAR);
    }

    const value = setting.value as unknown as AnnouncementBarConfig;
    return NextResponse.json({
      enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_ANNOUNCEMENT_BAR.enabled,
      text: value.text || DEFAULT_ANNOUNCEMENT_BAR.text,
      link: value.link ?? DEFAULT_ANNOUNCEMENT_BAR.link,
      bgColor: value.bgColor || DEFAULT_ANNOUNCEMENT_BAR.bgColor,
      textColor: value.textColor || DEFAULT_ANNOUNCEMENT_BAR.textColor,
    });
  } catch (err: unknown) {
    console.error("Failed to load announcement bar settings:", err);
    return NextResponse.json(DEFAULT_ANNOUNCEMENT_BAR);
  }
}

/**
 * PUT /api/admin/announcement
 * Update announcement bar ON/OFF status, message content, link, and theme
 */
export async function PUT(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid announcement configuration." },
        { status: 400 }
      );
    }

    const { enabled, text, link, bgColor } = parsed.data;

    const savedConfig: AnnouncementBarConfig = {
      enabled,
      text,
      link: link || "",
      bgColor: bgColor || "#5E1624",
      textColor: "#FFFFFF",
    };

    await db.storeSetting.upsert({
      where: { key: "announcement_bar" },
      update: { value: savedConfig as any },
      create: { key: "announcement_bar", value: savedConfig as any },
    });

    return NextResponse.json({
      ok: true,
      message: enabled ? "Announcement bar enabled and updated." : "Announcement bar disabled.",
      data: savedConfig,
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to update announcement bar:", err);
    return NextResponse.json({ error: "Failed to save announcement bar." }, { status: 500 });
  }
}
