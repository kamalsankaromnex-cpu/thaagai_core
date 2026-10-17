import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/auth";
import { getAdminReviews } from "@/server/services/review-service";
import { ReviewStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status");
    const productId = url.searchParams.get("productId") || undefined;

    let status: ReviewStatus | undefined;
    if (statusParam && Object.values(ReviewStatus).includes(statusParam as ReviewStatus)) {
      status = statusParam as ReviewStatus;
    }

    const reviews = await getAdminReviews(status, productId);
    return NextResponse.json(reviews);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Admin fetch reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}
