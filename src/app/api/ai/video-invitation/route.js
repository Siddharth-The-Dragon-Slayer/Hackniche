/**
 * POST /api/ai/video-invitation
 *
 * Generates a personalised AI video invitation using Google Veo 2
 * via the Vertex AI Predict Long-Running endpoint.
 *
 * Flow (asynchronous):
 * 1. Client sends booking + event details
 * 2. This route builds a rich cinematic Veo 2 prompt
 * 3. Calls generateVideo() which submits the long-running operation
 * 4. Returns { operation_name } immediately — generation takes ~2-5 min
 * 5. Client polls GET /api/ai/video-status?op=<operation_name>
 *
 * Required env:
 *   GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION (default: us-central1),
 *   GOOGLE_SA_JSON or GOOGLE_APPLICATION_CREDENTIALS,
 *   GCS_VIDEO_OUTPUT_BUCKET (e.g. gs://banquetease-videos)
 *
 * Input fields:
 *   client_name (required), event_type (required), event_date (required),
 *   venue_name (required), franchise_name, style, color_theme,
 *   duration_seconds (5 or 8), aspect_ratio (16:9 | 9:16 | 1:1),
 *   branch_id, franchise_id, booking_id
 *
 * Output: { operation_name, status: "processing", poll_endpoint, estimated_seconds }
 */

import { NextResponse } from "next/server";
import { generateVideo } from "@/lib/google-ai-client";
import { validateVideoInvitationInput, EVENT_TYPES } from "@/lib/ai-validators";

// Maps event types to a cinematic scene description for richer Veo prompts
const EVENT_SCENE_MAP = {
  Wedding: "a grand Indian wedding ceremony with marigold garlands, diya flames, and elegant mandap decorations",
  Reception: "a glittering wedding reception banquet hall with crystal chandeliers and romantic candlelight",
  Engagement: "a romantic engagement ceremony with rose petals, fairy lights, and a beautifully decorated stage",
  Birthday: "a joyful birthday celebration with colorful balloons, a tiered cake, and laughing guests",
  Anniversary: "a warm anniversary celebration with golden décor, floral arrangements, and a couple's photo wall",
  Corporate: "a sleek modern corporate event with branded backdrops, conference tables, and professional lighting",
  Conference: "a professional conference hall with spotlit podium, projector screens, and attentive audience",
  Seminar: "an elegant seminar setting with arranged seating, expert speakers, and informational displays",
  Kitty_Party: "a vibrant kitty party with colorful table settings, decorative centerpieces, and cheerful guests",
  Social_Gathering: "a warm social gathering with intimate lighting, comfortable seating, and festive décor",
  Pooja: "a serene pooja ceremony with flower rangoli, incense sticks, brass diyas, and spiritual ambiance",
  Naming_Ceremony: "a sweet naming ceremony with pastel decorations, flower garlands, and family blessings",
  Baby_Shower: "a charming baby shower with pastel balloons, floral arches, and a dessert table",
  Farewell: "a heartfelt farewell gathering with memorial slideshow, warm lighting, and emotional tributes",
  Alumni_Meet: "a nostalgic alumni reunion with vintage photos, school colours, and celebratory banners",
  Other: "a beautifully decorated elegant event venue with warm lighting and floral arrangements",
};

// Maps style preferences to cinematic language
const STYLE_MAP = {
  cinematic: "cinematic wide-angle shots, slow-motion b-roll, anamorphic lens flares, golden hour lighting",
  traditional: "classic traditional Indian wedding aesthetic, rich jewel tones, ornate patterns, Bollywood style",
  modern: "sleek modern minimalist aesthetic, clean lines, dramatic uplighting, contemporary style",
  romantic: "soft romantic lighting, shallow depth of field, warm bokeh, pastel tones",
  royal: "opulent royal banquet aesthetic, deep red and gold palette, palatial décor, regal grandeur",
  festive: "vibrant festive Diwali-inspired palette, sparkle effects, saturated colors, joyful energy",
};

function buildVeoPrompt(data) {
  const scene = EVENT_SCENE_MAP[data.event_type] || EVENT_SCENE_MAP.Other;
  const styleLang = STYLE_MAP[data.style] || STYLE_MAP.cinematic;
  const colorNote = data.color_theme
    ? `Color palette: ${data.color_theme}.`
    : "";

  // Format event date for display
  let formattedDate = data.event_date;
  try {
    formattedDate = new Date(data.event_date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    // keep original if date is invalid
  }

  return `Cinematic event invitation video for ${data.client_name}'s ${data.event_type}.

Scene: ${scene}. The venue is ${data.venue_name}${data.franchise_name && data.franchise_name !== data.venue_name ? `, presented by ${data.franchise_name}` : ""}.

Event date: ${formattedDate}.

Visual style: ${styleLang}. ${colorNote}

Opening shot: slow-motion reveal of the elaborately decorated venue interior with dramatic lighting transition.
Mid section: elegant text overlay animations: "${data.client_name} cordially invites you", event name: "${data.event_type}", date: "${formattedDate}", venue: "${data.venue_name}".
Closing shot: full venue exterior establishing shot at golden hour, with the franchise branding subtly visible.

Technical: smooth camera movements (tracking, dolly, crane), professional color grading, celebration confetti or sparkle overlay in final 2 seconds. 4K quality, no people's faces shown (generic/blurred attendees in background only), no text watermarks except the venue name overlay.`;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateVideoInvitationInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  // Build the Veo 2 prompt
  const videoPrompt = buildVeoPrompt(d);

  const durationSeconds = [5, 8].includes(d.duration_seconds) ? d.duration_seconds : 8;
  const aspectRatio = ["16:9", "9:16", "1:1"].includes(d.aspect_ratio) ? d.aspect_ratio : "16:9";
  const outputBucket = process.env.GCS_VIDEO_OUTPUT_BUCKET || null;

  try {
    const videoResult = await generateVideo({
      prompt: videoPrompt,
      durationSeconds: durationSeconds,
      aspectRatio: aspectRatio,
      outputGcsBucket: outputBucket,
    });

    return NextResponse.json({
      success: true,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      booking_id: d.booking_id ?? null,
      client_name: d.client_name,
      event_type: d.event_type,
      event_date: d.event_date,
      status: "processing",
      operation_name: videoResult.operationName,
      poll_endpoint: `/api/ai/video-status?op=${encodeURIComponent(videoResult.operationName)}`,
      estimated_seconds: durationSeconds === 5 ? 120 : 180,
      veo_prompt_preview: videoPrompt.slice(0, 200) + "...",
      // Caller writes to /ai_insights with insight_type: "video_invitation" once polled complete
    });
  } catch (err) {
    console.error("[video-invitation] Veo error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        hint: "Ensure GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and GCS_VIDEO_OUTPUT_BUCKET env vars are set correctly.",
      },
      { status: 500 }
    );
  }
}
