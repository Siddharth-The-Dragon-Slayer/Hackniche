/**
 * POST /api/leads/[id]/ai-analyze
 *
 * Runs a Groq/LangChain AI analysis on a lead and writes back:
 *   ai_score, ai_score_label, ai_sentiment, ai_suggested_action,
 *   ai_risk_factors, ai_score_updated_at
 *
 * Body: { franchise_id, branch_id }
 */

import { getAdminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { invokeStructuredJSON } from '@/lib/groq-client';

const s = (v) => v?.toDate?.()?.toISOString() ?? v ?? null;

export async function POST(request, { params }) {
  try {
    const { id: lead_id } = await params;
    const body = await request.json();
    const { franchise_id, branch_id } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { error: 'franchise_id and branch_id are required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // ── Fetch lead ──────────────────────────────────────────────────────────
    const leadRef = adminDb.collection('leads').doc(lead_id);

    const snap = await leadRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = { id: snap.id, ...snap.data() };

    // ── Build AI context ────────────────────────────────────────────────────
    const daysTillEvent = lead.event_date
      ? Math.ceil(
          (new Date(lead.event_date) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const stageIndex = [
      'new', 'visited', 'tasting_scheduled', 'tasting_done',
      'menu_selected', 'advance_paid', 'decoration_scheduled',
      'paid', 'in_progress', 'completed', 'settlement_complete', 'closed',
    ].indexOf(lead.status);

    const paidAmount =
      (lead.booking_confirmed?.advance_amount || 0) +
      (lead.final_payment?.remaining_amount || 0);

    const leadContext = {
      status: lead.status,
      pipeline_stage: stageIndex >= 0 ? stageIndex + 1 : 0,
      event_type: lead.event_type,
      event_date: lead.event_date,
      days_till_event: daysTillEvent,
      guest_count: lead.expected_guest_count,
      budget_min: lead.budget_min,
      budget_max: lead.budget_max,
      budget_flexibility: lead.budget_flexibility,
      quote_total: lead.quote?.total_estimated,
      advance_paid: lead.booking_confirmed?.advance_amount,
      total_paid: paidAmount,
      payment_mode: lead.booking_confirmed?.payment_mode,
      lead_source: lead.lead_source,
      priority: lead.priority,
      catering_required: lead.catering_required,
      decor_required: lead.decor_required,
      followup_count: lead.followup_count || 0,
      last_contacted: s(lead.last_contacted_at),
      next_followup: s(lead.next_followup_date),
      tasting_done: !!lead.food_tasting?.conducted_at,
      tasting_feedback: lead.food_tasting?.customer_feedback,
      preferred_menu: lead.food_tasting?.preferred_menu,
      site_visit_rating: lead.visited?.rating_from_customer,
      notes: lead.notes,
      is_converted: lead.is_converted,
      lost: lead.status === 'lost',
      on_hold: lead.status === 'on_hold',
      created_at: s(lead.created_at),
      status_history_length: lead.status_history?.length || 0,
    };

    // ── System prompt ───────────────────────────────────────────────────────
    const systemPrompt = `You are an expert banquet venue sales analyst for BanquetEase, a franchise banquet management system in India.

Analyse the provided lead data and return a structured JSON object with the following fields:
- ai_score: integer 0-100 representing conversion probability (100 = definite booking, 0 = lost)
- ai_score_label: one of "Hot Lead", "Warm Lead", "Cold Lead", "At Risk"
- ai_sentiment: one of "positive", "neutral", "negative"
- ai_suggested_action: a single clear, actionable next step (1-2 sentences, specific to this lead's current stage and data)
- ai_risk_factors: an array of 1-4 concise risk factor strings (or empty array if no significant risks)
- ai_summary: a 2-3 sentence brief summary of the lead's current standing and potential

Score guidelines:
- advance_paid / decoration_scheduled / paid stages: 75-95
- menu_selected: 60-80
- tasting_done / tasting_scheduled: 45-70
- visited: 35-60
- new: 20-50
- on_hold: 20-40
- lost: 0-15

Adjust score up for: high budget flexibility, catering+decor both required, positive tasting feedback, site visit done, advance paid, event soon (30-60 days away), premium event type (Wedding, Reception).
Adjust score down for: event very far (>120 days), no followup in >14 days, budget below quote, lost/on_hold status, very low guest count for venue type, no site visit done at stage > new.

Return ONLY valid JSON with no markdown, no explanation.`;

    const userPrompt = `Lead data:\n${JSON.stringify(leadContext, null, 2)}`;

    // ── Call Groq ───────────────────────────────────────────────────────────
    const aiResult = await invokeStructuredJSON(systemPrompt, userPrompt);

    const scoreLabel = (score) => {
      if (score >= 75) return 'Hot Lead';
      if (score >= 50) return 'Warm Lead';
      if (score >= 25) return 'Cold Lead';
      return 'At Risk';
    };

    const aiFields = {
      ai_score:            Number(aiResult.ai_score ?? 0),
      ai_score_label:      aiResult.ai_score_label || scoreLabel(Number(aiResult.ai_score ?? 0)),
      ai_sentiment:        aiResult.ai_sentiment || 'neutral',
      ai_suggested_action: aiResult.ai_suggested_action || '',
      ai_risk_factors:     Array.isArray(aiResult.ai_risk_factors) ? aiResult.ai_risk_factors : [],
      ai_summary:          aiResult.ai_summary || '',
      ai_score_updated_at: new Date().toISOString(),
    };

    // ── Write back to Firestore ─────────────────────────────────────────────
    await leadRef.update({
      ...aiFields,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, ...aiFields });
  } catch (err) {
    console.error('[AI Analyze Lead]', err);
    return NextResponse.json(
      { error: err.message || 'AI analysis failed' },
      { status: 500 }
    );
  }
}
