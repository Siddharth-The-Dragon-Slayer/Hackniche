/**
 * POST /api/ai/cross-branch-analysis
 * 
 * Explains performance differences across branches within a franchise.
 * "Banjara Hills converts 20% more referrals than Kukatpally — why?"
 * Uses LangChain + Groq.
 * 
 * Input: branches_stats from /branches._stats + _lead_stats (franchise-scoped)
 * Output: Comparative analysis with root causes and actionable recommendations
 */

import { NextResponse } from "next/server";
import { invokeStructuredJSON } from "@/lib/groq-client";
import { validateCrossBranchAnalysisInput } from "@/lib/ai-validators";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateCrossBranchAnalysisInput(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 422 }
    );
  }

  const d = validation.data;

  const branchesSummary = d.branches_stats
    .map(
      (b) =>
        `Branch: ${b.branch_name} (${b.city})
  - Revenue MTD: ₹${b.revenue_mtd?.toLocaleString("en-IN")}
  - Conversion Rate: ${b.conversion_rate_pct}%
  - Total Leads: ${b.total_leads}
  - Leads Hot: ${b.leads_hot ?? "N/A"}
  - Avg Conversion Days: ${b.avg_conversion_days ?? "N/A"}
  - Top Source: ${b.top_lead_source ?? "Unknown"}
  - Occupancy: ${b.occupancy_pct_mtd ?? "N/A"}%`
    )
    .join("\n\n");

  const leadsBySourceBlock = d.leads_by_source_per_branch
    ? d.leads_by_source_per_branch
        .map(
          (b) =>
            `${b.branch_name}: ${JSON.stringify(b.leads_by_source)}`
        )
        .join("\n")
    : "Not provided";

  const systemPrompt = `You are a franchise business analyst specializing in hospitality and event management.
Provide deep, data-driven insights explaining performance gaps between branches.
Be specific — avoid generic advice. Identify root causes from the data.
Respond ONLY with raw valid JSON — no markdown, no code fences.`;

  const userPrompt = `Analyze performance differences across these franchise branches.

Franchise ID: ${d.franchise_id}

Branch Performance Data:
${branchesSummary}

Lead Source Breakdown per Branch:
${leadsBySourceBlock}

Analysis requirements:
1. Identify the best-performing and worst-performing branches with specific metrics
2. Explain WHY the top branch outperforms — look at conversion rate, lead sources, occupancy
3. Find specific patterns — e.g., "referral leads convert 2× better in Branch A vs B"
4. Provide actionable recommendations for underperforming branches
5. Flag training needs or marketing adjustments per branch

Respond with this exact JSON:
{
  "top_performer": {
    "branch_name": "<name>",
    "key_strengths": ["<strength 1>", "<strength 2>"]
  },
  "underperformers": [
    {
      "branch_name": "<name>",
      "gap_vs_top": "<specific metric gap>",
      "root_cause": "<data-driven explanation>",
      "recommendation": "<specific actionable fix>"
    }
  ],
  "cross_branch_insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "training_needs": ["<branch: specific training need>"],
  "marketing_adjustments": ["<branch: specific marketing change>"],
  "executive_summary": "<2-3 sentence summary for the franchise admin>"
}`;

  try {
    const result = await invokeStructuredJSON(systemPrompt, userPrompt);

    return NextResponse.json({
      success: true,
      insight_type: "cross_branch_analysis",
      franchise_id: d.franchise_id,
      branches_analyzed: d.branches_stats.length,
      result,
      cache_ttl_hours: 24,
    });
  } catch (err) {
    console.error("[cross-branch-analysis] AI error:", err);
    return NextResponse.json(
      { error: "AI processing failed", message: err.message },
      { status: 500 }
    );
  }
}
