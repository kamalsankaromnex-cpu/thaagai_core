import { NextResponse } from "next/server";
import { getSizeChart } from "@/server/services/size-chart-service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId") || undefined;
    const categorySlug = url.searchParams.get("category") || undefined;

    const chart = await getSizeChart(productId, categorySlug);
    return NextResponse.json(chart);
  } catch (err: any) {
    console.error("Fetch size chart error:", err);
    return NextResponse.json({ error: "Failed to fetch size chart." }, { status: 500 });
  }
}
