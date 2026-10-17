import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminCredentials, createSessionTokenForUser, COOKIE_NAME } from "@/server/auth/auth";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }

    const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = createSessionTokenForUser(admin);
    const res = NextResponse.json({ ok: true, user: admin });

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    if (err?.message?.includes("Can't reach database server") || err?.code === "P1001" || err?.name === "PrismaClientInitializationError") {
      return NextResponse.json(
        { error: "Database offline. Please start Docker / PostgreSQL at localhost:5432 to sign in." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
