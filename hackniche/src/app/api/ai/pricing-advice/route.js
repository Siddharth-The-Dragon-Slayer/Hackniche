/**
 * POST /api/ai/pricing-advice
 * 
 * Dynamic pricing / yield management: suggests whether to offer a discount,
 * how much, and the justification based on occupancy and demand.
 * Uses LangChain + Groq.
 * 
 * Input: calendar occupancy (from branches/_stats), leads demand for the date,
 *        base price from halls.pricing, days to event
 * Output: { should_discount, discount_pct, discount_amount, reasoning,
 *            urgency_message, alternative_strategy }
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validatePricingAdviceInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validatePricingAdviceInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const systemPrompt = `You are a yield management and pricing strategy expert for an Indian banquet hall.
Your goal is to maximize revenue — avoid discounting when demand is high,
but recommend tactical discounts when there is risk of the date going unbooked.
All amounts in Indian Rupees (₹).
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze this booking date and advise on dynamic pricing.

Hall: ${d.hall_name}
Target date: ${d.target_date}
Days until event: ${d.days_to_event}
Base price: ₹${d.base_price?.toLocaleString("en-IN")}
Current month occupancy: ${d.occupancy_pct}%
Active leads interested in this specific date: ${d.active_leads_for_date}

Pricing decision framework:
- Occupancy > 80% AND days > 30 → No discount, high demand
- Occupancy 60-80% AND days 15-30 → Consider small incentive (5%)
- Occupancy < 60% AND days < 28 → Recommend 8-12% discount to close
- Occupancy < 40% AND days < 14 → Recommend 12-15% discount urgently
- Multiple active leads (> 2) for same date → No discount, create FOMO instead
- Single lead, date within 7 days, unbooked → Maximum discount justified

Respond with this exact JSON:
{
  "should_discount": <true|false>,
  "discount_pct": <number 0-20>,
  "discount_amount": <number in INR>,
  "new_price_after_discount": <number in INR>,
  "reasoning": "<2-3 sentence explanation>",
  "urgency_message": "<message the manager can share with the lead to create urgency>",
  "alternative_strategy": "<if not discounting, what else to offer e.g. complimentary setup>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    if (typeof result.should_discount !== "boolean") result.should_discount = false;
    if (typeof result.discount_pct !== "number") result.discount_pct = 0;
    if (typeof result.discount_amount !== "number") {
      result.discount_amount = Math.round(d.base_price * (result.discount_pct / 100));
    }
    if (typeof result.new_price_after_discount !== "number") {
      result.new_price_after_discount = d.base_price - result.discount_amount;
    }

    return NextResponse.json({
      success: true,
      insight_type: "pricing_advice",
      branch_id: d.branch_id,
      franchise_id: d.franchise_id,
      hall_name: d.hall_name,
      target_date: d.target_date,
      result,
      cache_ttl_hours: 12,
    });
  } catch (err) {
    console.error("[pricing-advice] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
