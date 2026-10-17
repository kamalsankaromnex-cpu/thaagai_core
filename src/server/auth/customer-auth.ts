import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const CUSTOMER_COOKIE_NAME = "thaagai_customer_session";
const SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

export interface CustomerSession {
  customerId: string;
  mobileNumber: string;
}

interface CustomerTokenPayload extends CustomerSession {
  exp: number;
}

function getSecretKey(): string {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be configured in production environment.");
  }
  return process.env.AUTH_SECRET || "fallback-secret-for-development-mode-only-at-least-32-chars";
}

/** Signs customer session payload into base64url HMAC token */
export function signCustomerToken(payload: CustomerSession): string {
  const fullPayload: CustomerTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", getSecretKey()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/** Verifies and parses customer session token */
export function verifyCustomerToken(token: string): CustomerTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = createHmac("sha256", getSecretKey()).update(data).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const payload: CustomerTokenPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/** Retrieves customer session from Next.js server cookie store or Authorization header */
export async function getCustomerSession(customCookieValue?: string): Promise<CustomerSession | null> {
  let token = customCookieValue;
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    } catch {
      // Not in a server action or route handler with cookie context
    }
  }

  if (!token) return null;
  const verified = verifyCustomerToken(token);
  if (!verified) return null;

  return {
    customerId: verified.customerId,
    mobileNumber: verified.mobileNumber,
  };
}

/** Verifies customer session and ensures customer is active in database */
export async function getAuthenticatedCustomer(customCookieValue?: string) {
  const session = await getCustomerSession(customCookieValue);
  if (!session) return null;

  const customer = await db.customer.findUnique({
    where: { id: session.customerId, status: "ACTIVE" },
    select: {
      id: true,
      mobileNumber: true,
      fullName: true,
      email: true,
      mobileVerifiedAt: true,
      createdAt: true,
    },
  });

  return customer;
}
