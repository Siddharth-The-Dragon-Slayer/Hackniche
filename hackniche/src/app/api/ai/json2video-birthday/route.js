/**
 * POST /api/ai/json2video-birthday
 *
 * Birthday-specific invitation video endpoint using the cinematic "birthday"
 * template from the BanquetEase invitation template library.
 *
 * Features: 4-scene video (reveal → name spotlight → event details → RSVP CTA),
 * golden colour palette, animated badge, voice narration, audiogram, background music.
 *
 * Shorthand body:  { "name": "Rahul", "age": "30" }
 * Full variables:  { "name": "Rahul", "age": "30", "hostName": "...", "eventDate": "...",
 *                    "eventTime": "...", "venueName": "...", "venueAddress": "...",
 *                    "rsvpContact": "...", "rsvpDate": "..." }
 *
 * For other event types (wedding, anniversary, corporate, engagement) use:
 *   POST /api/ai/json2video-invitation  with  { event_type: "...", variables: { ... } }
 */

import { NextResponse } from "next/server";
import { loadTemplate } from "@/lib/invitation-templates";

const API_KEY = process.env.JSON2VIDEO_API_KEY || "NecgE5iJRPAhoEBrH5KVvdAOCWO26MdFrJPxWd06";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Support both shorthand (name/age) and full variable maps
  const {
    name,
    age = "",
    guestName,
    hostName = "Your Hosts",
    eventDate = "Date TBD",
    eventTime = "Time TBD",
    venueName = "Venue TBD",
    venueAddress = "",
    rsvpContact = "",
    rsvpDate = "",
  } = body;

  const resolvedName = (guestName || name || "Friend").trim();

  if (!resolvedName) {
    return NextResponse.json(
      { success: false, error: "Provide 'name' or 'guestName' in the request body." },
      { status: 422 }
    );
  }

  try {
    const variables = {
      guestName: resolvedName,
      age: String(age),
      hostName,
      eventDate,
      eventTime,
      venueName,
      venueAddress,
      rsvpContact,
      rsvpDate,
      voiceScene2: `Join us as we celebrate ${resolvedName}'s ${age ? age + "th " : ""}birthday!`,
    };

    // Load the cinematic birthday template with merged variables
    const template = loadTemplate("birthday", variables);

    const { Movie, Scene } = await import("json2video-sdk");

    const movie = new Movie();
    movie.setAPIKey(API_KEY);

    const { scenes, elements, variables: vars, ...movieProps } = template;

    for (const [key, value] of Object.entries(movieProps)) {
      movie.set(key, value);
    }

    if (vars && Object.keys(vars).length > 0) {
      movie.set("variables", vars);
    }

    for (const sceneData of scenes || []) {
      const { elements: sceneElements, id, comment, ...sceneProps } = sceneData;
      const scene = new Scene();
      
      // Only set properties supported by Scene.set()
      if (comment) scene.set("comment", comment);
      for (const [key, value] of Object.entries(sceneProps)) {
        try {
          scene.set(key, value);
        } catch (err) {
          console.warn(`[birthday] Scene.set("${key}") not supported, skipping`);
        }
      }
      
      for (const element of sceneElements || []) {
        scene.addElement(element);
      }
      movie.addScene(scene);
    }

    for (const element of elements || []) {
      movie.addElement(element);
    }

    await movie.render();
    const status = await movie.waitToFinish();

    return NextResponse.json({
      success: true,
      event_type: "birthday",
      movieUrl: status?.movie?.url || null,
      message: "Embed the video: <video src={movieUrl} controls />",
      movie: status?.movie || null,
    });
  } catch (err) {
    console.error("[json2video-birthday] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Render failed" },
      { status: 500 }
    );
  }
}
