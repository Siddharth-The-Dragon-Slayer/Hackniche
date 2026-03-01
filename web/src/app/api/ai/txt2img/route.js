/**
 * POST /api/ai/txt2img
 *
 * Text-to-Image Generation endpoint using Puter.js
 * Generates high-quality images from text prompts without API keys
 *
 * Request Body:
 * {
 *   "prompt": "A serene Japanese garden with cherry blossoms",
 *   "quality": "high" | "medium" | "low" (default: "high"),
 *   "model": "gpt-image-1" | "gpt-image-1.5" | "dalle-3" (default: "gpt-image-1")
 * }
 *
 * Response (success):
 * {
 *   "success": true,
 *   "prompt": "A serene Japanese garden with cherry blossoms",
 *   "quality": "high",
 *   "model": "gpt-image-1",
 *   "status": "processing",
 *   "message": "Image generation started. Use clientUrl to generate image on frontend."
 * }
 *
 * Note: Puter.js is a client-side library. To fully utilize image generation,
 * use the returned clientUrl in your frontend to execute the image generation.
 */

import { NextResponse } from "next/server";

// Supported models
const SUPPORTED_MODELS = [
  "gpt-image-1",
  "gpt-image-1.5",
  "gpt-image-1-mini",
  "gemini-2.5-flash-image-preview",
  "dalle-3",
];

// Quality levels
const QUALITY_LEVELS = ["high", "medium", "low"];

export async function POST(request) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const {
      prompt,
      quality = "high",
      model = "gpt-image-1",
    } = body;

    // ── 2. Validate prompt ─────────────────────────────────────────────────
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid required field: prompt",
          example: {
            prompt: "A serene Japanese garden with cherry blossoms",
            quality: "high",
            model: "gpt-image-1",
          },
        },
        { status: 400 }
      );
    }

    const normalizedPrompt = prompt.trim();

    // ── 3. Validate quality ────────────────────────────────────────────────
    if (!QUALITY_LEVELS.includes(quality)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid quality level. Supported: ${QUALITY_LEVELS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── 4. Validate model ──────────────────────────────────────────────────
    if (!SUPPORTED_MODELS.includes(model)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid model. Supported: ${SUPPORTED_MODELS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ── 5. Generate client-side code snippet ────────────────────────────────
    // Return HTML snippet that can be used in frontend to generate image
    const htmlSnippet = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Generation - ${normalizedPrompt.substring(0, 30)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 50px auto; text-align: center; }
    .container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    h2 { color: #333; }
    .prompt { background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .loading { color: #666; font-style: italic; }
    #imageContainer { margin-top: 20px; min-height: 100px; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    .error { color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Image Generation</h1>
    <h2 id="status" class="loading">Initializing image generator...</h2>
    <div class="prompt">
      <strong>Prompt:</strong><br/>
      ${normalizedPrompt}
    </div>
    <div style="color: #666; font-size: 14px;">
      <strong>Model:</strong> ${model} | <strong>Quality:</strong> ${quality}
    </div>
    <div id="imageContainer"></div>
  </div>

  <script src="https://js.puter.com/v2/"></script>
  <script>
    function waitForPuter(maxWait) {
      return new Promise(function(resolve, reject) {
        if (typeof puter !== 'undefined' && puter.ai) { resolve(); return; }
        var elapsed = 0;
        var interval = setInterval(function() {
          elapsed += 100;
          if (typeof puter !== 'undefined' && puter.ai) { clearInterval(interval); resolve(); }
          else if (elapsed >= maxWait) { clearInterval(interval); reject(new Error('Puter.js failed to load within ' + (maxWait/1000) + 's')); }
        }, 100);
      });
    }

    waitForPuter(15000).then(async function() {
      try {
        document.getElementById('status').textContent = 'Generating image with ${model}...';
        
        const imageElement = await puter.ai.txt2img("${normalizedPrompt.replace(/"/g, '\\"')}", {
          model: "${model}",
          quality: "${quality}"
        });
        
        document.getElementById('status').textContent = '✅ Image generated successfully!';
        document.getElementById('imageContainer').appendChild(imageElement);
        
      } catch (error) {
        document.getElementById('status').className = 'error';
        document.getElementById('status').textContent = '❌ Error generating image';
        document.getElementById('imageContainer').innerHTML = '<p class="error">Error: ' + error.message + '</p>';
        console.error('Image generation error:', error);
      }
    }).catch(function(err) {
      document.getElementById('status').className = 'error';
      document.getElementById('status').textContent = '❌ ' + err.message;
    });
  </script>
</body>
</html>
    `;

    return NextResponse.json({
      success: true,
      prompt: normalizedPrompt,
      quality,
      model,
      status: "ready",
      message: "Use the imageGenerationUrl to generate the image in a browser/frontend context.",
      htmlSnippet,
      curlExample: `curl -X POST http://localhost:3000/api/ai/txt2img \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${normalizedPrompt}",
    "quality": "${quality}",
    "model": "${model}"
  }'`,
    });
  } catch (error) {
    console.error("[txt2img] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Text-to-Image Generation API",
    version: "1.0.0",
    description:
      "Generate high-quality images from text prompts using Puter.js (GPT Image, DALL-E, Gemini, etc.)",
    endpoint: "/api/ai/txt2img",
    method: "POST",
    supported_models: SUPPORTED_MODELS,
    quality_levels: QUALITY_LEVELS,
    example_request: {
      prompt: "A serene Japanese garden with cherry blossoms",
      quality: "high",
      model: "gpt-image-1",
    },
    example_response: {
      success: true,
      prompt: "A serene Japanese garden with cherry blossoms",
      quality: "high",
      model: "gpt-image-1",
      status: "ready",
      htmlSnippet: "[HTML code to render image with Puter.js]",
    },
    notes: [
      "Puter.js is a client-side library - image generation happens in the browser",
      "No API keys required",
      "Free and unlimited usage (user-pays model)",
      "Quality levels: high (best, slower), medium, low (faster)",
      "Use the htmlSnippet in your frontend or embed Puter.js script",
    ],
  });
}
