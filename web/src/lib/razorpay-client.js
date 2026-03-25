/**
 * Razorpay Server-Side Client
 * Used for creating orders and verifying payment signatures.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

let _razorpay = null;

export function getRazorpayClient() {
  if (!_razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in env');
    }
    _razorpay = new Razorpay({ key_id, key_secret });
  }
  return _razorpay;
}

/**
 * Create a Razorpay order
 * @param {number} amountInRupees - Amount in INR (will be converted to paise)
 * @param {string} receipt - Unique receipt ID (invoice_id or lead_id)
 * @param {object} notes - Optional metadata stored on the order
 */
export async function createRazorpayOrder(amountInRupees, receipt, notes = {}) {
  const rz = getRazorpayClient();
  const order = await rz.orders.create({
    amount: Math.round(amountInRupees * 100), // paise
    currency: 'INR',
    receipt: String(receipt).slice(0, 40), // max 40 chars
    notes,
  });
  return order;
}

/**
 * Verify Razorpay payment signature
 * Returns true if signature is valid, false otherwise.
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', key_secret)
    .update(body)
    .digest('hex');
  return expected === signature;
}
