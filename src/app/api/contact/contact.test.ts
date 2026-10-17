import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    contactSubmission: {
      create: vi.fn(),
    },
  },
}));

describe("Contact Us API Route — /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully validates and creates contact submission with valid data", async () => {
    (db.contactSubmission.create as any).mockResolvedValue({
      id: "sub-123",
      name: "Priya Sundaram",
      phone: "9876543210",
      email: "priya@example.com",
      subject: "Custom-Made",
      message: "Looking for a custom silk churidar set for a family wedding.",
    });

    const req = new Request("http://localhost:3001/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Sundaram",
        phone: "9876543210",
        email: "priya@example.com",
        subject: "Custom-Made",
        message: "Looking for a custom silk churidar set for a family wedding.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.id).toBe("sub-123");
    expect(db.contactSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Priya Sundaram",
          phone: "9876543210",
          email: "priya@example.com",
          subject: "Custom-Made",
        }),
      })
    );
  });

  it("rejects submissions with an invalid Indian mobile number", async () => {
    const req = new Request("http://localhost:3001/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Sundaram",
        phone: "12345", // Invalid length and prefix
        subject: "Order Enquiry",
        message: "When will my churidar arrive?",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("Please enter a valid 10-digit Indian mobile number");
    expect(db.contactSubmission.create).not.toHaveBeenCalled();
  });

  it("rejects submissions with missing or too short message", async () => {
    const req = new Request("http://localhost:3001/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Sundaram",
        phone: "9876543210",
        subject: "General",
        message: "Hi", // < 5 characters
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("Message must be at least 5 characters");
  });

  it("silently drops spam bot submissions where honeypot field is filled", async () => {
    const req = new Request("http://localhost:3001/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Spam Bot",
        phone: "9876543210",
        subject: "Other",
        message: "Buy cheap backlinks now",
        website: "https://spamlink.com", // Honeypot filled!
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    // Verified: NOT saved to database
    expect(db.contactSubmission.create).not.toHaveBeenCalled();
  });

  it("enforces rate limit when multiple submissions occur rapidly", async () => {
    (db.contactSubmission.create as any).mockResolvedValue({ id: "sub-1" });

    const createReq = () =>
      new Request("http://localhost:3001/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "203.0.113.195",
          "x-test-rate-limit": "true",
        },
        body: JSON.stringify({
          name: "Rapid Sender",
          phone: "9876543210",
          subject: "Other",
          message: "First message sending right now.",
        }),
      });

    const firstRes = await POST(createReq());
    expect(firstRes.status).toBe(200);

    const secondRes = await POST(createReq());
    expect(secondRes.status).toBe(429);

    const secondJson = await secondRes.json();
    expect(secondJson.error).toContain("Too many messages");
  });
});
