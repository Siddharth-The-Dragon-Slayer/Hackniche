'use client';
/**
 * RazorpayButton
 *
 * Drop-in payment button that:
 *  1. Calls /api/payments/create-order to get a Razorpay order
 *  2. Opens the Razorpay checkout modal
 *  3. On success, calls /api/payments/verify to verify + record the payment
 *  4. Fires onSuccess(paymentId) or onError(message) callbacks
 *
 * Props:
 *   amount        {number}   - Amount in INR
 *   invoiceId     {string}   - Invoice ID (optional)
 *   leadId        {string}   - Lead ID (optional)
 *   customerName  {string}   - Pre-fill customer name
 *   customerEmail {string}   - Pre-fill email
 *   customerPhone {string}   - Pre-fill phone
 *   description   {string}   - Payment description shown in modal
 *   paymentType   {string}   - "advance" | "balance" | "full"
 *   franchiseId   {string}
 *   branchId      {string}
 *   recordedByUid {string}
 *   recordedByName{string}
 *   onSuccess     {function} - Called with paymentId on success
 *   onError       {function} - Called with error message on failure
 *   disabled      {boolean}
 *   className     {string}
 *   children      {ReactNode} - Button label
 */

import { useState, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

export default function RazorpayButton({
  amount,
  invoiceId,
  leadId,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  description = 'BanquetEase Payment',
  paymentType = 'payment',
  franchiseId,
  branchId,
  recordedByUid,
  recordedByName,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay checkout script once
  useEffect(() => {
    if (window.Razorpay) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!scriptLoaded) {
      onError?.('Razorpay is still loading. Please try again.');
      return;
    }
    if (!amount || amount <= 0) {
      onError?.('Invalid payment amount.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          invoice_id: invoiceId,
          lead_id: leadId,
          customer_name: customerName,
          description,
          payment_type: paymentType,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // Step 2: Open Razorpay modal
      await new Promise((resolve, reject) => {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'BanquetEase',
          description,
          order_id: orderData.order_id,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: { color: '#b8953f' },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user')),
          },
          handler: async (response) => {
            try {
              // Step 3: Verify payment
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  invoice_id: invoiceId,
                  lead_id: leadId,
                  amount,
                  payment_type: paymentType,
                  franchise_id: franchiseId,
                  branch_id: branchId,
                  recorded_by_uid: recordedByUid,
                  recorded_by_name: recordedByName,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');
              resolve(response.razorpay_payment_id);
            } catch (e) {
              reject(e);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp.error?.description || 'Payment failed'));
        });
        rzp.open();
      }).then((paymentId) => {
        onSuccess?.(paymentId);
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled by user') {
        onError?.(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn btn-primary ${className}`}
      onClick={handlePay}
      disabled={disabled || loading || !scriptLoaded}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      {loading ? (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        <CreditCard size={14} />
      )}
      {loading ? 'Processing…' : (children || `Pay ₹${Number(amount || 0).toLocaleString('en-IN')}`)}
    </button>
  );
}
