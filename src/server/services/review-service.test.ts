import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatPrivacySafeName, getProductReviews, createReview } from "./review-service";
import { db } from "@/lib/db";
import { ReviewStatus } from "@prisma/client";

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    review: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderRequest: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Review Service — Customer Privacy & Formatting", () => {
  it("formats full customer names with privacy-safe last initial", () => {
    expect(formatPrivacySafeName("Priya Sundaram")).toBe("Priya S.");
    expect(formatPrivacySafeName("Lakshmi Priya Sundaram")).toBe("Lakshmi S.");
    expect(formatPrivacySafeName("Meenakshi R.")).toBe("Meenakshi R.");
  });

  it("preserves single-word names unchanged", () => {
    expect(formatPrivacySafeName("Ananya")).toBe("Ananya");
    expect(formatPrivacySafeName("Swetha")).toBe("Swetha");
  });

  it("handles empty or whitespace inputs gracefully", () => {
    expect(formatPrivacySafeName("")).toBe("Verified Customer");
    expect(formatPrivacySafeName("   ")).toBe("Verified Customer");
  });
});

describe("Review Service — Aggregates and Filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes accurate rating distributions and 1-decimal average rating from approved reviews only", async () => {
    const mockApprovedReviews = [
      {
        id: "r1",
        customerName: "Kavitha Rajan",
        rating: 5,
        title: "Superb silk quality",
        content: "The fabric drape is magnificent.",
        images: ["img1.jpg"],
        verifiedPurchase: true,
        createdAt: new Date("2026-03-01"),
      },
      {
        id: "r2",
        customerName: "Deepa N.",
        rating: 4,
        title: "Great stitching",
        content: "Fits true to size.",
        images: [],
        verifiedPurchase: true,
        createdAt: new Date("2026-03-02"),
      },
      {
        id: "r3",
        customerName: "Sowmya M.",
        rating: 5,
        title: "Loved the colour",
        content: "Exactly like the photos.",
        images: [],
        verifiedPurchase: false,
        createdAt: new Date("2026-03-03"),
      },
    ];

    (db.review.findMany as any).mockResolvedValue(mockApprovedReviews);

    const result = await getProductReviews("prod-123", "newest");

    // Average: (5 + 4 + 5) / 3 = 14 / 3 = 4.666... -> 4.7
    expect(result.stats.totalReviews).toBe(3);
    expect(result.stats.averageRating).toBe(4.7);
    expect(result.stats.distribution).toEqual({
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    });

    // Sanitized privacy names
    expect(result.reviews[0].customerName).toBe("Kavitha R.");
    expect(result.reviews[1].customerName).toBe("Deepa N.");
    expect(result.reviews[2].customerName).toBe("Sowmya M.");
  });

  it("returns zero counts and 0 average rating when a product has no approved reviews", async () => {
    (db.review.findMany as any).mockResolvedValue([]);

    const result = await getProductReviews("prod-empty");

    expect(result.stats.totalReviews).toBe(0);
    expect(result.stats.averageRating).toBe(0);
    expect(result.stats.distribution).toEqual({
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    });
    expect(result.reviews).toEqual([]);
  });
});

