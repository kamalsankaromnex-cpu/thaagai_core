import { Injectable, BadRequestException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OtpService {
  private readonly secret = process.env.AUTH_SECRET || "thaagai-otp-default-secret-key-32ch";
  private readonly cooldownSeconds = 60;
  private readonly expireMinutes = 10;
  private readonly maxAttempts = 5;

  constructor(private prisma: PrismaService) {}

  normalizePhone(phone: string): string {
    let clean = (phone || "").replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("91")) {
      clean = clean.substring(2);
    }
    if (!/^[6-9]\d{9}$/.test(clean)) {
      throw new BadRequestException("Please enter a valid 10-digit Indian mobile number.");
    }
    return clean;
  }

  hashOtp(mobile: string, otp: string): string {
    return crypto.createHmac("sha256", this.secret).update(`${mobile}:${otp}`).digest("hex");
  }

  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async requestOtp(rawPhone: string) {
    const mobile = this.normalizePhone(rawPhone);

    const latest = await this.prisma.otpVerification.findFirst({
      where: { mobileNumber: mobile },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const diffMs = Date.now() - latest.createdAt.getTime();
      const elapsedSec = Math.floor(diffMs / 1000);
      if (elapsedSec < this.cooldownSeconds) {
        throw new BadRequestException(
          `Please wait ${this.cooldownSeconds - elapsedSec} seconds before requesting a new OTP.`
        );
      }
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(mobile, otp);
    const expiresAt = new Date(Date.now() + this.expireMinutes * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        mobileNumber: mobile,
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
      },
    });

    console.log(`[NestJS OtpService] OTP for +91${mobile}: ${otp}`);

    return {
      success: true,
      mobileNumber: mobile,
      cooldownSeconds: this.cooldownSeconds,
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(rawPhone: string, rawOtp: string) {
    const mobile = this.normalizePhone(rawPhone);
    const otp = (rawOtp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      throw new BadRequestException("Please enter a valid 6-digit OTP code.");
    }

    const record = await this.prisma.otpVerification.findFirst({
      where: { mobileNumber: mobile, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new BadRequestException("No active OTP request found for this mobile number.");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("OTP has expired. Please request a new OTP.");
    }

    if (record.attempts >= this.maxAttempts) {
      throw new BadRequestException("Too many incorrect attempts. Please request a new OTP.");
    }

    const expectedHash = this.hashOtp(mobile, otp);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(record.otpHash),
      Buffer.from(expectedHash)
    );

    if (!isMatch) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = this.maxAttempts - (record.attempts + 1);
      throw new BadRequestException(`Incorrect OTP. ${remaining} attempts remaining.`);
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return { success: true, mobileNumber: mobile };
  }
}
