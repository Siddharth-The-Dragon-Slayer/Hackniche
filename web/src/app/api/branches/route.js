/**
 * GET  /api/branches      — list branches (RBAC-scoped)
 * POST /api/branches      — create a branch (franchise_admin / super_admin)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  let q = db.collection("branches");

  if (user.role === "super_admin") {
    // no filter — all branches
  } else if (user.franchise_id) {
    q = q.where("franchise_id", "==", user.franchise_id);
  } else {
    return NextResponse.json({ branches: [] });
  }

  const snap = await q.get();
  const branches = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return NextResponse.json({ branches }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "franchise_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Branch name is required" }, { status: 422 });
  }

  const db = getAdminDb();
  const payload = {
    name: body.name.trim(),
    type: body.type || "Outlet",
    city: body.city || "",
    state: body.state || "Maharashtra",
    address: body.address || "",
    phone: body.phone || "",
    timings: body.timings || "11:00 AM – 11:30 PM",
    maps_url: body.maps_url || null,
    google_rating: body.google_rating != null ? Number(body.google_rating) : null,
    review_count: body.review_count != null ? Number(body.review_count) : null,
    cost_for_two: body.cost_for_two != null ? Number(body.cost_for_two) : null,
    status: body.status || "active",
    franchise_id: user.franchise_id || body.franchise_id || "",
    franchise_name: user.franchise_name || body.franchise_name || "",
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("branches").add(payload);
  return NextResponse.json({ id: ref.id, ...payload }, { status: 201 });
}