describe("Review Service — Genuine Purchase Verification & Submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies genuine purchase when valid order contains the reviewed product", async () => {
    const mockOrder = {
      id: "ord-777",
      reference: "TG-ORD123",
      customerPhone: "+91 9876543210",
      items: [{ productId: "churidar-1" }],
    };

    (db.orderRequest.findFirst as any).mockResolvedValue(mockOrder);
    (db.review.findFirst as any).mockResolvedValue(null); // No previous review
    (db.review.create as any).mockImplementation(({ data }: any) => ({
      id: "new-rev-1",
      ...data,
    }));

    const review = await createReview({
      productId: "churidar-1",
      customerName: "Radha Krishnan",
      customerPhone: "9876543210",
      orderReference: "TG-ORD123",
      rating: 5,
      title: "Perfect fit",
      content: "Loved the embroidery and gathered pants.",
    });

    expect(review.verifiedPurchase).toBe(true);
    expect(review.orderId).toBe("ord-777");
    expect(review.status).toBe(ReviewStatus.PENDING);
    expect(db.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          verifiedPurchase: true,
          orderId: "ord-777",
          status: ReviewStatus.PENDING,
        }),
      })
    );
  });

  it("marks verifiedPurchase false if order reference is not found", async () => {
    (db.orderRequest.findFirst as any).mockResolvedValue(null);
    (db.review.create as any).mockImplementation(({ data }: any) => ({
      id: "new-rev-2",
      ...data,
    }));

    const review = await createReview({
      productId: "churidar-1",
      customerName: "Sneha Nair",
      orderReference: "INVALID-REF",
      rating: 4,
      title: "Nice colour",
      content: "Very comfortable cotton.",
    });

    expect(review.verifiedPurchase).toBe(false);
    expect(review.orderId).toBeNull();
  });

  it("prevents duplicate reviews for the same order reference and product", async () => {
    const mockOrder = {
      id: "ord-888",
      reference: "TG-DUPLICATE",
      customerPhone: "9876543210",
      items: [{ productId: "churidar-1" }],
    };

    (db.orderRequest.findFirst as any).mockResolvedValue(mockOrder);
    (db.review.findFirst as any).mockResolvedValue({ id: "existing-rev" }); // Duplicate exists

    await expect(
      createReview({
        productId: "churidar-1",
        customerName: "Radha Krishnan",
        customerPhone: "9876543210",
        orderReference: "TG-DUPLICATE",
        rating: 5,
        title: "Second attempt",
        content: "Trying to submit again",
      })
    ).rejects.toThrow("A review has already been submitted for this product and order reference.");
  });

  it("clamps ratings between 1 and 5", async () => {
    (db.review.create as any).mockImplementation(({ data }: any) => ({
      id: "rev-clamped",
      ...data,
    }));

    const underClamped = await createReview({
      productId: "churidar-1",
      customerName: "Tester",
      rating: -2,
      title: "Low rating",
      content: "Too low",
    });
    expect(underClamped.rating).toBe(1);

    const overClamped = await createReview({
      productId: "churidar-1",
      customerName: "Tester",
      rating: 10,
      title: "High rating",
      content: "Too high",
    });
    expect(overClamped.rating).toBe(5);
  });

  it("handles quick star rating submission with automatic fallback title and content", async () => {
    (db.review.create as any).mockImplementation(({ data }: any) => ({
      id: "quick-rating-1",
      ...data,
    }));

    const quickRating = await createReview({
      productId: "churidar-1",
      customerName: "Ananya",
      rating: 5,
    });

    expect(quickRating.rating).toBe(5);
    expect(quickRating.title).toBe("5-Star Rating");
    expect(quickRating.content).toContain("5 out of 5 stars");
    expect(quickRating.customerName).toBe("Ananya");
  });

  it("calculates verifiedPurchasesCount and withPhotosCount accurately", async () => {
    const mockReviews = [
      {
        id: "r1",
        customerName: "Priya S.",
        rating: 5,
        title: "Loved it",
        content: "Nice drape",
        images: ["photo1.jpg"],
        verifiedPurchase: true,
        createdAt: new Date("2026-03-01"),
      },
      {
        id: "r2",
        customerName: "Meena R.",
        rating: 4,
        title: "Good fit",
        content: "Comfortable",
        images: [],
        verifiedPurchase: false,
        createdAt: new Date("2026-03-02"),
      },
    ];

    (db.review.findMany as any).mockResolvedValue(mockReviews);

    const result = await getProductReviews("churidar-1", "newest");
    expect(result.stats.verifiedPurchasesCount).toBe(1);
    expect(result.stats.withPhotosCount).toBe(1);
    expect(result.stats.totalReviews).toBe(2);
  });

  it("filters by star rating when starFilter is provided", async () => {
    const mockReviews = [
      {
        id: "r1",
        customerName: "Priya S.",
        rating: 5,
        title: "Loved it",
        content: "Nice drape",
        images: [],
        verifiedPurchase: true,
        createdAt: new Date("2026-03-01"),
      },
      {
        id: "r2",
        customerName: "Meena R.",
        rating: 4,
        title: "Good fit",
        content: "Comfortable",
        images: [],
        verifiedPurchase: false,
        createdAt: new Date("2026-03-02"),
      },
    ];

    (db.review.findMany as any).mockResolvedValue(mockReviews);

    const result = await getProductReviews("churidar-1", "newest", 5);
    // Overall stats preserve all approved reviews
    expect(result.stats.totalReviews).toBe(2);
    // Filtered reviews only contain rating 5
    expect(result.reviews.length).toBe(1);
    expect(result.reviews[0].rating).toBe(5);
  });

  it("automatically verifies purchase when authenticated customer has qualifying OrderRequest", async () => {
    (db.orderRequest.findFirst as any).mockResolvedValue({ id: "ord-auth-101" });
    (db.review.findFirst as any).mockResolvedValue(null);
    (db.review.create as any).mockImplementation(({ data }: any) => ({
      id: "rev-auth-1",
      ...data,
    }));

    const result = await createReview({
      productId: "prod-999",
      customerId: "cust-123",
      customerName: "Priya Sundaram",
      customerPhone: "9876543210",
      rating: 5,
      content: "Loved the fabric and fit!",
    });

    expect(result.verifiedPurchase).toBe(true);
    expect(result.orderId).toBe("ord-auth-101");
    expect(result.customerId).toBe("cust-123");
  });

  it("updates existing review instead of creating duplicate when authenticated customer resubmits", async () => {
    const existingReview = {
      id: "rev-existing-1",
      productId: "prod-999",
      customerId: "cust-123",
      customerName: "Priya Sundaram",
      rating: 4,
      title: "4-Star Rating",
      content: "Initial review",
      verifiedPurchase: true,
      orderId: "ord-1",
    };

    (db.review.findFirst as any).mockResolvedValue(existingReview);
    (db.review.update as any).mockImplementation(({ data }: any) => ({
      ...existingReview,
      ...data,
    }));

    const updated = await createReview({
      productId: "prod-999",
      customerId: "cust-123",
      customerName: "Priya Sundaram",
      rating: 5,
      content: "Updated: after wash the drape is even better!",
    });

    expect(db.review.create).not.toHaveBeenCalled();
    expect(updated.id).toBe("rev-existing-1");
    expect(updated.rating).toBe(5);
    expect(updated.content).toBe("Updated: after wash the drape is even better!");
  });
});

