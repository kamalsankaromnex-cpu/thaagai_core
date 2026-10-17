import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.string().default("BANK_TRANSFER"),
  transactionDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  referenceType: z.string().optional().nullable(),
  referenceId: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "all";
    const type = searchParams.get("type"); // "INCOME" | "EXPENSE" | "ALL"
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    // Compute date window
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (timeframe === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (timeframe === "this_week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59, 999);
    } else if (timeframe === "this_month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeframe === "this_year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (timeframe === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }

    // Auto-sync sales income from confirmed/paid orders that don't yet have a finance transaction
    try {
      const confirmedOrders = await db.orderRequest.findMany({
        where: {
          OR: [{ paymentStatus: "PAID" }, { status: "CONFIRMED" }],
        },
        select: {
          id: true,
          reference: true,
          total: true,
          createdAt: true,
          customerName: true,
        },
      });

      for (const order of confirmedOrders) {
        const existingTx = await db.financeTransaction.findFirst({
          where: {
            referenceType: "ORDER",
            referenceId: order.id,
          },
        });

        if (!existingTx) {
          await db.financeTransaction.create({
            data: {
              type: "INCOME",
              category: "SALES_REVENUE",
              amount: order.total,
              paymentMethod: "UPI",
              referenceType: "ORDER",
              referenceId: order.id,
              description: `Order ${order.reference} - ${order.customerName}`,
              status: "COMPLETED",
              transactionDate: order.createdAt,
              actorId: session.id,
              idempotencyKey: `ORDER_REV_${order.id}`,
            },
          });
        }
      }
    } catch (syncErr) {
      console.warn("Order revenue auto-sync notice:", syncErr);
    }

    // Build Prisma where query
    const where: any = {};

    if (startDate && endDate) {
      where.transactionDate = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.transactionDate = { gte: startDate };
    }

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { paymentMethod: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, allTransactions] = await Promise.all([
      db.financeTransaction.findMany({
        where,
        orderBy: { transactionDate: "desc" },
        include: {
          actor: {
            select: { name: true, email: true },
          },
        },
      }),
      // Fetch all non-reversed transactions for KPI calculation in the chosen date frame
      db.financeTransaction.findMany({
        where: {
          ...(startDate && endDate
            ? { transactionDate: { gte: startDate, lte: endDate } }
            : {}),
          status: { not: "REVERSED" },
        },
        select: {
          type: true,
          amount: true,
        },
      }),
    ]);

    // Aggregate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of allTransactions) {
      const amt = Number(t.amount || 0);
      if (t.type === "INCOME") totalIncome += amt;
      else if (t.type === "EXPENSE") totalExpenses += amt;
    }

    const netBalance = totalIncome - totalExpenses;
    const profitMargin =
      totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      transactions,
      metrics: {
        totalIncome,
        totalExpenses,
        netBalance,
        profitMargin: Number(profitMargin),
      },
    });
  } catch (error) {
    console.error("Finance GET error:", error);
    return NextResponse.json(
      { error: "Failed to load financial records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TransactionSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: `Validation error in ${firstIssue.path.join(".")}: ${firstIssue.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Idempotency check
    if (data.idempotencyKey) {
      const existing = await db.financeTransaction.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) {
        return NextResponse.json({ transaction: existing, cached: true }, { status: 200 });
      }
    }

    const transaction = await db.financeTransaction.create({
      data: {
        type: data.type,
        category: data.category.toUpperCase().replace(/\s+/g, "_"),
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
        description: data.description,
        referenceType: data.referenceType || "OPERATING_EXPENSE",
        referenceId: data.referenceId,
        idempotencyKey: data.idempotencyKey || undefined,
        status: "COMPLETED",
        actorId: session.id,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Finance POST error:", error);
    return NextResponse.json(
      { error: "Failed to record financial transaction" },
      { status: 500 }
    );
  }
}
