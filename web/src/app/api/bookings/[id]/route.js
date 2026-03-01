import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { cache } from '@/lib/cache';
import { getResend, FROM_ADDRESS, buildPaymentConfirmationEmail } from '@/lib/resend-client';

/* ══════════════════════════════════════════════════════════════════
   BOOKING DETAIL API — /api/bookings/[id]
   GET  → single booking
   PUT  → update booking (status, payment, checklist, vendors, staff)
═══════════════════════════════════════════════════════════════════ */

const invalidate = pfx => cache.keys().filter(k => k.startsWith(pfx)).forEach(k => cache.delete(k));
const PAYMENT_MODES = ['cash','upi','bank_transfer','cheque','card','other'];

export async function GET(req, { params }) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;

    // Check cache first
    const cacheKey = `booking:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Fetch lead by ID (bookings are leads with booking statuses)
    const snap = await adminDb.collection('leads').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
<<<<<<< HEAD

    const lead = snap.data();

    // Map lead data to booking format
    const statusMap = {
      advance_paid: 'confirmed',
      decoration_scheduled: 'confirmed',
      paid: 'confirmed',
      in_progress: 'in_progress',
      completed: 'completed',
      settlement_complete: 'completed',
      closed: 'completed',
      // Also map non-booking statuses so they can still be viewed
      new: 'new',
      visited: 'visited',
      tasting_scheduled: 'tasting_scheduled',
      tasting_done: 'tasting_done',
      menu_selected: 'menu_selected',
      on_hold: 'on_hold',
      lost: 'lost',
    };

    // Serialize Firestore timestamps
    const serialize = (d) => {
      if (d?.toDate) return d.toDate().toISOString();
      return d;
    };

    // Transform menu data
    const menu = lead.menu_finalization
      ? {
          name: lead.menu_finalization.finalized_menu_name,
          per_plate_cost: lead.menu_finalization.final_per_plate_cost,
          plates: lead.menu_finalization.expected_plates,
          total: lead.menu_finalization.total_food_cost,
        }
      : null;

    // Transform decor data
    const decor = lead.event_finalization
      ? {
          theme: lead.event_finalization.decoration_theme,
          partner: lead.event_finalization.decoration_partner,
          cost: lead.event_finalization.decoration_cost,
        }
      : null;

    // Create booking object (same structure as API returns)
    const booking = {
      id: snap.id,
      ...lead,
      // Map lead fields to booking fields
      checklist: lead.booking_checklist || [],
      vendors: lead.booking_vendors || [],
      staff_assigned: lead.booking_staff_assigned || [],
      status: statusMap[lead.status] || 'confirmed',
      original_status: lead.status,
      event_locked: lead.event_locked || false,
      // Menu and decor with proper structure
      menu,
      decor,
      // Ensure payments structure exists (use booking_confirmed if present)
      payments: lead.booking_confirmed || {
        quote_total: lead.quote?.total_estimated || 0,
        advance_amount: 0,
        total_paid: 0,
        balance_due: lead.quote?.total_estimated || 0,
        payment_history: [],
      },
      // Serialize timestamps
      created_at: serialize(lead.created_at),
      updated_at: serialize(lead.updated_at),
    };

    const result = { booking };
    cache.set(cacheKey, result, 120);
    return NextResponse.json(result);
=======
    
    let booking = { id: snap.id, ...snap.data() };
    
    // If booking has no decoration data but has lead_id, fetch from lead
    if (booking.lead_id && (!booking.decor || (!booking.decor.theme && !booking.decor.partner && !booking.decor.cost))) {
      try {
        const leadSnap = await adminDb.collection('leads').doc(booking.lead_id).get();
        if (leadSnap.exists) {
          const lead = leadSnap.data();
          if (lead.event_finalization) {
            booking.decor = {
              theme: lead.event_finalization.decoration_theme || null,
              partner: lead.event_finalization.decoration_partner || null,
              cost: Number(lead.event_finalization.decoration_cost || 0),
              setup_date: lead.event_finalization.setup_date || null,
              teardown_date: lead.event_finalization.teardown_date || null,
              special_requests: lead.event_finalization.special_requests || null,
              description: lead.event_finalization.description || null,
            };
          }
        }
      } catch (leadErr) {
        console.error('[Lead fetch error for decoration data]', leadErr);
      }
    }
    
    return NextResponse.json({ booking });
>>>>>>> 107fc2583234521d5abf3906e8857c2ebc92e3b7
  } catch (e) {
    console.error('[GET /api/bookings/[id]]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;
    const body = await req.json();
    const { action, franchise_id = 'pfd', branch_id = 'pfd_b1', ...data } = body;

    // Fetch lead (bookings are leads)
    const ref = adminDb.collection('leads').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const lead = snap.data();

    const now = new Date().toISOString();
    let updates = { updated_at: now };
    let message = 'Updated';

    switch (action) {
      /* ── Record a payment (advance or balance) ── */
      case 'add_payment': {
        const { amount, date, mode, ref: txnRef, type = 'payment', note } = data;
        if (!amount || amount <= 0) return NextResponse.json({ error: 'amount required' }, { status: 400 });

        const paymentEntry = {
          date: date || now.slice(0, 10),
          amount: Number(amount),
          mode: mode || 'cash',
          type,
          ref: txnRef || null,
          note: note || null,
          recorded_at: now,
        };

        const bookingConfirmed = lead.booking_confirmed || {
          quote_total: lead.quote?.total_estimated || 0,
          advance_amount: 0,
          total_paid: 0,
          balance_due: lead.quote?.total_estimated || 0,
          payment_history: [],
        };

        const history = [...(bookingConfirmed.payment_history || []), paymentEntry];
        const totalPaid = history.reduce((s, p) => s + Number(p.amount), 0);
        const quoteTotal = bookingConfirmed.quote_total || 0;

        updates.booking_confirmed = {
          ...bookingConfirmed,
          total_paid: totalPaid,
          balance_due: quoteTotal - totalPaid,
          payment_history: history,
        };
        message = `Payment of ₹${Number(amount).toLocaleString('en-IN')} recorded`;

        // Send payment confirmation email (fire-and-forget)
        if (lead.email) {
          try {
            const resend = getResend();
            const branchDoc = await adminDb.collection('branches').doc(branch_id).get();
            const branchData = branchDoc.exists ? branchDoc.data() : {};

            const emailHtml = buildPaymentConfirmationEmail({
              customerName: lead.customer_name || 'Valued Customer',
              eventType: lead.event_type || 'Event',
              eventDate: lead.event_date || null,
              paymentType: type,
              amount: Number(amount),
              totalAmount: quoteTotal,
              balanceDue: quoteTotal - totalPaid,
              paymentMode: mode || 'cash',
              transactionRef: txnRef,
              branchName: branchData.name || 'BanquetEase',
              branchPhone: branchData.phone || branchData.contact_phone || 'N/A',
              branchEmail: branchData.email || branchData.contact_email || 'N/A',
            });

            resend.emails.send({
              from: FROM_ADDRESS,
              to: lead.email,
              subject: `Payment Received - ₹${Number(amount).toLocaleString('en-IN')} | BanquetEase`,
              html: emailHtml,
            }).catch(err => console.error('[Payment Email]', err));
          } catch (emailErr) {
            console.error('[Payment Email Failed]', emailErr);
          }
        }

        // Sync to linked invoice so invoice-based views stay consistent
        if (booking.invoice_id) {
          const invRef = adminDb.collection('invoices').doc(booking.invoice_id);
          const balanceDue = (booking.payments?.quote_total || 0) - (updates.payments?.total_paid || 0);
          invRef.update({
            payments: admin.firestore.FieldValue.arrayUnion(paymentEntry),
            amount_paid: admin.firestore.FieldValue.increment(Number(paymentEntry.amount)),
            balance: admin.firestore.FieldValue.increment(-Number(paymentEntry.amount)),
            status: balanceDue <= 0 ? 'paid' : 'partially_paid',
            updated_at: now,
          }).catch(err => console.error('[bookings/add_payment] invoice sync failed:', err));
        }
        break;
      }

      /* ── Update status ── */
      case 'update_status': {
        const { new_status } = data;
        const validStatuses = [
          'new',
          'visited',
          'tasting_scheduled',
          'tasting_done',
          'menu_selected',
          'advance_paid',
          'decoration_scheduled',
          'paid',
          'in_progress',
          'completed',
          'settlement_complete',
          'closed',
          'on_hold',
          'lost',
        ];
        if (!validStatuses.includes(new_status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        updates.status = new_status;
        if (new_status === 'in_progress') updates.event_locked = true;
        message = `Status → ${new_status}`;
        break;
      }

      /* ── Add checklist item ── */
      case 'add_checklist_item': {
        const { task, assigned_to, due_date } = data;
        if (!task) return NextResponse.json({ error: 'task required' }, { status: 400 });
        const item = {
          id: `chk_${Date.now()}`,
          task,
          assigned_to: assigned_to || null,
          due_date: due_date || null,
          status: 'pending',
          created_at: now,
        };
        updates.booking_checklist = [...(lead.booking_checklist || []), item];
        message = 'Checklist item added';
        break;
      }

      /* ── Toggle checklist item ── */
      case 'toggle_checklist': {
        const { item_id } = data;
        updates.booking_checklist = (lead.booking_checklist || []).map(c =>
          c.id === item_id ? { ...c, status: c.status === 'done' ? 'pending' : 'done', updated_at: now } : c
        );
        message = 'Checklist updated';
        break;
      }

      /* ── Remove checklist item ── */
      case 'remove_checklist_item': {
        const { item_id } = data;
        updates.booking_checklist = (lead.booking_checklist || []).filter(c => c.id !== item_id);
        message = 'Checklist item removed';
        break;
      }

      /* ── Add vendor ── */
      case 'add_vendor': {
        const { vendor_name, vendor_type, cost, contact_phone, notes } = data;
        if (!vendor_name) return NextResponse.json({ error: 'vendor_name required' }, { status: 400 });
        const vendor = {
          id: `vnd_${Date.now()}`,
          vendor_name,
          vendor_type: vendor_type || 'other',
          cost: Number(cost || 0),
          contact_phone: contact_phone || null,
          notes: notes || null,
          status: 'assigned',
          created_at: now,
        };
        updates.booking_vendors = [...(lead.booking_vendors || []), vendor];
        message = `Vendor "${vendor_name}" added`;
        break;
      }

      /* ── Remove vendor ── */
      case 'remove_vendor': {
        const { vendor_id } = data;
        updates.booking_vendors = (lead.booking_vendors || []).filter(v => v.id !== vendor_id);
        message = 'Vendor removed';
        break;
      }

      /* ── Assign staff ── */
      case 'assign_staff': {
        const { uid, name, role } = data;
        if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
        const entry = { uid: uid || null, name, role: role || 'general', assigned_at: now };
        const existing = (lead.booking_staff_assigned || []).filter(s => s.name !== name);
        updates.booking_staff_assigned = [...existing, entry];
        message = `Staff "${name}" assigned`;
        break;
      }

      /* ── Remove staff ── */
      case 'remove_staff': {
        const { name } = data;
        updates.booking_staff_assigned = (lead.booking_staff_assigned || []).filter(s => s.name !== name);
        message = 'Staff removed';
        break;
      }

      /* ── Generic field updates ── */
      case 'update_fields': {
        const safe = ['notes', 'customer_name', 'phone', 'email', 'event_type'];
        safe.forEach(k => {
          if (data[k] !== undefined) updates[k] = data[k];
        });
        message = 'Booking updated';
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await ref.update(updates);
    invalidate(`bookings:${franchise_id}:${branch_id}`);
    cache.delete(`booking:${id}`);
    return NextResponse.json({ message, booking_id: id });
  } catch (e) {
    console.error('[PUT /api/bookings/[id]]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
