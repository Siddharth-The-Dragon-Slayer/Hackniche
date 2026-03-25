import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request, { params }) {
  try {
    const { bookingId } = await params;
    const adminDb = getAdminDb();
    
    const doc = await adminDb.collection("bookings").doc(bookingId).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const data = doc.data();
    
    // Pick only public safe information to return to the guest
    return NextResponse.json({
      bookingId: doc.id,
      event_type: data.event_type || "Event",
      customer_name: data.customer_name || "Host",
      event_date: data.event_date || null,
      hall_name: data.hall_name || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
