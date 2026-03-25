/**
 * POST /api/payments/create-order
 *
 * Creates a Razorpay order for a given invoice or lead payment.
 *
 * Body:
 *   amount        {number}  - Amount in INR
 *   invoice_id    {string}  - Invoice ID (used as receipt)
 *   lead_id       {string}  - Lead ID (optional metadata)
 *   customer_name {string}  - Customer name (stored in notes)
 *   description   {string}  - Payment description (e.g. "Advance Payment")
 *   payment_type  {string}  - "advance" | "balance" | "full"
 */

import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay-client';

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, invoice_id, lead_id, customer_name, description, payment_type } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const receipt = invoice_id || lead_id || `pay_${Date.now()}`;

    const order = await createRazorpayOrder(Number(amount), receipt, {
      invoice_id: invoice_id || '',
      lead_id: lead_id || '',
      customer_name: customer_name || '',
      description: description || 'BanquetEase Payment',
      payment_type: payment_type || 'payment',
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,       // in paise
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('[POST /api/payments/create-order]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
