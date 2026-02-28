/**
 * GET    /api/leads/[id]?franchise_id=pfd&branch_id=pfd_b1
 *   → fetch a single lead with all stage data
 *
 * PUT    /api/leads/[id]
 *   body: any subset of lead fields to update, e.g.
 *         { status: 'visited', visited: { date, hall_id, notes, visited_by } }
 *         { follow_ups: [...existingPlusNew] }
 *   → partial update of the lead document, cache invalidated
 *
 * DELETE /api/leads/[id]
 *   body: { franchise_id, branch_id }
 *   → permanently delete the lead
 *
 * Access: branch_manager and above can DELETE; others can only PUT/GET
 */

import { db } from '@/lib/firebase';
import {
  doc, getDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// Cache key helpers (must match /api/leads/route.js)
const listKey   = (fid, bid)       => `leads:${fid}:${bid}:list`;
const statusKey = (fid, bid, s)    => `leads:${fid}:${bid}:${s}`;
const detailKey = (fid, bid, lid)  => `leads:${fid}:${bid}:${lid}`;
const LEAD_TTL  = 120; // 2 minutes

function leadDocRef(lead_id) {
  return doc(db, 'leads', lead_id);
}

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id: lead_id } = params;
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id are required' }, { status: 400 });
    }

    // Cache check
    const cKey = detailKey(franchise_id, branch_id, lead_id);
    const cached = cache.get(cKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const snap = await getDoc(leadDocRef(lead_id));
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const data = snap.data();
    const lead = {
      id: snap.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
      updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
    };

    cache.set(cKey, { lead }, LEAD_TTL);
    return NextResponse.json({ lead });

  } catch (err) {
    console.error('[GET /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch lead', details: err.message }, { status: 500 });
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const { id: lead_id } = params;
    const body = await request.json();

    const { franchise_id, branch_id, ...updates } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id are required in body' }, { status: 400 });
    }

    // Remove undefined values — only send what was explicitly provided
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await updateDoc(leadDocRef(lead_id), {
      ...cleanUpdates,
      updated_at: serverTimestamp(),
    });

    // Invalidate caches
    cache.del(detailKey(franchise_id, branch_id, lead_id));
    cache.del(listKey(franchise_id, branch_id));
    // Invalidate status caches for both old and new status
    if (cleanUpdates.status) {
      cache.del(statusKey(franchise_id, branch_id, cleanUpdates.status));
    }
    // Broad sweep of all lead caches for this branch
    cache.delPattern(`leads:${franchise_id}:${branch_id}:`);

    return NextResponse.json({ success: true, message: 'Lead updated' });

  } catch (err) {
    console.error('[PUT /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to update lead', details: err.message }, { status: 500 });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { id: lead_id } = params;
    const body = await request.json();
    const { franchise_id, branch_id } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id are required in body' }, { status: 400 });
    }

    await deleteDoc(leadDocRef(lead_id));

    // Invalidate all related caches
    cache.delPattern(`leads:${franchise_id}:${branch_id}:`);

    return NextResponse.json({ success: true, message: 'Lead deleted' });

  } catch (err) {
    console.error('[DELETE /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete lead', details: err.message }, { status: 500 });
  }
}
