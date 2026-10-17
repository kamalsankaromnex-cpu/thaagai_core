import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import {
  orderInput,
  canTransition,
  createOrderRequest,
  changeOrderStatus,
  AppError,
  db,
} from "./order-service";

describe("orderInput validation", () => {
  const baseValidInput = {
    customerName: "Ananya Sharma",
    customerPhone: "9876543210",
    address: "12, Temple Street, Mylapore",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600004",
    consent: true,
    items: [{ variantId: "var-1", quantity: 2 }],
  };

  it("accepts clean 10-digit Indian mobile number", () => {
    const result = orderInput.parse(baseValidInput);
    expect(result.customerPhone).toBe("9876543210");
  });

  it("strips whitespace and dashes from phone number", () => {
    const input = { ...baseValidInput, customerPhone: "98765 43210" };
    expect(orderInput.parse(input).customerPhone).toBe("9876543210");

    const inputWithDashes = { ...baseValidInput, customerPhone: "9876-543-210" };
    expect(orderInput.parse(inputWithDashes).customerPhone).toBe("9876543210");
  });

  it("handles +91 prefix correctly", () => {
    const input = { ...baseValidInput, customerPhone: "+91 9876543210" };
    expect(orderInput.parse(input).customerPhone).toBe("9876543210");
  });

  it("handles 12-digit format with 91 country code prefix", () => {
    const input = { ...baseValidInput, customerPhone: "919876543210" };
    expect(orderInput.parse(input).customerPhone).toBe("9876543210");
  });

  it("preserves 10-digit phone numbers starting with 91 (the bug fix)", () => {
    const input = { ...baseValidInput, customerPhone: "9123456789" };
    const parsed = orderInput.parse(input);
    expect(parsed.customerPhone).toBe("9123456789");
  });

  it("rejects phone numbers not starting with 6-9", () => {
    expect(() =>
      orderInput.parse({ ...baseValidInput, customerPhone: "5876543210" })
    ).toThrow();
    expect(() =>
      orderInput.parse({ ...baseValidInput, customerPhone: "0876543210" })
    ).toThrow();
  });

  it("rejects phone numbers with incorrect length", () => {
    expect(() =>
      orderInput.parse({ ...baseValidInput, customerPhone: "987654321" })
    ).toThrow();
    expect(() =>
      orderInput.parse({ ...baseValidInput, customerPhone: "98765432109" })
    ).toThrow();
  });

  it("validates 6-digit Indian PIN codes starting with 1-9", () => {
    expect(orderInput.parse({ ...baseValidInput, pinCode: "600001" }).pinCode).toBe("600001");
    expect(orderInput.parse({ ...baseValidInput, pinCode: "110001" }).pinCode).toBe("110001");
    expect(orderInput.parse({ ...baseValidInput, pinCode: "560001" }).pinCode).toBe("560001");
  });

  it("rejects invalid PIN codes", () => {
    expect(() => orderInput.parse({ ...baseValidInput, pinCode: "060001" })).toThrow();
    expect(() => orderInput.parse({ ...baseValidInput, pinCode: "60001" })).toThrow();
    expect(() => orderInput.parse({ ...baseValidInput, pinCode: "6000001" })).toThrow();
    expect(() => orderInput.parse({ ...baseValidInput, pinCode: "60000A" })).toThrow();
  });

  it("rejects non-empty honeypot", () => {
    expect(() =>
      orderInput.parse({ ...baseValidInput, honeypot: "spam-bot-value" })
    ).toThrow();
  });

  it("requires consent to be true", () => {
    expect(() => orderInput.parse({ ...baseValidInput, consent: false })).toThrow();
  });

  it("validates item quantities between 1 and 10", () => {
    expect(() =>
      orderInput.parse({
        ...baseValidInput,
        items: [{ variantId: "var-1", quantity: 0 }],
      })
    ).toThrow();

    expect(() =>
      orderInput.parse({
        ...baseValidInput,
        items: [{ variantId: "var-1", quantity: 11 }],
      })
    ).toThrow();
  });
});

