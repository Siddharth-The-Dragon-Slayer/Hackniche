/**
 * POST /api/ai/lead-score
 * 
 * Scores a lead 0–100 for conversion probability.
 * Uses LangChain + Groq (llama-3.3-70b-versatile).
 * 
 * Input: Fields from /leads collection (see ai-validators.js#validateLeadScoreInput)
 * Output: { score, label, reasoning, suggested_action, risk_factors, tags, sentiment }
 * 
 * Writes result to /ai_insights collection (caller responsibility via writeBatch).
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateLeadScoreInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Strict validation against /leads schema ─────────────────────────
  const validation = validateLeadScoreInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const systemPrompt = `You are an expert sales analyst for a premium banquet hall management platform in India.
Your task is to score leads for conversion probability based on provided data.
You must respond ONLY with raw valid JSON — no markdown, no code fences, no explanation outside the JSON object.`;

  const userPrompt = `Score this banquet hall enquiry lead (0–100) for booking conversion probability.

Lead Data:
- Event type: ${d.event_type}
- Lead source: ${d.source}
- Current status: ${d.status}
${d.guest_range ? `- Guest range: ${d.guest_range}` : ""}
${d.budget_min !== undefined ? `- Budget: ₹${d.budget_min?.toLocaleString("en-IN")} – ₹${d.budget_max?.toLocaleString("en-IN")} (Flexibility: ${d.budget_flexibility ?? "Unknown"})` : ""}
${d.preferred_date_days_away !== undefined ? `- Preferred event date: ${d.preferred_date_days_away} days away` : ""}
${d.followup_count !== undefined ? `- Follow-up count: ${d.followup_count}` : ""}
${d.days_since_last_contact !== undefined ? `- Days since last contact: ${d.days_since_last_contact}` : ""}
${d.site_visit_done !== undefined ? `- Site visit done: ${d.site_visit_done}` : ""}
${d.proposal_sent !== undefined ? `- Proposal sent: ${d.proposal_sent}, viewed: ${d.proposal_viewed}` : ""}
${d.avg_response_time_hrs !== undefined ? `- Avg client response time: ${d.avg_response_time_hrs} hrs` : ""}
${d.historical_branch_conversion_rate_pct !== undefined ? `- Branch historical conversion rate: ${d.historical_branch_conversion_rate_pct}%` : ""}

Scoring guidelines:
- Referral sources (referral_client, referral_vendor, repeat_client) = high trust; add 10–15 points
- Paid ads (google_ads, instagram_ads) = moderate intent; base score 40–60
- Budget flexibility "Flexible" = positive signal; "Fixed" = risk
- Date within 30 days = urgency bonus; > 90 days = lower urgency
- Each follow-up without conversion after status "Negotiation" = slight risk reduction
- Completed site visit + proposal sent but not viewed = action required
- Branch historical rate is the probabilistic baseline

Respond with this exact JSON structure:
{
  "score": <integer 0-100>,
  "label": "<Hot|Warm|Cold>",
  "reasoning": "<2-3 sentence explanation>",
  "suggested_action": "<specific next action for the sales executive>",
  "risk_factors": ["<risk 1>", "<risk 2>"],
  "tags": ["<tag1>", "<tag2>"],
  "sentiment": "<Positive|Neutral|Negative>"
}

Label rules: score >= 70 → Hot, 40–69 → Warm, < 40 → Cold.`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    // Validate critical fields in the AI response
    if (
      typeof result.score !== "number" ||
      result.score < 0 ||
      result.score > 100
    ) {
      throw new Error("AI returned invalid score value");
    }
    if (!["Hot", "Warm", "Cold"].includes(result.label)) {
      result.label = result.score >= 70 ? "Hot" : result.score >= 40 ? "Warm" : "Cold";
    }

    return NextResponse.json({
      success: true,
      insight_type: "lead_score",
      lead_id: d.lead_id ?? null,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      result,
      // Caller writes this payload to /ai_insights with expires_at = +7 days
      cache_ttl_days: 7,
    });
  } catch (err) {
    console.error("[lead-score] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
