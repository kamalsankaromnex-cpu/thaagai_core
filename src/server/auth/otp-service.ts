import { randomInt, createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { signCustomerToken } from "./customer-auth";

export class OtpError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export function normalizeIndianMobile(raw: string): string {
  const clean = raw.replace(/[\s-]/g, "");
  let digits = clean;
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  else if (/^91[6-9]\d{9}$/.test(digits)) digits = digits.slice(2);

  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new OtpError("INVALID_MOBILE", "Please enter a valid 10-digit Indian mobile number.", 400);
  }
  return digits;
}

function hashOtp(mobile: string, otp: string): string {
  const secret = process.env.AUTH_SECRET || "fallback-secret-for-development-mode-only-at-least-32-chars";
  return createHmac("sha256", secret).update(`${mobile}:${otp}`).digest("hex");
}

export interface SmsProvider {
  sendOtp(mobileNumber: string, otp: string): Promise<boolean>;
}

export class ConsoleSmsProvider implements SmsProvider {
  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    console.log(`\n======================================================`);
    console.log(`[SMS OTP SIMULATOR] To +91 ${mobileNumber}`);
    console.log(`Your Thaagai verification code is: ${otp}`);
    console.log(`Valid for 10 minutes.`);
    console.log(`======================================================\n`);
    return true;
  }
}

export class Fast2SmsProvider implements SmsProvider {
  constructor(private apiKey: string) {}

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: mobileNumber,
        }),
      });
      return response.ok;
    } catch (err) {
      console.error("Fast2SMS dispatch error:", err);
      return false;
    }
  }
}

function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER || "console";
  const apiKey = process.env.SMS_API_KEY;

  if (provider === "fast2sms" && apiKey) {
    return new Fast2SmsProvider(apiKey);
  }
  return new ConsoleSmsProvider();
}

/** Requests a new OTP for a normalized 10-digit mobile number */
export async function requestOtp(rawMobile: string) {
  const mobile = normalizeIndianMobile(rawMobile);
  const now = new Date();

  // 1. Check 60-second cooldown on most recent OTP
  const recentOtp = await db.otpVerification.findFirst({
    where: { mobileNumber: mobile, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((now.getTime() - recentOtp.createdAt.getTime()) / 1000);
    if (elapsedSeconds < 60) {
      const remainingSeconds = 60 - elapsedSeconds;
      throw new OtpError(
        "COOLDOWN_ACTIVE",
        `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        429
      );
    }
  }

  // 2. Abuse prevention: Max 5 requests in the last hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentCount = await db.otpVerification.count({
    where: { mobileNumber: mobile, createdAt: { gte: oneHourAgo } },
  });

  if (recentCount >= 5) {
    throw new OtpError(
      "RATE_LIMIT_EXCEEDED",
      "Too many OTP requests for this number. Please try again after an hour.",
      429
    );
  }

  // 3. Generate secure 6-digit OTP
  const otp = randomInt(100000, 999999).toString();
  const otpHash = hashOtp(mobile, otp);
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  // 4. Save record
  await db.otpVerification.create({
    data: {
      mobileNumber: mobile,
      otpHash,
      expiresAt,
      attempts: 0,
      verified: false,
    },
  });

  // 5. Dispatch via SMS provider
  const provider = getSmsProvider();
  await provider.sendOtp(mobile, otp);

  const isDev = process.env.NODE_ENV !== "production";
  return {
    success: true,
    mobileNumber: mobile,
    expiresInSeconds: 600,
    cooldownSeconds: 60,
    devOtp: isDev ? otp : undefined,
  };
}

/** Verifies received OTP and logs in or creates customer account */
export async function verifyOtp(rawMobile: string, rawOtp: string) {
  const mobile = normalizeIndianMobile(rawMobile);
  const trimmedOtp = rawOtp.trim();

  if (!/^\d{6}$/.test(trimmedOtp)) {
    throw new OtpError("INVALID_OTP_FORMAT", "OTP must be 6 digits.", 400);
  }

  const now = new Date();
  const activeOtp = await db.otpVerification.findFirst({
    where: { mobileNumber: mobile, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!activeOtp) {
    throw new OtpError("OTP_NOT_FOUND", "No pending OTP found. Please request a new code.", 400);
  }

  if (activeOtp.expiresAt < now) {
    throw new OtpError("OTP_EXPIRED", "This verification code has expired. Please request a new code.", 400);
  }

  if (activeOtp.attempts >= 5) {
    throw new OtpError(
      "MAX_ATTEMPTS_EXCEEDED",
      "Too many invalid attempts. For security, please request a new OTP.",
      400
    );
  }

  const expectedHash = hashOtp(mobile, trimmedOtp);
  const hashBuf = Buffer.from(activeOtp.otpHash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  const isMatch =
    hashBuf.length === expectedBuf.length && timingSafeEqual(hashBuf, expectedBuf);

  if (!isMatch) {
    // Increment attempts
    const updatedAttempts = activeOtp.attempts + 1;
    await db.otpVerification.update({
      where: { id: activeOtp.id },
      data: { attempts: updatedAttempts },
    });

    const remaining = 5 - updatedAttempts;
    throw new OtpError(
      "INVALID_OTP",
      remaining > 0
        ? `Incorrect OTP. You have ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining.`
        : "Incorrect OTP. Maximum attempts reached. Please request a new code.",
      400
    );
  }

  // Mark OTP as verified
  await db.otpVerification.update({
    where: { id: activeOtp.id },
    data: { verified: true },
  });

  // Find or create customer
  const customer = await db.customer.upsert({
    where: { mobileNumber: mobile },
    update: { mobileVerifiedAt: now },
    create: {
      mobileNumber: mobile,
      mobileVerifiedAt: now,
      status: "ACTIVE",
    },
    select: {
      id: true,
      mobileNumber: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  });

  // Generate session token
  const token = signCustomerToken({
    customerId: customer.id,
    mobileNumber: customer.mobileNumber,
  });

  return {
    customer,
    token,
  };
}
