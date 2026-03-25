import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const { bookingId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitCount = parseInt(searchParams.get("limit") || "25", 10);

    const adminDb = getAdminDb();
    const photosRef = adminDb.collection("bookings").doc(bookingId).collection("photos");

    // Fetch all and paginate in memory.
    // Notice: removed .where("status", "==", "approved") to avoid composite index error.
    const snap = await photosRef.orderBy("uploaded_at", "desc").get();
    let allPhotos = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.status === "approved") {
        allPhotos.push({ id: doc.id, ...data });
      }
    });

    const totalCount = allPhotos.length;
    const totalPages = Math.ceil(totalCount / limitCount);

    const startIndex = (page - 1) * limitCount;
    const endIndex = startIndex + limitCount;
    const paginatedPhotos = allPhotos.slice(startIndex, endIndex);

    return NextResponse.json({
      photos: paginatedPhotos,
      pagination: {
        page,
        limit: limitCount,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import crypto from "crypto";

async function uploadToCloudinarySigned(fileBase64, folderName) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "Root";
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary API Keys on the server configuration.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Create signature string (parameters to sign must be sorted alphabetically)
  // We have: folder and timestamp
  const str = `folder=${folderName}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(str).digest("hex");

  const formData = new FormData();
  formData.append("file", fileBase64);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folderName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  return await res.json();
}

export async function POST(request, { params }) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { fileBase64, uploader_name } = body;

    if (!fileBase64) {
      return NextResponse.json({ error: "fileBase64 is required" }, { status: 400 });
    }

    const cData = await uploadToCloudinarySigned(
      fileBase64,
      `guest_galleries/${bookingId}`
    );

    const url = cData.secure_url;
    const public_id = cData.public_id;
    const thumbnail_url = url.replace(
      "/upload/",
      "/upload/w_200,h_200,c_fill,q_auto,f_auto/"
    );

    const adminDb = getAdminDb();
    const ref = adminDb.collection("bookings").doc(bookingId).collection("photos").doc();
    const photoData = {
      url,
      public_id,
      thumbnail_url,
      uploaded_at: new Date().toISOString(),
      uploader_name: uploader_name || "Guest",
      status: "approved", // In a real app, this might be 'pending' for manager review
    };
    await ref.set(photoData);

    return NextResponse.json({ success: true, id: ref.id, ...photoData });
  } catch (error) {
    console.error("[Gallery Upload Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
