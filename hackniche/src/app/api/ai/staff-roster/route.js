/**
 * POST /api/ai/staff-roster
 * 
 * Predicts staffing needs for upcoming events based on guest count and event type.
 * Uses LangChain + Groq.
 * 
 * Input: upcoming bookings from /bookings (guest_count, catering_type, event_type, package_type)
 * Output: Per-booking staffing recommendations with role breakdown
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateStaffRosterInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateStaffRosterInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const bookingsSummary = d.upcoming_bookings
    .map(
      (b, i) =>
        `Event ${i + 1} (ID: ${b.booking_id}): ${b.event_type}, ${b.expected_guests} guests, Catering: ${b.catering_type}, Package: ${b.package_type}`
    )
    .join("\n");

  const systemPrompt = `You are a staffing and operations manager for a premium Indian banquet hall.
Predict exact staffing requirements based on event specifications.
Indian banquet service standards: 1 waiter per 20 guests for sit-down; 1 per 25 for buffet.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Predict staffing requirements for these upcoming banquet events.

Branch ID: ${d.branch_id}
Upcoming Events:
${bookingsSummary}

Role guidelines for Indian banquet service:
- Waiters: guests/20 (sit-down), guests/25 (buffet), guests/30 (cocktail/standing)
- Kitchen staff: 1 chef per 100 guests minimum; 1 helper per 50
- Cleaners: 2 minimum + 1 per 150 guests
- Setup crew: 2 minimum + 1 per 100 guests
- Security: 1 per 200 guests, minimum 2
- Coordinator: 1 per event minimum
- Extra for live counters (Chaat, Dosa): +1 staff per counter

For Non-Veg catering: add 20% more kitchen staff
For Luxury/Premium packages: add 15% more waiters

For each booking, return a staffing breakdown. Respond with this exact JSON:
{
  "staffing_plan": [
    {
      "booking_id": "<id>",
      "event_type": "<type>",
      "expected_guests": <number>,
      "total_staff_required": <number>,
      "breakdown": {
        "waiters": <number>,
        "kitchen_staff": <number>,
        "cleaners": <number>,
        "setup_crew": <number>,
        "security": <number>,
        "coordinator": <number>,
        "other": <number>
      },
      "notes": "<any special requirements>"
    }
  ],
  "summary": "<overall staffing summary for the branch manager>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "staff_roster",
      branch_id: d.branch_id,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[staff-roster] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
