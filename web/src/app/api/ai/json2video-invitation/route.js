/**
 * POST /api/ai/json2video-invitation
 *
 * Dynamically renders a video invitation for any supported event type
 * using pre-built, cinematically designed JSON templates.
 *
 * Request Body:
 * {
 *   "event_type": "birthday" | "wedding" | "anniversary" | "corporate" | "engagement",
 *   "variables": {
 *     // All required + any optional variables for the chosen event type
 *     // Birthday:    guestName, age?, hostName, eventDate, eventTime, venueName, venueAddress, rsvpContact, rsvpDate?
 *     // Wedding:     bride, groom, weddingDate, ceremonyTime, receptionTime, venueName, venueAddress, rsvpContact, rsvpDate?
 *     // Anniversary: coupleName, years, yearsLabel?, hostName, eventDate, eventTime, venueName, venueAddress, rsvpContact
 *     // Corporate:   eventTitle, companyName, eventDate, eventTime, venueName, venueAddress, speakerName?, theme?, registrationLink?, contactEmail
 *     // Engagement:  partner1, partner2, hostFamily1?, hostFamily2?, eventDate, eventTime, venueName, venueAddress, rsvpContact, rsvpDate?
 *   }
 * }
 *
 * Response (success):
 * {
 *   "success": true,
 *   "event_type": "birthday",
 *   "movieUrl": "https://....json2video.com/....mp4",
 *   "movie": { ...raw json2video result }
 * }
 */

import { NextResponse } from "next/server";
import { loadTemplate, validateVariables, EVENT_TYPES, requiredVariables } from "@/lib/invitation-templates";

const API_KEY = process.env.JSON2VIDEO_API_KEY || "NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06";

export async function POST(request) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const { event_type, variables = {} } = body;

    // ── 2. Validate event_type ─────────────────────────────────────────────
    if (!event_type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: event_type",
          supported_types: EVENT_TYPES,
        },
        { status: 400 }
      );
    }

    const normalized = event_type.toLowerCase().trim();
    if (!EVENT_TYPES.includes(normalized)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported event_type "${event_type}"`,
          supported_types: EVENT_TYPES,
        },
        { status: 400 }
      );
    }

    // ── 3. Validate required variables ─────────────────────────────────────
    const { valid, missing } = validateVariables(normalized, variables);
    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required variables for event type "${normalized}"`,
          missing_variables: missing,
        },
        { status: 422 }
      );
    }

    // ── 4. Load template with merged variables ─────────────────────────────
    const template = loadTemplate(normalized, variables);

    // ── 5. Render with json2video SDK ──────────────────────────────────────
    const { Movie } = await import("json2video-sdk");

    const movie = new Movie();
    movie.setAPIKey(API_KEY);

    // Apply all top-level template properties to the movie object
    const { scenes, elements, variables: vars, ...movieProps } = template;

    for (const [key, value] of Object.entries(movieProps)) {
      movie.set(key, value);
    }

    // Set merged variables
    if (vars && Object.keys(vars).length > 0) {
      movie.set("variables", vars);
    }

    // Build scenes from the template JSON
    const { Scene } = await import("json2video-sdk");
    for (const sceneData of scenes || []) {
      const { elements: sceneElements, id, comment, ...sceneProps } = sceneData;
      const scene = new Scene();

      // Only set properties that the SDK Scene.set() actually supports
      // Skip id and comment as they may not be settable via .set()
      if (comment) scene.set("comment", comment);
      for (const [key, value] of Object.entries(sceneProps)) {
        try {
          scene.set(key, value);
        } catch (err) {
          // Silently skip unsupported properties
          console.warn(`[json2video] Scene.set("${key}") not supported, skipping`);
        }
      }

      // Add elements
      for (const element of sceneElements || []) {
        scene.addElement(element);
      }

      movie.addScene(scene);
    }

    // Add global elements (e.g. background music)
    for (const element of elements || []) {
      movie.addElement(element);
    }

    // ── 6. Submit render job ───────────────────────────────────────────────
    await movie.render();

    // ── 7. Wait for completion ─────────────────────────────────────────────
    const result = await movie.waitToFinish();

    const movieUrl = result?.movie?.url || null;

    return NextResponse.json({
      success: true,
      event_type: normalized,
      movieUrl,
      movie: result?.movie || null,
    });
  } catch (err) {
    console.error("[json2video-invitation] Error:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
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

/** GET - Returns API documentation and supported event types */
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
