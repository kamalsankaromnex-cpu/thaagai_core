import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Probe PostgreSQL Database Connectivity & Latency
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    // 2. Gather system diagnostic metrics
    const mem = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(mem.rss / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    };

    return NextResponse.json(
      {
        status: "healthy",
        service: "THAAGAI Boutique E-Commerce Engine",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        database: {
          connected: true,
          engine: "PostgreSQL 14",
          latencyMs,
        },
        environment: process.env.NODE_ENV || "development",
        memoryMB,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Health check failure:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "THAAGAI Boutique E-Commerce Engine",
        timestamp: new Date().toISOString(),
        error: error.message || "Database connection failure",
        database: {
          connected: false,
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
