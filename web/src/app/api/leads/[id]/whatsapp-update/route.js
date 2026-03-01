/**
 * POST /api/leads/[id]/whatsapp-update
 *
 * Sends a WhatsApp status update message to the lead's phone number via WATI.
 *
 * Body: {
 *   franchise_id: string,
 *   branch_id:    string,
 *   message?:     string   // optional custom message; auto-built from lead data if omitted
 * }
 */

import { getAdminDb }             from '@/lib/firebase-admin';
import { NextResponse }           from 'next/server';
import { sendSessionMessage, buildLeadUpdateMessage, normalizePhone } from '@/lib/wati-client';

export async function POST(request, { params }) {
  try {
    const { id: lead_id } = await params;
    const body = await request.json();
    const { franchise_id, branch_id, message: customMessage } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json(
        { error: 'franchise_id and branch_id are required' },
        { status: 400 }
      );
    }

    // ── Fetch lead ───────────────────────────────────────────────────────────
    const adminDb = getAdminDb();
    const snap = await adminDb.collection('leads').doc(lead_id).get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = { id: snap.id, ...snap.data() };

    if (!lead.phone) {
      return NextResponse.json(
        { error: 'No phone number on this lead' },
        { status: 422 }
      );
    }

    // Verify phone can be normalised
    const normalised = normalizePhone(lead.phone);
    if (!normalised || normalised.length < 11) {
      return NextResponse.json(
        { error: `Phone number "${lead.phone}" could not be normalised to a valid WhatsApp number` },
        { status: 422 }
      );
    }

    // ── Build message ────────────────────────────────────────────────────────
    const message = customMessage?.trim() || buildLeadUpdateMessage(lead);

    // ── Send via WATI ────────────────────────────────────────────────────────
    const result = await sendSessionMessage(lead.phone, message);

    return NextResponse.json({
      success: true,
      whatsapp_number: normalised,
      wati_result: result,
    });
  } catch (err) {
    console.error('[WhatsApp Update]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
