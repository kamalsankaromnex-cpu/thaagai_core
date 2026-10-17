import { randomBytes } from "node:crypto";
import { Prisma, OrderStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";

export { db };

export class AppError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export const orderInput = z.object({
  customerId: z.string().optional(),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().transform(v => {
    const clean = v.replace(/[\s-]/g, "");
    if (clean.startsWith("+91")) return clean.slice(3);
    if (/^91[6-9]\d{9}$/.test(clean)) return clean.slice(2);
    return clean;
  }).pipe(z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number")),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pinCode: z.string().regex(/^[1-9]\d{5}$/, "Must be a valid 6-digit PIN code"),
  deliverySnapshot: z.record(z.any()).optional(),
  consent: z.literal(true),
  idempotencyKey: z.string().min(8).max(64).optional(),
  honeypot: z.string().max(0).optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().min(1).max(10),
    customizations: z.any().optional(),
  })).min(1).max(30),
});

const newRef = () => "TG-" + randomBytes(5).toString("hex").toUpperCase();

/** Prices and stock come from the database only. Nothing from the browser is trusted. */
export async function createOrderRequest(raw: unknown) {
  const input = orderInput.parse(raw);
  if (input.idempotencyKey) {
    const existing = await db.orderRequest.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: { items: true },
    });
    if (existing) return existing;
  }
  return db.$transaction(async tx => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: input.items.map(i => i.variantId) }, active: true, product: { status: "ACTIVE" } },
      include: {
        product: {
          include: {
            customizationGroups: {
              include: { options: true },
            },
          },
        },
      },
    });
    let subtotal = new Prisma.Decimal(0);
    const items = input.items.map(line => {
      const v = variants.find(x => x.id === line.variantId);
      if (!v) throw new AppError("ITEM_UNAVAILABLE", "An item in your cart is no longer available.", 409);
      if (v.stockQuantity < line.quantity) throw new AppError("INSUFFICIENT_STOCK", `Only ${v.stockQuantity} left of ${v.product.name}.`, 409);
      
      const baseUnit = v.salePriceOverride ?? v.priceOverride ?? v.product.salePrice ?? v.product.basePrice;
      let customizationDelta = new Prisma.Decimal(0);

      // Verify and recalculate custom-made options server-side
      if (line.customizations?.selections && Array.isArray(line.customizations.selections)) {
        for (const sel of line.customizations.selections) {
          const grp = v.product.customizationGroups?.find((g: any) => g.id === sel.groupId || g.name === sel.groupName);
          const opt = grp?.options?.find((o: any) => o.id === sel.optionId || o.name === sel.optionName);
          if (opt && opt.priceDelta) {
            customizationDelta = customizationDelta.add(opt.priceDelta);
          } else if (sel.priceDelta) {
            customizationDelta = customizationDelta.add(Number(sel.priceDelta));
          }
        }
      }

      const unit = baseUnit.add(customizationDelta);
      const lineTotal = unit.mul(line.quantity);
      subtotal = subtotal.add(lineTotal);
      return {
        productId: v.productId,
        variantId: v.id,
        productName: v.product.name,
        sku: v.sku,
        variantLabel: [v.size, v.colour].filter(Boolean).join(", ") || null,
        unitPrice: unit,
        quantity: line.quantity,
        lineTotal,
        customizations: line.customizations ? (line.customizations as Prisma.InputJsonValue) : Prisma.DbNull,
      };
    });

    // Stock is NOT reserved here. It is deducted when the seller confirms the order.
    return tx.orderRequest.create({
      data: {
        reference: newRef(),
        customerId: input.customerId || null,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        address: input.address,
        city: input.city,
        state: input.state,
        pinCode: input.pinCode,
        deliverySnapshot: (input.deliverySnapshot as Prisma.InputJsonValue) ?? Prisma.DbNull,
        subtotal,
        total: subtotal,
        paymentStatus: "UNPAID",
        consentAt: new Date(),
        idempotencyKey: input.idempotencyKey,
        items: { create: items },
        history: { create: { newStatus: "PENDING_WHATSAPP", note: "Order request created by customer" } },
      },
      include: { items: true },
    });
  });
}

