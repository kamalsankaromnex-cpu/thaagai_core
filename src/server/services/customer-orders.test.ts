import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCustomerOrders,
  getCustomerOrderById,
  validateReorder,
} from "./order-service";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/db", () => {
  return {
    db: {
      orderRequest: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      productVariant: {
        findMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      inventoryMovement: {
        create: vi.fn(),
      },
      orderStatusHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn((fn: any) => fn(db)),
    },
  };
});

describe("Customer Orders & Reordering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCustomerOrders", () => {
    it("filters orders strictly by customerId", async () => {
      vi.mocked(db.orderRequest.count).mockResolvedValueOnce(1);
      vi.mocked(db.orderRequest.findMany).mockResolvedValueOnce([
        {
          id: "ord-1",
          reference: "TG-123456",
          customerId: "cust-1",
          subtotal: new Prisma.Decimal(2500),
          status: "CONFIRMED",
          items: [],
          history: [],
        } as any,
      ]);

      const res = await getCustomerOrders("cust-1", "all", 1, 10);
      expect(res.orders).toHaveLength(1);
      expect(res.pagination.total).toBe(1);
      expect(db.orderRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ customerId: "cust-1" }),
        })
      );
    });

    it("applies active filter status criteria", async () => {
      vi.mocked(db.orderRequest.count).mockResolvedValueOnce(0);
      vi.mocked(db.orderRequest.findMany).mockResolvedValueOnce([]);

      await getCustomerOrders("cust-1", "active", 1, 10);
      expect(db.orderRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: "cust-1",
            status: expect.objectContaining({
              in: expect.arrayContaining(["CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED"]),
            }),
          }),
        })
      );
    });
  });

  describe("getCustomerOrderById", () => {
    it("returns order when customer matches", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-1",
        customerId: "cust-1",
        reference: "TG-123456",
        items: [],
        history: [],
      } as any);

      const order = await getCustomerOrderById("cust-1", "ord-1");
      expect(order.id).toBe("ord-1");
      expect(order.reference).toBe("TG-123456");
    });

    it("throws 403 when another customer attempts to view order", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-1",
        customerId: "cust-victim",
      } as any);

      await expect(getCustomerOrderById("cust-attacker", "ord-1")).rejects.toThrow(
        /permission/i
      );
    });
  });

  describe("validateReorder", () => {
    it("reports item stock availability and current live price", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-1",
        customerId: "cust-1",
        items: [
          {
            id: "item-1",
            variantId: "var-1",
            productId: "prod-1",
            productName: "Festive Silk Churidar Suit",
            quantity: 2,
          },
        ],
        history: [],
      } as any);

      vi.mocked(db.productVariant.findMany).mockResolvedValueOnce([
        {
          id: "var-1",
          productId: "prod-1",
          stockQuantity: 5, // in stock (>= 2)
          size: "Free Size",
          colour: "Maroon",
          price: new Prisma.Decimal(4500),
          product: {
            id: "prod-1",
            name: "Festive Silk Churidar Suit",
            slug: "festive-silk-churidar-suit",
            basePrice: new Prisma.Decimal(4500),
          },
        } as any,
      ]);

      const res = await validateReorder("cust-1", "ord-1");
      expect(res.canReorderAll).toBe(true);
      expect(res.items[0].inStock).toBe(true);
      expect(res.items[0].unitPrice).toBe(4500);
      expect(res.items[0].availableQuantity).toBe(5);
    });

    it("reports canReorderAll as false if variant is out of stock", async () => {
      vi.mocked(db.orderRequest.findUnique).mockResolvedValueOnce({
        id: "ord-1",
        customerId: "cust-1",
        items: [
          {
            id: "item-1",
            variantId: "var-1",
            productId: "prod-1",
            productName: "Festive Silk Churidar Suit",
            quantity: 2,
          },
        ],
        history: [],
      } as any);

      vi.mocked(db.productVariant.findMany).mockResolvedValueOnce([
        {
          id: "var-1",
          productId: "prod-1",
          stockQuantity: 1, // only 1 in stock (< 2)
          price: new Prisma.Decimal(4500),
          product: {
            id: "prod-1",
            name: "Festive Silk Churidar Suit",
            slug: "festive-silk-churidar-suit",
            basePrice: new Prisma.Decimal(4500),
          },
        } as any,
      ]);

      const res = await validateReorder("cust-1", "ord-1");
      expect(res.canReorderAll).toBe(false);
      expect(res.items[0].inStock).toBe(false);
    });
  });
});
