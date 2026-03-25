/**
 * POST /api/ai/generate-proposal
 * 
 * Generates a personalized event proposal narrative for a lead.
 * Uses LangChain + Groq.
 * 
 * The frontend uses the returned narrative sections to render and export a PDF
 * using jsPDF + html2canvas, then uploads to Cloudinary under:
 *   proposals/leads/{leadId}/proposal_v{n}.pdf
 * The URL is stored in leads/{id}.proposal.proposal_url
 * 
 * Input: lead data + halls + menus + branch branding
 * Output: structured proposal sections (introduction, venue, menu, why_us, closing)
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateGenerateProposalInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateGenerateProposalInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const eventDate = new Date(d.event_date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hallsDescription = d.halls
    .map(
      (h) =>
        `- ${h.hall_name} (${h.hall_type ?? "Hall"}, seats ${h.capacity_seated}${
          h.amenities?.length ? `, amenities: ${h.amenities.join(", ")}` : ""
        })`
    )
    .join("\n");

  const menusDescription = d.menus?.length
    ? d.menus
        .map(
          (m) =>
            `- ${m.menu_name} (${m.menu_type}, ₹${m.price_per_plate?.toLocaleString("en-IN")}/plate, min ${m.min_plates} plates)`
        )
        .join("\n")
    : "Custom menus available on request";

  const systemPrompt = `You are an elegant event proposal writer for ${d.franchise_name ?? "a premium banquet hall"}${
    d.branch_name ? ` — ${d.branch_name}` : ""
  }.
Write warm, personalized, professional proposal content in English.
Each section should feel personally crafted, not generic.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Create a personalized banquet event proposal for the following client:

Client: ${d.client_name}
Event: ${d.event_type}
Date: ${eventDate}
Expected guests: ${d.expected_guests}
Time slot: ${d.time_slot}
Budget: ₹${d.budget_min?.toLocaleString("en-IN") ?? "Flexible"} – ₹${d.budget_max?.toLocaleString("en-IN") ?? "Flexible"}
Catering required: ${d.catering_required ?? true}
Decoration required: ${d.decoration_required ?? true}
Special notes: ${d.notes ?? "None"}

Available Halls:
${hallsDescription}

Available Menu Packages:
${menusDescription}

Write the following proposal sections. Each should be 2-4 sentences, warm and personalized:

1. introduction: Opening paragraph addressing the client by name, referencing their specific event
2. venue_recommendation: Why the recommended hall perfectly suits their event type and guest count
3. menu_highlight: Highlight the most suitable menu with dietary considerations
4. why_us: 2-3 specific reasons this venue is ideal for their event (not generic)
5. closing: Warm closing with clear call-to-action (call/whatsapp to confirm)
6. tagline: A one-line memorable tagline for the proposal cover (e.g., "Where Priya's Dream Wedding Becomes Reality")
7. recommended_hall: The single hall name most recommended
8. recommended_menu: The single menu name most recommended

Respond with this exact JSON:
{
  "introduction": "<paragraph>",
  "venue_recommendation": "<paragraph>",
  "menu_highlight": "<paragraph>",
  "why_us": "<paragraph>",
  "closing": "<paragraph>",
  "tagline": "<one-line tagline>",
  "recommended_hall": "<hall name>",
  "recommended_menu": "<menu name or null>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "proposal_draft",
      lead_id: d.lead_id,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      client_name: d.client_name,
      event_type: d.event_type,
      result,
      cache_ttl_days: 30,
    });
  } catch (err) {
    console.error("[generate-proposal] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
