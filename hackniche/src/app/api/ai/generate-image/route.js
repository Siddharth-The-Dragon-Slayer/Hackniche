/**
 * POST /api/ai/generate-image
 *
 * Generates AI images for banquet halls/events using Google Imagen 3
 * via the Vertex AI Predict endpoint.
 *
 * Use cases:
 * - Generate venue decoration mock-ups for proposals
 * - Create event invitation card backgrounds
 * - Generate example food platters for menu proposals
 * - Create marketing collateral images
 *
 * Unlike Veo, Imagen 3 is synchronous — returns base64 images immediately.
 *
 * Required env:
 *   GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION (default: us-central1),
 *   GOOGLE_SA_JSON or GOOGLE_APPLICATION_CREDENTIALS
 *
 * Input fields:
 *   prompt (required), style, aspect_ratio, sample_count (1-4),
 *   event_type, venue_name, franchise_name, branch_id, franchise_id,
 *   negative_prompt (optional)
 *
 * Output: { images: [{ index, base64, mimeType, aspect_ratio }] }
 */

import { NextResponse } from "next/server";
import { generateImage } from "@/lib/google-ai-client";
import { validateGenerateImageInput, EVENT_TYPES } from "@/lib/ai-validators";

// Style presets that enhance user prompts for better banquet/event imagery
const STYLE_PRESETS = {
  photorealistic: "photorealistic, ultra-detailed, professional photography, 8K resolution, DSLR quality",
  illustration: "digital illustration, artistic rendering, vibrant colors, editorial style",
  watercolor: "soft watercolor painting, delicate brushstrokes, pastel tones, elegant artistic style",
  cinematic: "cinematic photography, dramatic lighting, shallow depth of field, film grain, moody atmosphere",
  minimalist: "minimalist design, clean composition, white space, elegant simplicity, modern aesthetic",
  traditional: "traditional Indian art style, intricate patterns, rich jewel tones, ornate decorations",
  flat_design: "flat design illustration, bold colors, geometric shapes, modern graphic style",
};

// Event-specific style hints to improve image relevance
const EVENT_STYLE_HINTS = {
  Wedding: "grand Indian wedding, marigold flowers, mandap, traditional decorations, warm golden lighting",
  Reception: "luxury wedding reception, crystal chandeliers, elegant table settings, romantic candlelight",
  Engagement: "romantic engagement ceremony, rose petals, fairy lights, floral arrangements",
  Birthday: "birthday party, colorful balloons, tiered cake, festive decorations",
  Anniversary: "anniversary celebration, golden décor, romantic ambiance, floral centerpieces",
  Corporate: "professional corporate event, branded backdrop, modern conference setup",
  Conference: "professional conference, podium, projector screens, formal seating arrangement",
  Pooja: "religious pooja ceremony, diyas, flower rangoli, incense, spiritual atmosphere",
  Other: "elegant banquet hall event, sophisticated décor, professional setup",
};

function buildEnhancedPrompt(data) {
  const parts = [data.prompt.trim()];

  // Add venue context
  if (data.venue_name) {
    parts.push(`at ${data.venue_name}`);
  }
  if (data.franchise_name && data.franchise_name !== data.venue_name) {
    parts.push(`(${data.franchise_name})`);
  }

  // Add event type hints
  if (data.event_type && EVENT_STYLE_HINTS[data.event_type]) {
    parts.push(EVENT_STYLE_HINTS[data.event_type]);
  }

  // Add style preset
  const stylePreset = STYLE_PRESETS[data.style] || STYLE_PRESETS.photorealistic;
  parts.push(stylePreset);

  // Standard quality enhancers for all images
  parts.push("professional quality, well-composed, beautiful lighting, no watermarks, no text overlays");

  return parts.join(", ");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateGenerateImageInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  // Build enhanced prompt
  const enhancedPrompt = buildEnhancedPrompt(d);

  // Build negative prompt (things to avoid)
  const defaultNegativePrompt =
    "blurry, low quality, distorted, watermark, text, logo, ugly, deformed, noisy, oversaturated, cartoon (unless style=illustration), people faces clearly visible";
  const negativePrompt = d.negative_prompt
    ? `${d.negative_prompt}, ${defaultNegativePrompt}`
    : defaultNegativePrompt;

  const sampleCount = typeof d.sample_count === "number" && d.sample_count >= 1 && d.sample_count <= 4
    ? Math.round(d.sample_count)
    : 1;
  const aspectRatio = ["1:1", "16:9", "9:16", "4:3", "3:4"].includes(d.aspect_ratio)
    ? d.aspect_ratio
    : "16:9";

  try {
    const imageResults = await generateImage({
      prompt: enhancedPrompt,
      negativePrompt: negativePrompt,
      sampleCount: sampleCount,
      aspectRatio: aspectRatio,
    });

    if (!Array.isArray(imageResults) || imageResults.length === 0) {
      throw new Error("Imagen 3 returned no images");
    }

    const images = imageResults.map((img, idx) => ({
      index: idx,
      base64: img.base64,
      mime_type: img.mimeType || "image/png",
      aspect_ratio: aspectRatio,
      // Caller can: store base64 to Firebase Storage and write URL to /ai_insights
    }));

    return NextResponse.json({
      success: true,
      branch_id: d.branch_id ?? null,
      franchise_id: d.franchise_id ?? null,
      image_count: images.length,
      images: images,
      prompt_used: enhancedPrompt,
      style: d.style ?? "photorealistic",
      aspect_ratio: aspectRatio,
      // Caller writes to /ai_insights: { insight_type: "generated_image", result: { images, prompt_used } }
      // Or uploads base64 to Firebase Storage and saves the URL
    });
  } catch (err) {
    console.error("[generate-image] Imagen error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        hint: "Ensure GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION env vars are set and Imagen 3 API is enabled.",
      },
      { status: 500 }
    );
  }
}
