/**
 * Resend email client — singleton for server-side use in API routes only.
 * Set RESEND_API_KEY in your .env.local file.
 * Set RESEND_FROM in .env.local, e.g. "BanquetEase <no-reply@yourdomain.com>"
 */
import { Resend } from "resend";

let _resend = null;

export function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key)
      throw new Error("RESEND_API_KEY is not set in environment variables");
    _resend = new Resend(key);
  }
  return _resend;
}

export const FROM_ADDRESS =
  process.env.RESEND_FROM || "BanquetEase <onboarding@resend.dev>";

/**
 * Build the HTML body for a staff onboarding email.
 */
export function buildOnboardingEmail({
  name,
  email,
  password,
  role,
  branchName,
  loginUrl,
}) {
  const roleLabel = role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BanquetEase</title>
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8962b 0%,#f0c040 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎊 BanquetEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your event management platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">Welcome aboard, ${name}! 👋</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Your <strong>${roleLabel}</strong> account has been created${branchName ? ` for <strong>${branchName}</strong>` : ""}. 
                Here are your login credentials — please change your password after your first login.
              </p>

              <!-- Credentials card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1.5px solid #e8dff7;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#8e44ad;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;width:90px;">Email</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Password</td>
                        <td style="padding:5px 0;">
                          <code style="background:#fff;border:1px solid #e0d7f5;border-radius:6px;padding:3px 10px;font-size:14px;font-weight:700;color:#c8962b;letter-spacing:1px;">${password}</code>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Role</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${roleLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#c8962b,#f0c040);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Log In to BanquetEase →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#999;text-align:center;">
                🔒 For security, please update your password immediately after logging in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9f7;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                This email was sent by BanquetEase. If you did not expect this, please contact your branch manager.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build the HTML body for a payment confirmation email.
 */
export function buildPaymentConfirmationEmail({
  customerName,
  eventType,
  eventDate,
  paymentType, // 'advance' or 'full' or 'payment'
  amount,
  totalAmount,
  balanceDue,
  paymentMode,
  transactionRef,
  branchName,
  branchPhone,
  branchEmail,
}) {
  const paymentLabel = paymentType === 'advance' ? 'Advance Payment' : paymentType === 'full' ? 'Full Payment' : 'Payment';
  const isFullyPaid = balanceDue <= 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8962b 0%,#f0c040 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎊 BanquetEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your event management platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#22c55e,#16a34a);width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;margin-bottom:16px;">✓</div>
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Payment Received!</h2>
                <p style="margin:0;color:#666;font-size:15px;">Thank you for your ${paymentLabel.toLowerCase()}</p>
              </div>

              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Dear <strong>${customerName}</strong>,<br/><br/>
                We have successfully received your payment for your upcoming <strong>${eventType}</strong> event.
              </p>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:2px solid #f0c040;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#c8962b;text-transform:uppercase;letter-spacing:0.8px;">Payment Details</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;width:140px;">Payment Type</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${paymentLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Amount Paid</td>
                        <td style="padding:8px 0;">
                          <span style="color:#16a34a;font-size:20px;font-weight:800;">₹${Number(amount).toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Payment Mode</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${paymentMode?.toUpperCase() || 'Cash'}</td>
                      </tr>
                      ${transactionRef ? `<tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Transaction Ref</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${transactionRef}</td>
                      </tr>` : ''}
                    </table>
                    ${totalAmount ? `<div style="margin-top:18px;padding-top:18px;border-top:1px solid #f0c040;">
                      <table cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding:5px 0;color:#555;font-size:14px;">Total Event Cost</td>
                          <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">₹${Number(totalAmount).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="padding:5px 0;color:#555;font-size:14px;">Balance Due</td>
                          <td style="padding:5px 0;font-size:16px;font-weight:700;text-align:right;color:${isFullyPaid ? '#16a34a' : '#c8962b'};">${isFullyPaid ? 'Fully Paid ✓' : `₹${Number(balanceDue).toLocaleString('en-IN')}`}</td>
                        </tr>
                      </table>
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1.5px solid #e8dff7;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#8e44ad;text-transform:uppercase;letter-spacing:0.8px;">Event Information</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;width:100px;">Event Type</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${eventType}</td>
                      </tr>
                      ${eventDate ? `<tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Event Date</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${!isFullyPaid && balanceDue > 0 ? `<div style="background:#fff3cd;border-left:4px solid #f0c040;padding:16px 20px;margin-bottom:28px;border-radius:6px;">
                <p style="margin:0;font-size:14px;color:#856404;line-height:1.6;">
                  ⏰ <strong>Payment Reminder:</strong> A balance of <strong>₹${Number(balanceDue).toLocaleString('en-IN')}</strong> is due before the event date. Please complete the payment to finalize your booking.
                </p>
              </div>` : ''}

              ${isFullyPaid ? `<div style="background:#d1fae5;border-left:4px solid #16a34a;padding:16px 20px;margin-bottom:28px;border-radius:6px;">
                <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
                  🎉 <strong>Congratulations!</strong> Your event is fully paid and confirmed. We look forward to making your event memorable!
                </p>
              </div>` : ''}

              <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">
                If you have any questions, please contact us at:<br/>
                📞 <strong>${branchPhone || 'N/A'}</strong> | 📧 <strong>${branchEmail || 'N/A'}</strong>
              </p>

              <p style="margin:0;font-size:14px;color:#999;text-align:center;font-style:italic;">
                Looking forward to serving you!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9f7;">
              <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:600;">${branchName || 'BanquetEase'}</p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                This is an automated payment confirmation. Please keep this email for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build the HTML body for a menu confirmation email.
 */
export function buildMenuConfirmationEmail({
  customerName,
  eventType,
  eventDate,
  menuName,
  perPlateCost,
  expectedPlates,
  totalFoodCost,
  customizations,
  hallRent,
  decorEstimate,
  totalEstimated,
  branchName,
  branchPhone,
  branchEmail,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Menu Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8962b 0%,#f0c040 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎊 BanquetEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your event management platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#c8962b,#f0c040);width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;margin-bottom:16px;">🍽️</div>
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Menu Confirmed!</h2>
                <p style="margin:0;color:#666;font-size:15px;">Your food selection is finalized</p>
              </div>

              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Dear <strong>${customerName}</strong>,<br/><br/>
                Great news! We have finalized the menu for your <strong>${eventType}</strong> event${eventDate ? ` on <strong>${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>` : ''}.
              </p>

              <!-- Menu Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:2px solid #f0c040;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#c8962b;text-transform:uppercase;letter-spacing:0.8px;">🍛 Selected Menu</p>
                    <h3 style="margin:0 0 18px;color:#1a1a2e;font-size:20px;font-weight:700;">${menuName}</h3>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;width:160px;">Cost per Plate</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:16px;font-weight:700;">₹${Number(perPlateCost).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Expected Guests</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${expectedPlates} plates</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Total Food Cost</td>
                        <td style="padding:8px 0;">
                          <span style="color:#16a34a;font-size:18px;font-weight:800;">₹${Number(totalFoodCost).toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                    </table>
                    ${customizations && customizations.length > 0 ? `<div style="margin-top:18px;padding-top:18px;border-top:1px solid #f0c040;">
                      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#c8962b;">Special Customizations:</p>
                      <ul style="margin:0;padding:0 0 0 20px;color:#555;font-size:14px;line-height:1.8;">
                        ${customizations.map(c => `<li>${c}</li>`).join('')}
                      </ul>
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Quote Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1.5px solid #e8dff7;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#8e44ad;text-transform:uppercase;letter-spacing:0.8px;">💰 Cost Estimate</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;">Food Cost</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">₹${Number(totalFoodCost).toLocaleString('en-IN')}</td>
                      </tr>
                      ${hallRent > 0 ? `<tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;">Hall Rent</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">₹${Number(hallRent).toLocaleString('en-IN')}</td>
                      </tr>` : ''}
                      ${decorEstimate > 0 ? `<tr>
                        <td style="padding:8px 0;color:#555;font-size:14px;">Decoration (Est.)</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;text-align:right;">₹${Number(decorEstimate).toLocaleString('en-IN')}</td>
                      </tr>` : ''}
                      <tr style="border-top:2px solid #e8dff7;">
                        <td style="padding:12px 0 0;color:#1a1a2e;font-size:16px;font-weight:700;">Total Estimated</td>
                        <td style="padding:12px 0 0;color:#c8962b;font-size:20px;font-weight:800;text-align:right;">₹${Number(totalEstimated).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="background:#e0f2fe;border-left:4px solid #0284c7;padding:16px 20px;margin-bottom:28px;border-radius:6px;">
                <p style="margin:0;font-size:14px;color:#075985;line-height:1.6;">
                  📌 <strong>Next Step:</strong> Please proceed with the advance payment to confirm your booking and lock in these prices.
                </p>
              </div>

              <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">
                For any changes or questions about your menu, please contact us:<br/>
                📞 <strong>${branchPhone || 'N/A'}</strong> | 📧 <strong>${branchEmail || 'N/A'}</strong>
              </p>

              <p style="margin:0;font-size:14px;color:#999;text-align:center;font-style:italic;">
                We can't wait to serve you delicious food!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9f7;">
              <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:600;">${branchName || 'BanquetEase'}</p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                This is an automated menu confirmation. All prices are subject to the quoted validity period.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build the HTML body for a decoration confirmation email.
 */
export function buildDecorConfirmationEmail({
  customerName,
  eventType,
  eventDate,
  decorTheme,
  decorPartner,
  decorCost,
  finalGuestCount,
  setupDate,
  teardownDate,
  specialRequests,
  branchName,
  branchPhone,
  branchEmail,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Decoration Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c8962b 0%,#f0c040 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🎊 BanquetEase</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your event management platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background:linear-gradient(135deg,#ec4899,#f472b6);width:64px;height:64px;border-radius:50%;line-height:64px;font-size:32px;margin-bottom:16px;">✨</div>
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:24px;font-weight:700;">Decoration Confirmed!</h2>
                <p style="margin:0;color:#666;font-size:15px;">Your event décor is finalized</p>
              </div>

              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                Dear <strong>${customerName}</strong>,<br/><br/>
                Wonderful news! The decoration details for your <strong>${eventType}</strong> event have been finalized. Your event is coming together beautifully!
              </p>

              <!-- Decoration Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3c7,#fef3e2);border:2px solid #f0c040;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#c8962b;text-transform:uppercase;letter-spacing:0.8px;">✨ Decoration Details</p>
                    <h3 style="margin:0 0 18px;color:#1a1a2e;font-size:20px;font-weight:700;">${decorTheme || 'Custom Theme'}</h3>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${decorPartner ? `<tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;width:160px;">Decoration Partner</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${decorPartner}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Decoration Cost</td>
                        <td style="padding:8px 0;">
                          <span style="color:#16a34a;font-size:18px;font-weight:800;">₹${Number(decorCost).toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                      ${finalGuestCount ? `<tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Final Guest Count</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${finalGuestCount} guests</td>
                      </tr>` : ''}
                      ${eventDate ? `<tr>
                        <td style="padding:8px 0;color:#777;font-size:14px;">Event Date</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Schedule -->
              ${setupDate || teardownDate ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1.5px solid #e8dff7;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8e44ad;text-transform:uppercase;letter-spacing:0.8px;">📅 Schedule</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${setupDate ? `<tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;width:140px;">Setup Date</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${new Date(setupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>` : ''}
                      ${teardownDate ? `<tr>
                        <td style="padding:5px 0;color:#777;font-size:14px;">Teardown Date</td>
                        <td style="padding:5px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${new Date(teardownDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>` : ''}

              <!-- Special Requests -->
              ${specialRequests ? `<div style="background:#dbeafe;border-left:4px solid#7c3aed;padding:16px 20px;margin-bottom:28px;border-radius:6px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#3b0764;">Special Requests:</p>
                <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
                  ${specialRequests}
                </p>
              </div>` : ''}

              <div style="background:#d1fae5;border-left:4px solid #16a34a;padding:16px 20px;margin-bottom:28px;border-radius:6px;">
                <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
                  🎉 <strong>Event Finalized!</strong> All details are locked in. We're all set to make your event spectacular!
                </p>
              </div>

              <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.6;">
                For any last-minute changes or questions, please reach out to us:<br/>
                📞 <strong>${branchPhone || 'N/A'}</strong> | 📧 <strong>${branchEmail || 'N/A'}</strong>
              </p>

              <p style="margin:0;font-size:14px;color:#999;text-align:center;font-style:italic;">
                Looking forward to creating magic at your event!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5ff;padding:20px 40px;text-align:center;border-top:1px solid #ede9f7;">
              <p style="margin:0 0 8px;font-size:13px;color:#666;font-weight:600;">${branchName || 'BanquetEase'}</p>
              <p style="margin:0;font-size:12px;color:#aaa;">
                This is an automated decoration confirmation. All arrangements are now scheduled.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
