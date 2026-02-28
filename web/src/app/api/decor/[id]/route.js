/**
 * PATCH /api/decor/[id]  — update a decor package
 * DELETE /api/decor/[id] — remove a decor package
 *
 * Access:
 *   decorator         → only own packages (created_by_uid === user.uid)
 *   branch_manager    → any package in their branch
 *   franchise_admin   → any package in their franchise
 *   super_admin       → any package
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// branch_manager is intentionally excluded — they have view-only access to decor packages
const CAN_MANAGE_ALL = ["super_admin", "franchise_admin"];

// ── helpers ───────────────────────────────────────────────────────────────
async function getDecorDoc(id) {
  const ref = doc(db, "decor", id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data(), _ref: ref } : null;
}

// Very lightweight auth — reads user profile from Firestore via cookie-less
// server approach: we accept an explicit X-User-Uid + X-User-Role header pair
// set by the client-side api-client (just like the offers route does).
// For stronger security use firebase-admin verifyIdToken (same pattern as offers/[id]).
function getRoleFromHeaders(request) {
  return {
    uid: request.headers.get("X-User-Uid") || "",
    role: request.headers.get("X-User-Role") || "",
    franchise_id: request.headers.get("X-Franchise-Id") || "",
    branch_id: request.headers.get("X-Branch-Id") || "",
  };
}

// ── PATCH ─────────────────────────────────────────────────────────────────
export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = getRoleFromHeaders(request);

  const existing = await getDecorDoc(id);
  if (!existing)
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );

  // Authorization check
  const isOwner = existing.created_by_uid === user.uid;
  const isBranchScope =
    CAN_MANAGE_ALL.includes(user.role) && existing.branch_id === user.branch_id;
  const isFranchiseScope =
    ["franchise_admin", "super_admin"].includes(user.role) &&
    existing.franchise_id === user.franchise_id;
  const isSuperAdmin = user.role === "super_admin";

  if (user.role === "decorator" && !isOwner) {
    return NextResponse.json(
      { success: false, error: "You can only edit your own packages" },
      { status: 403 },
    );
  }
  if (
    !user.role ||
    (!isOwner && !isBranchScope && !isFranchiseScope && !isSuperAdmin)
  ) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Prevent overwriting immutable ownership fields
  const {
    id: _id,
    created_by_uid: _c,
    franchise_id: _f,
    branch_id: _b,
    ...updateable
  } = body;

  const updates = {
    ...updateable,
    updated_at: new Date().toISOString(),
    base_price:
      typeof updateable.base_price === "string"
        ? parseFloat(updateable.base_price)
        : updateable.base_price,
  };

  try {
    await updateDoc(existing._ref, updates);
    return NextResponse.json({
      success: true,
      data: { id, ...existing, ...updates },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 },
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = getRoleFromHeaders(request);

  const existing = await getDecorDoc(id);
  if (!existing)
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );

  const isOwner = existing.created_by_uid === user.uid;
  const isBranchScope =
    CAN_MANAGE_ALL.includes(user.role) && existing.branch_id === user.branch_id;
  const isFranchiseScope =
    ["franchise_admin", "super_admin"].includes(user.role) &&
    existing.franchise_id === user.franchise_id;
  const isSuperAdmin = user.role === "super_admin";

  if (user.role === "decorator" && !isOwner) {
    return NextResponse.json(
      { success: false, error: "You can only delete your own packages" },
      { status: 403 },
    );
  }
  if (
    !user.role ||
    (!isOwner && !isBranchScope && !isFranchiseScope && !isSuperAdmin)
  ) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    await deleteDoc(existing._ref);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 },
    );
  }
}
