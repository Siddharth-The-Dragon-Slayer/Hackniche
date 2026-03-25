/**
 * GET  /api/halls?branch_id=xxx   — list halls for a branch (RBAC-scoped)
 * POST /api/halls                  — create a hall (branch_manager / franchise_admin / super_admin)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CAN_MANAGE = ["super_admin", "franchise_admin", "branch_manager"];

export async function GET(request) {
  const user = await verifyRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get("branch_id");

  const db = getAdminDb();
  let q = db.collection("halls");

  if (user.role === "branch_manager") {
    // Enforce: can only see their own branch
    const effectiveBranchId = user.branch_id;
    if (!effectiveBranchId) return NextResponse.json({ halls: [] });
    q = q.where("branch_id", "==", effectiveBranchId);
  } else if (branch_id) {
    // franchise_admin/super_admin can query any branch (franchise scoped below)
    q = q.where("branch_id", "==", branch_id);
    // Franchise admin: verify the branch belongs to their franchise
    if (user.role === "franchise_admin") {
      const branchSnap = await db.collection("branches").doc(branch_id).get();
      if (
        branchSnap.exists &&
        branchSnap.data().franchise_id !== user.franchise_id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  } else if (user.franchise_id) {
    q = q.where("franchise_id", "==", user.franchise_id);
  } else if (user.role !== "super_admin") {
    return NextResponse.json({ halls: [] });
  }

  const snap = await q.get();
  const halls = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return NextResponse.json(
    { halls },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(request) {
  const user = await verifyRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!CAN_MANAGE.includes(user.role)) {
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
      { error: "Hall name is required" },
      { status: 422 },
    );
  }

  // Determine branch_id: branch_manager is locked to theirs
  const branch_id =
    user.role === "branch_manager" ? user.branch_id : body.branch_id;
  if (!branch_id) {
    return NextResponse.json(
      { error: "branch_id is required" },
      { status: 422 },
    );
  }

  // Resolve branch details for denormalisation
  const db = getAdminDb();
  const branchSnap = await db.collection("branches").doc(branch_id).get();
  if (!branchSnap.exists) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }
  const branch = branchSnap.data();

  // Franchise admin scope check
  if (
    user.role === "franchise_admin" &&
    branch.franchise_id !== user.franchise_id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = {
    name: body.name.trim(),
    type: body.type || "Indoor",
    capacity_seating: Number(body.capacity_seating) || 0,
    capacity_floating: Number(body.capacity_floating) || 0,
    base_price: Number(body.base_price) || 0,
    price_per_plate: Number(body.price_per_plate) || 450,
    features: Array.isArray(body.features)
      ? body.features
      : (body.features || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    status: body.status || "active",
    branch_id,
    branch_name: branch.name || "",
    franchise_id: branch.franchise_id || "",
    franchise_name: branch.franchise_name || "",
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("halls").add(payload);
  return NextResponse.json({ id: ref.id, ...payload }, { status: 201 });
}
