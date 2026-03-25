/**
 * Inventory email templates — server-side only.
 * Used by API routes to send alerts for stock events.
 */
import { getResend, FROM_ADDRESS } from "@/lib/resend-client";

const BRAND_GRADIENT = "linear-gradient(135deg,#c8962b 0%,#f0c040 100%)";
const BRAND_COLOR = "#c8962b";

function wrapEmail(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
<tr><td style="background:${BRAND_GRADIENT};padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">🎊 BanquetEase</h1>
  <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">${title}</p>
</td></tr>
<tr><td style="padding:32px 40px;">${bodyHtml}</td></tr>
<tr><td style="background:#f8f5ff;padding:16px 40px;text-align:center;border-top:1px solid #ede9f7;">
  <p style="margin:0;font-size:11px;color:#aaa;">Automated notification from BanquetEase Inventory System</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function tableRow(label, value, color) {
  return `<tr>
    <td style="padding:6px 12px;font-size:13px;color:#666;border-bottom:1px solid #f0f0f0;">${label}</td>
    <td style="padding:6px 12px;font-size:13px;font-weight:600;color:${color || "#1a1a2e"};border-bottom:1px solid #f0f0f0;text-align:right;">${value}</td>
  </tr>`;
}

// ─── Low Stock Alert ────────────────────
export function buildLowStockEmail({ items, franchiseName }) {
  const rows = items
    .map(
      (i) =>
        `<tr>
      <td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:6px 12px;font-size:13px;font-weight:600;color:#ef4444;text-align:center;border-bottom:1px solid #f0f0f0;">${i.currentStock} ${i.unit}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">${i.minStock} ${i.unit}</td>
      <td style="padding:6px 12px;font-size:13px;font-weight:600;color:#f59e0b;text-align:center;border-bottom:1px solid #f0f0f0;">${i.deficit || i.minStock - i.currentStock} ${i.unit}</td>
    </tr>`,
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">⚠️ Low Stock Alert</h2>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
      ${items.length} raw material${items.length > 1 ? "s are" : " is"} below minimum stock level${franchiseName ? ` at <strong>${franchiseName}</strong>` : ""}.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <thead><tr style="background:#fef2f2;">
        <th style="padding:10px 12px;font-size:11px;text-align:left;color:#991b1b;text-transform:uppercase;">Material</th>
        <th style="padding:10px 12px;font-size:11px;text-align:center;color:#991b1b;text-transform:uppercase;">Current</th>
        <th style="padding:10px 12px;font-size:11px;text-align:center;color:#991b1b;text-transform:uppercase;">Minimum</th>
        <th style="padding:10px 12px;font-size:11px;text-align:center;color:#991b1b;text-transform:uppercase;">Shortage</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:0;font-size:13px;color:#888;">Please create a Purchase Order to restock these materials.</p>
  `;
  return wrapEmail("Low Stock Alert", body);
}

// ─── Purchase Order Created ─────────────
export function buildPOCreatedEmail({ po, vendorName }) {
  const itemRows = (po.items || [])
    .map(
      (i) =>
        `<tr>
      <td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">${i.quantity} ${i.unit}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:right;border-bottom:1px solid #f0f0f0;">₹${(i.total || 0).toLocaleString("en-IN")}</td>
    </tr>`,
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">📦 Purchase Order Created</h2>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
      A new purchase order has been raised.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${tableRow("PO Number", po.id, BRAND_COLOR)}
      ${tableRow("Vendor", vendorName || po.vendorName)}
      ${tableRow("Expected Delivery", po.expectedDelivery || "—")}
      ${tableRow("Payment Terms", po.paymentTerms || "Net 30")}
      ${tableRow("Total Amount", "₹" + (po.totalAmount || 0).toLocaleString("en-IN"), BRAND_COLOR)}
    </table>
    <h3 style="font-size:14px;color:#1a1a2e;margin:16px 0 8px;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8f9fa;">
        <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;color:#666;">Item</th>
        <th style="padding:8px 12px;font-size:11px;text-align:center;text-transform:uppercase;color:#666;">Qty</th>
        <th style="padding:8px 12px;font-size:11px;text-align:right;text-transform:uppercase;color:#666;">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
  `;
  return wrapEmail("Purchase Order Created", body);
}

// ─── Stock Received ─────────────────────
export function buildStockReceivedEmail({ poId, stockUpdates, vendorName }) {
  const rows = (stockUpdates || [])
    .map(
      (u) =>
        `<tr>
      <td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f0f0f0;">${u.name}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">+${u.receivedQty} ${u.unit}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">${u.previousStock} → <strong style="color:#10b981;">${u.newStock}</strong></td>
    </tr>`,
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">✅ Stock Received</h2>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
      Stock from <strong>${vendorName || "vendor"}</strong> has been received and inventory updated.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${tableRow("PO Number", poId, BRAND_COLOR)}
      ${tableRow("Items Received", `${stockUpdates?.length || 0} materials`)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#ecfdf5;">
        <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;color:#065f46;">Material</th>
        <th style="padding:8px 12px;font-size:11px;text-align:center;text-transform:uppercase;color:#065f46;">Received</th>
        <th style="padding:8px 12px;font-size:11px;text-align:center;text-transform:uppercase;color:#065f46;">Stock Change</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  return wrapEmail("Stock Received", body);
}

// ─── Stock Deduction Summary ────────────
export function buildStockDeductionEmail({
  deductionId,
  eventName,
  guestCount,
  deductions,
  shortages,
}) {
  const dedRows = (deductions || [])
    .map(
      (d) =>
        `<tr>
      <td style="padding:5px 12px;font-size:13px;border-bottom:1px solid #f0f0f0;">${d.material}</td>
      <td style="padding:5px 12px;font-size:13px;color:#ef4444;text-align:center;border-bottom:1px solid #f0f0f0;">-${d.deductQty} ${d.unit}</td>
      <td style="padding:5px 12px;font-size:13px;text-align:center;border-bottom:1px solid #f0f0f0;">${d.newStock} ${d.unit}${d.willBeLowStock ? " ⚠️" : ""}</td>
    </tr>`,
    )
    .join("");

  const shortageBlock =
    shortages?.length > 0
      ? `
    <h3 style="font-size:14px;color:#ef4444;margin:20px 0 8px;">❌ Shortages (${shortages.length})</h3>
    ${shortages.map((s) => `<p style="font-size:13px;color:#991b1b;margin:4px 0;">• <strong>${s.material}</strong>: Need ${s.needed} ${s.unit}${s.available !== undefined ? ` (have ${s.available}, short by ${s.deficit})` : ""}</p>`).join("")}
  `
      : "";

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">📉 Stock Deduction Processed</h2>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
      Raw materials have been deducted for ${eventName ? `<strong>${eventName}</strong>` : "an event"}.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${tableRow("Deduction ID", deductionId, BRAND_COLOR)}
      ${tableRow("Guest Count", guestCount)}
      ${tableRow("Materials Affected", `${deductions?.length || 0} items`)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8f9fa;">
        <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;color:#666;">Material</th>
        <th style="padding:8px 12px;font-size:11px;text-align:center;text-transform:uppercase;color:#666;">Deducted</th>
        <th style="padding:8px 12px;font-size:11px;text-align:center;text-transform:uppercase;color:#666;">Remaining</th>
      </tr></thead>
      <tbody>${dedRows}</tbody>
    </table>
    ${shortageBlock}
  `;
  return wrapEmail("Stock Deduction Summary", body);
}

/**
 * Send an email safely — catches errors so API routes don't fail on email issues.
 * @param {string} to - recipient
 * @param {string} subject - email subject
 * @param {string} html - rendered HTML body
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendInventoryEmail(to, subject, html) {
  try {
    if (!to || !process.env.RESEND_API_KEY) {
      console.log(
        `[Email Skipped] ${subject} → ${to || "no recipient"} (API key: ${process.env.RESEND_API_KEY ? "set" : "not set"})`,
      );
      return { success: false, error: "Email not configured" };
    }
    const resend = getResend();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `[BanquetEase] ${subject}`,
      html,
    });
    console.log(`[Email Sent] ${subject} → ${to}`);
    return { success: true };
  } catch (err) {
    console.error(`[Email Failed] ${subject}:`, err.message);
    return { success: false, error: err.message };
  }
}
