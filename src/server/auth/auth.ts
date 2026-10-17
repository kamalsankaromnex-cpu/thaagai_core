import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const COOKIE_NAME = "thaagai_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface TokenPayload extends AdminSession {
  exp: number;
}

function getSecretKey(): string {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET must be configured in production environment.");
  }
  return process.env.AUTH_SECRET || "fallback-secret-for-development-mode-only-at-least-32-chars";
}

/** Signs session payload into base64url HMAC token */
export function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSecretKey()).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/** Verifies and parses session token */
export function verifyToken(token: string): TokenPayload | null {
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

    const payload: TokenPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/** Authenticates admin credentials using bcrypt */
export async function verifyAdminCredentials(email: string, password: string): Promise<AdminSession | null> {
  const user = await db.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.active) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/** Retrieves session from HTTP cookies */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    let user = await db.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    if (!user && payload.email) {
      user = await db.adminUser.findUnique({
        where: { email: payload.email.toLowerCase().trim() },
        select: { id: true, email: true, name: true, role: true, active: true },
      });
    }

    if (!user || !user.active) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }
}

/** Route helper enforcing admin authentication and optional role level */
export async function requireAdmin(requiredRole?: Role): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (requiredRole && requiredRole === Role.OWNER && session.role !== Role.OWNER) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

/** Generates token string for successful login */
export function createSessionTokenForUser(user: AdminSession): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  return signToken({ ...user, exp });
}
