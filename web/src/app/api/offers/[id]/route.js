/**
 * PATCH  /api/offers/[id]  — update an offer/coupon
 * DELETE /api/offers/[id]  — delete an offer/coupon
 *
 * Role permissions:
 *   branch_manager / franchise_admin / super_admin → full management
 *   sales_executive → can toggle active on their own single-use coupons only
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CAN_MANAGE_FULL = ["super_admin", "franchise_admin", "branch_manager"];

async function getOfferAndAuthorize(db, id, user) {
  const snap = await db.collection("offers").doc(id).get();
  if (!snap.exists) return { error: "Offer not found", status: 404 };

  const offer = { id: snap.id, ...snap.data() };

  // Branch/franchise scope check
  if (user.role === "branch_manager" && offer.branch_id !== user.branch_id) {
    return { error: "Forbidden", status: 403 };
  }
  if (user.role === "franchise_admin" && offer.franchise_id !== user.franchise_id) {
    return { error: "Forbidden", status: 403 };
  }
  // Sales executive: can only touch their own single-use coupons
  if (user.role === "sales_executive") {
    if (offer.branch_id !== user.branch_id) return { error: "Forbidden", status: 403 };
    if (offer.created_by !== user.uid)       return { error: "Forbidden", status: 403 };
  }

  return { offer };
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request, { params }) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const { offer, error, status } = await getOfferAndAuthorize(db, params.id, user);
  if (error) return NextResponse.json({ error }, { status });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const isSalesExec = user.role === "sales_executive";
  const isManager   = CAN_MANAGE_FULL.includes(user.role);

  // Build safe update payload
  const update = { updated_at: FieldValue.serverTimestamp() };

  if (isManager) {
    if (body.title        !== undefined) update.title             = body.title.trim();
    if (body.description  !== undefined) update.description       = body.description.trim();
    if (body.type         !== undefined) update.type              = body.type;
    if (body.discount_value !== undefined) update.discount_value  = Number(body.discount_value) || 0;
    if (body.valid_from   !== undefined) update.valid_from        = body.valid_from;
    if (body.valid_to     !== undefined) update.valid_to          = body.valid_to;
    if (body.halls        !== undefined) update.halls             = body.halls;
    if (body.min_guests   !== undefined) update.min_guests        = Number(body.min_guests) || 0;
    if (body.badge        !== undefined) update.badge             = body.badge;
    if (body.badge_color  !== undefined) update.badge_color       = body.badge_color;
    if (body.terms        !== undefined) update.terms             = body.terms.trim();
    if (body.active       !== undefined) update.active            = !!body.active;
    if (body.consumer_visible !== undefined) update.consumer_visible = !!body.consumer_visible;
    if (body.single_use   !== undefined) update.single_use        = !!body.single_use;
    if (body.max_uses     !== undefined) update.max_uses          = Number(body.max_uses) || 0;
  }

  // Sales exec: can only toggle active on their own coupons
  if (isSalesExec && body.active !== undefined) {
    update.active = !!body.active;
  }

  await db.collection("offers").doc(params.id).update(update);
  return NextResponse.json({ id: params.id, ...offer, ...update });
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(request, { params }) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const { error, status } = await getOfferAndAuthorize(db, params.id, user);
  if (error) return NextResponse.json({ error }, { status });

  // Sales exec cannot delete — only deactivate
  if (user.role === "sales_executive") {
    return NextResponse.json({ error: "Sales executives cannot delete offers" }, { status: 403 });
  }

  await db.collection("offers").doc(params.id).delete();
  return NextResponse.json({ success: true });
}
