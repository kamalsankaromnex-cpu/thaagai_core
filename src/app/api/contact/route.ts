import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\+\(\)]/g, "").replace(/^91/, ""))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Please enter a valid 10-digit Indian mobile number",
    }),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(2, "Please select or enter a subject").max(100),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(3000, "Message is too long"),
  website: z.string().optional().or(z.literal("")), // Honeypot field for bot detection
});

// Simple in-memory rate limiting map: ip -> lastSubmissionTimestamp
const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawData: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      rawData = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        rawData[key] = value.toString();
      }
    } else {
      try {
        rawData = await req.json();
      } catch {
        return NextResponse.json({ error: "Unsupported request format" }, { status: 400 });
      }
    }

    // 1. Spam Protection: Honeypot check
    // If the hidden 'website' field has any content, it was filled by a spam bot.
    if (rawData.website && String(rawData.website).trim() !== "") {
      console.warn("[Spam Bot Blocked] Honeypot field triggered:", rawData);
      // Return fake success to confuse the bot
      return NextResponse.json(
        { success: true, message: "Thank you for contacting Thaagai. We will get back to you shortly." },
        { status: 200 }
      );
    }

    // 2. Rate Limiting: 1 submission per 45 seconds per IP / Phone
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const lastTime = rateLimitMap.get(ip);
    const shouldCheckRateLimit = process.env.NODE_ENV !== "test" || req.headers.get("x-test-rate-limit") === "true";

    if (shouldCheckRateLimit && lastTime && now - lastTime < 45_000) {
      const secondsLeft = Math.ceil((45_000 - (now - lastTime)) / 1000);
      return NextResponse.json(
        { error: `Too many messages. Please wait ${secondsLeft} seconds before sending another message.` },
        { status: 429 }
      );
    }

    // 3. Validation
    const parsed = contactSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError, details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, phone, email, subject, message } = parsed.data;

    // 4. Save to Database
    const submission = await db.contactSubmission.create({
      data: {
        name,
        phone,
        email: email || null,
        subject,
        message,
        ipAddress: ip !== "local" ? ip : null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    // Update rate limit tracker
    rateLimitMap.set(ip, now);

    // 5. Response handling (JSON vs Form Redirect)
    const isHtmlFormPost =
      !contentType.includes("application/json") &&
      req.headers.get("accept")?.includes("text/html");

    if (isHtmlFormPost) {
      return NextResponse.redirect(new URL("/contact?submitted=true", req.url), 303);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! We have received your message and our team will get in touch soon.",
      id: submission.id,
    });
  } catch (err: any) {
    console.error("Contact API route error:", err);
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again or reach us directly on WhatsApp." },
      { status: 500 }
    );
  }
}
