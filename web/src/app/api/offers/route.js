/**
 * GET  /api/offers?branch_id=xxx   — list offers/coupons for a branch
 * POST /api/offers                  — create an offer/coupon
 *
 * Role permissions:
 *   branch_manager / franchise_admin / super_admin → full offers (multi-use, consumer-visible)
 *   sales_executive → single-use coupons only (own branch)
 */
import { NextResponse } from "next/server";
import { getAdminDb, verifyRequest } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CAN_MANAGE_FULL = ["super_admin", "franchise_admin", "branch_manager"];
const CAN_CREATE = [...CAN_MANAGE_FULL, "sales_executive"];

/** Generate a human-friendly uppercase coupon code */
function generateCode(prefix = "BQE") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch_id = searchParams.get("branch_id");

  const db = getAdminDb();
  let q = db.collection("offers");

  if (user.role === "branch_manager" || user.role === "sales_executive") {
    const bid = user.branch_id;
    if (!bid) return NextResponse.json({ offers: [] });
    q = q.where("branch_id", "==", bid);
  } else if (user.role === "franchise_admin") {
    if (branch_id) {
      // Verify branch belongs to this franchise
      const bSnap = await db.collection("branches").doc(branch_id).get();
      if (bSnap.exists && bSnap.data().franchise_id !== user.franchise_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      q = q.where("branch_id", "==", branch_id);
    } else {
      q = q.where("franchise_id", "==", user.franchise_id);
    }
  } else if (user.role === "super_admin") {
    if (branch_id) q = q.where("branch_id", "==", branch_id);
  } else {
    return NextResponse.json({ offers: [] });
  }

  const snap = await q.orderBy("created_at", "desc").get();
  const offers = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    created_at: d.data().created_at?.toDate?.()?.toISOString?.() || null,
    updated_at: d.data().updated_at?.toDate?.()?.toISOString?.() || null,
  }));

  return NextResponse.json({ offers }, { headers: { "Cache-Control": "no-store" } });
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(request) {
  const user = await verifyRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!CAN_CREATE.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 422 });
  }
  if (!body.valid_to) {
    return NextResponse.json({ error: "Expiry date is required" }, { status: 422 });
  }

  const db = getAdminDb();

  // Resolve branch_id
  const branch_id = user.role === "branch_manager" || user.role === "sales_executive"
    ? user.branch_id
    : body.branch_id;

  if (!branch_id) {
    return NextResponse.json({ error: "branch_id is required" }, { status: 422 });
  }

  const branchSnap = await db.collection("branches").doc(branch_id).get();
  if (!branchSnap.exists) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }
  const branch = branchSnap.data();

  if (user.role === "franchise_admin" && branch.franchise_id !== user.franchise_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Sales executive can only create single-use coupons
  const isSalesExec = user.role === "sales_executive";

  // Ensure unique coupon code
  let code = (body.code || "").trim().toUpperCase();
  if (!code) code = generateCode("BQE");

  // Check code uniqueness within branch
  const existingSnap = await db.collection("offers")
    .where("branch_id", "==", branch_id)
    .where("code", "==", code)
    .limit(1)
    .get();
  if (!existingSnap.empty) {
    code = generateCode("BQE"); // regenerate on collision
  }

  const payload = {
    code,
    title: body.title.trim(),
    description: (body.description || "").trim(),
    type: body.type || "percentage",
    discount_value: Number(body.discount_value) || 0,
    valid_from: body.valid_from || new Date().toISOString().split("T")[0],
    valid_to: body.valid_to,
    halls: body.halls || "All",
    min_guests: Number(body.min_guests) || 0,
    badge: body.badge || "",
    badge_color: body.badge_color || "green",
    terms: (body.terms || "").trim(),
    active: isSalesExec ? true : (body.active !== false),
    consumer_visible: isSalesExec ? false : (body.consumer_visible !== false),
    single_use: isSalesExec ? true : (body.single_use === true),
    max_uses: isSalesExec ? 1 : (Number(body.max_uses) || 0), // 0 = unlimited
    used_count: 0,
    branch_id,
    branch_name: branch.name || "",
    franchise_id: branch.franchise_id || "",
    franchise_name: branch.franchise_name || "",
    created_by: user.uid,
    created_by_name: user.name || user.email || "Unknown",
    created_by_role: user.role,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("offers").add(payload);
  return NextResponse.json({ id: ref.id, ...payload }, { status: 201 });
}
