
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function PATCH(request, { params }) {
  try {
    const { bookingId, photoId } = await params;
    const { action } = await request.json();

    const adminDb = getAdminDb();
    const photoRef = adminDb.collection("bookings").doc(bookingId).collection("photos").doc(photoId);

    if (action === "approve") {
      await photoRef.update({ 
        status: "approved", 
        ai_flagged: false, // Override flag as approved by admin
        updated_at: new Date().toISOString() 
      });
      return NextResponse.json({ message: "Photo approved" });
    } else if (action === "delete") {
      await photoRef.delete();
      // Optional: Delete from Cloudinary using Cloudinary API if public_id was saved
      return NextResponse.json({ message: "Photo deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Gallery Admin Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
