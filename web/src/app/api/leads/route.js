/**
 * GET  /api/leads?franchise_id=pfd&branch_id=pfd_b1[&status=new]
 *   → list leads for a branch, optionally filtered by status
 *
 * GET  /api/leads?customer_uid=xxx
 *   → list leads submitted by a specific customer (by customer_uid)
 *
 * POST /api/leads
 *   body: { franchise_id, branch_id, customer_name, phone, email,
 *           event_type, event_date, expected_guest_count, budget_range,
 *           hall_id, hall_name, assigned_to_uid, assigned_to_name,
 *           customer_uid (optional — set when customer submits own enquiry) }
 *   → create a new lead with status "new"
 *
 * Access:
 *   super_admin     → any franchise / any branch
 *   franchise_admin → own franchise, any branch
 *   branch_manager  → own franchise + own branch
 *   sales_executive → own branch (create + view)
 *   receptionist    → own branch (create + view)
 *   customer        → own leads only (by customer_uid)
 */

import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// Cache key helpers
const listKey  = (fid, bid)        => `leads:${fid}:${bid}:list`;
const statusKey = (fid, bid, status) => `leads:${fid}:${bid}:${status}`;
const LEAD_TTL = 120; // 2 minutes — leads change frequently

/** Firestore reference to the top-level leads collection */
function leadsCol() {
  return collection(db, 'leads');
}

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');
    const status       = searchParams.get('status') || null;
    const customer_uid = searchParams.get('customer_uid') || null;

    // ── Customer mode: query by customer_uid ──────────────────────────────
    if (customer_uid) {
      const cKey = `leads:customer:${customer_uid}`;
      const cached = cache.get(cKey);
      if (cached) return NextResponse.json({ ...cached, cached: true });

      const snap = await getDocs(
        query(leadsCol(), where('customer_uid', '==', customer_uid))
      );
      const leads = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id, ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
          updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
        };
      });
      leads.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      const payload = { leads, total: leads.length, customer_uid };
      cache.set(cKey, payload, LEAD_TTL);
      return NextResponse.json(payload);
    }

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id are required (or customer_uid for customer mode)' }, { status: 400 });
    }

    // Cache lookup
    const cKey = status ? statusKey(franchise_id, branch_id, status) : listKey(franchise_id, branch_id);
    const cached = cache.get(cKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    // Query only by branch_id (single-field index, always works without composite index).
    // Filter franchise_id + status client-side to avoid any composite-index requirement.
    const snap = await getDocs(query(leadsCol(), where('branch_id', '==', branch_id)));

    let leads = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() ?? null,
        updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
      };
    });

    // Client-side filters
    leads = leads.filter(l => l.franchise_id === franchise_id);
    if (status) leads = leads.filter(l => l.status === status);
    leads.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    const payload = {
      leads,
      total: leads.length,
      franchise_id,
      branch_id,
      filter_status: status,
    };

    cache.set(cKey, payload, LEAD_TTL);
    return NextResponse.json(payload);

  } catch (err) {
    console.error('[GET /api/leads]', err);
    return NextResponse.json({ error: 'Failed to fetch leads', details: err.message }, { status: 500 });
  }
}

// ── POST ───────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      franchise_id, branch_id,
      customer_name, phone, email,
      event_type, event_date, expected_guest_count, budget_range,
      hall_id, hall_name,
      assigned_to_uid, assigned_to_name,
      customer_uid,
    } = body;

    // Validate required fields
    const missing = [];
    if (!franchise_id)    missing.push('franchise_id');
    if (!branch_id)       missing.push('branch_id');
    if (!customer_name)   missing.push('customer_name');
    if (!phone)           missing.push('phone');
    if (!event_type)      missing.push('event_type');
    if (!event_date)      missing.push('event_date');
    if (!expected_guest_count) missing.push('expected_guest_count');

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    const now = serverTimestamp();
    const leadData = {
      franchise_id,
      branch_id,
      status: 'new',

      // Customer info
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,

      // Event details
      event_type,
      event_date,
      expected_guest_count: Number(expected_guest_count),
      budget_range: budget_range || null,

      // Hall
      hall_id:   hall_id   || null,
      hall_name: hall_name || null,

      // Assignment
      assigned_to_uid:  assigned_to_uid  || null,
      assigned_to_name: assigned_to_name || null,

      // Customer self-service (set when the customer submits their own enquiry)
      customer_uid: customer_uid || null,

      // Stage-specific nested objects (all null at creation)
      follow_ups:          [],
      visited:             null,
      food_tasting:        null,
      menu_finalization:   null,
      booking_confirmed:   null,
      event_finalization:  null,
      final_payment:       null,
      event_execution:     null,
      post_event_settlement: null,
      feedback:            null,

      created_at: now,
      updated_at: now,
    };

    const docRef = await addDoc(leadsCol(), leadData);

    // Invalidate list cache
    cache.del(listKey(franchise_id, branch_id));
    cache.del(statusKey(franchise_id, branch_id, 'new'));
    if (customer_uid) cache.del(`leads:customer:${customer_uid}`);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Lead created successfully',
    }, { status: 201 });

  } catch (err) {
    console.error('[POST /api/leads]', err);
    return NextResponse.json({ error: 'Failed to create lead', details: err.message }, { status: 500 });
  }
}
