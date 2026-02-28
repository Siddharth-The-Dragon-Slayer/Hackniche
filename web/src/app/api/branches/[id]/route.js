/**
 * PATCH /api/branches/[id]  — update a branch (franchise_admin / super_admin)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function PATCH(request, { params }) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "franchise_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing branch id" }, { status: 400 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("branches").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Enforce franchise scope for franchise_admin
  const existing = snap.data();
  if (user.role === "franchise_admin" && existing.franchise_id !== user.franchise_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update = {
    ...(body.name != null && { name: body.name }),
    ...(body.type != null && { type: body.type }),
    ...(body.city != null && { city: body.city }),
    ...(body.state != null && { state: body.state }),
    ...(body.address != null && { address: body.address }),
    ...(body.phone != null && { phone: body.phone }),
    ...(body.timings != null && { timings: body.timings }),
    ...(body.maps_url !== undefined && { maps_url: body.maps_url }),
    ...(body.google_rating != null && { google_rating: Number(body.google_rating) }),
    ...(body.review_count != null && { review_count: Number(body.review_count) }),
    ...(body.cost_for_two != null && { cost_for_two: Number(body.cost_for_two) }),
    ...(body.status != null && { status: body.status }),
    updated_at: FieldValue.serverTimestamp(),
  };

  await ref.update(update);
  return NextResponse.json({ id, ...update });
}
