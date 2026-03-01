import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
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
    const snap = await adminDb.collection('bookings').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ booking: { id: snap.id, ...snap.data() } });
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

    const ref = adminDb.collection('bookings').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    const booking = snap.data();

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
        const history = [...(booking.payments?.payment_history || []), paymentEntry];
        const totalPaid = history.reduce((s, p) => s + Number(p.amount), 0);
        const quoteTotal = booking.payments?.quote_total || 0;

        updates.payments = {
          ...booking.payments,
          total_paid: totalPaid,
          balance_due: quoteTotal - totalPaid,
          payment_history: history,
        };
        message = `Payment of ₹${Number(amount).toLocaleString('en-IN')} recorded`;

        // Send payment confirmation email (fire-and-forget)
        if (booking.customer_email) {
          try {
            const resend = getResend();
            const branchDoc = await adminDb.collection('branches').doc(branch_id).get();
            const branchData = branchDoc.exists ? branchDoc.data() : {};

            const emailHtml = buildPaymentConfirmationEmail({
              customerName: booking.customer_name || 'Valued Customer',
              eventType: booking.event_type || 'Event',
              eventDate: booking.event_date || null,
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
              to: booking.customer_email,
              subject: `Payment Received - ₹${Number(amount).toLocaleString('en-IN')} | BanquetEase`,
              html: emailHtml,
            }).catch(err => console.error('[Payment Email]', err));
          } catch (emailErr) {
            console.error('[Payment Email Failed]', emailErr);
          }
        }
        break;
      }

      /* ── Update status ── */
      case 'update_status': {
        const { new_status } = data;
        if (!['confirmed','in_progress','completed','cancelled'].includes(new_status)) {
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
        updates.checklist = [...(booking.checklist || []), item];
        message = 'Checklist item added';
        break;
      }

      /* ── Toggle checklist item ── */
      case 'toggle_checklist': {
        const { item_id } = data;
        updates.checklist = (booking.checklist || []).map(c =>
          c.id === item_id ? { ...c, status: c.status === 'done' ? 'pending' : 'done', updated_at: now } : c
        );
        message = 'Checklist updated';
        break;
      }

      /* ── Remove checklist item ── */
      case 'remove_checklist_item': {
        const { item_id } = data;
        updates.checklist = (booking.checklist || []).filter(c => c.id !== item_id);
        message = 'Checklist item removed';
        break;
      }

      /* ── Add vendor ── */
      case 'add_vendor': {
        const { vendor_name, vendor_type, cost, contact_phone, notes } = data;
        if (!vendor_name) return NextResponse.json({ error: 'vendor_name required' }, { status: 400 });
        const vendor = {
          id: `vnd_${Date.now()}`,
          vendor_name, vendor_type: vendor_type || 'other',
          cost: Number(cost || 0), contact_phone: contact_phone || null,
          notes: notes || null, status: 'assigned', created_at: now,
        };
        updates.vendors = [...(booking.vendors || []), vendor];
        message = `Vendor "${vendor_name}" added`;
        break;
      }

      /* ── Remove vendor ── */
      case 'remove_vendor': {
        const { vendor_id } = data;
        updates.vendors = (booking.vendors || []).filter(v => v.id !== vendor_id);
        message = 'Vendor removed';
        break;
      }

      /* ── Assign staff ── */
      case 'assign_staff': {
        const { uid, name, role } = data;
        if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
        const entry = { uid: uid || null, name, role: role || 'general', assigned_at: now };
        const existing = (booking.staff_assigned || []).filter(s => s.name !== name);
        updates.staff_assigned = [...existing, entry];
        message = `Staff "${name}" assigned`;
        break;
      }

      /* ── Remove staff ── */
      case 'remove_staff': {
        const { name } = data;
        updates.staff_assigned = (booking.staff_assigned || []).filter(s => s.name !== name);
        message = 'Staff removed';
        break;
      }

      /* ── Update event details ── */
      case 'update_event': {
        if (booking.event_locked && !data.force) {
          return NextResponse.json({ error: 'Event is locked. Use force=true to override.' }, { status: 403 });
        }
        const allowed = ['event_date','event_start_time','event_end_time','hall_id','hall_name',
                         'expected_guest_count','final_guest_count','menu','decor','notes'];
        allowed.forEach(k => { if (data[k] !== undefined) updates[k] = data[k]; });

        // Re-check conflict if hall or date changed
        if ((data.event_date || data.hall_id) && (data.hall_id || booking.hall_id)) {
          const checkHall = data.hall_id || booking.hall_id;
          const checkDate = data.event_date || booking.event_date;
          const conflict = await adminDb.collection('bookings')
            .where('franchise_id', '==', booking.franchise_id)
            .where('branch_id', '==', booking.branch_id)
            .where('hall_id', '==', checkHall)
            .where('event_date', '==', checkDate)
            .where('status', 'in', ['confirmed', 'in_progress'])
            .limit(2).get();
          const others = conflict.docs.filter(d => d.id !== id);
          if (others.length > 0) {
            return NextResponse.json({ error: `Conflict: hall booked on ${checkDate}`, conflict: true }, { status: 409 });
          }
        }
        message = 'Event details updated';
        break;
      }

      /* ── Generic field updates ── */
      case 'update_fields': {
        const safe = ['notes','customer_name','phone','email','event_type'];
        safe.forEach(k => { if (data[k] !== undefined) updates[k] = data[k]; });
        message = 'Booking updated';
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await ref.update(updates);
    invalidate(`bookings:${franchise_id}:${branch_id}`);
    return NextResponse.json({ message, booking_id: id });
  } catch (e) {
    console.error('[PUT /api/bookings/[id]]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
