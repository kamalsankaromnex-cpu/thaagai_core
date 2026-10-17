import { NextResponse } from "next/server";
import { getAllFabrics } from "@/server/services/fabric-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fabrics = await getAllFabrics();
    const activeFabrics = fabrics.filter((f) => f.status === "ACTIVE");
    return NextResponse.json(activeFabrics);
  } catch (error) {
    console.error("GET /api/fabrics error:", error);
    return NextResponse.json({ error: "Failed to fetch fabrics" }, { status: 500 });
  }
}
