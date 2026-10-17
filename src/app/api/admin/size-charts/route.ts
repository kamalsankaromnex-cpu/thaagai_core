import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { getAllSizeCharts, upsertSizeChart } from "@/server/services/size-chart-service";

const sizeChartSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categorySlug: z.string().trim().optional().nullable(),
  productId: z.string().trim().optional().nullable(),
  gender: z.string().default("WOMEN"),
  measurements: z.any(),
  howToMeasure: z.any().optional().nullable(),
  customFitGuide: z.string().trim().optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
    const charts = await getAllSizeCharts();
    return NextResponse.json(charts);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Admin fetch size charts error:", err);
    return NextResponse.json({ error: "Failed to fetch size charts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = sizeChartSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const chart = await upsertSizeChart(parsed.data);
    return NextResponse.json(chart, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create size chart error:", err);
    return NextResponse.json({ error: "Failed to create size chart." }, { status: 500 });
  }
}
