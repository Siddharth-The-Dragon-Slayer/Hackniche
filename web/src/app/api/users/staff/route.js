/**
 * POST /api/users/staff — create a new staff member (Firebase Auth + Firestore)
 *
 * Allowed callers:
 *   branch_manager  → can create: decorator, sales_executive, kitchen_manager,
 *                      accountant, operations_staff, receptionist
 *   franchise_admin → can create any role except super_admin / franchise_admin
 *   super_admin     → can create any role
 *
 * Auth: X-User-Uid + X-User-Role + X-Branch-Id + X-Franchise-Id headers
 * Body: { name, email, password, role, phone?, employment_type?, branch_id?,
 *          branch_name?, franchise_id? }
 */
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  getResend,
  FROM_ADDRESS,
  buildOnboardingEmail,
} from "@/lib/resend-client";

// Which roles each caller level can create
const CREATABLE_BY = {
  branch_manager: [
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
  franchise_admin: [
    "branch_manager",
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
  super_admin: [
    "super_admin",
    "franchise_admin",
    "branch_manager",
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
};

function getUserFromHeaders(req) {
  return {
    uid: req.headers.get("X-User-Uid") || "",
    role: req.headers.get("X-User-Role") || "",
    branch_id: req.headers.get("X-Branch-Id") || "",
    franchise_id: req.headers.get("X-Franchise-Id") || "",
    branch_name: req.headers.get("X-Branch-Name") || "",
  };
}

export async function POST(request) {
  const caller = getUserFromHeaders(request);

  // Must be an authorised manager role
  const allowed = CREATABLE_BY[caller.role];
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Forbidden — insufficient role" },
      { status: 403 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const {
    name,
    email,
    password,
    role: newRole,
    phone = "",
    employment_type = "Permanent",
    branch_id,
    branch_name,
    franchise_id,
  } = body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !password || !newRole) {
    return NextResponse.json(
      { success: false, error: "name, email, password, and role are required" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { success: false, error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  // Role permission check
  if (!allowed.includes(newRole)) {
    return NextResponse.json(
      {
        success: false,
        error: `Your role (${caller.role}) cannot create a ${newRole} account`,
      },
      { status: 403 },
    );
  }

  // Resolve branch context — branch_manager always uses their own branch
  const effectiveBranchId =
    caller.role === "branch_manager"
      ? caller.branch_id
      : branch_id || caller.branch_id;
  const effectiveFranchiseId = franchise_id || caller.franchise_id;
  const effectiveBranchName = branch_name || caller.branch_name || "";

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Create Firebase Auth account
    const userRecord = await adminAuth.createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: name.trim(),
    });

    const now = new Date().toISOString();
    const profile = {
      uid: userRecord.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      role: newRole,
      employment_type,
      branch_id: effectiveBranchId || null,
      branch_name: effectiveBranchName || null,
      franchise_id: effectiveFranchiseId || null,
      status: "active",
      created_by_uid: caller.uid,
      created_by_role: caller.role,
      created_at: now,
      updated_at: now,
    };

    // Save Firestore profile
    await adminDb.collection("users").doc(userRecord.uid).set(profile);

    // Send onboarding email — non-blocking (don't fail account creation if email fails)
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : "https://banquetease.com/login";
    try {
      const resend = getResend();
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email.trim().toLowerCase(),
        subject: `Welcome to BanquetEase — Your ${newRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} account is ready`,
        html: buildOnboardingEmail({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: newRole,
          branchName: effectiveBranchName,
          loginUrl,
        }),
      });
    } catch (emailErr) {
      console.warn(
        "[POST /api/users/staff] Onboarding email failed:",
        emailErr.message,
      );
    }

    return NextResponse.json({
      success: true,
      data: { uid: userRecord.uid, ...profile },
      message: `${newRole.replace(/_/g, " ")} account created successfully`,
    });
  } catch (error) {
    console.error("[POST /api/users/staff]", error);

    // Friendly Firebase Auth error messages
    let msg = error.message || "Failed to create staff account";
    if (error.code === "auth/email-already-exists") {
      msg = "An account with this email address already exists";
    } else if (error.code === "auth/invalid-email") {
      msg = "Invalid email address format";
    } else if (error.code === "auth/weak-password") {
      msg = "Password is too weak — use at least 6 characters";
    }

    return NextResponse.json({ success: false, error: msg }, { status: 422 });
  }
}
