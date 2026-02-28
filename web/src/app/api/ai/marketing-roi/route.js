/**
 * POST /api/ai/marketing-roi
 * 
 * Analyzes which lead sources generate highest final booking value, not just volume.
 * "Instagram generates more leads but Google Ads generates higher-value bookings."
 * Uses LangChain + Groq.
 * 
 * Input: leads grouped by source (from /leads) + booking values (from /bookings invoice amounts)
 * Output: ROI ranking by channel, budget reallocation advice
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateMarketingROIInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateMarketingROIInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  // Compute conversion rate and avg booking value per source
  const enrichedSources = d.leads_by_source.map((s) => ({
    ...s,
    conversion_rate_pct:
      s.total_leads > 0
        ? ((s.converted_leads / s.total_leads) * 100).toFixed(1)
        : 0,
    avg_booking_value:
      s.converted_leads > 0
        ? Math.round(s.total_booking_value / s.converted_leads)
        : 0,
  }));

  const sourcesSummary = enrichedSources
    .map(
      (s) =>
        `- Source: ${s.source} | Total Leads: ${s.total_leads} | Converted: ${s.converted_leads} | Conversion Rate: ${s.conversion_rate_pct}% | Total Booking Value: ₹${s.total_booking_value?.toLocaleString("en-IN")} | Avg Booking Value: ₹${s.avg_booking_value?.toLocaleString("en-IN")}`
    )
    .join("\n");

  const systemPrompt = `You are a digital marketing ROI analyst specializing in Indian event and hospitality businesses.
Analyze lead source performance beyond volume — focus on quality and final booking value.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze marketing channel ROI for this banquet business.

${d.date_range ? `Analysis period: ${d.date_range.from} to ${d.date_range.to}` : ""}
Branch: ${d.branch_id} | Franchise: ${d.franchise_id}

Lead Source Performance:
${sourcesSummary}

Analysis requirements:
1. Rank sources by ROI quality (avg booking value × conversion rate) — not just raw lead volume
2. Identify the "hidden gem" sources: high avg value but low volume (worth investing more)
3. Flag "vanity" sources: high volume but low conversion or low booking value
4. For paid sources (google_ads, instagram_ads, facebook_ads), distinguish from organic
5. Referral sources typically have highest quality — note if underperforming

ROI Score formula: (avg_booking_value × conversion_rate_pct) / 100 — normalize to 0-100

Respond with this exact JSON:
{
  "source_rankings": [
    {
      "source": "<source_id>",
      "rank": <1, 2, 3...>,
      "roi_score": <0-100>,
      "total_revenue_generated": <INR>,
      "avg_booking_value": <INR>,
      "conversion_rate_pct": <number>,
      "verdict": "<Excellent|Good|Average|Poor>",
      "insight": "<specific insight about this channel>"
    }
  ],
  "budget_recommendations": [
    {
      "action": "<Increase|Decrease|Maintain|Stop>",
      "source": "<source_id>",
      "reason": "<data-backed reason>"
    }
  ],
  "best_roi_source": "<source_id>",
  "most_volume_source": "<source_id>",
  "hidden_gem": "<source_id or null if none>",
  "executive_summary": "<2-3 sentences for the franchise admin / super admin>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "marketing_roi",
      branch_id: d.branch_id,
      franchise_id: d.franchise_id,
      sources_analyzed: d.leads_by_source.length,
      result,
      cache_ttl_hours: 48,
    });
  } catch (err) {
    console.error("[marketing-roi] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
