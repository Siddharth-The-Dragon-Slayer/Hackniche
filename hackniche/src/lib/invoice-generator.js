/**
 * Simple HTML-based invoice generator
 * Generates invoice HTML that can be printed or converted to PDF
 */

export function generateInvoiceHTML({
  invoiceNumber,
  invoiceDate,
  dueDate,
  customerName,
  customerEmail,
  customerPhone,
  eventType,
  eventDate,
  hallName,
  guestCount,
  quoteTotal,
  advancePaid,
  balanceDue,
  paymentHistory = [],
  branchName = "BanquetEase",
  branchAddress = "",
  branchPhone = "",
  branchEmail = "",
  notes = "",
}) {
  const formatCurrency = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const paymentRows = paymentHistory
    .map(
      (p) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px">${formatDate(p.date)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px">${p.type || "Payment"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px">${p.mode?.replace(/_/g, " ") || "Cash"}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px">${formatCurrency(p.amount)}</td>
      ${p.ref ? `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; color: #666">${p.ref}</td>` : ""}
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f9fafb; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 700; color: #1f2937; letter-spacing: -0.5px; }
    .invoice-meta { text-align: right; font-size: 12px; color: #666; }
    .invoice-meta-label { font-weight: 600; color: #111; font-size: 13px; margin-top: 6px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 12px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-box { font-size: 13px; line-height: 1.6; color: #374151; }
    .info-box-title { font-weight: 700; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px; }
    .summary-table { margin-top: 20px; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .summary-row.total { border-bottom: 2px solid #1f2937; font-weight: 700; font-size: 16px; padding: 14px 0; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; text-align: center; }
    .terms { background: #f9fafb; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 12px; color: #666; }
    @media print {
      body { background: white; padding: 0; }
      .container { padding: 20px; box-shadow: none; border-radius: 0; }
      a { color: #0000ff; text-decoration: underline; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">${branchName}</div>
      <div class="invoice-meta">
        <div class="invoice-meta-label">Invoice</div>
        <div style="font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px">${invoiceNumber}</div>
        <div class="invoice-meta-label">Invoice Date</div>
        <div>${formatDate(invoiceDate)}</div>
        ${
          dueDate
            ? `
          <div class="invoice-meta-label" style="margin-top: 10px;">Due Date</div>
          <div>${formatDate(dueDate)}</div>
        `
            : ""
        }
      </div>
    </div>

    <!-- From/To -->
    <div class="grid-2">
      <div class="section">
        <div class="section-title">From</div>
        <div class="info-box">
          <div class="info-box-title">${branchName}</div>
          ${branchAddress ? `<div>${branchAddress}</div>` : ""}
          ${branchPhone ? `<div>Phone: ${branchPhone}</div>` : ""}
          ${branchEmail ? `<div>Email: ${branchEmail}</div>` : ""}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Bill To</div>
        <div class="info-box">
          <div class="info-box-title">${customerName}</div>
          ${customerEmail ? `<div>Email: ${customerEmail}</div>` : ""}
          ${customerPhone ? `<div>Phone: ${customerPhone}</div>` : ""}
        </div>
      </div>
    </div>

    <!-- Event Details -->
    <div class="section">
      <div class="section-title">Event Details</div>
      <table>
        <tr>
          <td style="font-weight: 600; width: 150px;">Event Type</td>
          <td>${eventType || "—"}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="font-weight: 600;">Event Date</td>
          <td>${formatDate(eventDate)}</td>
        </tr>
        ${
          hallName
            ? `
          <tr>
            <td style="font-weight: 600;">Venue</td>
            <td>${hallName}</td>
          </tr>
        `
            : ""
        }
        ${
          guestCount
            ? `
          <tr style="background: #f9fafb;">
            <td style="font-weight: 600;">Guest Count</td>
            <td>${guestCount}</td>
          </tr>
        `
            : ""
        }
      </table>
    </div>

    <!-- Payment Summary -->
    <div class="section">
      <div class="section-title">Payment Summary</div>
      <div class="summary-table">
        <div class="summary-row">
          <span>Quote Total</span>
          <span style="font-weight: 600">${formatCurrency(quoteTotal)}</span>
        </div>
        <div class="summary-row">
          <span>Advance Paid</span>
          <span style="font-weight: 600; color: #15803d">${formatCurrency(advancePaid)}</span>
        </div>
        <div class="summary-row total">
          <span>Balance Due</span>
          <span style="color: ${balanceDue > 0 ? "#dc2626" : "#15803d"}">${formatCurrency(balanceDue)}</span>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    ${
      paymentHistory.length > 0
        ? `
      <div class="section">
        <div class="section-title">Payment History</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Mode</th>
              <th style="text-align: right;">Amount</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>
      </div>
    `
        : ""
    }

    <!-- Terms/Notes -->
    ${
      notes
        ? `
      <div class="terms">
        <strong>Notes:</strong><br/>
        ${notes}
      </div>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business! Please contact us if you have any questions about this invoice.</p>
      <p style="margin-top: 10px; color: #999; font-size: 11px;">This is an electronically generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Download invoice as PDF using html2pdf library
 * Client-side usage: download(htmlContent, 'invoice-12345.pdf')
 */
export function downloadInvoicePDF(htmlContent, filename = "invoice.pdf") {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  setTimeout(() => document.body.removeChild(iframe), 1000);
}

/**
 * Alternative: download as HTML file directly
 */
export function downloadInvoiceHTML(htmlContent, filename = "invoice.html") {
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
