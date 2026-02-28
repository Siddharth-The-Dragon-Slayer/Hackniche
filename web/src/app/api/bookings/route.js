import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { cache } from '@/lib/cache';

/* ══════════════════════════════════════════════════════════════════
   BOOKINGS API — /api/bookings
   GET  → list bookings (by franchise/branch, optional date/hall)
   POST → create booking from a lead OR standalone
═══════════════════════════════════════════════════════════════════ */

const BOOKING_STATUSES = ['confirmed','in_progress','completed','cancelled'];
const TTL = 120_000;
const invalidate = pfx => cache.keys().filter(k => k.startsWith(pfx)).forEach(k => cache.delete(k));

/* ── GET: list bookings ── */
export async function GET(req) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const franchise_id = searchParams.get('franchise_id') || 'pfd';
    const branch_id    = searchParams.get('branch_id') || 'pfd_b1';
    const hall_id      = searchParams.get('hall_id');
    const status       = searchParams.get('status');
    const from_date    = searchParams.get('from_date');
    const to_date      = searchParams.get('to_date');

    const cacheKey = `bookings:${franchise_id}:${branch_id}:${hall_id||''}:${status||''}:${from_date||''}:${to_date||''}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    let q = adminDb.collection('bookings')
      .where('franchise_id', '==', franchise_id)
      .where('branch_id', '==', branch_id);

    if (status && BOOKING_STATUSES.includes(status)) q = q.where('status', '==', status);
    if (hall_id) q = q.where('hall_id', '==', hall_id);

    const snap = await q.orderBy('event_date', 'desc').limit(500).get();
    let bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Client-side date filtering (Firestore doesn't support multi-range easily)
    if (from_date) bookings = bookings.filter(b => b.event_date >= from_date);
    if (to_date)   bookings = bookings.filter(b => b.event_date <= to_date);

    const result = { bookings, total: bookings.length };
    cache.set(cacheKey, result, TTL);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[GET /api/bookings]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── POST: create booking ── */
export async function POST(req) {
  try {
    const adminDb = getAdminDb();
    const body = await req.json();
    const { franchise_id = 'pfd', branch_id = 'pfd_b1', lead_id, ...rest } = body;

    let bookingData = {};

    if (lead_id) {
      // ── Create from lead: pull data from lead document ──
      const leadRef = adminDb.collection('leads').doc(lead_id);
      const leadSnap = await leadRef.get();
      if (!leadSnap.exists) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      const lead = leadSnap.data();

      const advPaid = lead.booking_confirmed?.advance_amount || 0;
      const quoteTotal = lead.quote?.total_estimated || 0;

      bookingData = {
        lead_id,
        franchise_id: lead.franchise_id || franchise_id,
        branch_id: lead.branch_id || branch_id,
        customer_name: lead.customer_name,
        phone: lead.phone,
        email: lead.email || null,
        event_type: lead.event_type,
        event_date: lead.event_date,
        event_start_time: lead.event_start_time || null,
        event_end_time: lead.event_end_time || null,
        hall_id: lead.hall_id || null,
        hall_name: lead.hall_name || null,
        expected_guest_count: lead.expected_guest_count || null,
        final_guest_count: lead.event_finalization?.final_guest_count || null,
        menu: lead.menu_finalization ? {
          name: lead.menu_finalization.finalized_menu_name,
          per_plate_cost: lead.menu_finalization.final_per_plate_cost,
          plates: lead.menu_finalization.expected_plates,
          total: lead.menu_finalization.total_food_cost,
        } : null,
        decor: lead.event_finalization ? {
          theme: lead.event_finalization.decoration_theme,
          partner: lead.event_finalization.decoration_partner,
          cost: lead.event_finalization.decoration_cost,
        } : null,
        payments: {
          quote_total: quoteTotal,
          advance_amount: advPaid,
          advance_date: lead.booking_confirmed?.advance_payment_date || null,
          advance_mode: lead.booking_confirmed?.payment_mode || null,
          total_paid: advPaid + (lead.final_payment?.remaining_amount || 0),
          balance_due: quoteTotal - advPaid - (lead.final_payment?.remaining_amount || 0),
          payment_history: [
            ...(advPaid > 0 ? [{
              date: lead.booking_confirmed?.advance_payment_date,
              amount: advPaid,
              mode: lead.booking_confirmed?.payment_mode,
              type: 'advance',
              ref: lead.booking_confirmed?.transaction_ref,
            }] : []),
            ...(lead.final_payment?.remaining_amount ? [{
              date: lead.final_payment.payment_date,
              amount: lead.final_payment.remaining_amount,
              mode: lead.final_payment.payment_mode,
              type: 'balance',
              ref: lead.final_payment.transaction_ref,
            }] : []),
          ],
        },
        status: 'confirmed',
        event_locked: false,
        checklist: [],
        vendors: [],
        staff_assigned: [],
        notes: rest.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // ── Standalone booking ──
      if (!rest.customer_name || !rest.phone || !rest.event_date) {
        return NextResponse.json({ error: 'customer_name, phone, event_date required' }, { status: 400 });
      }
      bookingData = {
        lead_id: null,
        franchise_id, branch_id,
        customer_name: rest.customer_name,
        phone: rest.phone,
        email: rest.email || null,
        event_type: rest.event_type || null,
        event_date: rest.event_date,
        event_start_time: rest.event_start_time || null,
        event_end_time: rest.event_end_time || null,
        hall_id: rest.hall_id || null,
        hall_name: rest.hall_name || null,
        expected_guest_count: rest.expected_guest_count || null,
        final_guest_count: null,
        menu: rest.menu || null,
        decor: rest.decor || null,
        payments: {
          quote_total: Number(rest.quote_total || 0),
          advance_amount: Number(rest.advance_amount || 0),
          advance_date: rest.advance_date || null,
          advance_mode: rest.advance_mode || null,
          total_paid: Number(rest.advance_amount || 0),
          balance_due: Number(rest.quote_total || 0) - Number(rest.advance_amount || 0),
          payment_history: rest.advance_amount ? [{
            date: rest.advance_date || new Date().toISOString().slice(0, 10),
            amount: Number(rest.advance_amount),
            mode: rest.advance_mode || 'cash',
            type: 'advance',
            ref: rest.advance_ref || null,
          }] : [],
        },
        status: 'confirmed',
        event_locked: false,
        checklist: [],
        vendors: [],
        staff_assigned: [],
        notes: rest.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // ── Conflict check: same hall + same date ──
    if (bookingData.hall_id && bookingData.event_date) {
      const conflict = await adminDb.collection('bookings')
        .where('franchise_id', '==', bookingData.franchise_id)
        .where('branch_id', '==', bookingData.branch_id)
        .where('hall_id', '==', bookingData.hall_id)
        .where('event_date', '==', bookingData.event_date)
        .where('status', 'in', ['confirmed', 'in_progress'])
        .limit(1).get();
      if (!conflict.empty) {
        return NextResponse.json({
          error: `Hall "${bookingData.hall_name || bookingData.hall_id}" is already booked for ${bookingData.event_date}`,
          conflict: true,
        }, { status: 409 });
      }
    }

    // ── Write booking ──
    const ref = adminDb.collection('bookings').doc();
    await ref.set(bookingData);

    // ── Link to lead ──
    if (lead_id) {
      await adminDb.collection('leads').doc(lead_id).update({
        booking_id: ref.id,
        updated_at: new Date().toISOString(),
      });
    }

    invalidate(`bookings:${franchise_id}:${branch_id}`);
    return NextResponse.json({ message: 'Booking created', booking_id: ref.id }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/bookings]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
