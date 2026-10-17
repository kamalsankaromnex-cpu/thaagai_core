import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { sortVariantsBySize, normalizeSize } from "@/server/services/size-chart-service";

const singleItemSchema = z.object({
  variantId: z.string().min(1),
  delta: z.number().int().refine((d) => d !== 0, "Delta must be non-zero"),
  reason: z.string().trim().min(3).max(250, "Audit reason is required"),
});

const batchAdjustSchema = z.object({
  updates: z.array(singleItemSchema).min(1, "At least one adjustment update is required"),
});

const adjustStockSchema = z.union([
  batchAdjustSchema,
  singleItemSchema.transform((val) => ({ updates: [val] })),
]);

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const sizeFilter = searchParams.get("size")?.trim();
    const statusFilter = searchParams.get("status")?.trim(); // "out_of_stock" | "low_stock" | "in_stock"

    const where: Prisma.ProductVariantWhereInput = {
      product: { status: { in: ["ACTIVE", "DRAFT"] } },
    };

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (sizeFilter && sizeFilter !== "all") {
      const normalized = normalizeSize(sizeFilter);
      where.size = { equals: normalized, mode: "insensitive" };
    }

    if (statusFilter === "out_of_stock") {
      where.stockQuantity = { equals: 0 };
    } else if (statusFilter === "low_stock") {
      where.stockQuantity = { gt: 0, lte: 2 }; // low stock
    } else if (statusFilter === "in_stock") {
      where.stockQuantity = { gt: 2 };
    }

    const [variants, movements, products] = await Promise.all([
      db.productVariant.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, status: true, productType: true } },
        },
        orderBy: [{ stockQuantity: "asc" }, { sku: "asc" }],
      }),
      db.inventoryMovement.findMany({
        take: 100,
        include: {
          variant: {
            select: {
              sku: true,
              size: true,
              colour: true,
              product: { select: { name: true } },
            },
          },
          actor: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.product.findMany({
        where: {
          status: { in: ["ACTIVE", "DRAFT"] },
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                  { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
                ],
              }
            : {}),
        },
        include: {
          images: { where: { isPrimary: true }, take: 1, select: { storageKey: true, altText: true } },
          variants: {
            where: { active: true },
            select: {
              id: true,
              sku: true,
              size: true,
              colour: true,
              stockQuantity: true,
              lowStockThreshold: true,
              active: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    // Construct Product Size Matrices
    const productMatrices = products.map((p) => {
      const sortedVariants = sortVariantsBySize(p.variants);
      const totalStock = sortedVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
      const hasOutOfStock = sortedVariants.some((v) => v.stockQuantity <= 0);
      const hasLowStock = sortedVariants.some((v) => v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold);

      return {
        productId: p.id,
        productName: p.name,
        productSku: p.sku,
        productType: p.productType,
        status: p.status,
        primaryImage: p.images[0] || null,
        totalStock,
        hasOutOfStock,
        hasLowStock,
        variants: sortedVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colour: v.colour,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold,
          isOutOfStock: v.stockQuantity <= 0,
          isLowStock: v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold,
        })),
      };
    });

    return NextResponse.json({
      variants,
      movements,
      productMatrices,
    });
  } catch (err: unknown) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Fetch inventory error:", err);
    return NextResponse.json({ error: "Failed to fetch inventory records." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = adjustStockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { updates } = parsed.data;

    const result = await db.$transaction(async (tx) => {
      const updatedVariants = [];
      const movements = [];

      for (const item of updates) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new Error(`VARIANT_NOT_FOUND:${item.variantId}`);
        }

        const newStock = variant.stockQuantity + item.delta;
        if (newStock < 0) {
          throw new Error(`NEGATIVE_STOCK:${variant.sku}:${variant.stockQuantity}`);
        }

        const updated = await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: newStock },
        });

        const movement = await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            type: "MANUAL_ADJUSTMENT",
            delta: item.delta,
            reason: item.reason,
            actorId: admin.id,
          },
        });

        updatedVariants.push(updated);
        movements.push(movement);
      }

      return { updatedVariants, movements };
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN") {
        return NextResponse.json({ error: err.message }, { status: 401 });
      }
      if (err.message.startsWith("VARIANT_NOT_FOUND")) {
        return NextResponse.json({ error: "One or more product variants were not found." }, { status: 404 });
      }
      if (err.message.startsWith("NEGATIVE_STOCK")) {
        const parts = err.message.split(":");
        const sku = parts[1] || "variant";
        const curr = parts[2] || "0";
        return NextResponse.json(
          { error: `Adjustment would cause negative stock on SKU ${sku} (current on hand: ${curr}).` },
          { status: 409 }
        );
      }
    }
    console.error("Stock adjustment error:", err);
    return NextResponse.json({ error: "Failed to adjust inventory." }, { status: 500 });
  }
}
