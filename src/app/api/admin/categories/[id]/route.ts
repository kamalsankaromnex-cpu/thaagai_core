import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const category = await db.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
    if (!category) return NextResponse.json({ error: "Category not found." }, { status: 404 });
    return NextResponse.json(category);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch category." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        { error: `Validation error in ${fieldPath}: ${fieldMsg}`, details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check slug collision
    const existing = await db.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 });
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        ...parsed.data,
        canonicalUrl: parsed.data.canonicalUrl || null,
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const counts = await db.category.findUnique({
      where: { id },
      select: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!counts) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    if (counts._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: it is assigned to ${counts._count.products} products.` },
        { status: 409 }
      );
    }

    if (counts._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: it has ${counts._count.children} subcategories.` },
        { status: 409 }
      );
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