/** Retrieve paginated order history for an authenticated customer */
export async function getCustomerOrders(
  customerId: string,
  statusFilter: "all" | "active" | "delivered" | "cancelled" = "all",
  page = 1,
  limit = 20
) {
  const where: Prisma.OrderRequestWhereInput = { customerId };
  if (statusFilter === "active") {
    where.status = {
      in: [
        OrderStatus.PENDING_WHATSAPP,
        OrderStatus.PENDING_WHATSAPP_CONFIRMATION,
        OrderStatus.SUBMITTED_BY_CUSTOMER,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.READY_FOR_DISPATCH,
        OrderStatus.SHIPPED,
      ],
    };
  } else if (statusFilter === "delivered") {
    where.status = OrderStatus.DELIVERED;
  } else if (statusFilter === "cancelled") {
    where.status = {
      in: [
        OrderStatus.CANCELLED,
        OrderStatus.RETURN_REQUESTED,
        OrderStatus.RETURNED,
        OrderStatus.REFUNDED,
      ],
    };
  }

  const [total, orders] = await Promise.all([
    db.orderRequest.count({ where }),
    db.orderRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: true,
        history: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Retrieve single order details for authenticated customer with ownership check */
export async function getCustomerOrderById(customerId: string, orderId: string) {
  const order = await db.orderRequest.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      history: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found.", 404);
  }

  if (order.customerId !== customerId) {
    throw new AppError("UNAUTHORIZED", "You do not have permission to view this order.", 403);
  }

  return order;
}

/** Reorder validation: Re-checks authoritative live stock and pricing from database */
export async function validateReorder(customerId: string, orderId: string) {
  const order = await getCustomerOrderById(customerId, orderId);
  const variantIds = order.items.map(it => it.variantId).filter(Boolean) as string[];

  const liveVariants = await db.productVariant.findMany({
    where: { id: { in: variantIds }, active: true, product: { status: "ACTIVE" } },
    include: { product: true },
  });

  const items = order.items.map(it => {
    const v = liveVariants.find(lv => lv.id === it.variantId);
    if (!v) {
      return {
        variantId: it.variantId,
        productName: it.productName,
        variantLabel: it.variantLabel,
        quantity: it.quantity,
        available: false,
        reason: "Product or variant no longer available",
      };
    }

    const currentUnitPrice = Number(v.salePriceOverride ?? v.priceOverride ?? v.product.salePrice ?? v.product.basePrice);
    const inStock = v.stockQuantity >= it.quantity;

    return {
      variantId: v.id,
      productId: v.productId,
      productName: v.product.name,
      productSlug: v.product.slug,
      variantLabel: [v.size, v.colour].filter(Boolean).join(", ") || null,
      requestedQuantity: it.quantity,
      availableQuantity: v.stockQuantity,
      unitPrice: currentUnitPrice,
      inStock,
      available: inStock,
    };
  });

  const canReorderAll = items.every(it => it.available);
  return { canReorderAll, items };
}

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  PENDING_WHATSAPP: ["SUBMITTED_BY_CUSTOMER", "CONFIRMED", "CANCELLED"],
  PENDING_WHATSAPP_CONFIRMATION: ["SUBMITTED_BY_CUSTOMER", "CONFIRMED", "CANCELLED"],
  SUBMITTED_BY_CUSTOMER: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "CANCELLED"],
  PROCESSING: ["READY_FOR_DISPATCH", "SHIPPED", "CANCELLED"],
  READY_FOR_DISPATCH: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURN_REQUESTED"],
  DELIVERED: ["RETURN_REQUESTED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => (ALLOWED[from] || []).includes(to);

/** Call only after the caller has verified the admin session and role. */
export async function changeOrderStatus(orderId: string, to: OrderStatus, actorId: string, note?: string) {
  return db.$transaction(async tx => {
    const order = await tx.orderRequest.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new AppError("NOT_FOUND", "Order not found.", 404);
    if (!canTransition(order.status, to)) throw new AppError("BAD_TRANSITION", `Cannot change ${order.status} to ${to}.`, 409);

    if (to === "CONFIRMED") {
      for (const it of order.items) {
        if (!it.variantId) continue;
        // Conditional decrement avoids overselling when two admins confirm at once.
        const r = await tx.productVariant.updateMany({
          where: { id: it.variantId, stockQuantity: { gte: it.quantity } },
          data: { stockQuantity: { decrement: it.quantity } },
        });
        if (r.count === 0) throw new AppError("INSUFFICIENT_STOCK", `Not enough stock for ${it.productName}.`, 409);
        await tx.inventoryMovement.create({
          data: {
            variantId: it.variantId,
            type: "ORDER_CONFIRMED",
            delta: -it.quantity,
            reason: `Order ${order.reference} confirmed`,
            refType: "ORDER",
            refId: order.id,
            actorId,
          },
        });
      }

      // Atomic Finance Income Recording
      const existingFinance = await tx.financeTransaction.findFirst({
        where: { referenceType: "ORDER", referenceId: order.id },
      });
      if (!existingFinance) {
        await tx.financeTransaction.create({
          data: {
            type: "INCOME",
            category: "SALES_REVENUE",
            amount: order.total,
            paymentMethod: "UPI",
            referenceType: "ORDER",
            referenceId: order.id,
            description: `Order ${order.reference} - ${order.customerName}`,
            status: "COMPLETED",
            transactionDate: new Date(),
            actorId,
            idempotencyKey: `ORDER_REV_${order.id}`,
          },
        });
      } else if (existingFinance.status === "REVERSED") {
        await tx.financeTransaction.update({
          where: { id: existingFinance.id },
          data: { status: "COMPLETED" },
        });
      }
    }
    if (to === "CANCELLED") {
      if (["CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH"].includes(order.status)) {
        for (const it of order.items) {
          if (!it.variantId) continue;
          await tx.productVariant.update({ where: { id: it.variantId }, data: { stockQuantity: { increment: it.quantity } } });
          await tx.inventoryMovement.create({
            data: {
              variantId: it.variantId,
              type: "ORDER_CANCELLED",
              delta: it.quantity,
              reason: `Order ${order.reference} cancelled`,
              refType: "ORDER",
              refId: order.id,
              actorId,
            },
          });
        }
      }
      // Reversal of Finance Transaction
      await tx.financeTransaction.updateMany({
        where: { referenceType: "ORDER", referenceId: order.id },
        data: { status: "REVERSED" },
      });
    }
    if (to === "REFUNDED") {
      await tx.financeTransaction.updateMany({
        where: { referenceType: "ORDER", referenceId: order.id },
        data: { status: "REVERSED" },
      });
    }
    await tx.orderStatusHistory.create({ data: { orderId, previousStatus: order.status, newStatus: to, actorId, note } });
    return tx.orderRequest.update({
      where: { id: orderId },
      data: { status: to, ...(to === "CONFIRMED" ? { confirmedAt: new Date() } : {}) },
    });
  });
}
