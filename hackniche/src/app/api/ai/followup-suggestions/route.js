/**
 * POST /api/ai/followup-suggestions
 * 
 * Recommends the best channel, time, and message for the next follow-up.
 * Uses LangChain + Groq.
 * 
 * Input: recent lead_activities, current lead status, last contact info
 * Output: { best_channel, best_time, suggested_message, reasoning, do_not_try }
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateFollowupSuggestionsInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateFollowupSuggestionsInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const activitiesSummary = d.recent_activities
    .map(
      (a, i) =>
        `${i + 1}. Type: ${a.activity_type}, Outcome: ${a.outcome ?? "N/A"}, Note: ${a.description ?? "—"}`
    )
    .join("\n");

  const systemPrompt = `You are a sales coach for an Indian banquet hall business.
Analyze client interaction history and suggest the optimal follow-up strategy.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Based on these recent lead interactions, recommend the best follow-up strategy.

Lead Status: ${d.current_status}
Last contacted via: ${d.last_contacted_via ?? "Unknown"}
Days since last contact: ${d.days_since_last_contact ?? "Unknown"}
Client phone area code: ${d.client_phone_area_code ?? "Unknown"}

Recent Activity History (newest last):
${activitiesSummary || "No recent activity recorded"}

Instructions:
- Recommend either WhatsApp, Call, Email, or Site Visit as the best channel
- WhatsApp is preferred if previous WhatsApp interactions had faster responses
- Suggest a specific time window (e.g., "Tomorrow 10:00–11:00 AM") based on typical Indian client behavior
- Write a warm, contextually appropriate follow-up message in English (can include 1-2 Hindi words like "ji" naturally if appropriate for warmth)
- Do not recommend channels that have been consistently unresponsive

Respond with this exact JSON:
{
  "best_channel": "<WhatsApp|Call|Email|Site Visit>",
  "best_time": "<specific time window suggestion>",
  "suggested_message": "<ready-to-send message text>",
  "reasoning": "<1-2 sentences explaining the recommendation>",
  "do_not_try": ["<channel or approach to avoid>"]
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "followup_suggestion",
      lead_id: d.lead_id,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      result,
      cache_ttl_days: 1,
    });
  } catch (err) {
    console.error("[followup-suggestions] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
