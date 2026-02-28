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
  orderBy,
} from "firebase/firestore";

// GET /api/decor - Fetch decor packages for a branch or franchise
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchise_id") || "pfd";

    const decorRef = collection(db, "decor");
    const q = query(decorRef, where("franchise_id", "==", franchiseId));

    const snapshot = await getDocs(q);
    const decorData = [];

    snapshot.forEach((doc) => {
      decorData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by created_at in memory (newest first)
    decorData.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

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
    const {
      franchise_id = "pfd",
      branch_id = "",
      name = "",
      theme = "Custom",
      description = "",
      status = "active",
      base_price = 0,
      items = [],
      suitable_for = [],
      image_urls = [],
      created_by_uid = "",
      created_by_name = "",
      created_by_role = "",
    } = body;

    // Generate next decor ID for this branch
    const decorRef = collection(db, "decor");
    const q = query(decorRef, where("branch_id", "==", branch_id));
    const snapshot = await getDocs(q);

    // Find the highest existing number
    let maxNum = 0;
    snapshot.forEach((d) => {
      const m = d.id.match(new RegExp(`^${branch_id}_d(\\d+)$`));
      if (m && parseInt(m[1]) > maxNum) maxNum = parseInt(m[1]);
    });
    const nextId = `${branch_id}_d${maxNum + 1}`;

    const now = new Date().toISOString();
    const newDecor = {
      name,
      theme,
      description,
      status,
      base_price: typeof base_price === "string" ? parseFloat(base_price) : base_price || 0,
      items: Array.isArray(items) ? items : [],
      suitable_for: Array.isArray(suitable_for) ? suitable_for : [],
      image_urls: Array.isArray(image_urls) ? image_urls : [],
      franchise_id,
      branch_id,
      created_by_uid,
      created_by_name,
      created_by_role,
      created_at: now,
      updated_at: now,
    };

    // Save with custom document ID
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
