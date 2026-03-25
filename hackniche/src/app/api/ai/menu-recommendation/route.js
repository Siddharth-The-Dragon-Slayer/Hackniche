/**
 * POST /api/ai/menu-recommendation
 * 
 * Suggests best menu packages based on event, budget, and dietary constraints.
 * Uses LangChain + Groq.
 * 
 * Input: event details + available_menus from /menus collection (branch-scoped)
 * Output: { top_recommendation, alternatives }
 * 
 * Shown as recommendation cards during menu selection in booking form.
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateMenuRecommendationInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateMenuRecommendationInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const menusList = d.available_menus
    .map(
      (m) =>
        `- ID: ${m.menu_id} | Name: ${m.menu_name} | Type: ${m.menu_type} | ₹${m.price_per_plate}/plate | Min ${m.min_plates} plates${
          m.courses ? ` | Courses: ${Object.keys(m.courses).join(", ")}` : ""
        }`
    )
    .join("\n");

  const systemPrompt = `You are a banquet catering expert and menu consultant for an Indian event venue.
Match menu packages to client requirements — prioritize dietary compliance then value for money.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Recommend the best menu package(s) for this booking.

Event Requirements:
- Event type: ${d.event_type}
- Expected guests: ${d.expected_guests}
- Budget per head: ₹${d.budget_per_head}
- Total food budget: ₹${(d.budget_per_head * d.expected_guests).toLocaleString("en-IN")}
- Dietary preference: ${d.dietary_preference}
- Time slot: ${d.event_time_slot}
- Special requirements: ${d.special_requirements || "None"}

Available Menu Packages:
${menusList}

Selection criteria:
1. MUST respect dietary preference (Jain/Veg/Non-Veg/Mixed) — hard filter
2. Price per plate × number of guests should be within 110% of total food budget
3. For "No Onion/Garlic" requirement → prefer Jain menus
4. Luxury packages preferred for weddings with flexible budget
5. Minimum plates must be ≤ expected_guests

Calculate fit_score 0–100:
- 100 = perfect dietary match + within budget + suits event type
- Deduct for budget overrun, dietary mismatches, or undersized minimums

Return top recommendation (highest fit_score) and up to 2 alternatives.

Respond with this exact JSON:
{
  "top_recommendation": {
    "menu_id": "<id>",
    "menu_name": "<name>",
    "price_per_plate": <number>,
    "total_cost": <price_per_plate × expected_guests>,
    "fit_score": <0-100>,
    "reasoning": "<why this is the best match>"
  },
  "alternatives": [
    {
      "menu_id": "<id>",
      "menu_name": "<name>",
      "price_per_plate": <number>,
      "total_cost": <number>,
      "fit_score": <0-100>,
      "note": "<brief note on trade-off>"
    }
  ],
  "no_match_reason": "<null or explanation if no menu meets dietary requirements>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "menu_recommendation",
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      event_type: d.event_type,
      expected_guests: d.expected_guests,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[menu-recommendation] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
