import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const slideUpdateSchema = z.object({
  eyebrow: z.string().trim().max(100).optional().nullable(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(2).max(500).optional(),
  primaryCtaLabel: z.string().trim().min(1).max(80).optional(),
  primaryCtaUrl: z.string().trim().min(1).max(255).optional(),
  secondaryCtaLabel: z.string().trim().max(80).optional().nullable(),
  secondaryCtaUrl: z.string().trim().max(255).optional().nullable(),
  desktopImage: z.string().trim().min(1).optional(),
  mobileImage: z.string().trim().optional().nullable(),
  altText: z.string().trim().min(1).max(255).optional(),
  textAlignment: z.enum(["left", "center", "right"]).optional(),
  overlayOpacity: z.number().int().min(0).max(100).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const slide = await db.heroSlide.findUnique({
      where: { id },
    });
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    }
    return NextResponse.json(slide);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch hero slide." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = slideUpdateSchema.safeParse(body);

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

    const updatePayload: Record<string, any> = { ...data };
    if (startDate !== undefined) {
      updatePayload.startDate = startDate ? new Date(startDate) : null;
    }
    if (endDate !== undefined) {
      updatePayload.endDate = endDate ? new Date(endDate) : null;
    }

    const updated = await db.heroSlide.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to update hero slide:", err);
    return NextResponse.json({ error: "Failed to update hero slide." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(req, { params });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.heroSlide.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Hero slide deleted." });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Failed to delete hero slide:", err);
    return NextResponse.json({ error: "Failed to delete hero slide." }, { status: 500 });
  }
}
