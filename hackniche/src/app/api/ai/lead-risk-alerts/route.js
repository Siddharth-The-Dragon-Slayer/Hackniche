/**
 * POST /api/ai/lead-risk-alerts
 * 
 * Flags high-value leads that are stalled (no activity 7+ days) or have negative sentiment.
 * Uses LangChain + Groq.
 * 
 * Input: leads array with activity timeline and ai_sentiment from /leads + /ai_insights
 * Output: Array of risk alerts per lead with severity, action, and escalation flag
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateLeadRiskAlertsInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateLeadRiskAlertsInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const leadsSummary = d.leads
    .map(
      (l) =>
        `- Lead ${l.lead_id} (${l.client_name}): status="${l.status}", days_inactive=${l.days_since_last_activity}, est_value=₹${l.estimated_value?.toLocaleString("en-IN")}, ai_score=${l.ai_score}/100, sentiment="${l.ai_sentiment ?? "Unknown"}"`
    )
    .join("\n");

  const systemPrompt = `You are a sales risk management expert for a banquet hall business.
Identify leads that are at risk of being lost due to inactivity or negative sentiment.
Focus on high-value leads where intervention can save the deal.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze these leads for risk of deal loss. Flag ones needing immediate attention.

Branch ID: ${d.branch_id}
Franchise ID: ${d.franchise_id}

Leads:
${leadsSummary}

Risk criteria:
- CRITICAL: High-value (₹3L+) lead with 7+ days no activity OR Negative sentiment
- HIGH: Medium-value (₹1L–3L) with 5+ days no activity OR ai_score < 40 + Negative sentiment
- MEDIUM: Any lead stalled 4-6 days in "Negotiation" or "Proposal Sent" status
- LOW: Score dropped, minimal activity, low-value lead

For each at-risk lead (SKIP leads that are healthy — low inactivity + positive sentiment):
- Provide a specific action the manager or exec can take to save the deal
- Flag if manager escalation is needed (critical + high-value = yes)

Respond with this exact JSON:
{
  "alerts": [
    {
      "lead_id": "<id>",
      "client_name": "<name>",
      "risk_level": "<Critical|High|Medium|Low>",
      "risk_reason": "<concise reason>",
      "recommended_action": "<specific action to take>",
      "escalate_to_manager": <true|false>,
      "urgency_days": <number of days before this lead is likely lost>
    }
  ],
  "total_at_risk_value": <sum of estimated_value of alerting leads in INR>,
  "summary": "<1-2 sentence summary for branch manager>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    if (!Array.isArray(result.alerts)) result.alerts = [];
    if (typeof result.total_at_risk_value !== "number") result.total_at_risk_value = 0;

    return NextResponse.json({
      success: true,
      insight_type: "risk_alert",
      branch_id: d.branch_id,
      franchise_id: d.franchise_id,
      alert_count: result.alerts.length,
      result,
      cache_ttl_hours: 6,
    });
  } catch (err) {
    console.error("[lead-risk-alerts] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