describe("canTransition status machine", () => {
  it("allows valid transitions from PENDING_WHATSAPP", () => {
    expect(canTransition("PENDING_WHATSAPP", "SUBMITTED_BY_CUSTOMER")).toBe(true);
    expect(canTransition("PENDING_WHATSAPP", "CONFIRMED")).toBe(true);
    expect(canTransition("PENDING_WHATSAPP", "CANCELLED")).toBe(true);
    expect(canTransition("PENDING_WHATSAPP", "DELIVERED")).toBe(false);
  });

  it("allows valid transitions from CONFIRMED", () => {
    expect(canTransition("CONFIRMED", "PROCESSING")).toBe(true);
    expect(canTransition("CONFIRMED", "SHIPPED")).toBe(true);
    expect(canTransition("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransition("CONFIRMED", "PENDING_WHATSAPP")).toBe(false);
  });

  it("disallows transitions from terminal CANCELLED and REFUNDED states", () => {
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
    expect(canTransition("CANCELLED", "PENDING_WHATSAPP")).toBe(false);
    expect(canTransition("REFUNDED", "RETURNED")).toBe(false);
  });

  it("disallows cancelling once SHIPPED", () => {
    expect(canTransition("SHIPPED", "CANCELLED")).toBe(false);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(canTransition("SHIPPED", "RETURN_REQUESTED")).toBe(true);
  });
});

describe("createOrderRequest pricing & stock verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validPayload = {
    customerName: "Priya Sundaram",
    customerPhone: "9876543210",
    address: "45 Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600002",
    consent: true as const,
    items: [{ variantId: "var-1", quantity: 2 }],
  };

  it("returns existing order when idempotencyKey matches", async () => {
    const existingOrder = { id: "order-123", reference: "TG-EXISTING", items: [] };
    vi.spyOn(db.orderRequest, "findUnique").mockResolvedValue(existingOrder as never);

    const result = await createOrderRequest({
      ...validPayload,
      idempotencyKey: "idem-key-12345",
    });

    expect(result).toBe(existingOrder);
  });

  it("throws ITEM_UNAVAILABLE if variant is inactive or missing", async () => {
    vi.spyOn(db.orderRequest, "findUnique").mockResolvedValue(null);
    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };
      return callback(mockTx);
    });

    await expect(createOrderRequest(validPayload)).rejects.toThrow(
      new AppError("ITEM_UNAVAILABLE", "An item in your cart is no longer available.", 409)
    );
  });

  it("throws INSUFFICIENT_STOCK if requested quantity exceeds stock", async () => {
    vi.spyOn(db.orderRequest, "findUnique").mockResolvedValue(null);
    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "var-1",
              productId: "prod-1",
              sku: "TG-HLK-S",
              stockQuantity: 1, // Only 1 in stock, request is 2
              product: { name: "Handloom cotton kurta", basePrice: new Prisma.Decimal(1890) },
            },
          ]),
        },
      };
      return callback(mockTx);
    });

    await expect(createOrderRequest(validPayload)).rejects.toThrow(
      new AppError("INSUFFICIENT_STOCK", "Only 1 left of Handloom cotton kurta.", 409)
    );
  });

  it("accurately calculates pricing with overrides precedence (salePriceOverride > priceOverride > salePrice > basePrice)", async () => {
    vi.spyOn(db.orderRequest, "findUnique").mockResolvedValue(null);

    let createdOrderData: any = null;

    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        productVariant: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "var-1",
              productId: "prod-1",
              sku: "TG-HLK-S",
              size: "S",
              colour: "Indigo",
              stockQuantity: 10,
              salePriceOverride: new Prisma.Decimal(1500),
              priceOverride: new Prisma.Decimal(1700),
              product: {
                name: "Handloom cotton kurta",
                basePrice: new Prisma.Decimal(1890),
                salePrice: new Prisma.Decimal(1600),
              },
            },
          ]),
        },
        orderRequest: {
          create: vi.fn().mockImplementation((args: any) => {
            createdOrderData = args.data;
            return { id: "order-1", ...args.data };
          }),
        },
      };
      return callback(mockTx);
    });

    await createOrderRequest(validPayload);

    // salePriceOverride (1500) takes precedence over all else.
    // 1500 * quantity (2) = 3000
    expect(createdOrderData.subtotal.toString()).toBe("3000");
    expect(createdOrderData.total.toString()).toBe("3000");
    expect(createdOrderData.items.create[0].unitPrice.toString()).toBe("1500");
    expect(createdOrderData.items.create[0].lineTotal.toString()).toBe("3000");
    expect(createdOrderData.items.create[0].variantLabel).toBe("S, Indigo");
  });
});

