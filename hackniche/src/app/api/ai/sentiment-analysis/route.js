/**
 * POST /api/ai/sentiment-analysis
 * 
 * Analyzes follow-up notes to detect client hesitation / negative sentiment.
 * Uses LangChain + Groq.
 * 
 * Input: notes from /follow_ups and /lead_activities (last 3–5)
 * Output: { sentiment, confidence, signals, urgency, recommended_action, do_not_do }
 * 
 * Updates leads/{id}.ai_sentiment on result.
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateSentimentAnalysisInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateSentimentAnalysisInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const notesBlock = d.notes
    .map((n, i) => `Note ${i + 1}: "${n}"`)
    .join("\n");

  const systemPrompt = `You are a sentiment analysis expert for an Indian banquet hall sales team.
Analyze client communication notes and detect emotional tone, hesitation, and intent signals.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze the sentiment in these follow-up notes from a banquet hall lead interaction.
These notes are written by sales executives recording their calls/visits with the client.

${notesBlock}

Look for signals such as:
- Price objections or budget concerns
- Competitor comparison mentions
- Hesitation phrases ("will think", "let us check", "too expensive")
- Positive intent ("liked it", "interested", "want to proceed")
- Postponement language ("not sure yet", "check with family")

Classify sentiment as:
- Positive: client is enthusiastic, engaged, moving forward
- Neutral: waiting, evaluating, no strong signals
- Negative: objections, considering competitors, losing interest

Respond with this exact JSON:
{
  "sentiment": "<Positive|Neutral|Negative>",
  "confidence": "<High|Medium|Low>",
  "signals": ["<signal 1>", "<signal 2>"],
  "urgency": "<High|Medium|Low>",
  "recommended_action": "<specific action the sales exec or manager should take>",
  "do_not_do": "<what to avoid in the next interaction>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    if (!["Positive", "Neutral", "Negative"].includes(result.sentiment)) {
      result.sentiment = "Neutral";
    }

    return NextResponse.json({
      success: true,
      insight_type: "sentiment_analysis",
      lead_id: d.lead_id,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      result,
      cache_ttl_days: 7,
    });
  } catch (err) {
    console.error("[sentiment-analysis] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
