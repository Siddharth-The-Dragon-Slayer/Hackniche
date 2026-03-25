/**
 * Google Vertex AI Client — Veo 2 (video) + Imagen 3 (image)
 *
 * Video: POST /api/ai/video-invitation   → uses Veo 2 via Vertex AI
 * Image: POST /api/ai/generate-image     → uses Imagen 3 via Vertex AI
 *
 * Requires:
 *   GOOGLE_CLOUD_PROJECT     = your GCP project ID
 *   GOOGLE_CLOUD_LOCATION    = e.g. "us-central1"
 *   GOOGLE_APPLICATION_CREDENTIALS = path to service account JSON
 *     OR set GOOGLE_SA_JSON env var with the JSON string directly
 */

import { VertexAI } from "@google-cloud/vertexai";

// Lazy singleton
let _vertexAI = null;

export function getVertexAIClient() {
  if (!_vertexAI) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

    if (!project) {
      throw new Error(
        "GOOGLE_CLOUD_PROJECT environment variable is not set. " +
          "Add it to your .env.local file."
      );
    }

    // If a JSON string is provided, write it to a temp file for the SDK
    if (process.env.GOOGLE_SA_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");
      const tmpPath = path.join(os.tmpdir(), "bms-gcp-sa.json");
      fs.writeFileSync(tmpPath, process.env.GOOGLE_SA_JSON, "utf-8");
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    }

    _vertexAI = new VertexAI({ project, location });
  }
  return _vertexAI;
}

// ---------------------------------------------------------------------------
// Imagen 3 — Image generation
// Returns: Array of base64-encoded PNG strings
// ---------------------------------------------------------------------------
export async function generateImage({ prompt, sampleCount = 1, aspectRatio = "1:1" }) {
  const vertex = getVertexAIClient();
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const project = process.env.GOOGLE_CLOUD_PROJECT;

  // Imagen 3 is accessed via REST (Vertex AI SDK does not yet expose it as a
  // typed method; use the raw predict endpoint)
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount,
        aspectRatio,
        safetySetting: "block_some",
        personGeneration: "allow_adult",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Imagen 3 API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  // Each prediction has { bytesBase64Encoded, mimeType }
  return (data.predictions || []).map((p) => ({
    base64: p.bytesBase64Encoded,
    mimeType: p.mimeType || "image/png",
  }));
}

// ---------------------------------------------------------------------------
// Veo 2 — Video generation (long-running operation)
// Returns: { operationName } — poll /api/ai/video-status for result
// Veo 2 generates 5–8 second video clips per prompt
// ---------------------------------------------------------------------------
export async function generateVideo({
  prompt,
  durationSeconds = 8,
  aspectRatio = "16:9",
  outputGcsBucket, // e.g. "gs://my-bucket/videos/"
}) {
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const project = process.env.GOOGLE_CLOUD_PROJECT;

  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Veo 2 endpoint (preview / GA depending on project allowlisting)
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/veo-2.0-generate-001:predictLongRunning`;

  const storageUri =
    outputGcsBucket || process.env.GCS_VIDEO_OUTPUT_BUCKET;

  if (!storageUri) {
    throw new Error(
      "GCS_VIDEO_OUTPUT_BUCKET env var is required for Veo video generation. " +
        "Set it to a gs:// path, e.g. gs://my-bucket/bms-videos/"
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        durationSeconds,
        aspectRatio,
        storageUri,
        sampleCount: 1,
        enhancePrompt: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Veo 2 API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  // Returns a long-running operation: { name: "projects/.../operations/..." }
  return { operationName: data.name };
}

// ---------------------------------------------------------------------------
// Poll a Vertex AI long-running operation (for Veo video status)
// ---------------------------------------------------------------------------
export async function pollOperation(operationName) {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/${operationName}`;

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken.token}` },
  });

  if (!response.ok) {
    throw new Error(`Operation poll error: ${response.status}`);
  }

  return response.json();
}