describe("changeOrderStatus stock deduction and rollback transactions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockOrder = {
    id: "ord-1",
    reference: "TG-A1B2C3",
    status: "PENDING_WHATSAPP" as const,
    items: [
      { variantId: "var-1", productName: "Handloom cotton kurta", quantity: 2 },
    ],
  };

  it("throws NOT_FOUND if order does not exist", async () => {
    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };
      return callback(mockTx);
    });

    await expect(
      changeOrderStatus("non-existent", "CONFIRMED", "admin-1")
    ).rejects.toThrow(new AppError("NOT_FOUND", "Order not found.", 404));
  });

  it("throws BAD_TRANSITION if transition is illegal", async () => {
    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue({ ...mockOrder, status: "CANCELLED" }),
        },
      };
      return callback(mockTx);
    });

    await expect(
      changeOrderStatus("ord-1", "CONFIRMED", "admin-1")
    ).rejects.toThrow(new AppError("BAD_TRANSITION", "Cannot change CANCELLED to CONFIRMED.", 409));
  });

  it("deducts stock and creates InventoryMovement on CONFIRMED", async () => {
    const updateManySpy = vi.fn().mockResolvedValue({ count: 1 });
    const movementSpy = vi.fn().mockResolvedValue({ id: "mov-1" });
    const historySpy = vi.fn().mockResolvedValue({ id: "hist-1" });
    const updateOrderSpy = vi.fn().mockResolvedValue({ id: "ord-1", status: "CONFIRMED" });

    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          update: updateOrderSpy,
        },
        productVariant: {
          updateMany: updateManySpy,
        },
        inventoryMovement: {
          create: movementSpy,
        },
        orderStatusHistory: {
          create: historySpy,
        },
        financeTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: "fin-1" }),
          update: vi.fn(),
          updateMany: vi.fn(),
        },
      };
      return callback(mockTx);
    });

    const res = await changeOrderStatus("ord-1", "CONFIRMED", "admin-1", "Verified payment request");

    // Stock deduction with conditional gte check
    expect(updateManySpy).toHaveBeenCalledWith({
      where: { id: "var-1", stockQuantity: { gte: 2 } },
      data: { stockQuantity: { decrement: 2 } },
    });

    // Movement creation
    expect(movementSpy).toHaveBeenCalledWith({
      data: {
        variantId: "var-1",
        type: "ORDER_CONFIRMED",
        delta: -2,
        reason: "Order TG-A1B2C3 confirmed",
        refType: "ORDER",
        refId: "ord-1",
        actorId: "admin-1",
      },
    });

    // History record
    expect(historySpy).toHaveBeenCalledWith({
      data: {
        orderId: "ord-1",
        previousStatus: "PENDING_WHATSAPP",
        newStatus: "CONFIRMED",
        actorId: "admin-1",
        note: "Verified payment request",
      },
    });

    expect(res.status).toBe("CONFIRMED");
  });

  it("throws INSUFFICIENT_STOCK if stock decreased before confirmation", async () => {
    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
        },
        productVariant: {
          // updateMany returns count: 0 if stock was insufficient
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      return callback(mockTx);
    });

    await expect(
      changeOrderStatus("ord-1", "CONFIRMED", "admin-1")
    ).rejects.toThrow(
      new AppError("INSUFFICIENT_STOCK", "Not enough stock for Handloom cotton kurta.", 409)
    );
  });

  it("increments stock back when CANCELLED from CONFIRMED or PROCESSING", async () => {
    const updateVariantSpy = vi.fn().mockResolvedValue({ id: "var-1" });
    const movementSpy = vi.fn().mockResolvedValue({ id: "mov-1" });

    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue({ ...mockOrder, status: "CONFIRMED" }),
          update: vi.fn().mockResolvedValue({ id: "ord-1", status: "CANCELLED" }),
        },
        productVariant: {
          update: updateVariantSpy,
        },
        inventoryMovement: {
          create: movementSpy,
        },
        orderStatusHistory: {
          create: vi.fn().mockResolvedValue({ id: "hist-1" }),
        },
        financeTransaction: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };
      return callback(mockTx);
    });

    await changeOrderStatus("ord-1", "CANCELLED", "admin-1", "Customer requested cancellation");

    expect(updateVariantSpy).toHaveBeenCalledWith({
      where: { id: "var-1" },
      data: { stockQuantity: { increment: 2 } },
    });

    expect(movementSpy).toHaveBeenCalledWith({
      data: {
        variantId: "var-1",
        type: "ORDER_CANCELLED",
        delta: 2,
        reason: "Order TG-A1B2C3 cancelled",
        refType: "ORDER",
        refId: "ord-1",
        actorId: "admin-1",
      },
    });
  });

  it("does NOT increment stock when CANCELLED from PENDING_WHATSAPP (stock was never deducted)", async () => {
    const updateVariantSpy = vi.fn();
    const movementSpy = vi.fn();

    vi.spyOn(db, "$transaction").mockImplementation(async (callback: any) => {
      const mockTx = {
        orderRequest: {
          findUnique: vi.fn().mockResolvedValue({ ...mockOrder, status: "PENDING_WHATSAPP" }),
          update: vi.fn().mockResolvedValue({ id: "ord-1", status: "CANCELLED" }),
        },
        productVariant: {
          update: updateVariantSpy,
        },
        inventoryMovement: {
          create: movementSpy,
        },
        orderStatusHistory: {
          create: vi.fn().mockResolvedValue({ id: "hist-1" }),
        },
        financeTransaction: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      return callback(mockTx);
    });

    await changeOrderStatus("ord-1", "CANCELLED", "admin-1", "Order expired");

    expect(updateVariantSpy).not.toHaveBeenCalled();
    expect(movementSpy).not.toHaveBeenCalled();
  });
});
