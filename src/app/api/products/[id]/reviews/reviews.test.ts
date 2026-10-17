import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import * as reviewService from "@/server/services/review-service";
import * as customerAuth from "@/server/auth/customer-auth";

vi.mock("@/server/services/review-service", () => ({
  createReview: vi.fn(),
  getProductReviews: vi.fn(),
  getCustomerProductReview: vi.fn(),
}));

vi.mock("@/server/auth/customer-auth", () => ({
  getAuthenticatedCustomer: vi.fn(),
  CUSTOMER_COOKIE_NAME: "thaagai_customer_session",
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

describe("Product Reviews API Route — /api/products/[id]/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated customer attempts to submit review without customer session", async () => {
    (customerAuth.getAuthenticatedCustomer as any).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        content: "Beautiful dress!",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "prod-1" }) });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("Please sign in");
  });

  it("successfully allows authenticated customer to submit a star-only rating without comment", async () => {
    const mockCustomer = {
      id: "cust-99",
      mobileNumber: "9876543210",
      fullName: "Ananya Sundaram",
      email: "ananya@example.com",
    };
    (customerAuth.getAuthenticatedCustomer as any).mockResolvedValue(mockCustomer);
    (reviewService.createReview as any).mockResolvedValue({
      id: "rev-101",
      rating: 5,
      content: "",
      status: "PENDING",
      verifiedPurchase: true,
    });

    const req = new Request("http://localhost:3000/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        content: "",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "prod-1" }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.verifiedPurchase).toBe(true);

    // Verifies customer profile was automatically attached
    expect(reviewService.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "prod-1",
        customerId: "cust-99",
        customerName: "Ananya Sundaram",
        customerPhone: "9876543210",
        rating: 5,
        content: "",
      })
    );
  });

  it("successfully allows authenticated customer to submit written review with rating and comment", async () => {
    const mockCustomer = {
      id: "cust-100",
      mobileNumber: "9876543211",
      fullName: "Priya Sundaram",
      email: null,
    };
    (customerAuth.getAuthenticatedCustomer as any).mockResolvedValue(mockCustomer);
    (reviewService.createReview as any).mockResolvedValue({
      id: "rev-102",
      rating: 5,
      content: "The fabric drape is splendid and stitching neat.",
      status: "APPROVED",
      verifiedPurchase: true,
    });

    const req = new Request("http://localhost:3000/api/products/prod-1/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: 5,
        content: "The fabric drape is splendid and stitching neat.",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "prod-1" }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("published");
  });

  it("GET returns reviews, aggregates, and customer existing review when authenticated", async () => {
    const mockCustomer = {
      id: "cust-100",
      mobileNumber: "9876543211",
      fullName: "Priya Sundaram",
    };
    (customerAuth.getAuthenticatedCustomer as any).mockResolvedValue(mockCustomer);
    (reviewService.getCustomerProductReview as any).mockResolvedValue({
      id: "rev-existing",
      rating: 5,
      title: "5-Star Rating",
      content: "Loved it!",
      verifiedPurchase: true,
      status: "APPROVED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (reviewService.getProductReviews as any).mockResolvedValue({
      reviews: [],
      stats: {
        averageRating: 4.8,
        totalReviews: 128,
        verifiedPurchasesCount: 88,
        withPhotosCount: 24,
        distribution: { 5: 80, 4: 32, 3: 10, 2: 4, 1: 2 },
      },
    });

    const req = new Request("http://localhost:3000/api/products/prod-1/reviews");
    const res = await GET(req, { params: Promise.resolve({ id: "prod-1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.stats.totalReviews).toBe(128);
    expect(json.userReview).toBeDefined();
    expect(json.userReview.id).toBe("rev-existing");
    expect(json.userReview.rating).toBe(5);
  });
});
