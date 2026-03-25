/**
 * POST /api/payments/verify
 *
 * Verifies Razorpay payment signature and records the payment
 * against the invoice and/or lead in Firestore.
 *
 * Body:
 *   razorpay_order_id   {string}
 *   razorpay_payment_id {string}
 *   razorpay_signature  {string}
 *   invoice_id          {string}  - optional
 *   lead_id             {string}  - optional
 *   amount              {number}  - amount in INR
 *   payment_type        {string}  - "advance" | "balance" | "full"
 *   franchise_id        {string}
 *   branch_id           {string}
 *   recorded_by_uid     {string}
 *   recorded_by_name    {string}
 */

import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay-client';
import { getAdminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoice_id,
      lead_id,
      amount,
      payment_type = 'payment',
      franchise_id,
      branch_id,
      recorded_by_uid,
      recorded_by_name,
    } = body;

    // ── 1. Verify signature ──────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment fields' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const now = new Date().toISOString();
    const paymentRecord = {
      date: now.slice(0, 10),
      amount: Number(amount),
      mode: 'razorpay',
      type: payment_type,
      ref: razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      recorded_at: now,
      recorded_by: recorded_by_name || null,
    };

    const batch = adminDb.batch();

    // ── 2. Update invoice ────────────────────────────────────────────
    if (invoice_id) {
      const invRef = adminDb.collection('invoices').doc(invoice_id);
      const invSnap = await invRef.get();

      if (invSnap.exists) {
        const inv = invSnap.data();
        const existingPayments = inv.payments || [];
        const newAmountPaid = (inv.amount_paid || 0) + Number(amount);
        const newBalance = (inv.total || 0) - newAmountPaid;
        const newStatus =
          newBalance <= 0 ? 'paid' : newAmountPaid > 0 ? 'partially_paid' : inv.status;

        batch.update(invRef, {
          payments: [...existingPayments, paymentRecord],
          amount_paid: newAmountPaid,
          balance: Math.max(0, newBalance),
          status: newStatus,
          updated_at: now,
        });
      }
    }

    // ── 3. Update lead ───────────────────────────────────────────────
    if (lead_id) {
      const leadRef = adminDb.collection('leads').doc(lead_id);
      const leadSnap = await leadRef.get();

      if (leadSnap.exists) {
        const lead = leadSnap.data();

        if (payment_type === 'advance') {
          batch.update(leadRef, {
            status: 'advance_paid',
            booking_confirmed: {
              advance_amount: Number(amount),
              advance_payment_date: now.slice(0, 10),
              payment_mode: 'razorpay',
              transaction_ref: razorpay_payment_id,
              confirmed_by: recorded_by_name || null,
            },
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else if (payment_type === 'balance' || payment_type === 'full') {
          batch.update(leadRef, {
            status: 'paid',
            final_payment: {
              remaining_amount: Number(amount),
              payment_date: now.slice(0, 10),
              payment_mode: 'razorpay',
              transaction_ref: razorpay_payment_id,
            },
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // ── 4. Audit log ─────────────────────────────────────────────────
    const auditRef = adminDb.collection('audit_logs').doc();
    batch.set(auditRef, {
      entity_type: 'payment',
      entity_id: razorpay_payment_id,
      action: 'razorpay_payment_verified',
      franchise_id: franchise_id || null,
      branch_id: branch_id || null,
      performed_by_uid: recorded_by_uid || null,
      performed_by_name: recorded_by_name || null,
      details: {
        amount: Number(amount),
        payment_type,
        invoice_id: invoice_id || null,
        lead_id: lead_id || null,
        razorpay_order_id,
        razorpay_payment_id,
      },
      created_at: now,
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Payment verified and recorded',
      payment_id: razorpay_payment_id,
    });
  } catch (err) {
    console.error('[POST /api/payments/verify]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
