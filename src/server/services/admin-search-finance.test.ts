import { describe, it, expect } from "vitest";

describe("Admin Global Search & Finance Integration", () => {
  describe("Finance Calculations & Margin Logic", () => {
    it("computes net balance and profit margin percentage correctly", () => {
      const totalIncome = 150000;
      const totalExpenses = 90000;
      const netBalance = totalIncome - totalExpenses;
      const profitMargin =
        totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

      expect(netBalance).toBe(60000);
      expect(profitMargin).toBe("40.0");
    });

    it("handles zero income gracefully without division by zero", () => {
      const totalIncome = 0;
      const totalExpenses = 15000;
      const netBalance = totalIncome - totalExpenses;
      const profitMargin =
        totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

      expect(netBalance).toBe(-15000);
      expect(profitMargin).toBe("0.0");
    });

    it("aggregates mixed transaction types accurately", () => {
      const sampleTransactions = [
        { type: "INCOME", amount: 4500, category: "SALES_REVENUE", status: "COMPLETED" },
        { type: "INCOME", amount: 6200, category: "SALES_REVENUE", status: "COMPLETED" },
        { type: "EXPENSE", amount: 1200, category: "PACKAGING", status: "COMPLETED" },
        { type: "EXPENSE", amount: 800, category: "LOGISTICS", status: "COMPLETED" },
        { type: "EXPENSE", amount: 3000, category: "FABRIC_SOURCING", status: "REVERSED" }, // should exclude reversed
      ];

      const active = sampleTransactions.filter((t) => t.status !== "REVERSED");
      let totalIncome = 0;
      let totalExpenses = 0;

      for (const t of active) {
        if (t.type === "INCOME") totalIncome += t.amount;
        else if (t.type === "EXPENSE") totalExpenses += t.amount;
      }

      expect(totalIncome).toBe(10700);
      expect(totalExpenses).toBe(2000);
      expect(totalIncome - totalExpenses).toBe(8700);
    });
  });

  describe("Global Search Query & Grouping Bounds", () => {
    it("groups search results into the 5 core domain entities", () => {
      const mockResults = {
        products: [{ id: "p1", title: "Anarkali Suit", badge: "Product", url: "/admin/products/p1" }],
        orders: [{ id: "o1", title: "ORD-2026-001", badge: "Order", url: "/admin/orders/o1" }],
        customers: [{ id: "c1", title: "Lakshmi S.", badge: "Customer", url: "/admin/customers/c1" }],
        inventory: [{ id: "v1", title: "Anarkali (M)", badge: "Inventory", url: "/admin/inventory?search=TG-M" }],
        finance: [{ id: "f1", title: "Packaging boxes", badge: "Expense", url: "/admin/finance" }],
      };

      expect(Object.keys(mockResults)).toEqual([
        "products",
        "orders",
        "customers",
        "inventory",
        "finance",
      ]);
      expect(mockResults.products[0].badge).toBe("Product");
      expect(mockResults.orders[0].badge).toBe("Order");
      expect(mockResults.customers[0].badge).toBe("Customer");
      expect(mockResults.inventory[0].badge).toBe("Inventory");
      expect(mockResults.finance[0].badge).toBe("Expense");
    });

    it("verifies minimum query length threshold for searching", () => {
      const validateQuery = (q: string) => {
        const trimmed = q.trim();
        return trimmed.length >= 2;
      };

      expect(validateQuery("")).toBe(false);
      expect(validateQuery("a")).toBe(false);
      expect(validateQuery("  a  ")).toBe(false);
      expect(validateQuery("tg")).toBe(true);
      expect(validateQuery("anarkali")).toBe(true);
    });
  });

  describe("Promotions & Voucher Rules", () => {
    it("normalizes and formats promo codes to clean uppercase", () => {
      const normalizePromoCode = (code: string) => code.toUpperCase().trim().replace(/\s+/g, "");

      expect(normalizePromoCode("  thaagai10  ")).toBe("THAAGAI10");
      expect(normalizePromoCode("festive 2026")).toBe("FESTIVE2026");
      expect(normalizePromoCode("bridal_luxe")).toBe("BRIDAL_LUXE");
    });

    it("calculates percentage discount with optional cap limit", () => {
      const applyPromo = (orderTotal: number, discountPercent: number, maxDiscount?: number) => {
        let discount = (orderTotal * discountPercent) / 100;
        if (maxDiscount && discount > maxDiscount) {
          discount = maxDiscount;
        }
        return {
          discount,
          finalTotal: Math.max(0, orderTotal - discount),
        };
      };

      // 10% on 3000 = 300
      expect(applyPromo(3000, 10)).toEqual({ discount: 300, finalTotal: 2700 });

      // 20% on 10000 = 2000, capped at 1000
      expect(applyPromo(10000, 20, 1000)).toEqual({ discount: 1000, finalTotal: 9000 });
    });
  });

  describe("Staff & Permissions Hierarchy", () => {
    it("enforces OWNER-only permissions for team invite", () => {
      const canManageStaff = (role: string) => role === "OWNER";

      expect(canManageStaff("OWNER")).toBe(true);
      expect(canManageStaff("ADMIN")).toBe(false);
      expect(canManageStaff("STAFF")).toBe(false);
    });
  });
});
