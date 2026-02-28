/**
 * POST /api/ai/consumption-prediction
 * 
 * Predicts raw material consumption for upcoming bookings with seasonal adjustment.
 * "Waste Control" — for 500 guests in Winter, prep 20% more soup than usual.
 * Uses LangChain + Groq.
 * 
 * Input: upcoming bookings (menu, catering_type, guests) + current_stock from /raw_materials
 * Output: Per-item consumption prediction with seasonal adjustments
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateConsumptionPredictionInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateConsumptionPredictionInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const bookingsSummary = d.upcoming_bookings
    .map(
      (b) =>
        `- ${b.booking_id}: ${b.expected_guests} guests, Menu: ${b.menu_name}, Catering: ${b.catering_type}, Date: ${b.event_date}`
    )
    .join("\n");

  const stockSummary = d.current_stock
    .map((s) => `- ${s.item_name} (${s.item_id}): ${s.current_stock} ${s.unit} in stock`)
    .join("\n");

  const systemPrompt = `You are an experienced head chef and kitchen manager for a large Indian banquet hall.
Predict raw material consumption accurately, considering seasonal preferences and Indian banquet conventions.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Predict raw material consumption for these upcoming banquet events.

Season: ${d.season}
Branch: ${d.branch_id}

Upcoming Bookings:
${bookingsSummary}

Current Stock Snapshot:
${stockSummary}

Indian banquet consumption standards (per guest, adjust by season/menu):
- Rice (Biryani): 200-250g/guest for Non-Veg; 180-220g for Veg
- Dal/Lentils: 150-200g/guest
- Paneer: 200-250g/guest for Veg events
- Cooking Oil: 50-60ml/guest
- Vegetables (mixed): 300-400g/guest
- Flour (for bread): 100-150g/guest

Seasonal adjustments:
- Winter: +20-30% for soups, hot beverages, rice preparations
- Summer: +30% cold beverages, -10% hot preparations
- Monsoon: similar to winter for warm items

For each current stock item, predict:
1. Total consumption across all bookings
2. Whether current stock is sufficient
3. How much to procure (if insufficient)

Respond with this exact JSON:
{
  "predictions": [
    {
      "item_id": "<id>",
      "item_name": "<name>",
      "unit": "<unit>",
      "total_predicted_consumption": <number>,
      "current_stock": <number>,
      "stock_sufficient": <true|false>,
      "recommended_procurement_qty": <number or 0 if sufficient>,
      "seasonal_note": "<any seasonal adjustment applied>"
    }
  ],
  "total_events_covered": <number>,
  "total_guests_served": <number>,
  "procurement_urgency": "<Immediate|This Week|Next Week|None>",
  "chef_notes": "<operational tips from the AI chef>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    if (!Array.isArray(result.predictions)) result.predictions = [];

    return NextResponse.json({
      success: true,
      insight_type: "consumption_prediction",
      branch_id: d.branch_id,
      season: d.season,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[consumption-prediction] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
