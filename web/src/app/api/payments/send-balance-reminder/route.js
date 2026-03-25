/**
 * POST /api/payments/send-balance-reminder
 *
 * Sends a Gmail + WhatsApp (Twilio - disabled) reminder for balance payment.
 * Body: { booking_id, franchise_id, branch_id }
 */

import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getResend, FROM_ADDRESS } from '@/lib/resend-client';
import { sendWhatsApp } from '@/lib/twilio-client'; // no-op until Twilio is enabled

export async function POST(req) {
  try {
    const { booking_id, franchise_id, branch_id } = await req.json();
    if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 });

    const adminDb = getAdminDb();

    // Fetch booking (try bookings collection first, then leads)
    let snap = await adminDb.collection('bookings').doc(booking_id).get();
    if (!snap.exists) snap = await adminDb.collection('leads').doc(booking_id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const bk = snap.data();
    const pay = bk.payments || {};
    const balanceDue = pay.balance_due ?? ((pay.quote_total || 0) - (pay.total_paid || 0));

    if (balanceDue <= 0) {
      return NextResponse.json({ message: 'No balance due — reminder not sent' });
    }

    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    const fmtDate = d => d
      ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';

    const results = { email: null, whatsapp: null };

    // ── 1. Email via Resend ───────────────────────────────────────────
    if (bk.email) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: FROM_ADDRESS,
          to: bk.email,
          subject: `Balance Payment Reminder — ${fmt(balanceDue)} due | BanquetEase`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff">
              <div style="background:#b8953f;padding:16px 24px;border-radius:8px 8px 0 0">
                <h2 style="color:#fff;margin:0">BanquetEase</h2>
                <p style="color:#fff;opacity:0.85;margin:4px 0 0;font-size:13px">Payment Reminder</p>
              </div>
              <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px">
                <p style="font-size:15px">Dear <strong>${bk.customer_name || 'Valued Customer'}</strong>,</p>
                <p style="color:#374151">Your balance payment for the upcoming event is due. Please complete the payment at your earliest convenience.</p>

                <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
                  <tr style="background:#f9fafb">
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280;width:40%">Event</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb"><strong>${bk.event_type || 'Event'}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280">Event Date</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb">${fmtDate(bk.event_date)}</td>
                  </tr>
                  <tr style="background:#f9fafb">
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280">Venue</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb">${bk.hall_name || 'BanquetEase'}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280">Total Quote</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb">${fmt(pay.quote_total)}</td>
                  </tr>
                  <tr style="background:#f9fafb">
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280">Amount Paid</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#16a34a"><strong>${fmt(pay.total_paid)}</strong></td>
                  </tr>
                  <tr style="background:#fef3c7">
                    <td style="padding:10px 12px;border:1px solid #fde68a;font-weight:700">Balance Due</td>
                    <td style="padding:10px 12px;border:1px solid #fde68a;font-weight:700;color:#dc2626;font-size:16px">${fmt(balanceDue)}</td>
                  </tr>
                  ${bk.balance_due_date ? `
                  <tr>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#6b7280">Due Date</td>
                    <td style="padding:10px 12px;border:1px solid #e5e7eb;color:#dc2626"><strong>${fmtDate(bk.balance_due_date)}</strong></td>
                  </tr>` : ''}
                </table>

                <div style="text-align:center;margin:24px 0">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments"
                     style="display:inline-block;background:#b8953f;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
                    Pay Now
                  </a>
                </div>

                <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">
                  For any queries, please contact your event manager.<br>
                  — <strong>BanquetEase Team</strong>
                </p>
              </div>
            </div>
          `,
          text: `Balance Payment Reminder\n\nDear ${bk.customer_name},\n\nYour balance of ${fmt(balanceDue)} is due for your ${bk.event_type} on ${fmtDate(bk.event_date)}.\n\nPlease visit ${process.env.NEXT_PUBLIC_APP_URL}/payments to complete your payment.\n\n— BanquetEase Team`,
        });
        results.email = 'sent';
      } catch (e) {
        console.error('[Balance Reminder Email]', e.message);
        results.email = `failed: ${e.message}`;
      }
    } else {
      results.email = 'skipped: no email on file';
    }

    // ── 2. WhatsApp via Twilio (disabled — uncomment twilio-client.js to enable) ──
    /*
    if (bk.phone) {
      try {
        const msg = `🔔 *BanquetEase Payment Reminder*\n\nDear ${bk.customer_name || 'Customer'},\n\nYour balance payment of *${fmt(balanceDue)}* is due for your ${bk.event_type || 'event'} on ${fmtDate(bk.event_date)}.\n\nPay here: ${process.env.NEXT_PUBLIC_APP_URL}/payments\n\n— BanquetEase Team`;
        await sendWhatsApp(bk.phone, msg);
        results.whatsapp = 'sent';
      } catch (e) {
        console.error('[Balance Reminder WhatsApp]', e.message);
        results.whatsapp = `failed: ${e.message}`;
      }
    }
    */
    results.whatsapp = 'disabled (Twilio not configured)';

    // Log reminder
    await adminDb.collection('payment_reminders').add({
      booking_id,
      franchise_id: franchise_id || bk.franchise_id,
      branch_id: branch_id || bk.branch_id,
      customer_name: bk.customer_name,
      balance_due: balanceDue,
      sent_at: new Date().toISOString(),
      results,
    });

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[POST /api/payments/send-balance-reminder]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
