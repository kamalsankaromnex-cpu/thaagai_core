import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ReceiveGoodsSchema = z.object({
  invoiceNumber: z.string().optional().nullable(),
  receivedBy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(
    z.object({
      poItemId: z.string(),
      variantId: z.string().optional().nullable(),
      quantityAccepted: z.coerce.number().int().min(0),
      quantityDamaged: z.coerce.number().int().min(0).default(0),
      unitCost: z.coerce.number().positive(),
    })
  ).min(1, "At least one item must be received"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: poId } = await params;
    const po = await db.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        supplier: true,
        items: true,
      },
    });

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    if (po.status === "RECEIVED" || po.status === "CANCELLED") {
      return NextResponse.json(
        { error: `Cannot receive items for purchase order with status ${po.status}` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = ReceiveGoodsSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${issue.path.join(".")}: ${issue.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const receiptNumber = `GR-${po.poNumber}-${Date.now().toString().slice(-4)}`;

    // Execute atomic receiving transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Create Goods Receipt
      const receipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          poId: po.id,
          receivedDate: new Date(),
          receivedBy: data.receivedBy || session.name,
          invoiceNumber: data.invoiceNumber || null,
          notes: data.notes || null,
        },
      });

      let totalReceiptValue = 0;

      // 2. Process each receipt item
      for (const item of data.items) {
        if (item.quantityAccepted <= 0 && item.quantityDamaged <= 0) continue;

        const lineVal = item.quantityAccepted * item.unitCost;
        totalReceiptValue += lineVal;

        // Record GoodsReceiptItem
        await tx.goodsReceiptItem.create({
          data: {
            receiptId: receipt.id,
            poItemId: item.poItemId,
            variantId: item.variantId || null,
            quantityAccepted: item.quantityAccepted,
            quantityDamaged: item.quantityDamaged,
            unitCost: item.unitCost,
          },
        });

        // Update PO item received count
        await tx.purchaseOrderItem.update({
          where: { id: item.poItemId },
          data: {
            quantityReceived: { increment: item.quantityAccepted },
          },
        });

        // If variantId is mapped, increment stock & log movement
        if (item.variantId && item.quantityAccepted > 0) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { increment: item.quantityAccepted },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              type: "RESTOCK",
              delta: item.quantityAccepted,
              reason: `PO Receipt ${receiptNumber} (${po.poNumber})`,
              refType: "PURCHASE_ORDER",
              refId: po.id,
              actorId: session.id,
            },
          });
        }
      }

      // 3. Check if all items are fully received
      const updatedPOItems = await tx.purchaseOrderItem.findMany({
        where: { poId: po.id },
      });

      const allFulfilled = updatedPOItems.every(
        (i) => i.quantityReceived >= i.quantityOrdered
      );
      const anyReceived = updatedPOItems.some((i) => i.quantityReceived > 0);

      const newStatus = allFulfilled
        ? "RECEIVED"
        : anyReceived
        ? "PARTIAL_RECEIVED"
        : po.status;

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: newStatus },
      });

      // 4. Automatically post procurement outflow expense to Finance
      if (totalReceiptValue > 0) {
        await tx.financeTransaction.create({
          data: {
            type: "EXPENSE",
            category: "FABRIC_SOURCING",
            amount: totalReceiptValue,
            paymentMethod: "BANK_TRANSFER",
            referenceType: "PURCHASE_ORDER",
            referenceId: po.id,
            description: `Goods Receipt ${receiptNumber} for ${po.poNumber} (${po.supplier.name})`,
            status: "COMPLETED",
            actorId: session.id,
            idempotencyKey: `GR_FIN_${receipt.id}`,
          },
        });
      }

      return { receipt, newStatus, totalReceiptValue };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Receive Goods error:", error);
    return NextResponse.json(
      { error: "Failed to process goods receipt" },
      { status: 500 }
    );
  }
}
