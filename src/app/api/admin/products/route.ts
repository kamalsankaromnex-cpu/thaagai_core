import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, ProductStatus } from "@prisma/client";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";

const variantInput = z.object({
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

const imageInput = z.object({
  id: z.string().optional(),
  storageKey: z.string().min(1, "Image storage key is required"),
  altText: z.string().trim().optional().nullable().transform((a) => a || "Product photo"),
  sortOrder: z.coerce.number().int().default(0),
  isPrimary: z.boolean().default(false),
  variantId: z.string().optional().nullable(),
});

const productCreateSchema = z.object({
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
  variants: z.array(variantInput).min(1, "Product must have at least one variant"),
  images: z.array(imageInput).default([]),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status") as ProductStatus | null;
    const categoryId = searchParams.get("categoryId");

    const where: Prisma.ProductWhereInput = {};

    if (status && ["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (categoryId) {
      where.categories = { some: { categoryId } };
    }

    const products = await db.product.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Fetch products error:", err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);

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
    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }

    const product = await db.$transaction(async (tx) => {
      const p = await tx.product.create({
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
          publishedAt: data.status === "ACTIVE" ? new Date() : null,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          canonicalUrl: data.canonicalUrl || null,
          noindex: data.noindex,
          categories: {
            create: data.categoryIds.map((cid) => ({ categoryId: cid })),
          },
        },
      });

      // Create variants
      for (const v of data.variants) {
        await tx.productVariant.create({
          data: {
            productId: p.id,
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

      // Create images
      if (data.images.length > 0) {
        for (const img of data.images) {
          await tx.productImage.create({
            data: {
              productId: p.id,
              storageKey: img.storageKey,
              altText: img.altText,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: p.id },
        include: {
          categories: { include: { category: true } },
          variants: true,
          images: true,
        },
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
