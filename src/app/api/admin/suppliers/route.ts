import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SupplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters"),
  code: z.string().min(2, "Supplier code must be at least 2 characters").transform((c) => c.toUpperCase().trim()),
  contactName: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppliers = await db.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error("Suppliers GET error:", error);
    return NextResponse.json({ error: "Failed to load suppliers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SupplierSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check duplicate code
    const existing = await db.supplier.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Supplier code "${data.code}" already exists.` },
        { status: 409 }
      );
    }

    const supplier = await db.supplier.create({
      data: {
        name: data.name.trim(),
        code: data.code,
        contactName: data.contactName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        gstin: data.gstin?.toUpperCase().trim() || null,
        active: data.active,
      },
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error("Suppliers POST error:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
