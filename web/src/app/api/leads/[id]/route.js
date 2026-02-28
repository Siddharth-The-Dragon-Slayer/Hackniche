/**
 * GET    /api/leads/[id]?franchise_id=pfd&branch_id=pfd_b1
 * PUT    /api/leads/[id]  — action-based stage progression + generic updates
 * DELETE /api/leads/[id]  — permanently delete
 *
 * Pipeline:
 *   new → visited → tasting_scheduled → tasting_done → menu_selected →
 *   advance_paid → decoration_scheduled → full_payment_pending → paid →
 *   in_progress → completed → settlement_pending → settlement_complete →
 *   feedback_pending → closed   |  lost  |  on_hold (at any stage)
 *
 * Stage Actions (PUT):
 *   log_visit           – Stage 2 : property visit data
 *   schedule_tasting    – Stage 3a: set food tasting date
 *   complete_tasting    – Stage 3b: record dish ratings + feedback
 *   finalize_menu       – Stage 4 : select menu + generate quote
 *   record_advance      – Stage 5 : advance payment received
 *   finalize_decoration – Stage 6 : decoration + event finalization
 *   record_full_payment – Stage 7 : remaining payment + lock event
 *   start_event         – Stage 8a: mark in_progress
 *   complete_event      – Stage 8b: event execution data
 *   settle_event        – Stage 9 : post-event settlement
 *   close_lead          – Stage 10: feedback + close
 *   reactivate          – Reopen from on_hold
 *   add_followup        – Log call/visit/whatsapp follow-up
 *   mark_lost           – Lost at any stage
 *   put_on_hold         – Pause at any stage
 *   status_change       – Manager override for any status
 */

import { getAdminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

const listKey   = (fid, bid)       => `leads:${fid}:${bid}:list`;
const statusKey = (fid, bid, s)    => `leads:${fid}:${bid}:${s}`;
const detailKey = (fid, bid, lid)  => `leads:${fid}:${bid}:${lid}`;
const LEAD_TTL  = 120;

const s = (v) => v?.toDate?.()?.toISOString() ?? v ?? null;

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id: lead_id } = await params;
    const { searchParams } = new URL(request.url);
    const franchise_id = searchParams.get('franchise_id');
    const branch_id    = searchParams.get('branch_id');

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id required' }, { status: 400 });
    }

    const cKey = detailKey(franchise_id, branch_id, lead_id);
    const cached = cache.get(cKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const adminDb = getAdminDb();

    // Parallel: lead doc + activities + follow-ups
    const [leadSnap, activitiesSnap, followupsSnap] = await Promise.all([
      adminDb.collection('leads').doc(lead_id).get(),
      adminDb.collection('lead_activities').where('lead_id', '==', lead_id).orderBy('created_at', 'desc').limit(50).get(),
      adminDb.collection('follow_ups').where('lead_id', '==', lead_id).orderBy('scheduled_date', 'desc').limit(30).get(),
    ]);

    if (!leadSnap.exists) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const data = leadSnap.data();
    const lead = {
      id: leadSnap.id, ...data,
      created_at: s(data.created_at), updated_at: s(data.updated_at),
      next_followup_date: s(data.next_followup_date),
      converted_at: s(data.converted_at), last_contacted_at: s(data.last_contacted_at),
    };

    const activities = activitiesSnap.docs.map(d => {
      const ad = d.data();
      return { id: d.id, ...ad, created_at: s(ad.created_at) };
    });

    const follow_ups = followupsSnap.docs.map(d => {
      const fd = d.data();
      return {
        id: d.id, ...fd,
        scheduled_date: s(fd.scheduled_date), done_at: s(fd.done_at),
        created_at: s(fd.created_at), next_followup_date: s(fd.next_followup_date),
      };
    });

    const result = { lead, activities, follow_ups };
    cache.set(cKey, result, LEAD_TTL);
    return NextResponse.json(result);

  } catch (err) {
    console.error('[GET /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch lead', details: err.message }, { status: 500 });
  }
}

