/**
 * GET /api/leads/ai-insights?franchise_id=pfd&branch_id=pfd_b1[&uid=xxx]
 *
 * Returns graphical insight data (computed locally — no LLM wait) PLUS
 * a short Groq narrative that is cached per branch for 5 minutes.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import { invokeStructuredJSON } from '@/lib/groq-client';

const NARRATIVE_TTL = 300; // 5 min
const STATS_TTL     = 60;  // 1 min

function serializeLead(d) {
  const data = d.data();
  const s = (v) => v?.toDate?.()?.toISOString() ?? v ?? null;
  return { id: d.id, ...data, created_at: s(data.created_at), updated_at: s(data.updated_at) };
}

// ─── Stats computation (pure JS, instant) ─────────────────────────────────
function computeStats(leads, uid) {
  const myLeads = uid ? leads.filter(l => l.assigned_to_uid === uid) : leads;

  // Score buckets
  const scoreBuckets = { '0–20': 0, '21–40': 0, '41–60': 0, '61–80': 0, '81–100': 0 };
  const sentimentCount = { positive: 0, neutral: 0, negative: 0, unknown: 0 };
  const riskMap = {};
  const eventTypeConv = {};
  const hotLeads = [];
  const atRiskLeads = [];
  let totalScored = 0;
  let totalScore  = 0;

  for (const l of leads) {
    // Score distribution
    if (typeof l.ai_score === 'number') {
      totalScored++;
      totalScore += l.ai_score;
      if      (l.ai_score <= 20)  scoreBuckets['0–20']++;
      else if (l.ai_score <= 40)  scoreBuckets['21–40']++;
      else if (l.ai_score <= 60)  scoreBuckets['41–60']++;
      else if (l.ai_score <= 80)  scoreBuckets['61–80']++;
      else                        scoreBuckets['81–100']++;
    }

    // Sentiment
    const sent = l.ai_sentiment || 'unknown';
    sentimentCount[sent] = (sentimentCount[sent] || 0) + 1;

    // Risk factors
    if (Array.isArray(l.ai_risk_factors)) {
      for (const rf of l.ai_risk_factors) {
        if (rf) riskMap[rf] = (riskMap[rf] || 0) + 1;
      }
    }

    // Event type → conversion
    const et = l.event_type || 'Other';
    if (!eventTypeConv[et]) eventTypeConv[et] = { total: 0, converted: 0 };
    eventTypeConv[et].total++;
    if (l.is_converted) eventTypeConv[et].converted++;

    // Hot leads (score ≥ 80, not yet converted)
    if (typeof l.ai_score === 'number' && l.ai_score >= 80 && !l.is_converted) {
      hotLeads.push({ id: l.id, name: l.customer_name, score: l.ai_score, label: l.ai_score_label, event: l.event_type, status: l.status });
    }

    // At-risk: negative sentiment or risk factors present
    if ((l.ai_sentiment === 'negative' || (Array.isArray(l.ai_risk_factors) && l.ai_risk_factors.length > 0)) && !l.is_converted) {
      atRiskLeads.push({ id: l.id, name: l.customer_name, score: l.ai_score, risks: l.ai_risk_factors || [], sentiment: l.ai_sentiment || 'unknown' });
    }
  }

  // Top risk factors (sorted by frequency)
  const topRisks = Object.entries(riskMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([factor, count]) => ({ factor, count }));

  // Event type conversion rates
  const conversionByEvent = Object.entries(eventTypeConv)
    .map(([event, { total, converted }]) => ({
      event, total, converted,
      rate: Math.round((converted / total) * 100),
    }))
    .sort((a, b) => b.total - a.total);

  // Status funnel
  const FUNNEL_ORDER = ['new','visited','tasting_scheduled','tasting_done','menu_selected','advance_paid','paid','completed','closed'];
  const funnelCounts = {};
  for (const s of FUNNEL_ORDER) funnelCounts[s] = leads.filter(l => l.status === s).length;

  const FUNNEL_LABELS = {
    new:'New', visited:'Visited', tasting_scheduled:'Tasting Sched.', tasting_done:'Tasting Done',
    menu_selected:'Menu Selected', advance_paid:'Advance Paid', paid:'Fully Paid',
    completed:'Completed', closed:'Closed',
  };

  const funnel = FUNNEL_ORDER
    .map(s => ({ status: s, label: FUNNEL_LABELS[s], count: funnelCounts[s] }))
    .filter(f => f.count > 0);

  return {
    total: leads.length,
    myTotal: myLeads.length,
    totalScored,
    avgScore: totalScored ? Math.round(totalScore / totalScored) : 0,
    scoreBuckets: Object.entries(scoreBuckets).map(([range, count]) => ({ range, count })),
    sentimentBreakdown: Object.entries(sentimentCount)
      .filter(([, c]) => c > 0)
      .map(([sentiment, count]) => ({ sentiment, count })),
    topRisks,
    conversionByEvent,
    hotLeads: hotLeads.sort((a, b) => b.score - a.score).slice(0, 10),
    atRiskLeads: atRiskLeads.slice(0, 10),
    funnel,
  };
}

// ─── Groq narrative (cached 5 min) ────────────────────────────────────────
async function getAINarrative(stats, branchKey) {
  const nKey = `ai-insights:narrative:${branchKey}`;
  const cached = cache.get(nKey);
  if (cached) return cached;

  const system = `You are a sales performance analyst for a banquet hall business. 
Respond with ONLY a JSON object: { "narrative": "...", "priority_action": "...", "mood": "positive"|"neutral"|"warning" }
Keep narrative under 60 words. Be direct and actionable.`;

  const user = `Branch stats:
- Total leads: ${stats.total}, Average AI score: ${stats.avgScore}/100
- Sentiment: ${stats.sentimentBreakdown.map(s => `${s.sentiment}=${s.count}`).join(', ')}
- Hot leads (score≥80): ${stats.hotLeads.length}
- At-risk leads: ${stats.atRiskLeads.length}
- Top risk factor: ${stats.topRisks[0]?.factor || 'none'}
- Funnel top stage: ${stats.funnel[0]?.label || 'n/a'} (${stats.funnel[0]?.count || 0})`;

  try {
    const result = await invokeStructuredJSON(system, user);
    cache.set(nKey, result, NARRATIVE_TTL);
    return result;
  } catch {
    return { narrative: 'AI narrative temporarily unavailable.', priority_action: 'Review hot leads and follow up.', mood: 'neutral' };
  }
}

// ─── GET ───────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');
    const uid          = searchParams.get('uid') || null;

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id required' }, { status: 400 });
    }

    const branchKey = `${franchise_id}:${branch_id}`;
    const statsKey  = `ai-insights:stats:${branchKey}`;

    // Stats are cheap — cache 1 min
    let stats = cache.get(statsKey);
    if (!stats) {
      const adminDb = getAdminDb();
      const snap = await adminDb.collection('leads')
        .where('franchise_id', '==', franchise_id)
        .where('branch_id', '==', branch_id)
        .get();

      const leads = snap.docs.map(serializeLead);
      stats = computeStats(leads, uid);
      cache.set(statsKey, stats, STATS_TTL);
    }

    // Narrative is expensive — cache 5 min, run in parallel with stats
    const narrative = await getAINarrative(stats, branchKey);

    return NextResponse.json({ success: true, stats, narrative, cached: false });
  } catch (err) {
    console.error('ai-insights error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
