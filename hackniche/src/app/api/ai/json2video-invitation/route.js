/**
 * POST /api/ai/json2video-invitation
 *
 * Renders a video invitation using the json2video REST API directly.
 * Bypasses the SDK to send the full template JSON as-is, which avoids
 * SDK property-whitelisting bugs (the SDK Scene object only supports
 * comment / background-color / duration / cache; everything else was dropped).
 *
 * Request Body:
 * {
 *   "event_type": "birthday" | "wedding" | "anniversary" | "corporate" | "engagement",
 *   "variables": { ... }
 * }
 */

import { NextResponse } from "next/server";
import {
  loadTemplate,
  validateVariables,
  EVENT_TYPES,
  requiredVariables,
} from "@/lib/invitation-templates";

const API_KEY =
  process.env.JSON2VIDEO_API_KEY ||
  "NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06";
const API_URL = "https://api.json2video.com/v2/movies";

// ── helpers ────────────────────────────────────────────────────────────────
async function submitRender(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function pollStatus(project, maxWaitMs = 300_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 4000)); // poll every 4s
    const res = await fetch(`${API_URL}?project=${project}`, {
      headers: { "x-api-key": API_KEY },
    });
    const data = await res.json();
    const status = data?.movie?.status;
    if (status === "done") return data;
    if (status === "error") {
      throw new Error(
        data?.movie?.message || "json2video rendering failed"
      );
    }
  }
  throw new Error("Video rendering timed out after 5 minutes");
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    // 1. Parse
    const body = await request.json().catch(() => ({}));
    const { event_type, variables = {} } = body;

    // 2. Validate event_type
    if (!event_type) {
      return NextResponse.json(
        { success: false, error: "Missing required field: event_type", supported_types: EVENT_TYPES },
        { status: 400 }
      );
    }
    const normalized = event_type.toLowerCase().trim();
    if (!EVENT_TYPES.includes(normalized)) {
      return NextResponse.json(
        { success: false, error: `Unsupported event_type "${event_type}"`, supported_types: EVENT_TYPES },
        { status: 400 }
      );
    }

    // 3. Validate required variables
    const { valid, missing } = validateVariables(normalized, variables);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: `Missing required variables for "${normalized}"`, missing_variables: missing },
        { status: 422 }
      );
    }

    // 4. Load & merge template
    const template = loadTemplate(normalized, variables);

    // 5. Build the json2video payload — strip internal-only fields
    const {
      id: _templateId,
      comment: _comment,
      ...payload
    } = template;

    console.log(
      `[json2video] Submitting ${normalized} render — ${payload.scenes?.length} scenes`
    );

    // 6. Submit render
    const renderResp = await submitRender(payload);
    if (!renderResp?.success || !renderResp?.project) {
      console.error("[json2video] Submit failed:", renderResp);
      return NextResponse.json(
        { success: false, error: renderResp?.message || "Failed to submit video render job" },
        { status: 502 }
      );
    }

    console.log(`[json2video] Project ${renderResp.project} — polling…`);

    // 7. Poll until done
    const result = await pollStatus(renderResp.project);
    const movieUrl = result?.movie?.url || null;

    console.log(`[json2video] Done — ${movieUrl ? "URL ready" : "no URL"}`);

    return NextResponse.json({
      success: true,
      event_type: normalized,
      movieUrl,
      movie: result?.movie || null,
    });
  } catch (err) {
    console.error("[json2video-invitation] Error:", err?.message, err?.stack);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// ── GET — docs ─────────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    success: true,
    description: "BanquetEase Dynamic Video Invitation Generator",
    endpoint: "POST /api/ai/json2video-invitation",
    supported_event_types: EVENT_TYPES,
    required_variables_per_type: requiredVariables,
    example_request: {
      event_type: "birthday",
      variables: {
        guestName: "Rahul Sharma",
        age: "30",
        hostName: "The Sharma Family",
        eventDate: "Saturday, March 15, 2026",
        eventTime: "7:00 PM",
        venueName: "Grand Celebration Hall",
        venueAddress: "12, MG Road, Bengaluru",
        rsvpContact: "+91 98765 43210",
        rsvpDate: "March 10, 2026",
      },
    },
  });
}