// ── helpers ────────────────────────────────────────────────────────────────
function act(adminDb, batch, lead_id, franchise_id, branch_id, type, desc, uid, name, meta) {
  const ref = adminDb.collection('lead_activities').doc();
  batch.set(ref, {
    lead_id, franchise_id, branch_id,
    activity_type: type, description: desc,
    performed_by_uid: uid || null, performed_by_name: name || null,
    metadata: meta || null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function histEntry(status, uid, note) {
  return { status, changed_at: new Date().toISOString(), changed_by: uid || null, note: note || '' };
}

function branchStat(adminDb, batch, branch_id, from, to, now) {
  try {
    const ref = adminDb.collection('branches').doc(branch_id);
    const upd = { '_stats.last_updated_at': now };
    if (from) upd[`_stats.leads_by_status.${from}`] = admin.firestore.FieldValue.increment(-1);
    if (to)   upd[`_stats.leads_by_status.${to}`]   = admin.firestore.FieldValue.increment(1);
    batch.update(ref, upd);
  } catch (_) { /* non-critical */ }
}

// ── PUT ────────────────────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const { id: lead_id } = await params;
    const body = await request.json();
    const { franchise_id, branch_id, action, ...updates } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = adminDb.batch();
    const leadRef = adminDb.collection('leads').doc(lead_id);

    // Get current lead for status transition logic
    const currentSnap = await leadRef.get();
    if (!currentSnap.exists) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    const current = currentSnap.data();

    const { performed_by_uid: puid, performed_by_name: pname } = updates;

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 2 – LOG PROPERTY VISIT  →  status: visited
    // Roles: sales_executive, branch_manager, receptionist
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'log_visit') {
      const { visit_date, hall_id, hall_name, notes, customer_rating, visited_by } = updates;
      if (!visit_date) return NextResponse.json({ error: 'visit_date required' }, { status: 400 });

      batch.update(leadRef, {
        status: 'visited',
        hall_id: hall_id || current.hall_id || null,
        hall_name: hall_name || current.hall_name || null,
        visited: {
          date: visit_date, hall_id: hall_id || null, hall_name: hall_name || null,
          visited_by: visited_by || pname || null, notes: notes || null,
          rating_from_customer: customer_rating ? Number(customer_rating) : null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('visited', puid, `Visit logged — ${hall_name || ''}`)),
        updated_at: now,
      });
      // Build metadata without undefined values
      const metadata = {};
      if (hall_id) metadata.hall_id = hall_id;
      if (customer_rating) metadata.customer_rating = customer_rating;
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'visit_completed',
        `Property visit completed — ${hall_name || 'hall'}. Rating: ${customer_rating || 'N/A'}`,
        puid, pname, Object.keys(metadata).length > 0 ? metadata : null);
      branchStat(adminDb, batch, branch_id, current.status, 'visited', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Property visit logged → Visited' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 3a – SCHEDULE FOOD TASTING  →  status: tasting_scheduled
    // Roles: kitchen_manager, sales_executive, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'schedule_tasting') {
      const { tasting_date, menu_options_to_present, notes } = updates;
      if (!tasting_date) return NextResponse.json({ error: 'tasting_date required' }, { status: 400 });

      batch.update(leadRef, {
        status: 'tasting_scheduled',
        food_tasting: {
          scheduled_date: tasting_date,
          menu_options_presented: menu_options_to_present || [],
          notes: notes || null, conducted_at: null, dishes_sampled: [],
          customer_feedback: null, preferred_menu: null, kitchen_manager: null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('tasting_scheduled', puid, `Tasting scheduled for ${tasting_date}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'tasting_scheduled',
        `Food tasting scheduled for ${tasting_date}`, puid, pname, { tasting_date, menu_options_to_present });
      branchStat(adminDb, batch, branch_id, current.status, 'tasting_scheduled', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Food tasting scheduled' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 3b – COMPLETE FOOD TASTING  →  status: tasting_done
    // Roles: kitchen_manager, sales_executive
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'complete_tasting') {
      const { dishes_sampled, customer_feedback, preferred_menu, kitchen_manager } = updates;

      const existingTasting = current.food_tasting || {};
      batch.update(leadRef, {
        status: 'tasting_done',
        food_tasting: {
          ...existingTasting,
          conducted_at: new Date().toISOString(),
          dishes_sampled: dishes_sampled || [],
          customer_feedback: customer_feedback || null,
          preferred_menu: preferred_menu || null,
          kitchen_manager: kitchen_manager || pname || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('tasting_done', puid, `Tasting done. Preferred: ${preferred_menu || 'TBD'}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'tasting_completed',
        `Food tasting completed. Preferred: ${preferred_menu || 'TBD'}. Feedback: ${customer_feedback || 'None'}`,
        puid, pname, { preferred_menu, dishes_count: dishes_sampled?.length });
      branchStat(adminDb, batch, branch_id, current.status, 'tasting_done', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Food tasting recorded → Tasting Done' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 4 – FINALIZE MENU + GENERATE QUOTE  →  status: menu_selected
    // Roles: kitchen_manager, sales_executive, accountant
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'finalize_menu') {
      const { menu_id, menu_name, per_plate_cost, expected_plates, customizations,
              hall_rent, food_cost, decor_estimate, valid_till } = updates;
      if (!menu_name || !per_plate_cost) {
        return NextResponse.json({ error: 'menu_name and per_plate_cost required' }, { status: 400 });
      }

      const plates = Number(expected_plates || current.expected_guest_count || 0);
      const foodTotal = Number(food_cost || (Number(per_plate_cost) * plates));
      const hallRent = Number(hall_rent || 0);
      const decorEst = Number(decor_estimate || 0);
      const totalEstimated = hallRent + foodTotal + decorEst;

      batch.update(leadRef, {
        status: 'menu_selected',
        menu_finalization: {
          finalized_menu_id: menu_id || null, finalized_menu_name: menu_name,
          finalized_date: new Date().toISOString(),
          customizations: customizations || [],
          final_per_plate_cost: Number(per_plate_cost),
          expected_plates: plates, total_food_cost: foodTotal,
        },
        quote: {
          hall_base_rent: hallRent, food_cost: foodTotal,
          decoration_budget_estimated: decorEst,
          total_estimated: totalEstimated,
          quote_valid_till: valid_till || null,
          generated_at: new Date().toISOString(),
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('menu_selected', puid, `Menu: ${menu_name}, Total: ₹${totalEstimated.toLocaleString()}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'menu_finalized',
        `Menu finalized: ${menu_name} — ₹${per_plate_cost}/plate × ${plates} = ₹${foodTotal.toLocaleString()}. Quote: ₹${totalEstimated.toLocaleString()}`,
        puid, pname, { menu_name, per_plate_cost, plates, total_estimated: totalEstimated });
      branchStat(adminDb, batch, branch_id, current.status, 'menu_selected', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: `Menu finalized. Quote: ₹${totalEstimated.toLocaleString()}` });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 5 – RECORD ADVANCE PAYMENT  →  status: advance_paid
    // Roles: accountant, receptionist, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'record_advance') {
      const { advance_amount, payment_date, payment_mode, transaction_ref, confirmed_by } = updates;
      if (!advance_amount || !payment_date) {
        return NextResponse.json({ error: 'advance_amount and payment_date required' }, { status: 400 });
      }

      batch.update(leadRef, {
        status: 'advance_paid',
        booking_confirmed: {
          date: new Date().toISOString(),
          advance_amount: Number(advance_amount),
          advance_payment_date: payment_date,
          payment_mode: payment_mode || 'cash',
          transaction_ref: transaction_ref || null,
          confirmed_by: confirmed_by || pname || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('advance_paid', puid, `Advance ₹${Number(advance_amount).toLocaleString()} received via ${payment_mode || 'cash'}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'advance_paid',
        `Advance payment of ₹${Number(advance_amount).toLocaleString()} received via ${payment_mode || 'cash'}. Ref: ${transaction_ref || 'N/A'}`,
        puid, pname, { advance_amount: Number(advance_amount), payment_mode, transaction_ref });
      branchStat(adminDb, batch, branch_id, current.status, 'advance_paid', now);

      // Audit log
      const auditRef = adminDb.collection('audit_logs').doc();
      batch.set(auditRef, {
        entity_type: 'lead', entity_id: lead_id, action: 'advance_payment',
        franchise_id, branch_id,
        performed_by_uid: puid || null, performed_by_name: pname || null,
        details: { advance_amount: Number(advance_amount), payment_mode, transaction_ref },
        created_at: now,
      });

      // ── Auto-create BOOKING from lead data ───────────────────────────
      const advAmt = Number(advance_amount);
      const quoteData = current.quote || {};
      const menuData  = current.menu_finalization || {};
      const eventFin  = current.event_finalization || {};
      const quoteTotal = Number(quoteData.total_estimated || 0);

      const bookingRef = adminDb.collection('bookings').doc();
      const bookingDoc = {
        lead_id,
        franchise_id,
        branch_id,
        customer_name: current.customer_name || current.name || '',
        customer_phone: current.customer_phone || current.phone || '',
        customer_email: current.customer_email || current.email || '',
        event_type: current.event_type || 'wedding',
        event_date: current.event_date || null,
        event_time: current.event_time || null,
        hall_id: current.hall_id || null,
        hall_name: current.hall_name || null,
        expected_guest_count: Number(current.expected_guest_count || eventFin.final_guest_count || 0),
        menu: {
          name: menuData.finalized_menu_name || null,
          per_plate_cost: Number(menuData.final_per_plate_cost || 0),
          plates: Number(menuData.expected_plates || current.expected_guest_count || 0),
          total: Number(menuData.total_food_cost || 0),
        },
        decor: {
          theme: eventFin.decoration_theme || null,
          partner: eventFin.decoration_partner || null,
          cost: Number(eventFin.decoration_cost || 0),
        },
        payments: {
          quote_total: quoteTotal,
          advance_amount: advAmt,
          total_paid: advAmt,
          balance_due: Math.max(quoteTotal - advAmt, 0),
          payment_history: [{
            amount: advAmt,
            date: payment_date,
            mode: payment_mode || 'cash',
            ref: transaction_ref || null,
            type: 'advance',
            recorded_by: pname || null,
          }],
        },
        status: 'confirmed',
        event_locked: false,
        checklist: [],
        vendors: [],
        staff_assigned: [],
        notes: current.notes || '',
        created_by_uid: puid || null,
        created_by_name: pname || null,
        created_at: now,
        updated_at: now,
      };
      batch.set(bookingRef, bookingDoc);

      // ── Auto-create INVOICE from booking data ────────────────────────
      const taxRate = 0.18;
      const lineItems = [];
      if (menuData.total_food_cost) {
        lineItems.push({ description: `Food – ${menuData.finalized_menu_name || 'Menu'}`, qty: Number(menuData.expected_plates || 1), rate: Number(menuData.final_per_plate_cost || 0), amount: Number(menuData.total_food_cost) });
      }
      if (quoteData.hall_base_rent) {
        lineItems.push({ description: `Hall Rent – ${current.hall_name || 'Hall'}`, qty: 1, rate: Number(quoteData.hall_base_rent), amount: Number(quoteData.hall_base_rent) });
      }
      if (eventFin.decoration_cost) {
        lineItems.push({ description: `Decoration – ${eventFin.decoration_theme || 'Custom'}`, qty: 1, rate: Number(eventFin.decoration_cost), amount: Number(eventFin.decoration_cost) });
      }
      const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
      const taxAmount = Math.round(subtotal * taxRate);
      const invoiceTotal = subtotal + taxAmount;

      // Sequential invoice number
      const lastInvSnap = await adminDb.collection('invoices')
        .where('franchise_id', '==', franchise_id)
        .orderBy('created_at', 'desc').limit(1).get();
      let invSeq = 1001;
      if (!lastInvSnap.empty) {
        const lastNum = lastInvSnap.docs[0].data().invoice_number || '';
        const parsed = parseInt(lastNum.replace('INV-', ''), 10);
        if (!isNaN(parsed)) invSeq = parsed + 1;
      }

      const invoiceRef = adminDb.collection('invoices').doc();
      const invoiceDoc = {
        invoice_number: `INV-${String(invSeq).padStart(5, '0')}`,
        booking_id: bookingRef.id,
        lead_id,
        franchise_id,
        branch_id,
        customer_name: bookingDoc.customer_name,
        customer_phone: bookingDoc.customer_phone,
        customer_email: bookingDoc.customer_email,
        event_type: bookingDoc.event_type,
        event_date: bookingDoc.event_date,
        line_items: lineItems,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount: 0,
        total: invoiceTotal,
        amount_paid: advAmt,
        balance_due: Math.max(invoiceTotal - advAmt, 0),
        payment_history: [{
          amount: advAmt,
          date: payment_date,
          mode: payment_mode || 'cash',
          ref: transaction_ref || null,
          type: 'advance',
          recorded_by: pname || null,
        }],
        status: advAmt >= invoiceTotal ? 'paid' : 'sent',
        due_date: current.event_date || null,
        notes: '',
        created_by_uid: puid || null,
        created_by_name: pname || null,
        created_at: now,
        updated_at: now,
      };
      batch.set(invoiceRef, invoiceDoc);

      // Link booking_id + invoice_id back to lead
      batch.update(leadRef, {
        booking_id: bookingRef.id,
        invoice_id: invoiceRef.id,
      });

      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({
        success: true,
        booking_id: bookingRef.id,
        invoice_id: invoiceRef.id,
        message: `Advance ₹${advAmt.toLocaleString()} recorded → Advance Paid. Booking & Invoice auto-created.`,
      });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 6 – FINALIZE DECORATION & EVENT  →  status: decoration_scheduled
    // Roles: operations_staff, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'finalize_decoration') {
      const { final_guest_count, decor_theme, decor_partner, decor_cost,
              setup_date, teardown_date, special_requests, final_food_cost, final_per_plate } = updates;

      const plates = Number(final_guest_count || current.expected_guest_count || 0);
      const ppCost = Number(final_per_plate || current.menu_finalization?.final_per_plate_cost || 0);
      const foodFinal = Number(final_food_cost || (plates * ppCost));

      batch.update(leadRef, {
        status: 'decoration_scheduled',
        event_finalization: {
          final_confirmed_date: current.event_date || null,
          final_guest_count: plates,
          final_per_plate_food: ppCost,
          final_food_cost: foodFinal,
          decoration_theme: decor_theme || null,
          decoration_partner: decor_partner || null,
          decoration_cost: Number(decor_cost || 0),
          setup_date: setup_date || null,
          teardown_date: teardown_date || null,
          special_requests: special_requests || null,
          finalized_at: new Date().toISOString(),
          finalized_by: pname || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('decoration_scheduled', puid, `Event finalized — ${decor_theme || 'TBD theme'}, ${plates} guests`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'event_finalized',
        `Event finalized: ${plates} guests, decor: ${decor_theme || 'TBD'}, partner: ${decor_partner || 'TBD'}`,
        puid, pname, { final_guest_count: plates, decor_theme, decor_partner });
      branchStat(adminDb, batch, branch_id, current.status, 'decoration_scheduled', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Decoration & event finalized → Decoration Scheduled' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 7 – RECORD FULL (REMAINING) PAYMENT  →  status: paid
    // Roles: accountant, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'record_full_payment') {
      const { remaining_amount, payment_date, payment_mode, transaction_ref } = updates;
      if (!remaining_amount || !payment_date) {
        return NextResponse.json({ error: 'remaining_amount and payment_date required' }, { status: 400 });
      }

      batch.update(leadRef, {
        status: 'paid',
        event_locked: true,
        locked_date: new Date().toISOString(),
        final_payment: {
          remaining_amount: Number(remaining_amount),
          due_date: current.event_finalization?.setup_date || null,
          payment_date,
          payment_mode: payment_mode || 'cash',
          transaction_ref: transaction_ref || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('paid', puid, `Full payment ₹${Number(remaining_amount).toLocaleString()} received. Event locked.`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'full_payment_received',
        `Full payment ₹${Number(remaining_amount).toLocaleString()} received via ${payment_mode || 'cash'}. Event locked. Ref: ${transaction_ref || 'N/A'}`,
        puid, pname, { remaining_amount: Number(remaining_amount), payment_mode, transaction_ref });
      branchStat(adminDb, batch, branch_id, current.status, 'paid', now);

      const auditRef = adminDb.collection('audit_logs').doc();
      batch.set(auditRef, {
        entity_type: 'lead', entity_id: lead_id, action: 'full_payment',
        franchise_id, branch_id,
        performed_by_uid: puid || null, performed_by_name: pname || null,
        details: { remaining_amount: Number(remaining_amount), payment_mode, transaction_ref },
        created_at: now,
      });

      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: `Full payment ₹${Number(remaining_amount).toLocaleString()} recorded → Paid & Locked` });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 8a – START EVENT  →  status: in_progress
    // Roles: operations_staff, kitchen_manager, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'start_event') {
      batch.update(leadRef, {
        status: 'in_progress',
        event_execution: { started_at: new Date().toISOString(), started_by: pname || null },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('in_progress', puid, 'Event started')),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'event_started',
        `Event started by ${pname || 'staff'}`, puid, pname);
      branchStat(adminDb, batch, branch_id, current.status, 'in_progress', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Event started → In Progress' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 8b – COMPLETE EVENT  →  status: completed
    // Roles: branch_manager, operations_staff, kitchen_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'complete_event') {
      const { actual_guest_count, start_time, end_time, problems_encountered,
              contingency_actions, staff_feedback, photos_taken } = updates;

      const existing = current.event_execution || {};
      batch.update(leadRef, {
        status: 'completed',
        event_execution: {
          ...existing,
          event_date: current.event_date || null,
          start_time: start_time || null, end_time: end_time || null,
          actual_guest_count: Number(actual_guest_count || 0),
          photos_taken: Number(photos_taken || 0),
          problems_encountered: problems_encountered || null,
          contingency_actions: contingency_actions || null,
          staff_feedback: staff_feedback || null,
          completed_at: new Date().toISOString(),
          completed_by: pname || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('completed', puid, `Event completed. Guests: ${actual_guest_count || 0}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'event_completed',
        `Event completed. ${actual_guest_count || 0} guests served. ${problems_encountered ? 'Issues: ' + problems_encountered : 'No issues.'}`,
        puid, pname, { actual_guest_count: Number(actual_guest_count || 0) });
      branchStat(adminDb, batch, branch_id, current.status, 'completed', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Event completed → Completed' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 9 – POST-EVENT SETTLEMENT  →  status: settlement_complete
    // Roles: accountant, operations_staff, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'settle_event') {
      const { final_guest_count, final_plates_served, leftover_refund_amount,
              extra_charges_amount, extra_charges_reason, total_final_amount,
              amount_paid, final_settlement_amount, settled_date } = updates;

      const advAmt  = current.booking_confirmed?.advance_amount || 0;
      const fullAmt = current.final_payment?.remaining_amount   || 0;
      const totalPaid = Number(amount_paid || (advAmt + fullAmt));

      batch.update(leadRef, {
        status: 'settlement_complete',
        post_event_settlement: {
          settlement_date: settled_date || new Date().toDateString(),
          final_guest_count: Number(final_guest_count || current.event_execution?.actual_guest_count || 0),
          final_plates_served: Number(final_plates_served || 0),
          leftover_refund: {
            plates_not_served: 0,
            refund_amount: Number(leftover_refund_amount || 0),
          },
          extra_charges: {
            reason: extra_charges_reason || null,
            amount: Number(extra_charges_amount || 0),
          },
          total_final_amount: Number(total_final_amount || 0),
          amount_paid: totalPaid,
          final_settlement: Number(final_settlement_amount || 0),
          settled_date: settled_date || new Date().toISOString().slice(0, 10),
          settled_by: pname || null,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('settlement_complete', puid, `Settled. Final: ₹${(total_final_amount || 0).toLocaleString()}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'settlement_done',
        `Post-event settlement complete. Total: ₹${(total_final_amount || 0).toLocaleString()}, Paid: ₹${totalPaid.toLocaleString()}, Balance: ₹${(final_settlement_amount || 0).toLocaleString()}`,
        puid, pname, { total_final_amount, amount_paid: totalPaid });
      branchStat(adminDb, batch, branch_id, current.status, 'settlement_complete', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Settlement complete' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STAGE 10 – COLLECT FEEDBACK & CLOSE LEAD  →  status: closed
    // Roles: sales_executive, receptionist, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'close_lead') {
      const { customer_rating, food_rating, ambiance_rating, service_rating,
              feedback_text, permission_for_testimonial, repeat_booking } = updates;

      const quote = current.quote || {};
      const extra = current.post_event_settlement?.extra_charges?.amount || 0;
      const lifetime_value = Number(current.post_event_settlement?.total_final_amount ||
        (quote.total_estimated || 0) + extra);

      batch.update(leadRef, {
        status: 'closed',
        is_converted: true,
        lifetime_value,
        lead_closed_date: new Date().toISOString(),
        feedback: {
          feedback_date: new Date().toISOString().slice(0, 10),
          customer_rating: customer_rating ? Number(customer_rating) : null,
          food_rating:     food_rating     ? Number(food_rating)     : null,
          ambiance_rating: ambiance_rating ? Number(ambiance_rating) : null,
          service_rating:  service_rating  ? Number(service_rating)  : null,
          feedback_text: feedback_text || null,
          permission_for_testimonial: permission_for_testimonial === true,
          repeat_booking: repeat_booking === true,
        },
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('closed', puid, `Closed. Rating: ${customer_rating || 'N/A'}/5. LTV: ₹${lifetime_value.toLocaleString()}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'lead_closed',
        `Lead closed. Customer rating: ${customer_rating || 'N/A'}/5. LTV: ₹${lifetime_value.toLocaleString()}. Repeat: ${repeat_booking ? 'Yes' : 'No'}`,
        puid, pname, { customer_rating, lifetime_value });
      branchStat(adminDb, batch, branch_id, current.status, 'closed', now);

      const auditRef = adminDb.collection('audit_logs').doc();
      batch.set(auditRef, {
        entity_type: 'lead', entity_id: lead_id, action: 'closed',
        franchise_id, branch_id,
        performed_by_uid: puid || null, performed_by_name: pname || null,
        details: { customer_rating, lifetime_value, repeat_booking },
        created_at: now,
      });

      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: `Lead closed ✅ LTV: ₹${lifetime_value.toLocaleString()}` });
    }

    // ══════════════════════════════════════════════════════════════════════
    // REACTIVATE  →  from on_hold back to previous_status
    // Roles: branch_manager, franchise_admin
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'reactivate') {
      const prevStatus = current.status_history?.slice().reverse()
        .find(h => h.status !== 'on_hold')?.status || 'new';

      batch.update(leadRef, {
        status: prevStatus,
        on_hold_reason: null, on_hold_until: null,
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry(prevStatus, puid, 'Reactivated from hold')),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'reactivated',
        `Lead reactivated from on_hold → ${prevStatus}`, puid, pname);
      branchStat(adminDb, batch, branch_id, 'on_hold', prevStatus, now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: `Lead reactivated → ${prevStatus}` });
    }

    // ══════════════════════════════════════════════════════════════════════
    // ADD FOLLOW-UP  (any stage)
    // Roles: all staff roles
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'add_followup') {
      const { scheduled_date, followup_type, outcome, notes: fuNotes,
              call_duration_mins, call_answered,
              next_followup_date: nextDate, next_followup_type: nextType } = updates;

      if (!scheduled_date || !followup_type) {
        return NextResponse.json({ error: 'scheduled_date and followup_type required' }, { status: 400 });
      }

      const fuRef = adminDb.collection('follow_ups').doc();
      batch.set(fuRef, {
        lead_id, franchise_id, branch_id, scheduled_date,
        followup_type, outcome: outcome || null, notes: fuNotes || null,
        call_duration_mins: call_duration_mins ? Number(call_duration_mins) : null,
        call_answered: call_answered ?? null,
        next_followup_date: nextDate || null, next_followup_type: nextType || null,
        done_by_user_id: puid || null, done_by_user_name: pname || null,
        done_at: now, is_overdue: false, created_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'followup_logged',
        `Follow-up: ${followup_type}${outcome ? ' — ' + outcome : ''}${fuNotes ? '. ' + fuNotes.slice(0, 100) : ''}`,
        puid, pname, { followup_type, outcome });

      const ldUpd = { followup_count: admin.firestore.FieldValue.increment(1), last_contacted_at: now, updated_at: now };
      if (nextDate) ldUpd.next_followup_date = nextDate;
      if (nextType) ldUpd.next_followup_type = nextType;
      batch.update(leadRef, ldUpd);

      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, followup_id: fuRef.id, message: 'Follow-up saved' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // MARK LOST  (any stage before closed)
    // Roles: sales_executive, branch_manager
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'mark_lost') {
      const { lost_reason, lost_detail, competitor_chosen } = updates;
      if (!lost_reason) return NextResponse.json({ error: 'lost_reason required' }, { status: 400 });

      batch.update(leadRef, {
        status: 'lost', lost_reason, lost_detail: lost_detail || null,
        competitor_chosen: competitor_chosen || null,
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('lost', puid, `Lost: ${lost_reason}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'lost',
        `Lead lost — ${lost_reason}${competitor_chosen ? ' (Competitor: ' + competitor_chosen + ')' : ''}`,
        puid, pname, { lost_reason, lost_detail, competitor_chosen });
      branchStat(adminDb, batch, branch_id, current.status, 'lost', now);

      const auditRef2 = adminDb.collection('audit_logs').doc();
      batch.set(auditRef2, {
        entity_type: 'lead', entity_id: lead_id, action: 'mark_lost',
        franchise_id, branch_id, performed_by_uid: puid || null, performed_by_name: pname || null,
        details: { lost_reason, lost_detail, competitor_chosen }, created_at: now,
      });

      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Lead marked as lost' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // PUT ON HOLD  (any stage)
    // Roles: branch_manager, franchise_admin
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'put_on_hold') {
      const { on_hold_reason, on_hold_until } = updates;
      if (!on_hold_reason || !on_hold_until) {
        return NextResponse.json({ error: 'on_hold_reason and on_hold_until required' }, { status: 400 });
      }

      batch.update(leadRef, {
        status: 'on_hold', on_hold_reason, on_hold_until,
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry('on_hold', puid, `On hold until ${on_hold_until}: ${on_hold_reason}`)),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'status_changed',
        `Lead put on hold until ${on_hold_until} — ${on_hold_reason}`, puid, pname);
      branchStat(adminDb, batch, branch_id, current.status, 'on_hold', now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: 'Lead put on hold' });
    }

    // ══════════════════════════════════════════════════════════════════════
    // STATUS CHANGE — manager override / correction
    // ══════════════════════════════════════════════════════════════════════
    if (action === 'status_change') {
      const { new_status, note } = updates;
      if (!new_status) return NextResponse.json({ error: 'new_status required' }, { status: 400 });

      batch.update(leadRef, {
        status: new_status,
        status_history: admin.firestore.FieldValue.arrayUnion(histEntry(new_status, puid, note || 'Manual status change')),
        updated_at: now,
      });
      act(adminDb, batch, lead_id, franchise_id, branch_id, 'status_changed',
        `Status: ${current.status} → ${new_status}${note ? ' — ' + note : ''}`, puid, pname,
        { old_status: current.status, new_status });
      branchStat(adminDb, batch, branch_id, current.status, new_status, now);
      await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
      return NextResponse.json({ success: true, message: `Status changed to ${new_status}` });
    }

    // ── Default: generic field update ──────────────────────────────────────
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k, v]) => v !== undefined && k !== 'performed_by_uid' && k !== 'performed_by_name')
    );
    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    if (cleanUpdates.status && cleanUpdates.status !== current.status) {
      cleanUpdates.status_history = admin.firestore.FieldValue.arrayUnion(
        histEntry(cleanUpdates.status, puid, cleanUpdates.transition_note || '')
      );
      delete cleanUpdates.transition_note;
    }
    batch.update(leadRef, { ...cleanUpdates, updated_at: now });
    act(adminDb, batch, lead_id, franchise_id, branch_id,
      cleanUpdates.status ? 'status_changed' : 'lead_updated',
      cleanUpdates.status ? `Status changed to ${cleanUpdates.status}` : `Lead updated: ${Object.keys(cleanUpdates).join(', ')}`,
      puid, pname);
    await batch.commit(); invalidate(franchise_id, branch_id, lead_id);
    return NextResponse.json({ success: true, message: 'Lead updated' });

  } catch (err) {
    console.error('[PUT /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to update lead', details: err.message }, { status: 500 });
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { id: lead_id } = await params;
    const body = await request.json();
    const { franchise_id, branch_id } = body;

    if (!franchise_id || !branch_id) {
      return NextResponse.json({ error: 'franchise_id and branch_id required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    await adminDb.collection('leads').doc(lead_id).delete();
    invalidate(franchise_id, branch_id, lead_id);
    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    console.error('[DELETE /api/leads/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete lead', details: err.message }, { status: 500 });
  }
}

function invalidate(fid, bid, lid) {
  cache.del(detailKey(fid, bid, lid));
  cache.del(listKey(fid, bid));
  cache.delPattern(`leads:${fid}:${bid}:`);
}
