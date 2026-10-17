import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { OtpService } from "./otp.service";

export interface CustomerSessionPayload {
  customerId: string;
  mobileNumber: string;
  fullName: string | null;
  role: "customer";
}

@Injectable()
export class AuthService {
  private readonly secret = process.env.AUTH_SECRET || "thaagai-customer-session-secret-key-32ch";

  constructor(
    private prisma: PrismaService,
    private otpService: OtpService
  ) {}

  signCustomerToken(payload: CustomerSessionPayload): string {
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto.createHmac("sha256", this.secret).update(data).digest("base64url");
    return `${data}.${sig}`;
  }

  verifyCustomerToken(token?: string): CustomerSessionPayload | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, sig] = parts;
    const expectedSig = crypto.createHmac("sha256", this.secret).update(data).digest("base64url");

    try {
      const match = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
      if (!match) return null;
      return JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    } catch {
      return null;
    }
  }

  async loginWithOtp(mobileNumber: string, otp: string) {
    await this.otpService.verifyOtp(mobileNumber, otp);
    const normalized = this.otpService.normalizePhone(mobileNumber);

    let customer = await this.prisma.customer.findUnique({
      where: { mobileNumber: normalized },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          mobileNumber: normalized,
          mobileVerifiedAt: new Date(),
          status: "ACTIVE",
        },
      });
    } else if (!customer.mobileVerifiedAt) {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: { mobileVerifiedAt: new Date() },
      });
    }

    const payload: CustomerSessionPayload = {
      customerId: customer.id,
      mobileNumber: customer.mobileNumber,
      fullName: customer.fullName,
      role: "customer",
    };

    const token = this.signCustomerToken(payload);
    return { token, customer };
  }

  async getSession(token?: string) {
    const session = this.verifyCustomerToken(token);
    if (!session) {
      return { authenticated: false, customer: null };
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: session.customerId },
      select: {
        id: true,
        mobileNumber: true,
        fullName: true,
        email: true,
        mobileVerifiedAt: true,
        status: true,
      },
    });

    if (!customer || customer.status !== "ACTIVE") {
      return { authenticated: false, customer: null };
    }

    return { authenticated: true, customer };
  }
}
