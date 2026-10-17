import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus, Prisma } from "@prisma/client";
import * as crypto from "crypto";

export interface CreateOrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
  idempotencyKey?: string;
  items: CreateOrderItemInput[];
  deliverySnapshot?: any;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  generateReference(): string {
    const raw = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `TG-${raw}`;
  }

  async getCustomerOrders(customerId: string, statusFilter?: string, page = 1, limit = 20) {
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
      this.prisma.orderRequest.count({ where }),
      this.prisma.orderRequest.findMany({
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

  async getCustomerOrderById(customerId: string, orderId: string) {
    const order = await this.prisma.orderRequest.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        history: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException("You do not have permission to view this order.");
    }

    return order;
  }

  async validateReorder(customerId: string, orderId: string) {
    const order = await this.getCustomerOrderById(customerId, orderId);
    const variantIds = order.items.map((it) => it.variantId).filter(Boolean) as string[];

    const liveVariants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, active: true, product: { status: "ACTIVE" } },
      include: { product: true },
    });

    const liveMap = new Map(liveVariants.map((v) => [v.id, v]));

    const items = order.items.map((it) => {
      const v = it.variantId ? liveMap.get(it.variantId) : null;
      if (!v) {
        return {
          orderItemId: it.id,
          variantId: it.variantId,
          productId: it.productId,
          productName: it.productName,
          requestedQuantity: it.quantity,
          availableQuantity: 0,
          inStock: false,
          available: false,
        };
      }

      const currentUnitPrice = v.price ? Number(v.price) : Number(v.product.basePrice);
      const inStock = v.stockQuantity >= it.quantity;

      return {
        orderItemId: it.id,
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

    const canReorderAll = items.every((it) => it.available);
    return { canReorderAll, items };
  }

  async createOrderRequest(customerId: string | null, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException("Order must contain at least one item.");
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.orderRequest.findFirst({
        where: { notes: { contains: `[idem:${dto.idempotencyKey}]` } },
        include: { items: true },
      });
      if (existing) {
        return { order: existing, isDuplicate: true };
      }
    }

    const variantIds = dto.items.map((it) => it.variantId).filter(Boolean) as string[];
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, active: true, product: { status: "ACTIVE" } },
      include: { product: true },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    let calculatedSubtotal = 0;
    const itemsToCreate = [];

    for (const it of dto.items) {
      if (!it.variantId) {
        throw new BadRequestException("Variant ID is required for each order item.");
      }

      const v = variantMap.get(it.variantId);
      if (!v) {
        throw new BadRequestException("One or more selected items are no longer active.");
      }

      const unitPrice = v.price ? Number(v.price) : Number(v.product.basePrice);
      const lineTotal = unitPrice * it.quantity;
      calculatedSubtotal += lineTotal;

      itemsToCreate.push({
        productId: v.productId,
        variantId: v.id,
        productName: v.product.name,
        sku: v.sku,
        variantLabel: [v.size, v.colour].filter(Boolean).join(", ") || null,
        unitPrice,
        quantity: it.quantity,
        lineTotal,
      });
    }

    const reference = this.generateReference();
    const finalNotes = [
      dto.notes?.trim(),
      dto.idempotencyKey ? `[idem:${dto.idempotencyKey}]` : null,
    ].filter(Boolean).join(" ");

    const order = await this.prisma.orderRequest.create({
      data: {
        reference,
        customerId: customerId || null,
        customerName: dto.customerName.trim(),
        customerPhone: dto.customerPhone.replace(/\D/g, "").slice(-10),
        address: dto.address.trim(),
        city: dto.city.trim(),
        state: dto.state.trim(),
        pinCode: dto.pinCode.trim(),
        subtotal: calculatedSubtotal,
        status: OrderStatus.PENDING_WHATSAPP,
        notes: finalNotes || null,
        deliverySnapshot: dto.deliverySnapshot || null,
        items: {
          create: itemsToCreate,
        },
        history: {
          create: {
            previousStatus: null,
            newStatus: OrderStatus.PENDING_WHATSAPP,
            note: "Customer initiated order via WhatsApp checkout",
          },
        },
      },
      include: {
        items: true,
      },
    });

    return { order, isDuplicate: false };
  }
}
