import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateTransactionSchema = z.object({
  category: z.string().min(1).optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero").optional(),
  paymentMethod: z.string().min(1).optional(),
  transactionDate: z.string().optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["COMPLETED", "PENDING", "REVERSED"]).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transaction = await db.financeTransaction.findUnique({
      where: { id },
      include: { actor: { select: { name: true, email: true } } },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Finance GET [id] error:", error);
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateTransactionSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const existing = await db.financeTransaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: any = {};
    if (data.category !== undefined) {
      updateData.category = data.category.toUpperCase().replace(/\s+/g, "_");
    }
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.transactionDate !== undefined) updateData.transactionDate = new Date(data.transactionDate);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await db.financeTransaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error("Finance PATCH error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.financeTransaction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Set to REVERSED for double-entry auditability
    const updated = await db.financeTransaction.update({
      where: { id },
      data: { status: "REVERSED" },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error("Finance DELETE error:", error);
    return NextResponse.json({ error: "Failed to reverse transaction" }, { status: 500 });
  }
}
