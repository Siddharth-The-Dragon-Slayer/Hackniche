
import crypto from "crypto";

export async function analyzeImage(imageUrl, eventDetails = {}) {
  const apiKey = process.env.featherless_API;
  if (!apiKey) {
    console.error("Missing featherless_API key");
    return null;
  }

  const model = "mistralai/Mistral-Small-3.1-24B-Instruct-2503"; // A common vision model on Featherless
  const endpoint = "https://api.featherless.ai/v1/chat/completions";

  const prompt = `
    Analyze this image uploaded by a guest to a collaborative event gallery for "${eventDetails.customerName || 'an event'}".
    Focus: Event is on ${eventDetails.eventDate || 'a specific date'} at ${eventDetails.venue || 'a venue'}.
    
    Task: Identify if the image is inappropriate for a professional banquet/event gallery.
    Inappropriate content includes:
    1. Explicit nudity or sexual content.
    2. Violence or gore.
    3. Hate speech or offensive symbols.
    4. Promotional spam (unrelated marketing).
    5. Completely irrelevant content (random screenshots, garbage photos).
    
    Respond STRICTLY in JSON format:
    {
      "is_inappropriate": boolean,
      "reason": "Clear explanation of why it was flagged or why it is safe",
      "recommendation": "delete" | "keep",
      "confidence": 0-1
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Featherless AI Error:", err);
      return null;
    }

    const data = await response.json();
    console.log(" Data: ", JSON.stringify(data, null, 2));
    
    let content = data.choices[0].message.content;
    
    // Clean markdown code blocks if present
    content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const result = JSON.parse(content);
      console.log("Response: ", result);
      return result;
    } catch (parseError) {
      console.error("Manual JSON Parse failed, attempting fallback extraction:", content);
      // Fallback: search for first { and last }
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return null;
  }
}
