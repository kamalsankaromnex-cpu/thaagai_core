import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const variantUpdateInput = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "Variant SKU is required").max(50),
  size: z.string().trim().max(30).optional().nullable(),
  colour: z.string().trim().max(30).optional().nullable(),
  attributes: z.record(z.any()).optional().nullable(),
  priceOverride: z.coerce.number().min(0).optional().nullable().or(z.literal("").transform(() => null)),
  salePriceOverride: z.coerce.number().min(0).optional().nullable().or(z.literal("").transform(() => null)),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(2),
  active: z.boolean().default(true),
});

const imageUpdateInput = z.object({
  id: z.string().optional(),
  storageKey: z.string().min(1, "Image storage key is required"),
  altText: z.string().trim().optional().nullable().transform((a) => a || "Product photo"),
  sortOrder: z.coerce.number().int().default(0),
  isPrimary: z.boolean().default(false),
  variantId: z.string().optional().nullable(),
});

const productUpdateSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  slug: z
    .string()
    .trim()
    .transform((s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .pipe(z.string().min(2, "Product slug must be at least 2 characters").max(120)),
  shortDescription: z.string().trim().max(300).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  productType: z
    .enum(["READY_TO_WEAR", "CUSTOM_MADE", "CLOTHING", "JEWELLERY"])
    .transform((v) => (v === "CUSTOM_MADE" ? "CUSTOM_MADE" : "READY_TO_WEAR"))
    .default("READY_TO_WEAR"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
  salePrice: z.coerce.number().positive().optional().nullable().or(z.literal("").transform(() => null)),
  sku: z.string().trim().max(40).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  fabricCare: z.string().trim().optional().nullable(),
  shippingInfo: z.string().trim().optional().nullable(),
  seoTitle: z.string().trim().max(120).optional().nullable(),
  seoDescription: z.string().trim().max(200).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  noindex: z.boolean().default(false),
  categoryIds: z.array(z.string()).default([]),
  variants: z.array(variantUpdateInput).min(1, "Product must have at least one variant"),
  images: z.array(imageUpdateInput).default([]),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue?.path.join(".") || "form";
      const fieldMsg = firstIssue?.message || "Validation failed";
      return NextResponse.json(
        {
          error: `Validation error in ${fieldPath}: ${fieldMsg}`,
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug collision
    const existing = await db.product.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }

    const updated = await db.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          productType: data.productType,
          basePrice: new Prisma.Decimal(data.basePrice),
          salePrice: data.salePrice ? new Prisma.Decimal(data.salePrice) : null,
          sku: data.sku,
          status: data.status,
          featured: data.featured,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          canonicalUrl: data.canonicalUrl || null,
          noindex: data.noindex,
        },
      });

      // 2. Sync categories: delete removed, add new
      await tx.productCategory.deleteMany({ where: { productId: id } });
      if (data.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: data.categoryIds.map((cid) => ({ productId: id, categoryId: cid })),
        });
      }

      // 3. Sync variants
      const incomingVariantIds = data.variants.map((v) => v.id).filter(Boolean) as string[];
      // Deactivate variants not in payload (to protect historical order integrity)
      await tx.productVariant.updateMany({
        where: { productId: id, id: { notIn: incomingVariantIds } },
        data: { active: false },
      });

      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              size: v.size,
              colour: v.colour,
              attributes: v.attributes || Prisma.JsonNull,
              priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
              salePriceOverride: v.salePriceOverride ? new Prisma.Decimal(v.salePriceOverride) : null,
              stockQuantity: v.stockQuantity,
              lowStockThreshold: v.lowStockThreshold,
              active: v.active,
            },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              size: v.size,
              colour: v.colour,
              attributes: v.attributes || Prisma.JsonNull,
              priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
              salePriceOverride: v.salePriceOverride ? new Prisma.Decimal(v.salePriceOverride) : null,
              stockQuantity: v.stockQuantity,
              lowStockThreshold: v.lowStockThreshold,
              active: v.active,
            },
          });
        }
      }

      // 4. Sync images
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: id,
            storageKey: img.storageKey,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          categories: { include: { category: true } },
          variants: true,
          images: true,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Soft archive the product to preserve order history
    await db.product.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: "Product archived successfully." });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to archive product." }, { status: 500 });
  }
}
