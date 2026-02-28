import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";

// GET /api/decor - Fetch decor packages for a branch or franchise
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchise_id");
    const branchId = searchParams.get("branch_id");

    const decorRef = collection(db, "decor");
    let q;
    if (branchId) {
      q = query(decorRef, where("branch_id", "==", branchId));
    } else if (franchiseId) {
      q = query(decorRef, where("franchise_id", "==", franchiseId));
    } else {
      return NextResponse.json(
        { success: false, error: "branch_id or franchise_id required" },
        { status: 400 },
      );
    }

    const snapshot = await getDocs(q);
    const decorData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    decorData.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );

    return NextResponse.json({
      success: true,
      data: decorData,
      count: decorData.length,
    });
  } catch (error) {
    console.error("Error fetching decor:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch decor packages: ${error.message}`,
      },
      { status: 500 },
    );
  }
}

// POST /api/decor - Create new decor package
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id, branch_id, ...rest } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { success: false, error: "franchise_id and branch_id are required" },
        { status: 400 },
      );
    }

    // Generate a sequential ID per branch
    const decorRef = collection(db, "decor");
    const snap = await getDocs(
      query(decorRef, where("branch_id", "==", branch_id)),
    );
    let maxNum = 0;
    snap.forEach((d) => {
      const m = d.id.match(new RegExp(`^${branch_id}_d(\\d+)$`));
      if (m && parseInt(m[1]) > maxNum) maxNum = parseInt(m[1]);
    });
    const nextId = `${branch_id}_d${maxNum + 1}`;

    const now = new Date().toISOString();
    const newDecor = {
      ...rest,
      franchise_id,
      branch_id,
      created_at: now,
      updated_at: now,
      status: rest.status || "active",
      base_price:
        typeof rest.base_price === "string"
          ? parseFloat(rest.base_price)
          : rest.base_price || 0,
      items: rest.items || [],
      suitable_for: rest.suitable_for || [],
      theme: rest.theme || "Custom",
    };

    await setDoc(doc(db, "decor", nextId), newDecor);
    return NextResponse.json({
      success: true,
      data: { id: nextId, ...newDecor },
      message: "Decor package created",
    });
  } catch (error) {
    console.error("Error creating decor:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create decor package" },
      { status: 500 },
    );
  }
}
