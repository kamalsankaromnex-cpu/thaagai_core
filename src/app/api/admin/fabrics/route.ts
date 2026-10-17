import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/auth";
import {
  getAllFabrics,
  upsertFabric,
  deleteFabric,
} from "@/server/services/fabric-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fabrics = await getAllFabrics();
    return NextResponse.json(fabrics);
  } catch (err) {
    console.error("GET /api/admin/fabrics error:", err);
    return NextResponse.json({ error: "Failed to fetch fabrics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.fabricId || !body.name) {
      return NextResponse.json(
        { error: "Fabric ID and Fabric Name are required." },
        { status: 400 }
      );
    }

    const saved = await upsertFabric(body);
    return NextResponse.json(saved, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/fabrics error:", err);
    return NextResponse.json({ error: "Failed to save fabric" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Fabric ID is required" }, { status: 400 });
  }

  try {
    const success = await deleteFabric(id);
    return NextResponse.json({ success });
  } catch (err) {
    console.error("DELETE /api/admin/fabrics error:", err);
    return NextResponse.json({ error: "Failed to delete fabric" }, { status: 500 });
  }
}
