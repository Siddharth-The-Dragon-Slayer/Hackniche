/**
 * POST /api/ai/revenue-forecast
 * 
 * Predicts cash flow for next 30/60/90 days from confirmed bookings + pipeline.
 * Uses LangChain + Groq.
 * 
 * Input: hot leads, warm leads count, confirmed booking revenue, conversion rate,
 *        from branches/_stats and /leads (weighted pipeline)
 * Output: { forecast_30d, forecast_60d, forecast_90d, confidence, assumptions, risks, opportunities }
 * 
 * Cached in /ai_insights with expires_at: +24 hours.
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateRevenueForecastInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateRevenueForecastInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const hotLeadsSummary = d.hot_leads
    .map(
      (l, i) =>
        `  Lead ${i + 1}: est. value ₹${l.estimated_value?.toLocaleString("en-IN")}, event in ${l.event_date_days} days, AI score ${l.score}/100`
    )
    .join("\n");

  const systemPrompt = `You are a revenue forecasting expert for an Indian banquet hall business.
Calculate realistic 30/60/90-day revenue forecasts using pipeline data and historical rates.
All monetary values are in Indian Rupees (₹).
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Generate a 30/60/90-day revenue forecast for this banquet branch.

Pipeline Data:
- Hot leads (${d.hot_leads.length}):
${hotLeadsSummary || "  None"}
- Warm leads count: ${d.warm_leads_count} (avg value ₹${d.avg_warm_lead_value?.toLocaleString("en-IN")} each)
- Historical conversion rate: ${(d.historical_conversion_rate * 100).toFixed(1)}%
- Confirmed bookings revenue (already secured): ₹${d.confirmed_bookings_revenue?.toLocaleString("en-IN")}
- Pending balance on confirmed bookings: ₹${d.pending_balance_bookings?.toLocaleString("en-IN")}
- Current month: ${d.month}
- Peak season: ${d.is_peak_season ? "Yes" : "No"}${d.peak_multiplier ? ` (multiplier: ${d.peak_multiplier}×)` : ""}

Calculation approach:
1. Confirmed bookings revenue goes into all three windows
2. Hot leads: sum of (estimated_value × probability based on score/100 × historical_rate × date proximity)
3. Warm leads: count × avg_value × historical_rate × 0.7 (warm discount)
4. Peak season: apply multiplier if is_peak_season = true
5. 60d = 30d + additional pipeline expected to convert in days 31-60
6. 90d = 60d + days 61-90 pipeline

Respond with this exact JSON:
{
  "forecast_30d": <number in INR>,
  "forecast_60d": <number in INR>,
  "forecast_90d": <number in INR>,
  "confidence": "<High|Medium|Low>",
  "assumptions": ["<assumption 1>", "<assumption 2>", "<assumption 3>"],
  "risks": ["<risk 1>", "<risk 2>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>"]
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    // Validate numeric outputs
    ["forecast_30d", "forecast_60d", "forecast_90d"].forEach((k) => {
      if (typeof result[k] !== "number") result[k] = 0;
    });

    return NextResponse.json({
      success: true,
      insight_type: "revenue_forecast",
      branch_id: d.branch_id,
      franchise_id: d.franchise_id,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[revenue-forecast] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
