import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreatePOSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  poNumber: z.string().optional(),
  expectedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      variantId: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      productName: z.string().min(1, "Product name is required"),
      quantityOrdered: z.coerce.number().int().positive("Quantity must be at least 1"),
      unitCost: z.coerce.number().positive("Unit cost must be greater than zero"),
    })
  ).min(1, "At least one item is required in a purchase order"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      where,
      orderBy: { orderDate: "desc" },
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
        items: true,
        goodsReceipts: {
          include: { items: true },
        },
      },
    });

    return NextResponse.json({ purchaseOrders });
  } catch (error) {
    console.error("Purchases GET error:", error);
    return NextResponse.json({ error: "Failed to load purchase orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreatePOSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate unique PO Number if not given
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const countToday = await db.purchaseOrder.count();
    const poNumber = data.poNumber?.trim().toUpperCase() || `PO-${dateStr}-${(countToday + 1).toString().padStart(3, "0")}`;

    // Calculate subtotal
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const lineTotal = item.quantityOrdered * item.unitCost;
      subtotal += lineTotal;
      return {
        variantId: item.variantId || null,
        sku: item.sku || null,
        productName: item.productName,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: 0,
        unitCost: item.unitCost,
        lineTotal,
      };
    });

    const totalAmount = subtotal;

    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        status: "ORDERED",
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        notes: data.notes || null,
        subtotal,
        totalAmount,
        items: {
          create: itemsData,
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    return NextResponse.json({ purchaseOrder }, { status: 201 });
  } catch (error) {
    console.error("Purchases POST error:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
