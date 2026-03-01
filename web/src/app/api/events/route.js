import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { cache } from "@/lib/cache";

/* ══════════════════════════════════════════════════════════════════
   EVENTS API — /api/events
   GET  → list events (by franchise/branch)
   
   Events are bookings with status "confirmed" or "in_progress"
═══════════════════════════════════════════════════════════════════ */

const TTL = 120_000;

/* ── GET: list events ── */
export async function GET(req) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const franchise_id = searchParams.get("franchise_id") || "pfd";
    const branch_id = searchParams.get("branch_id") || null;
    const status = searchParams.get("status"); // optional filter: confirmed, in_progress, completed

    const cacheKey = `events:${franchise_id}:${branch_id || "all"}:${status || ""}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    let q = adminDb
      .collection("bookings")
      .where("franchise_id", "==", franchise_id);

    if (branch_id) {
      q = q.where("branch_id", "==", branch_id);
    }

    // Get confirmed and in_progress bookings (these are the active events)
    const statuses = status
      ? [status]
      : ["confirmed", "in_progress", "completed"];

    let allEvents = [];

    for (const s of statuses) {
      const snap = await q
        .where("status", "==", s)
        .orderBy("event_date", "desc")
        .limit(500)
        .get();
      allEvents = allEvents.concat(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          eventStatus: s, // map booking status to event status
        })),
      );
    }

    // Filter events: show if advance payment has been made, or if booking is confirmed/in_progress
    // (for now, we show all confirmed/in_progress bookings even without payment data)
    allEvents = allEvents.filter((booking) => {
      const advanceAmount =
        booking.payments?.advance_amount ||
        booking.booking_confirmed?.advance_amount ||
        0;
      // Show event if: (1) advance payment exists, OR (2) booking is confirmed/in_progress
      return (
        Number(advanceAmount) > 0 ||
        ["confirmed", "in_progress"].includes(booking.eventStatus)
      );
    });

    // Helper to normalise Firestore Timestamp or Date-like values to ISO date string
    const toIsoDate = (val) => {
      if (!val) return null;
      // Firestore Timestamp has toDate()
      if (typeof val.toDate === "function") return val.toDate().toISOString();
      // If it's a JS Date
      if (val instanceof Date) return val.toISOString();
      // If it's a number (seconds / millis)
      if (typeof val === "number") return new Date(val).toISOString();
      // If it's a string, try to parse
      try {
        const d = new Date(val);
        if (!isNaN(d)) return d.toISOString();
      } catch (e) {}
      return null;
    };

    // Transform booking data to event data structure (normalise date fields)
    const events = allEvents
      .map((booking) => {
        const dateIso = toIsoDate(booking.event_date) || null;
        const startIso = toIsoDate(booking.event_start_time) || null;
        const endIso = toIsoDate(booking.event_end_time) || null;

        return {
          id: booking.id,
          bookingId: booking.id,
          name: booking.customer_name || "Event",
          hall: booking.hall_name || "—",
          // expose ISO strings (client will format for display)
          date: dateIso,
          guests: booking.expected_guest_count || 0,
          staff: booking.staffAssigned?.length || 0,
          status: mapStatus(booking.eventStatus),
          checklistDone: 0,
          checklistTotal: 8,
          clientName: booking.customer_name,
          phone: booking.phone,
          email: booking.email,
          eventType: booking.event_type,
          eventDate: dateIso,
          eventStartTime: startIso,
          eventEndTime: endIso,
          hallId: booking.hall_id,
          guestCount: booking.expected_guest_count,
          payments: booking.payments,
        };
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const result = { events, total: events.length };
    cache.set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/events]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * Map booking status to event status for UI display
 */
function mapStatus(bookingStatus) {
  const statusMap = {
    confirmed: "Upcoming",
    in_progress: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[bookingStatus] || "Upcoming";
}
