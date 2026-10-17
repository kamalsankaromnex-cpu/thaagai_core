import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { upsertSizeChart, deleteSizeChart } from "@/server/services/size-chart-service";

const updateSizeChartSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categorySlug: z.string().trim().optional().nullable(),
  productId: z.string().trim().optional().nullable(),
  gender: z.string().optional(),
  measurements: z.any(),
  howToMeasure: z.any().optional().nullable(),
  customFitGuide: z.string().trim().optional().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSizeChartSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await upsertSizeChart({
      id,
      ...parsed.data,
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Update size chart error:", err);
    return NextResponse.json({ error: "Failed to update size chart." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteSizeChart(id);
    return NextResponse.json({ success: true, message: "Size chart deleted." });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Delete size chart error:", err);
    return NextResponse.json({ error: "Failed to delete size chart." }, { status: 500 });
  }
}
