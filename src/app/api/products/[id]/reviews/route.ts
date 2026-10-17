import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getProductReviews, createReview, getCustomerProductReview } from "@/server/services/review-service";
import { getAuthenticatedCustomer, CUSTOMER_COOKIE_NAME } from "@/server/auth/customer-auth";

const reviewSubmitSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
  content: z.string().trim().max(2000, "Review cannot exceed 2000 characters").optional().default(""),
  // Optional backwards compatibility fields for tests / admin:
  customerName: z.string().trim().max(80).optional(),
  customerEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  customerPhone: z.string().trim().optional().nullable().or(z.literal("")),
  title: z.string().trim().max(120).optional().nullable().or(z.literal("")),
  images: z.array(z.string()).optional().default([]),
  orderReference: z.string().trim().max(50).optional().nullable().or(z.literal("")),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const url = new URL(req.url);
    const rawSort = url.searchParams.get("sort");
    const sort = (["newest", "highest", "lowest", "photos"].includes(rawSort || "")
      ? rawSort
      : "newest") as "newest" | "highest" | "lowest" | "photos";
    const starParam = url.searchParams.get("star");
    const starFilter = starParam && !isNaN(Number(starParam)) ? Number(starParam) : undefined;

    // Check if customer is authenticated to also provide their existing review
    let userReview: any = null;
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
      const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      const customer = await getAuthenticatedCustomer(cookieToken || authHeader);

      if (customer) {
        userReview = await getCustomerProductReview(productId, customer.id, customer.mobileNumber);
      }
    } catch {
      // Non-critical session check failure, continue public review fetch
    }

    const result = await getProductReviews(productId, sort, starFilter);
    return NextResponse.json({
      ...result,
      userReview: userReview
        ? {
            id: userReview.id,
            rating: userReview.rating,
            title: userReview.title,
            content: userReview.content,
            verifiedPurchase: userReview.verifiedPurchase,
            status: userReview.status,
            createdAt: userReview.createdAt,
            updatedAt: userReview.updatedAt,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Fetch reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Authenticate customer from session cookie or Authorization header
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const authenticatedCustomer = await getAuthenticatedCustomer(cookieToken || authHeader);

    const body = await req.json();
    const parsed = reviewSubmitSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: fieldMsg, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!authenticatedCustomer && !parsed.data.customerName) {
      return NextResponse.json(
        { error: "Please sign in to your THAAGAI account to submit a review." },
        { status: 401 }
      );
    }

    // Never trust frontend-supplied identity, profile name, or verified status
    const customerId = authenticatedCustomer ? authenticatedCustomer.id : null;
    const customerName = authenticatedCustomer
      ? (authenticatedCustomer.fullName?.trim() || "Customer")
      : parsed.data.customerName!;
    const customerPhone = authenticatedCustomer
      ? authenticatedCustomer.mobileNumber
      : parsed.data.customerPhone || null;
    const customerEmail = authenticatedCustomer
      ? authenticatedCustomer.email
      : parsed.data.customerEmail || null;

    const review = await createReview({
      productId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      rating: parsed.data.rating,
      title: parsed.data.title,
      content: parsed.data.content,
      images: parsed.data.images,
      orderReference: parsed.data.orderReference || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: review.status === "APPROVED"
          ? "Thank you! Your review has been published."
          : "Thank you! Your review has been saved.",
        reviewId: review.id,
        verifiedPurchase: review.verifiedPurchase,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Create review error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit review." },
      { status: 400 }
    );
  }
}
