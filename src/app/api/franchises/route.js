/**
 * GET  /api/franchises      — list franchises (super_admin only)
 * POST /api/franchises      — create a franchise (super_admin)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { cache } from "@/lib/cache";

const TTL = 300; // 5 min cache (in seconds)

export async function GET(request) {
  try {
    const user = await verifyRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super_admin can view all franchises
    if (user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cacheKey = "franchises:all";
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const db = getAdminDb();
    const snap = await db.collection("franchises").get();
    
    const franchises = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const result = { franchises };
    cache.set(cacheKey, result, TTL);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/franchises]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await verifyRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Franchise name is required" },
        { status: 422 }
      );
    }

    const db = getAdminDb();
    const docRef = await db.collection("franchises").add({
      name: body.name.trim(),
      city: body.city || "",
      code: body.code?.toUpperCase() || "",
      created_at: new Date(),
      updated_at: new Date(),
      status: "Active",
    });

    // Invalidate cache
    cache.delete("franchises:all");

    return NextResponse.json(
      { id: docRef.id, message: "Franchise created" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/franchises]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
