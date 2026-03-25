/**
 * POST /api/payments/emi
 * Create or update an EMI plan for a booking.
 *
 * Body:
 *   action: 'create_plan' | 'pay_installment' | 'get_plan'
 *   booking_id, franchise_id, branch_id
 *
 * create_plan:
 *   total_amount, num_installments, start_date, frequency
 *
 * pay_installment:
 *   installment_number, razorpay_order_id, razorpay_payment_id, razorpay_signature
 */

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { generateEMISchedule } from '@/lib/emi-calculator';
import { verifyRazorpaySignature } from '@/lib/razorpay-client';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, booking_id, franchise_id, branch_id } = body;

    if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 });

    const adminDb = getAdminDb();
    const now = new Date().toISOString();

    // Fetch booking (bookings or leads collection)
    let ref = adminDb.collection('bookings').doc(booking_id);
    let snap = await ref.get();
    if (!snap.exists) {
      ref = adminDb.collection('leads').doc(booking_id);
      snap = await ref.get();
    }
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const bk = snap.data();

    // ── CREATE PLAN ──────────────────────────────────────────────────
    if (action === 'create_plan') {
      const { total_amount, num_installments, start_date, frequency = 'monthly' } = body;

      if (!total_amount || !num_installments || !start_date) {
        return NextResponse.json({ error: 'total_amount, num_installments, start_date required' }, { status: 400 });
      }
      if (num_installments < 2 || num_installments > 12) {
        return NextResponse.json({ error: 'num_installments must be between 2 and 12' }, { status: 400 });
      }

      const installments = generateEMISchedule(
        Number(total_amount),
        Number(num_installments),
        start_date,
        frequency
      );

      const emiPlan = {
        total_amount: Number(total_amount),
        num_installments: Number(num_installments),
        frequency,
        start_date,
        installments,
        created_at: now,
        updated_at: now,
      };

      await ref.update({ emi_plan: emiPlan, updated_at: now });

      return NextResponse.json({ success: true, emi_plan: emiPlan });
    }

    // ── PAY INSTALLMENT ──────────────────────────────────────────────
    if (action === 'pay_installment') {
      const {
        installment_number,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = body;

      if (!installment_number || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
      }

      // Verify signature
      const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
      }

      const emiPlan = bk.emi_plan;
      if (!emiPlan) return NextResponse.json({ error: 'No EMI plan found' }, { status: 404 });

      // Update the specific installment
      const updatedInstallments = emiPlan.installments.map(inst => {
        if (inst.installment_number === Number(installment_number)) {
          return {
            ...inst,
            status: 'paid',
            paid_at: now,
            payment_id: razorpay_payment_id,
            razorpay_order_id,
          };
        }
        return inst;
      });

      // Update overdue status for past-due pending installments
      const finalInstallments = updatedInstallments.map(inst => {
        if (inst.status === 'pending' && inst.due_date && new Date(inst.due_date) < new Date()) {
          return { ...inst, status: 'overdue' };
        }
        return inst;
      });

      const totalPaid = finalInstallments
        .filter(i => i.status === 'paid')
        .reduce((s, i) => s + i.amount, 0);

      const updatedPlan = {
        ...emiPlan,
        installments: finalInstallments,
        updated_at: now,
      };

      // Also update the booking payments
      const pay = bk.payments || {};
      const updatedPayments = {
        ...pay,
        total_paid: totalPaid,
        balance_due: Math.max(0, (pay.quote_total || emiPlan.total_amount) - totalPaid),
        payment_history: [
          ...(pay.payment_history || []),
          {
            date: now.slice(0, 10),
            amount: emiPlan.installments.find(i => i.installment_number === Number(installment_number))?.amount || 0,
            mode: 'razorpay',
            type: `emi_${installment_number}`,
            ref: razorpay_payment_id,
            recorded_at: now,
          },
        ],
      };

      await ref.update({
        emi_plan: updatedPlan,
        payments: updatedPayments,
        updated_at: now,
      });

      // Audit log
      await adminDb.collection('audit_logs').add({
        entity_type: 'emi_payment',
        entity_id: razorpay_payment_id,
        action: 'emi_installment_paid',
        franchise_id: franchise_id || bk.franchise_id,
        branch_id: branch_id || bk.branch_id,
        details: { booking_id, installment_number, razorpay_payment_id },
        created_at: now,
      });

      return NextResponse.json({ success: true, message: `Installment ${installment_number} paid`, emi_plan: updatedPlan });
    }

    // ── GET PLAN ─────────────────────────────────────────────────────
    if (action === 'get_plan') {
      return NextResponse.json({ emi_plan: bk.emi_plan || null });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/payments/emi]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
