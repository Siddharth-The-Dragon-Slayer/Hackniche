/**
 * POST /api/ai/chatbot
 * 
 * Website AI chatbot — qualifies visitors via conversation and creates
 * a lead in Firestore automatically when contact details are captured.
 * Uses LangChain + Groq (multi-turn conversation).
 * 
 * Flow:
 * 1. Client sends messages array (conversation history)
 * 2. AI continues the conversation
 * 3. When enough info collected, returns lead_data to create /leads doc
 * 4. Caller writes the lead via writeBatch() and triggers WATI/OneSignal
 * 
 * Input: messages[], branch_name, franchise_name, session_id
 * Output: { reply, lead_captured: false } OR { reply, lead_captured: true, lead_data: {...} }
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateChatbotInput, EVENT_TYPES, LEAD_SOURCES } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateChatbotInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;
  const venueName = d.franchise_name || d.branch_name || "our venue";

  // System prompt for the chatbot persona
  const systemPrompt = `You are a friendly and professional event booking assistant for ${venueName}.
Your goal is to warmly qualify website visitors and collect their event details.

Conversation protocol:
1. Greet warmly and ask about their event type (if not asked yet)
2. Ask for preferred date
3. Ask for expected guest count
4. Ask about budget range (approximate, in lakhs is fine: "2-3 lakhs")
5. Ask for their name and phone number to connect them with the team
6. Once you have: event_type + date + guests + name + phone → mark lead as ready to capture

Rules:
- Keep responses SHORT (2-3 sentences max)
- Be warm, use light Hindi words naturally (ji, aap) when fitting
- Never ask multiple questions in one message — one at a time
- Once name + phone collected, give a warm confirmation and stop asking questions

You must respond ONLY with raw valid JSON — no markdown, no code fences:
{
  "reply": "<your next message to the visitor>",
  "lead_captured": <true|false>,
  "lead_quality": "<Hot|Warm|Cold|Unknown>",
  "collected_data": {
    "client_name": "<name or null>",
    "phone": "<phone or null>",
    "event_type": "<event type or null>",
    "preferred_date": "<date string or null>",
    "expected_guests": <number or null>,
    "budget_text": "<raw budget text or null>",
    "budget_min": <number in INR or null>,
    "budget_max": <number in INR or null>
  }
}

lead_captured = true ONLY when you have: client_name + phone + event_type (at minimum).
lead_quality: Hot if event within 60 days + good budget; Warm if longer timeline; Cold if very vague.`;

  // Build user prompt from conversation history
  const conversationHistory = d.messages
    .map((m) => `${m.role === "user" ? "Visitor" : m.role === "assistant" ? "Assistant" : "System"}: ${m.content}`)
    .join("\n");

  const userPrompt = `Continue this conversation naturally. Extract any lead information from it.

Conversation so far:
${conversationHistory}

Continue as the assistant. Respond with the JSON structure above.`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    // Build the response
    const response = {
      success: true,
      session_id: d.session_id ?? null,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      reply: result.reply || "I'd love to help you plan your event! What occasion are you celebrating?",
      lead_captured: result.lead_captured === true,
      lead_quality: result.lead_quality ?? "Unknown",
    };

    // If lead captured, build the Firestore-ready lead_data payload
    if (result.lead_captured && result.collected_data) {
      const cd = result.collected_data;
      response.lead_data = {
        // These fields must be written to /leads collection by the caller via writeBatch()
        client_name: cd.client_name ?? "Website Visitor",
        phone: cd.phone ?? null,
        event_type: EVENT_TYPES.includes(cd.event_type) ? cd.event_type : "Other",
        preferred_date: cd.preferred_date ?? null,
        expected_guests: typeof cd.expected_guests === "number" ? cd.expected_guests : null,
        budget_min: cd.budget_min ?? null,
        budget_max: cd.budget_max ?? null,
        budget_text: cd.budget_text ?? null,
        source: "ai_chatbot",
        source_detail: "Qualified via website AI chatbot",
        status: "New",
        priority: result.lead_quality === "Hot" ? "High" : result.lead_quality === "Warm" ? "Medium" : "Low",
        ai_score_label: result.lead_quality,
        franchise_id: d.franchise_id ?? null,
        branch_id: d.branch_id ?? null,
        // Caller must add: assigned_to_user_id, next_followup_date, created_at, created_by
      };
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[chatbot] AI error:", err);
    return NextResponse.json(
      {
        success: false,
        reply:
          "I apologize, I'm having a momentary issue. Please call us directly or fill the enquiry form — our team will respond within 2 hours!",
        lead_captured: false,
        lead_quality: "Unknown",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
