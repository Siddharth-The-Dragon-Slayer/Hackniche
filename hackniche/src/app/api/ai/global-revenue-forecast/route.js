/**
 * POST /api/ai/global-revenue-forecast
 * 
 * Aggregates forecasts from all franchise branches for the Super Admin / Franchise Admin.
 * Uses LangChain + Groq.
 * 
 * Input: franchises._stats array from /franchises collection
 * Output: Global forecast with per-franchise breakdown and strategic insights
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateGlobalRevenueForecastInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateGlobalRevenueForecastInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const franchisesSummary = d.franchises_stats
    .map(
      (f) =>
        `Franchise: ${f.franchise_name} (${f.franchise_id})
  - Revenue MTD: ₹${f.total_revenue_mtd?.toLocaleString("en-IN")}
  - Revenue YTD: ₹${f.total_revenue_ytd?.toLocaleString("en-IN")}
  - Hot Leads: ${f.total_leads_hot}
  - Conversion Rate: ${f.conversion_rate_pct}%
  - Outstanding Dues: ₹${f.outstanding_dues?.toLocaleString("en-IN") ?? "N/A"}`
    )
    .join("\n\n");

  const totalRevenueMTD = d.franchises_stats.reduce(
    (sum, f) => sum + (f.total_revenue_mtd || 0),
    0
  );
  const totalHotLeads = d.franchises_stats.reduce(
    (sum, f) => sum + (f.total_leads_hot || 0),
    0
  );

  const systemPrompt = `You are a CFO-level financial analyst for a multi-location Indian banquet franchise platform.
Aggregate franchise data to produce a global revenue forecast and strategic financial insights.
All amounts in Indian Rupees (₹).
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Generate a global revenue forecast across all franchises on this platform.

Current Month: ${d.month}
Peak Season: ${d.is_peak_season ? "Yes" : "No"}

Franchise Portfolio Data:
${franchisesSummary}

Platform Totals:
- Total Revenue MTD (all franchises): ₹${totalRevenueMTD.toLocaleString("en-IN")}
- Total Hot Leads Platform-wide: ${totalHotLeads}

Calculation approach:
1. Sum confirmed revenues across franchises
2. Apply weighted pipeline: hot_leads × avg_conversion × historical_rate
3. Apply seasonal multiplier if peak_season = true  
4. Provide 30/60/90 day global forecast
5. Flag franchises at risk (low conversion, high outstanding dues)
6. Identify franchises ready to scale

Respond with this exact JSON:
{
  "global_forecast": {
    "forecast_30d": <INR>,
    "forecast_60d": <INR>,
    "forecast_90d": <INR>,
    "confidence": "<High|Medium|Low>"
  },
  "per_franchise_forecast": [
    {
      "franchise_id": "<id>",
      "franchise_name": "<name>",
      "forecast_30d": <INR>,
      "contribution_pct": <percentage of global total>
    }
  ],
  "platform_health": {
    "total_pipeline_value": <INR>,
    "total_outstanding_dues": <INR>,
    "avg_conversion_rate_pct": <number>
  },
  "flags": {
    "franchises_at_risk": ["<franchise name: reason>"],
    "franchises_scaling_ready": ["<franchise name: reason>"]
  },
  "strategic_insights": ["<insight 1>", "<insight 2>"],
  "executive_summary": "<2-3 sentences for the platform super admin>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "global_forecast",
      franchise_count: d.franchises_stats.length,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[global-revenue-forecast] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
