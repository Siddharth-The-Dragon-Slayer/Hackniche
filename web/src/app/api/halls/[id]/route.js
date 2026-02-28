/**
 * PATCH /api/halls/[id]  — update a hall (branch_manager / franchise_admin / super_admin)
 * DELETE /api/halls/[id] — delete a hall (franchise_admin / super_admin)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CAN_MANAGE = ["super_admin", "franchise_admin", "branch_manager"];

export async function PATCH(request, { params }) {
  const user = await verifyRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!CAN_MANAGE.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing hall id" }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("halls").doc(id);
  const snap = await ref.get();
  if (!snap.exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = snap.data();

  // Scope checks
  if (user.role === "branch_manager" && existing.branch_id !== user.branch_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (
    user.role === "franchise_admin" &&
    existing.franchise_id !== user.franchise_id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = {
    ...(body.name != null && { name: body.name }),
    ...(body.type != null && { type: body.type }),
    ...(body.capacity_seating != null && {
      capacity_seating: Number(body.capacity_seating),
    }),
    ...(body.capacity_floating != null && {
      capacity_floating: Number(body.capacity_floating),
    }),
    ...(body.base_price != null && { base_price: Number(body.base_price) }),
    ...(body.price_per_plate != null && {
      price_per_plate: Number(body.price_per_plate),
    }),
    ...(body.features != null && {
      features: Array.isArray(body.features)
        ? body.features
        : body.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    }),
    ...(body.status != null && { status: body.status }),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.update(update);
  return NextResponse.json({ id, ...update });
}

export async function DELETE(request, { params }) {
  const user = await verifyRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "franchise_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const db = getAdminDb();
  const snap = await db.collection("halls").doc(id).get();
  if (!snap.exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hall = snap.data();
  if (
    user.role === "franchise_admin" &&
    hall.franchise_id !== user.franchise_id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.collection("halls").doc(id).delete();
  return NextResponse.json({ deleted: true });
}
