import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const slideSchema = z.object({
  eyebrow: z.string().trim().max(100).optional().nullable(),
  title: z.string().trim().min(2, "Title is required").max(200),
  description: z.string().trim().min(2, "Description is required").max(500),
  primaryCtaLabel: z.string().trim().min(1, "Primary CTA label is required").max(80),
  primaryCtaUrl: z.string().trim().min(1, "Primary CTA URL is required").max(255),
  secondaryCtaLabel: z.string().trim().max(80).optional().nullable(),
  secondaryCtaUrl: z.string().trim().max(255).optional().nullable(),
  desktopImage: z.string().trim().min(1, "Desktop image is required"),
  mobileImage: z.string().trim().optional().nullable(),
  altText: z.string().trim().min(1, "Alt text is required").max(255),
  textAlignment: z.enum(["left", "center", "right"]).default("left"),
  overlayOpacity: z.number().int().min(0).max(100).default(40),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
    const slides = await db.heroSlide.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(slides);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to fetch hero slides:", err);
    return NextResponse.json({ error: "Failed to fetch hero slides." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = slideSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { startDate, endDate, ...data } = parsed.data;

    const slide = await db.heroSlide.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to create hero slide:", err);
    return NextResponse.json({ error: "Failed to create hero slide." }, { status: 500 });
  }
}
