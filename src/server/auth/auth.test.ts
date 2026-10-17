import { describe, it, expect } from "vitest";
import { signToken, verifyToken, createSessionTokenForUser } from "./auth";
import { Role } from "@prisma/client";

describe("admin auth token cryptographic verification", () => {
  const sampleUser = {
    id: "usr-admin-1",
    email: "owner@thaagai.com",
    name: "Thaagai Owner",
    role: Role.OWNER,
  };

  it("signs and verifies valid token correctly", () => {
    const token = createSessionTokenForUser(sampleUser);
    expect(token).toContain(".");

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(sampleUser.id);
    expect(verified?.email).toBe(sampleUser.email);
    expect(verified?.role).toBe(Role.OWNER);
  });

  it("rejects token with tampered signature", () => {
    const token = createSessionTokenForUser(sampleUser);
    const [data] = token.split(".");
    const tamperedToken = `${data}.tampered-invalid-signature`;

    const verified = verifyToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it("rejects token with tampered payload", () => {
    const token = createSessionTokenForUser(sampleUser);
    const [, sig] = token.split(".");
    const fakeData = Buffer.from(
      JSON.stringify({ ...sampleUser, role: "HACKER", exp: Date.now() / 1000 + 3600 })
    ).toString("base64url");

    const verified = verifyToken(`${fakeData}.${sig}`);
    expect(verified).toBeNull();
  });

  it("rejects expired token", () => {
    const expiredPayload = {
      ...sampleUser,
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
    };
    const expiredToken = signToken(expiredPayload);

    const verified = verifyToken(expiredToken);
    expect(verified).toBeNull();
  });
});
