import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { cache } from '@/lib/cache';

/* ══════════════════════════════════════════════════════════════════
   BILLING DETAIL API — /api/billing/[id]
   GET  → single invoice
   PUT  → add payment, update status, edit line items
═══════════════════════════════════════════════════════════════════ */

const invalidate = pfx => cache.keys().filter(k => k.startsWith(pfx)).forEach(k => cache.delete(k));

export async function GET(req, { params }) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;
    const snap = await adminDb.collection('invoices').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    const invData = snap.data();
    // Normalise legacy field names for consumers
    return NextResponse.json({ invoice: {
      id: snap.id,
      ...invData,
      payments: invData.payments || invData.payment_history || [],
      balance: invData.balance ?? invData.balance_due ?? 0,
    }});
  } catch (e) {
    console.error('[GET /api/billing/[id]]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const adminDb = getAdminDb();
    const { id } = await params;
    const body = await req.json();
    const { action, franchise_id = 'pfd', branch_id = 'pfd_b1', ...data } = body;

    const ref = adminDb.collection('invoices').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    const inv = snap.data();
    // Normalise legacy field names
    inv.payments = inv.payments || inv.payment_history || [];
    inv.balance = inv.balance ?? inv.balance_due ?? 0;

    const now = new Date().toISOString();
    let updates = { updated_at: now };
    let message = 'Invoice updated';

    switch (action) {
      /* ── Record payment ── */
      case 'add_payment': {
        const { amount, date, mode, ref: txnRef, received_by, note } = data;
        if (!amount || amount <= 0) return NextResponse.json({ error: 'amount required' }, { status: 400 });

        const entry = {
          date: date || now.slice(0, 10),
          amount: Number(amount),
          mode: mode || 'cash',
          ref: txnRef || null,
          received_by: received_by || null,
          note: note || null,
          recorded_at: now,
        };
        const payments = [...(inv.payments || []), entry];
        const amountPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
        const balance = inv.total - amountPaid;

        updates.payments = payments;
        updates.amount_paid = amountPaid;
        updates.balance = balance;
        updates.status = balance <= 0 ? 'paid' : 'partially_paid';
        if (balance <= 0) updates.paid_date = now.slice(0, 10);
        message = `Payment ₹${Number(amount).toLocaleString('en-IN')} recorded. ${balance <= 0 ? 'Invoice fully paid!' : `Balance: ₹${balance.toLocaleString('en-IN')}`}`;

        // Sync to linked booking so customer-payments view stays consistent
        if (inv.booking_id) {
          const bookingRef = adminDb.collection('bookings').doc(inv.booking_id);
          // Fire-and-forget; invoice is the source of truth
          bookingRef.update({
            'payments.payment_history': admin.firestore.FieldValue.arrayUnion(entry),
            'payments.total_paid': amountPaid,
            'payments.balance_due': Math.max(balance, 0),
            updated_at: now,
          }).catch(err => console.error('[billing/add_payment] booking sync failed:', err));
        }
        break;
      }

      /* ── Update status ── */
      case 'update_status': {
        const valid = ['draft','sent','paid','partially_paid','overdue','cancelled'];
        if (!valid.includes(data.new_status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        updates.status = data.new_status;
        message = `Status → ${data.new_status}`;
        break;
      }

      /* ── Update line items (recalculates) ── */
      case 'update_line_items': {
        const items = data.line_items || [];
        const subtotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
        const taxRate = data.tax_rate != null ? Number(data.tax_rate) : inv.tax_rate;
        const taxAmount = Math.round(subtotal * taxRate / 100);
        const discount = data.discount != null ? Number(data.discount) : inv.discount;
        const total = subtotal + taxAmount - discount;

        updates.line_items = items;
        updates.subtotal = subtotal;
        updates.tax_rate = taxRate;
        updates.tax_amount = taxAmount;
        updates.discount = discount;
        updates.total = total;
        updates.balance = total - inv.amount_paid;
        if (updates.balance <= 0) updates.status = 'paid';
        message = 'Line items updated, totals recalculated';
        break;
      }

      /* ── Update basic fields ── */
      case 'update_fields': {
        const safe = ['due_date','notes','customer_address','customer_name','phone','email','issue_date'];
        safe.forEach(k => { if (data[k] !== undefined) updates[k] = data[k]; });
        message = 'Invoice details updated';
        break;
      }

      /* ── Send invoice ── */
      case 'send': {
        updates.status = inv.status === 'draft' ? 'sent' : inv.status;
        updates.sent_at = now;
        message = 'Invoice marked as sent';
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    await ref.update(updates);
    invalidate(`invoices:${franchise_id}:${branch_id}`);
    return NextResponse.json({ message, invoice_id: id });
  } catch (e) {
    console.error('[PUT /api/billing/[id]]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
