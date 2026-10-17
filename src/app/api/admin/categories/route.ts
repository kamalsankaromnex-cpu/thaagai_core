import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .trim()
    .transform((s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .pipe(z.string().min(2, "Slug must be at least 2 characters").max(100)),
  description: z.string().trim().max(500).optional().nullable(),
  bannerKey: z.string().optional().nullable(),
  bannerAlt: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
  seoTitle: z.string().trim().max(120).optional().nullable(),
  seoDescription: z.string().trim().max(200).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  noindex: z.boolean().default(false),
});

export async function GET() {
  try {
    await requireAdmin();
    const categories = await db.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(categories);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.category.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        ...parsed.data,
        canonicalUrl: parsed.data.canonicalUrl || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
