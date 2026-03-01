import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";

export async function POST(request) {
    try {
        const body = await request.json();
        const { reviews, branchName, franchiseName } = body;

        console.log("[review-summary] Request received — branchName:", branchName, "| franchiseName:", franchiseName, "| reviews count:", reviews?.length);

        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            console.warn("[review-summary] Rejected: no reviews provided");
            return NextResponse.json(
                { success: false, error: "No reviews provided for analysis" },
                { status: 400 }
            );
        }

        const reviewsText = reviews
            .map((r, i) => `Review ${i + 1} (${r.rating} stars): "${r.text || r.snippet || "No text"}"`)
            .join("\n\n");

        const systemPrompt = `You are an AI Reputation Analyst for BanquetEase, a premium banquet hall management system.
Analyze the provided customer reviews for ${branchName || "the branch"} under ${franchiseName || "the franchise"}.
Extract sentiment distribution, top themes, rating breakdown, and key actionable insights.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

        const userPrompt = `Analyze these customer reviews and provide a structured insight report:

${reviewsText}

Return a JSON object with this exact structure:
{
  "summary": "Short 2-3 sentence overview of the general sentiment and main feedback points.",
  "sentiment_distribution": [
    { "name": "Positive", "value": <percentage_0_100> },
    { "name": "Neutral", "value": <percentage_0_100> },
    { "name": "Negative", "value": <percentage_0_100> }
  ],
  "top_themes": [
    { "theme": "<Theme Name e.g. Food Quality>", "score": <0_100_rating>, "mentions": <count>, "sentiment": "<Positive|Neutral|Negative>" }
  ],
  "rating_breakdown": [
    { "stars": 5, "count": <count> },
    { "stars": 4, "count": <count> },
    { "stars": 3, "count": <count> },
    { "stars": 2, "count": <count> },
    { "stars": 1, "count": <count> }
  ],
  "key_insights": [
    "<insight 1 e.g. 'Kaju Masala is a signature favorite mentioned in 40% of positive reviews.'>",
    "<insight 2 e.g. 'AC cooling in the Grand Hall is a recurring complaint in recent weeks.'>"
  ],
  "ai_recommendation": "Calculated advice for the manager to improve scores."
}`;

        console.log("[review-summary] Calling Groq LLM with", reviews.length, "reviews...");
        const result = await invokeStructuredJSON(systemPrompt, userPrompt);
        console.log("[review-summary] AI result keys:", result ? Object.keys(result) : "null/undefined");

        return NextResponse.json({
            success: true,
            insight_type: "review_summary",
            branch_name: branchName,
            franchise_name: franchiseName,
            result,
            fetched_at: new Date().toISOString()
        });

    } catch (error) {
        console.error("[review-summary] AI error — name:", error.name, "| message:", error.message);
        console.error("[review-summary] Stack:", error.stack);
        // Check for common failure reasons
        if (error.message?.includes("GROQ_API_KEY")) {
            console.error("[review-summary] >>> GROQ_API_KEY is missing from environment variables <<<");
        }
        if (error.message?.includes("JSON")) {
            console.error("[review-summary] >>> AI returned invalid JSON — check model response format <<<");
        }
        return NextResponse.json(
            { success: false, error: "AI processing failed", message: error.message },
            { status: 500 }
        );
    }
}
