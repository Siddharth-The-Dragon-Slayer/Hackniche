/**
 * POST /api/ai/low-stock-forecast
 * 
 * Proactive stock forecasting — alerts BEFORE stock goes low.
 * "Instead of alerting when stock is low, alerts when stock WILL be low."
 * Uses LangChain + Groq.
 * 
 * Input: raw_materials current stock (from /raw_materials) + next week's bookings menu items
 * Output: Stock depletion forecast with procurement priority
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateLowStockForecastInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateLowStockForecastInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const materialsList = d.raw_materials
    .map(
      (r) =>
        `- ${r.item_name} (ID: ${r.item_id}): Current=${r.current_stock} ${r.unit}, Min Level=${r.min_stock_level} ${r.unit}, Buffer=${r.current_stock - r.min_stock_level} ${r.unit}`
    )
    .join("\n");

  const bookingsSummary = d.next_week_bookings
    .map(
      (b) =>
        `- Booking ${b.booking_id}: ${b.expected_guests} guests, Menu: ${b.menu_name}, Catering: ${b.catering_type}`
    )
    .join("\n");

  const systemPrompt = `You are a smart inventory management system for an Indian banquet hall.
Forecast which items will fall below minimum safe levels BEFORE next week's events.
The goal is to prevent last-minute expensive emergency purchases.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Forecast stock levels for next week based on upcoming events.

Branch: ${d.branch_id}

Current Raw Material Stock:
${materialsList}

Next Week's Events (that will consume these materials):
${bookingsSummary || "No events next week"}

For each raw material item:
1. Estimate how much will be consumed across all next-week events
2. Compute: projected_balance = current_stock - estimated_consumption
3. Flag if projected_balance < min_stock_level (will be low BEFORE week ends)
4. Recommend procurement quantity = (min_stock_level × 2) - current_stock + estimated_consumption

Priority rules:
- CRITICAL: Will run out during an event (projected_balance < 0)  
- HIGH: Will hit below min level mid-week
- MEDIUM: Will go below min level by end of week
- LOW: Approaching min level but not critical yet

Respond with this exact JSON:
{
  "forecasts": [
    {
      "item_id": "<id>",
      "item_name": "<name>",
      "unit": "<unit>",
      "current_stock": <number>,
      "min_stock_level": <number>,
      "estimated_consumption_next_week": <number>,
      "projected_balance_after_week": <number>,
      "will_go_below_minimum": <true|false>,
      "priority": "<Critical|High|Medium|Low|OK>",
      "recommended_order_qty": <number>,
      "order_by_date": "<ISO date string when to order by>"
    }
  ],
  "critical_count": <number of Critical items>,
  "total_forecast_shortfall_items": <number of items needing procurement>,
  "purchase_recommendation": "<summary for kitchen manager or purchase order trigger>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    if (!Array.isArray(result.forecasts)) result.forecasts = [];

    return NextResponse.json({
      success: true,
      insight_type: "low_stock_forecast",
      branch_id: d.branch_id,
      critical_count: result.critical_count ?? 0,
      result,
      cache_ttl_hours: 12,
    });
  } catch (err) {
    console.error("[low-stock-forecast] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
