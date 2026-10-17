import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  processChat,
  lookupOrderWithSecurity,
  ChatMessage,
  ChatContext,
} from "@/server/services/ai-assistant-service";
import { requestOtp, verifyOtp } from "@/server/auth/otp-service";

export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(2000),
        timestamp: z.string().optional(),
      })
    )
    .min(1),
  context: z
    .object({
      currentPath: z.string().optional(),
      customerId: z.string().optional(),
      customerPhone: z.string().optional(),
      customerName: z.string().optional(),
      pendingOtpPhone: z.string().optional(),
      pendingOtpRef: z.string().optional(),
      otpCode: z.string().optional(),
      preferredLanguage: z.enum(["en", "ta"]).optional(),
    })
    .optional(),
  action: z.enum(["CHAT", "VERIFY_OTP", "RESEND_OTP"]).optional(),
  actionPayload: z
    .object({
      phone: z.string().optional(),
      reference: z.string().optional(),
      otp: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = ChatRequestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { messages, context = {}, action, actionPayload } = parsed.data;

    // Direct Action: Verify OTP for order tracking
    if (action === "VERIFY_OTP" && actionPayload?.phone && actionPayload?.otp) {
      const { phone, otp, reference } = actionPayload;
      try {
        await verifyOtp(phone, otp);

        // Fetch verified order details
        const lookup = await lookupOrderWithSecurity(reference || phone, {
          ...context,
          pendingOtpPhone: phone,
          isOtpVerified: true,
        });

        if (lookup.order) {
          return NextResponse.json({
            success: true,
            response: {
              message: `Verification successful! Here are your live tracking details for order **${lookup.order.reference}**:`,
              language: context.preferredLanguage || "en",
              orderStatus: lookup.order,
              quickReplies: ["Track Courier", "Return Policy", "WhatsApp Support", "Shop More Kurtis"],
            },
          });
        }

        return NextResponse.json({
          success: true,
          response: {
            message: lookup.error || "Order details could not be loaded after verification.",
            language: context.preferredLanguage || "en",
            quickReplies: ["Talk to WhatsApp Support", "Track Another Order"],
          },
        });
      } catch (err: any) {
        return NextResponse.json({
          success: true,
          response: {
            message: `OTP verification failed: ${err.message || "Incorrect code"}. Please check and try again.`,
            language: context.preferredLanguage || "en",
            otpPrompt: {
              step: "FAILED",
              reference: reference || "",
              phone,
              maskedPhone: `+91 ******${phone.slice(-4)}`,
              error: err.message,
            },
            quickReplies: ["Resend OTP", "Contact Concierge"],
          },
        });
      }
    }

    // Direct Action: Resend OTP
    if (action === "RESEND_OTP" && actionPayload?.phone) {
      const { phone, reference } = actionPayload;
      try {
        const otpResult = await requestOtp(phone);
        const devNotice = otpResult.devOtp ? ` (Simulated dev OTP: **${otpResult.devOtp}**)` : "";
        return NextResponse.json({
          success: true,
          response: {
            message: `A new 6-digit verification code has been dispatched to **+91 ******${phone.slice(-4)}** via SMS.${devNotice}`,
            language: context.preferredLanguage || "en",
            otpPrompt: {
              step: "REQUESTED",
              reference: reference || "",
              phone,
              maskedPhone: `+91 ******${phone.slice(-4)}`,
              expiresInSeconds: otpResult.expiresInSeconds,
              devOtp: otpResult.devOtp,
            },
            quickReplies: otpResult.devOtp ? [`Enter ${otpResult.devOtp}`, "Talk to Concierge"] : ["Contact Concierge"],
          },
        });
      } catch (err: any) {
        return NextResponse.json({
          success: true,
          response: {
            message: `Unable to resend OTP at this time: ${err.message}`,
            language: context.preferredLanguage || "en",
            quickReplies: ["Try Again", "WhatsApp Concierge"],
          },
        });
      }
    }

    // Standard Chat Conversation
    const response = await processChat(messages as ChatMessage[], context as ChatContext);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error: any) {
    console.error("AI Assistant route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error in AI Assistant",
        message: "I apologize, but I encountered a momentary hiccup. How may I assist you with Thaagai's collection?",
      },
      { status: 500 }
    );
  }
}
