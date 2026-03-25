/**
 * LangChain + Groq Client
 * Used for all text-based AI features in BanquetEase.
 * Model: llama-3.3-70b-versatile (high-context, JSON-capable)
 */

import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ---------------------------------------------------------------------------
// Initialise ChatGroq lazily (env var read at request time, not module load)
// ---------------------------------------------------------------------------
let _groqClient = null;

export function getGroqClient() {
  if (!_groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY environment variable is not set. " +
          "Add it to your .env.local file."
      );
    }
    _groqClient = new ChatGroq({
      apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Low for structured/predictable JSON output
      maxTokens: 2048,
    });
  }
  return _groqClient;
}

// ---------------------------------------------------------------------------
// Helper: invoke LLM and return parsed JSON
// Retries once on JSON parse failure.
// ---------------------------------------------------------------------------
export async function invokeStructuredJSON(systemPrompt, userPrompt) {
  const client = getGroqClient();
  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ];

  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    const response = await client.invoke(messages);
    const raw = response.content.trim();

    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      if (attempt === 2) {
        throw new Error(
          `AI returned non-parseable JSON after ${attempt} attempt(s). Raw: ${raw.slice(0, 200)}`
        );
      }
      // Retry with stricter instruction
      messages.push(
        new HumanMessage(
          "Your previous response was not valid JSON. Return ONLY raw JSON with no markdown, no explanation."
        )
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Helper: invoke LLM and return plain text
// ---------------------------------------------------------------------------
export async function invokeText(systemPrompt, userPrompt) {
  const client = getGroqClient();
  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ];
  const response = await client.invoke(messages);
  return response.content.trim();
}

// ---------------------------------------------------------------------------
// Helper: multi-turn chat (for chatbot)
// messages: Array of { role: "user"|"assistant"|"system", content: string }
// ---------------------------------------------------------------------------
export async function invokeChat(messages) {
  const client = getGroqClient();
  const langchainMessages = messages.map((m) => {
    if (m.role === "system") return new SystemMessage(m.content);
    if (m.role === "assistant") {
      const { AIMessage } = require("@langchain/core/messages");
      return new AIMessage(m.content);
    }
    return new HumanMessage(m.content);
  });
  const response = await client.invoke(langchainMessages);
  return response.content.trim();
}
