/**
 * POST /api/ai/whatsapp-concierge
 *
 * Handles inbound WhatsApp messages and generates intelligent auto-replies.
 * Detects intent, checks menu info and calendar availability,
 * and optionally flags the message as a new lead.
 * Uses LangChain + Groq (single-turn structured response).
 *
 * Flow:
 * 1. Incoming WhatsApp message arrives via WATI webhook
 * 2. Backend fetches relevant menus + booked_dates from Firestore
 * 3. Calls this API with the message + context data
 * 4. Returns a ready-to-send WhatsApp reply + intent metadata
 * 5. Caller sends reply via WATI API and optionally creates /leads doc
 *
 * Input: message, from_phone, menus[], booked_dates[], branch_name, franchise_name
 * Output: { reply_message, intent_detected, date_available, suggested_menu, should_create_lead }
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateWhatsAppConciergeInput, EVENT_TYPES } from "@/lib/ai-validators";

const INTENT_TYPES = [
  "menu_inquiry",
  "availability_check",
  "pricing_inquiry",
  "booking_request",
  "general_inquiry",
  "lead_capture",
  "cancellation",
  "complaint",
  "other",
];

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateWhatsAppConciergeInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;
  const venueName = d.franchise_name || d.branch_name || "Our Venue";

  // Prepare a brief menu summary for the prompt
  const menuSummary = Array.isArray(d.menus) && d.menus.length > 0
    ? d.menus
        .map((m) => {
          const price = m.price_per_plate ? `₹${m.price_per_plate}/plate` : m.package_price ? `₹${m.package_price} pkg` : "price on request";
          return `• ${m.name} (${m.menu_type || "Menu"}): ${price}${m.description ? " — " + m.description : ""}`;
        })
        .join("\n")
    : "Menu details available on request. Please ask our team for the latest packages.";

  // Prepare booked dates summary
  const bookedDates = Array.isArray(d.booked_dates) && d.booked_dates.length > 0
    ? d.booked_dates.join(", ")
    : null;

  const systemPrompt = `You are the official WhatsApp concierge for ${venueName}, a premium banquet hall booking service.

AVAILABLE MENUS:
${menuSummary}

${bookedDates ? `UNAVAILABLE DATES (already booked): ${bookedDates}` : "AVAILABILITY: Please check specific dates — contact our team."}

Instructions:
- Reply in a friendly, professional tone (English + Hindi mix is fine)
- Be concise — WhatsApp replies should be SHORT (3-5 lines max)
- For menu questions, give specific names/prices from the menu list above
- For availability questions, check the booked dates; if a date is NOT in the list, it's likely available (say "seems available")
- For pricing, give range and suggest a call/visit for exact quotes
- End with a soft CTA: invite them to call, visit, or book a demo
- For complaints/cancellations, show empathy and route to the manager
- If the message looks like someone wants to book an event, set should_create_lead to true

Respond ONLY with raw valid JSON (no markdown, no code fences):
{
  "reply_message": "<ready-to-send WhatsApp reply>",
  "intent_detected": "<one of: menu_inquiry|availability_check|pricing_inquiry|booking_request|general_inquiry|lead_capture|cancellation|complaint|other>",
  "detected_date": "<ISO date string if a date was mentioned, else null>",
  "date_available": <true|false|null>,
  "suggested_menu": "<menu name from the list if relevant, else null>",
  "should_create_lead": <true|false>,
  "detected_event_type": "<event type if mentioned, else null>",
  "customer_name_if_mentioned": "<name if visitor gave their name, else null>",
  "urgency": "<high|medium|low>"
}`;

  const userPrompt = `Incoming WhatsApp message from ${d.from_phone || "customer"}:

"${d.message}"

Analyze the message, detect intent, and generate an appropriate reply using the venue context provided.`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    // Normalize intent
    const intentRaw = (result.intent_detected || "other").toLowerCase().trim();
    const intent = INTENT_TYPES.includes(intentRaw) ? intentRaw : "other";

    // Normalize event type if detected
    let detectedEventType = result.detected_event_type ?? null;
    if (detectedEventType && !EVENT_TYPES.includes(detectedEventType)) {
      detectedEventType = null;
    }

    // Determine date availability
    let dateAvailable = result.date_available ?? null;
    const detectedDate = result.detected_date ?? null;
    if (detectedDate && Array.isArray(d.booked_dates)) {
      const isBooked = d.booked_dates.includes(detectedDate);
      dateAvailable = !isBooked;
    }

    return NextResponse.json({
      success: true,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      from_phone: d.from_phone ?? null,
      reply_message: result.reply_message || `Thank you for reaching out to ${venueName}! Our team will get back to you shortly. 🙏`,
      intent_detected: intent,
      detected_date: detectedDate,
      date_available: dateAvailable,
      suggested_menu: result.suggested_menu ?? null,
      should_create_lead: result.should_create_lead === true,
      detected_event_type: detectedEventType,
      urgency: ["high", "medium", "low"].includes(result.urgency) ? result.urgency : "medium",
      // If should_create_lead, caller provides this to writeBatch() for /leads collection
      lead_seed: result.should_create_lead
        ? {
            client_name: result.customer_name_if_mentioned ?? null,
            phone: d.from_phone ?? null,
            event_type: detectedEventType ?? "Other",
            preferred_date: detectedDate ?? null,
            source: "whatsapp",
            source_detail: "WhatsApp AI Concierge",
            status: "New",
            priority: result.urgency === "high" ? "High" : "Medium",
            franchise_id: d.franchise_id ?? null,
            branch_id: d.branch_id ?? null,
          }
        : null,
      // Not cached in /ai_insights — real-time message handling
    });
  } catch (err) {
    console.error("[whatsapp-concierge] AI error:", err);
    return NextResponse.json(
      {
        success: false,
        reply_message: `Thank you for contacting ${venueName}! Our team will respond to your message shortly. For immediate assistance please call us. 🙏`,
        intent_detected: "other",
        should_create_lead: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
