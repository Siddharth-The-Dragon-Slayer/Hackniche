"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import { useAuth } from "@/contexts/auth-context";
import Badge from "@/components/ui/Badge";
import RazorpayButton from "@/components/shared/RazorpayButton";
import {
  RefreshCw,
  AlertCircle,
  CreditCard,
  DollarSign,
  Clock,
  TrendingUp,
  Download,
  FileText,
  CheckCircle2,
  Circle,
  CalendarDays,
  Users,
  MapPin,
  Mail,
  Share2,
  BarChart2,
  FileDown,
  Send,
} from "lucide-react";
import {
  generateInvoiceHTML,
  downloadInvoiceHTML,
} from "@/lib/invoice-generator";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// ─── CSV export helper ────────────────────────────────────────────────────────
function exportToCSV(rows, filename) {
  if (!rows || rows.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── mailto share helper ──────────────────────────────────────────────────────
function shareViaEmail(toEmail, subject, body) {
  const mailto = `mailto:${toEmail || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, "_blank");
}

// Pipeline stages shown to customers (simplified)
const PIPELINE = [
  { key: "new", label: "Enquiry" },
  { key: "visited", label: "Site Visit" },
  { key: "tasting_done", label: "Tasting" },
  { key: "menu_selected", label: "Menu" },
  { key: "advance_paid", label: "Confirmed" },
  { key: "decoration_scheduled", label: "Decor" },
  { key: "paid", label: "Paid" },
  { key: "completed", label: "Done" },
];
const PIPELINE_KEYS = PIPELINE.map((s) => s.key);

const STATUS_BADGES = {
  new: { variant: "neutral", label: "Enquiry Received" },
  visited: { variant: "accent", label: "Site Visited" },
  tasting_scheduled: { variant: "warning", label: "Tasting Scheduled" },
  tasting_done: { variant: "warning", label: "Tasting Done" },
  menu_selected: { variant: "success", label: "Menu Finalised" },
  advance_paid: { variant: "success", label: "Booking Confirmed" },
  decoration_scheduled: { variant: "accent", label: "Decor Planned" },
  full_payment_pending: { variant: "warning", label: "Final Payment Due" },
  paid: { variant: "success", label: "Fully Paid" },
  in_progress: { variant: "warning", label: "In Progress" },
  completed: { variant: "success", label: "Event Done" },
  settlement_pending: { variant: "warning", label: "Settlement Due" },
  settlement_complete: { variant: "success", label: "Settled" },
  closed: { variant: "neutral", label: "Closed" },
  lost: { variant: "error", label: "Cancelled" },
  on_hold: { variant: "neutral", label: "On Hold" },
};

function stageIdx(status) {
  const i = PIPELINE_KEYS.indexOf(status);
  return i >= 0 ? i : 0;
}

function PipelineDots({ status }) {
  const cur = stageIdx(status);
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 8,
      }}
    >
      {PIPELINE.map((s, i) => {
        const done = i < cur;
        const active = i === cur;
        return (
          <div
            key={s.key}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              title={s.label}
              style={{
                width: active ? 10 : 7,
                height: active ? 10 : 7,
                borderRadius: "50%",
                background: done
                  ? "var(--color-success, #16a34a)"
                  : active
                    ? "var(--color-primary, #b8953f)"
                    : "var(--color-border)",
                flexShrink: 0,
                transition: "all 0.2s",
              }}
            />
            {i < PIPELINE.length - 1 && (
              <div
                style={{
                  width: 14,
                  height: 2,
                  background: done
                    ? "var(--color-success, #16a34a)"
                    : "var(--color-border)",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        );
      })}
      <span
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          marginLeft: 4,
        }}
      >
        {STATUS_BADGES[status]?.label || status}
      </span>
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  // Show customer view for customer role OR if user has no franchise (end-user)
  const isCustomer = userProfile?.role === "customer" || !userProfile?.franchise_id;
  const uid = userProfile?.uid;
  const fid = userProfile?.franchise_id || "pfd";
  const bid = userProfile?.branch_id || "pfd_b1";

  const [invoices, setInvoices] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [customerLeads, setCustomerLeads] = useState([]);
  const [customerSummary, setCustomerSummary] = useState({
    totalPaid: 0,
    totalDue: 0,
    transactionCount: 0,
    bookingCount: 0,
    enquiryCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(
    isCustomer ? "enquiries" : "business",
  );

  const fetchBusiness = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/billing?franchise_id=${fid}&branch_id=${bid}`,
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setInvoices(d.invoices || []);
    } catch (e) {
      setError(e.message);
    }
  }, [fid, bid]);

  const fetchCustomer = useCallback(async () => {
    if (!uid) return;
    try {
      const r = await fetch(`/api/customer-payments?customer_uid=${uid}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setCustomerPayments(d.payments || []);
      setCustomerBookings(d.bookings || []);
      setCustomerLeads(d.enquiries || []);
      setCustomerSummary(d.summary || {});
    } catch (e) {
      setError(e.message);
    }
  }, [uid]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (isCustomer) {
      await fetchCustomer();
    } else {
      await fetchBusiness();
    }
    setLoading(false);
  }, [isCustomer, fetchBusiness, fetchCustomer]);
  useEffect(() => {
    fetch_();
  }, [fetch_]);

  // Flatten all payments from all invoices (business view)
  const allPayments = invoices
    .flatMap((inv) =>
      (inv.payments || []).map((p) => ({
        ...p,
        invoice_number: inv.invoice_number,
        invoice_id: inv.id,
        customer_name: inv.customer_name,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.date || b.recorded_at || 0) -
        new Date(a.date || a.recorded_at || 0),
    );

  const totalCollected = allPayments.reduce(
    (s, p) => s + Number(p.amount || 0),
    0,
  );
  const totalOutstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0);
  const thisMonth = allPayments.filter((p) => {
    const d = new Date(p.date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
  const monthTotal = thisMonth.reduce((s, p) => s + Number(p.amount || 0), 0);

  // Handle invoice download for customers
  const downloadInvoice = (booking) => {
    try {
      const html = generateInvoiceHTML({
        invoiceNumber: booking.invoice_number,
        invoiceDate: new Date().toISOString(),
        customerName: booking.customer_name,
        customerEmail: userProfile?.email,
        customerPhone: userProfile?.phone,
        eventType: booking.event_type,
        eventDate: booking.event_date,
        hallName: booking.hall_name,
        guestCount: booking.guest_count,
        quoteTotal: booking.quote_total,
        advancePaid: booking.total_paid,
        balanceDue: booking.balance_due,
        paymentHistory: booking.payment_history,
        branchName: "BanquetEase",
        notes: "Thank you for booking with us!",
      });
      downloadInvoiceHTML(html, `invoice-${booking.invoice_number}.html`);
    } catch (err) {
      console.error("Invoice download failed:", err);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  // ── CSV Exports ───────────────────────────────────────────────────────────
  const handleExportPaymentsCSV = () => {
    const rows = allPayments.map((p) => ({
      Date: fmtDate(p.date),
      Customer: p.customer_name || "",
      "Invoice #": p.invoice_number || "",
      Amount: Number(p.amount || 0),
      Mode: p.mode?.replace(/_/g, " ") || "Cash",
      Type: p.type || "",
      Ref: p.ref || "",
      "Received By": p.received_by || "",
    }));
    exportToCSV(rows, `payments-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportInvoicesCSV = () => {
    const rows = invoices.map((inv) => ({
      "Invoice #": inv.invoice_number || "",
      Customer: inv.customer_name || "",
      "Event Type": inv.event_type || "",
      "Event Date": fmtDate(inv.event_date),
      "Quote Total": Number(inv.quote_total || 0),
      "Amount Paid": Number(inv.amount_paid || 0),
      Balance: Number(inv.balance || 0),
      Status: inv.status || "",
    }));
    exportToCSV(rows, `invoices-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportCustomerPaymentsCSV = () => {
    const rows = customerPayments.map((p) => ({
      Date: fmtDate(p.date),
      Amount: Number(p.amount || 0),
      Mode: p.mode?.replace(/_/g, " ") || "Cash",
      Type: p.type || "",
      "Event Type": p.event_type || "",
      "Event Date": fmtDate(p.event_date),
      "Invoice #": p.invoice_number || "",
      Ref: p.ref || "",
      "Balance Due": Number(p.balance_due || 0),
    }));
    exportToCSV(
      rows,
      `my-payments-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleExportEnquiriesCSV = () => {
    const rows = customerLeads.map((l) => ({
      "Event Type": l.event_type || "",
      "Event Date": fmtDate(l.event_date),
      Hall: l.hall_name || "",
      Guests: l.guest_count || 0,
      Status: STATUS_BADGES[l.status]?.label || l.status || "",
      "Quote Total": Number(l.quote_total || 0),
      Paid: Number(l.total_paid || 0),
      "Balance Due": Number(l.balance_due || 0),
      "Invoice #": l.invoice_number || "",
    }));
    exportToCSV(
      rows,
      `my-enquiries-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  // ── Email Shares ──────────────────────────────────────────────────────────
  const shareInvoiceEmail = (booking) => {
    const email = userProfile?.email || "";
    const subject = `Invoice #${booking.invoice_number} – ${booking.event_type} at ${booking.hall_name || "BanquetEase"}`;
    const body = `Dear ${userProfile?.displayName || "Valued Customer"},

Here is your invoice summary for your upcoming event:

──────────────────────────────
Event: ${booking.event_type || "Event"}
Date: ${fmtDate(booking.event_date)}
Venue: ${booking.hall_name || "BanquetEase"}
Guests: ${booking.guest_count || "—"}
Invoice #: ${booking.invoice_number || "—"}
──────────────────────────────
Financial Summary:
  Total Amount : ${fmt(booking.quote_total)}
  Amount Paid  : ${fmt(booking.total_paid)}
  Balance Due  : ${fmt(booking.balance_due)}
──────────────────────────────
${booking.payment_history?.length > 0 ? `\nPayment History:\n${booking.payment_history.map((ph) => `  • ${fmtDate(ph.date)}  ${fmt(ph.amount)}  via ${ph.mode?.replace(/_/g, " ") || "Cash"}${ph.ref ? "  Ref: " + ph.ref : ""}`).join("\n")}` : ""}

${booking.balance_due > 0 ? "Please complete your remaining payment at your earliest convenience." : "Your payment is complete. Thank you for your trust!"}

For any queries, feel free to reach out to us.

Regards,
BanquetEase Team`;
    shareViaEmail(email, subject, body);
  };

  const sharePaymentSummaryEmail = () => {
    const email = userProfile?.email || "";
    const subject = "My Payment Summary – BanquetEase";
    const body = `Dear ${userProfile?.displayName || "Valued Customer"},

Here is your current payment summary with BanquetEase:

──────────────────────────────
Total Paid     : ${fmt(customerSummary.totalPaid)}
Balance Due    : ${fmt(customerSummary.totalDue)}
Transactions   : ${customerSummary.transactionCount}
Enquiries      : ${customerSummary.enquiryCount}
──────────────────────────────
${
  customerPayments.length > 0
    ? `\nRecent Payments:\n${customerPayments
        .slice(0, 5)
        .map(
          (p) =>
            `  • ${fmtDate(p.date)}  ${fmt(p.amount)}  via ${p.mode?.replace(/_/g, " ") || "Cash"}${p.invoice_number ? "  #" + p.invoice_number : ""}`,
        )
        .join("\n")}`
    : ""
}

For any queries, feel free to reach out to us.

Regards,
BanquetEase Team`;
    shareViaEmail(email, subject, body);
  };

  const shareBusinessInsightsEmail = () => {
    const recipientEmail = userProfile?.email || "";
    const methodBreakdown = Object.entries(
      allPayments.reduce((acc, p) => {
        const mode = p.mode?.replace(/_/g, " ") || "Cash";
        acc[mode] = (acc[mode] || 0) + Number(p.amount || 0);
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .map(([mode, amt]) => `  • ${mode}: ${fmt(amt)}`)
      .join("\n");

    const subject = `Payments Insights Report – ${new Date().toLocaleDateString("en-IN")}`;
    const body = `Payments Insights Report
Generated: ${new Date().toLocaleString("en-IN")}
──────────────────────────────
Total Collected  : ${fmt(totalCollected)}
Outstanding      : ${fmt(totalOutstanding)}
This Month       : ${fmt(monthTotal)}
Total Payments   : ${allPayments.length}
Total Invoices   : ${invoices.length}
──────────────────────────────
Payment Method Breakdown:
${methodBreakdown || "  No data"}
──────────────────────────────

BanquetEase`;
    shareViaEmail(recipientEmail, subject, body);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        className="page-header"
        style={{ marginBottom: 24 }}
      >
        <div className="page-header-left">
          <h1>{isCustomer ? "My Payments & Bookings" : "Payments"}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {loading
              ? "Loading..."
              : isCustomer
                ? `${customerSummary.enquiryCount} enquiries · ${customerSummary.transactionCount} payments`
                : `${allPayments.length} payments across ${invoices.length} invoices`}
          </p>
        </div>
        <div
          className="page-actions"
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          {isCustomer && (
            <>
              <button
                className={`btn ${viewMode === "enquiries" ? "btn-primary" : "btn-outline"} btn-sm`}
                onClick={() => setViewMode("enquiries")}
              >
                My Enquiries
              </button>
              <button
                className={`btn ${viewMode === "customer" ? "btn-primary" : "btn-outline"} btn-sm`}
                onClick={() => setViewMode("customer")}
              >
                My Payments
              </button>
              <button
                className={`btn ${viewMode === "invoices" ? "btn-primary" : "btn-outline"} btn-sm`}
                onClick={() => setViewMode("invoices")}
              >
                Invoices
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={sharePaymentSummaryEmail}
                title="Share payment summary via email"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Mail size={14} />
                Share Summary
              </button>
            </>
          )}
          {!isCustomer && (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleExportPaymentsCSV}
                disabled={loading || allPayments.length === 0}
                title="Export all payments as CSV"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FileDown size={14} />
                Export Payments
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleExportInvoicesCSV}
                disabled={loading || invoices.length === 0}
                title="Export all invoices as CSV"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FileDown size={14} />
                Export Invoices
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={shareBusinessInsightsEmail}
                disabled={loading || allPayments.length === 0}
                title="Share insights report via email"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Mail size={14} />
                Share Report
              </button>
            </>
          )}
          <button
            className="btn btn-outline btn-sm"
            onClick={fetch_}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={fadeUp}
        className="kpi-row"
        style={{ marginBottom: 20 }}
      >
        {(isCustomer
          ? [
              {
                label: "Total Paid",
                val: fmt(customerSummary.totalPaid),
                icon: <DollarSign size={14} />,
              },
              {
                label: "Balance Due",
                val: fmt(customerSummary.totalDue),
                icon: <Clock size={14} />,
                warn: customerSummary.totalDue > 0,
              },
              {
                label: "Transactions",
                val: customerSummary.transactionCount ?? 0,
                icon: <CreditCard size={14} />,
              },
              {
                label: "Enquiries",
                val: customerSummary.enquiryCount ?? 0,
                icon: <TrendingUp size={14} />,
              },
            ]
          : [
              {
                label: "Total Collected",
                val: fmt(totalCollected),
                icon: <DollarSign size={14} />,
              },
              {
                label: "Outstanding",
                val: fmt(totalOutstanding),
                icon: <Clock size={14} />,
                warn: totalOutstanding > 0,
              },
              {
                label: "This Month",
                val: fmt(monthTotal),
                icon: <TrendingUp size={14} />,
              },
              {
                label: "Transactions",
                val: allPayments.length,
                icon: <CreditCard size={14} />,
              },
            ]
        ).map((k) => (
          <div key={k.label} className="card" style={{ padding: "12px 16px" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 3,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: k.warn ? "#dc2626" : "var(--color-text-h)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {k.icon}
              {k.val}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Business Insights Breakdown */}
      {!isCustomer &&
        !loading &&
        allPayments.length > 0 &&
        (() => {
          const methodTotals = allPayments.reduce((acc, p) => {
            const mode = p.mode?.replace(/_/g, " ") || "Cash";
            acc[mode] = (acc[mode] || 0) + Number(p.amount || 0);
            return acc;
          }, {});
          const methodEntries = Object.entries(methodTotals).sort(
            (a, b) => b[1] - a[1],
          );
          const maxVal = methodEntries[0]?.[1] || 1;

          const lastMonth = allPayments.filter((p) => {
            const d = new Date(p.date);
            const n = new Date();
            const lm = new Date(n.getFullYear(), n.getMonth() - 1, 1);
            return (
              d.getMonth() === lm.getMonth() &&
              d.getFullYear() === lm.getFullYear()
            );
          });
          const lastMonthTotal = lastMonth.reduce(
            (s, p) => s + Number(p.amount || 0),
            0,
          );
          const paidInvoices = invoices.filter(
            (inv) => inv.balance === 0 || inv.status === "paid",
          );
          const pendingInvoices = invoices.filter(
            (inv) => (inv.balance || 0) > 0,
          );

          return (
            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h2
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BarChart2 size={14} />
                  Insights
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {/* Payment Method Breakdown */}
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 12,
                    }}
                  >
                    Payment Methods
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {methodEntries.map(([mode, total]) => (
                      <div key={mode}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              textTransform: "capitalize",
                              color: "var(--color-text-body)",
                            }}
                          >
                            {mode}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text-h)",
                            }}
                          >
                            {fmt(total)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "var(--color-border)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(total / maxVal) * 100}%`,
                              background: "var(--color-primary, #b8953f)",
                              borderRadius: 3,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 12,
                    }}
                  >
                    Invoice Status
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        label: "Fully Paid",
                        val: paidInvoices.length,
                        pct: invoices.length
                          ? Math.round(
                              (paidInvoices.length / invoices.length) * 100,
                            )
                          : 0,
                        color: "#16a34a",
                      },
                      {
                        label: "Pending Payment",
                        val: pendingInvoices.length,
                        pct: invoices.length
                          ? Math.round(
                              (pendingInvoices.length / invoices.length) * 100,
                            )
                          : 0,
                        color: "#dc2626",
                      },
                    ].map((s) => (
                      <div key={s.label}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            marginBottom: 3,
                          }}
                        >
                          <span style={{ color: "var(--color-text-body)" }}>
                            {s.label}
                          </span>
                          <span style={{ fontWeight: 600, color: s.color }}>
                            {s.val} ({s.pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "var(--color-border)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${s.pct}%`,
                              background: s.color,
                              borderRadius: 3,
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div
                      style={{
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: 10,
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>
                        Last Month
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-h)",
                        }}
                      >
                        {fmt(lastMonthTotal)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>
                        Avg per Invoice
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--color-text-h)",
                        }}
                      >
                        {invoices.length
                          ? fmt(Math.round(totalCollected / invoices.length))
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

      {/* Error Banner */}
      {error && (
        <motion.div
          variants={fadeUp}
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#991b1b",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={15} />
          {error}
        </motion.div>
      )}

      {/* Content */}
      <motion.div variants={fadeUp}>
        {isCustomer ? (
          /* MY ENQUIRIES */
          viewMode === "enquiries" ? (
            customerLeads.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--color-text-muted)",
                }}
              >
                <TrendingUp
                  size={40}
                  style={{ margin: "0 auto 12px", opacity: 0.3 }}
                />
                <p style={{ fontSize: 15 }}>No enquiries yet.</p>
                <p style={{ fontSize: 13 }}>
                  Submit a new enquiry to get started.
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Section toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {customerLeads.length} enquir
                    {customerLeads.length === 1 ? "y" : "ies"}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleExportEnquiriesCSV}
                      title="Export enquiries as CSV"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <FileDown size={13} />
                      Export CSV
                    </button>
                  </div>
                </div>
                {customerLeads.map((lead, i) => {
                  const badge = STATUS_BADGES[lead.status] || {
                    variant: "neutral",
                    label: lead.status,
                  };
                  const hasFinancials = lead.quote_total > 0;
                  return (
                    <div
                      key={i}
                      className="card"
                      style={{ padding: "16px 18px" }}
                    >
                      {/* Top row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: "var(--color-text-h)",
                              marginBottom: 4,
                              textTransform: "capitalize",
                            }}
                          >
                            {lead.event_type || "Event"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-muted)",
                              display: "flex",
                              gap: 12,
                              flexWrap: "wrap",
                            }}
                          >
                            {lead.event_date && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <CalendarDays size={11} />
                                {fmtDate(lead.event_date)}
                              </span>
                            )}
                            {lead.hall_name && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <MapPin size={11} />
                                {lead.hall_name}
                              </span>
                            )}
                            {lead.guest_count > 0 && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Users size={11} />
                                {lead.guest_count} guests
                              </span>
                            )}
                            {lead.invoice_number && (
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 11,
                                }}
                              >
                                #{lead.invoice_number}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>

                      {/* Pipeline progress dots */}
                      <PipelineDots status={lead.status} />

                      {/* Financial summary — shown once booking is confirmed */}
                      {hasFinancials && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 10,
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid var(--color-border)",
                          }}
                        >
                          {[
                            {
                              label: "Quote Total",
                              val: fmt(lead.quote_total),
                            },
                            {
                              label: "Paid",
                              val: fmt(lead.total_paid),
                              color: "#16a34a",
                            },
                            {
                              label: "Balance Due",
                              val: fmt(lead.balance_due),
                              color:
                                lead.balance_due > 0 ? "#dc2626" : "#16a34a",
                            },
                          ].map((f) => (
                            <div key={f.label}>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                  textTransform: "uppercase",
                                  marginBottom: 2,
                                }}
                              >
                                {f.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: f.color || "var(--color-text-h)",
                                }}
                              >
                                {f.val}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Pay Online button for customers with balance due */}
                      {lead.balance_due > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <RazorpayButton
                            amount={lead.balance_due}
                            invoiceId={lead.invoice_id}
                            leadId={lead.id}
                            customerName={userProfile?.displayName || userProfile?.name}
                            customerEmail={userProfile?.email}
                            customerPhone={userProfile?.phone}
                            description={`${lead.event_type || "Event"} — ${lead.invoice_number || lead.id}`}
                            paymentType={lead.total_paid > 0 ? "balance" : "advance"}
                            franchiseId={fid}
                            branchId={bid}
                            recordedByUid={uid}
                            recordedByName={userProfile?.displayName || userProfile?.name}
                            className="btn-sm"
                            onSuccess={() => { fetch_(); }}
                            onError={(msg) => setError(msg)}
                          >
                            Pay Now ₹{Number(lead.balance_due).toLocaleString("en-IN")}
                          </RazorpayButton>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : /* MY PAYMENTS */
          viewMode === "customer" ? (
            customerPayments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--color-text-muted)",
                }}
              >
                <CreditCard
                  size={40}
                  style={{ margin: "0 auto 12px", opacity: 0.3 }}
                />
                <p style={{ fontSize: 15 }}>No payments made yet.</p>
                <p style={{ fontSize: 13 }}>
                  Your payments will appear here once recorded.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Section toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {customerPayments.length} payment
                    {customerPayments.length === 1 ? "" : "s"}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleExportCustomerPaymentsCSV}
                      title="Export payments as CSV"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <FileDown size={13} />
                      Export CSV
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={sharePaymentSummaryEmail}
                      title="Share payment summary via email"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Mail size={13} />
                      Share via Email
                    </button>
                  </div>
                </div>
                {customerPayments.map((p, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#16a34a",
                          }}
                        >
                          {fmt(p.amount)}
                        </span>
                        <Badge variant="accent">
                          {p.mode?.replace(/_/g, " ") || "Cash"}
                        </Badge>
                        {p.type && (
                          <Badge
                            variant="neutral"
                            style={{ textTransform: "capitalize" }}
                          >
                            {p.type}
                          </Badge>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <CalendarDays size={11} />
                          {fmtDate(p.date)}
                        </span>
                        {p.event_type && (
                          <span style={{ textTransform: "capitalize" }}>
                            {p.event_type}
                          </span>
                        )}
                        {p.event_date && <span>{fmtDate(p.event_date)}</span>}
                        {p.invoice_number && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                            }}
                          >
                            #{p.invoice_number}
                          </span>
                        )}
                        {p.ref && <span>Ref: {p.ref}</span>}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {p.balance_due > 0 && (
                        <div style={{ color: "#dc2626", fontWeight: 600 }}>
                          Due: {fmt(p.balance_due)}
                        </div>
                      )}
                      {p.balance_due === 0 && (
                        <div style={{ color: "#16a34a" }}>✓ Fully Paid</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : /* INVOICES */
          customerBookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "var(--color-text-muted)",
              }}
            >
              <FileText
                size={40}
                style={{ margin: "0 auto 12px", opacity: 0.3 }}
              />
              <p style={{ fontSize: 15 }}>No invoices yet.</p>
              <p style={{ fontSize: 13 }}>
                Invoices will appear after your bookings are confirmed.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {customerBookings.map((booking, i) => (
                <div key={i} className="card" style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "var(--color-text-h)",
                          marginBottom: 4,
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.event_type}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          display: "flex",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        {booking.event_date && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CalendarDays size={11} />
                            {fmtDate(booking.event_date)}
                          </span>
                        )}
                        {booking.hall_name && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <MapPin size={11} />
                            {booking.hall_name}
                          </span>
                        )}
                        {booking.guest_count > 0 && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Users size={11} />
                            {booking.guest_count} guests
                          </span>
                        )}
                        {booking.invoice_number && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                            }}
                          >
                            #{booking.invoice_number}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => shareInvoiceEmail(booking)}
                        title="Share this invoice via email"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Mail size={13} />
                        Share
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadInvoice(booking)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    {[
                      { label: "Total", val: fmt(booking.quote_total) },
                      {
                        label: "Paid",
                        val: fmt(booking.total_paid),
                        color: "#16a34a",
                      },
                      {
                        label: "Balance",
                        val: fmt(booking.balance_due),
                        color: booking.balance_due > 0 ? "#dc2626" : "#16a34a",
                      },
                    ].map((f) => (
                      <div key={f.label}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          {f.label}
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: f.color || "var(--color-text-h)",
                          }}
                        >
                          {f.val}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pay Online button for balance due */}
                  {booking.balance_due > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <RazorpayButton
                        amount={booking.balance_due}
                        invoiceId={booking.invoice_id}
                        leadId={booking.lead_id}
                        customerName={userProfile?.displayName || userProfile?.name}
                        customerEmail={userProfile?.email}
                        customerPhone={userProfile?.phone}
                        description={`${booking.event_type || "Event"} — ${booking.invoice_number || ""}`}
                        paymentType={booking.total_paid > 0 ? "balance" : "advance"}
                        franchiseId={fid}
                        branchId={bid}
                        recordedByUid={uid}
                        recordedByName={userProfile?.displayName || userProfile?.name}
                        className="btn-sm"
                        onSuccess={() => fetch_()}
                        onError={(msg) => setError(msg)}
                      >
                        Pay Now ₹{Number(booking.balance_due).toLocaleString("en-IN")}
                      </RazorpayButton>
                    </div>
                  )}
                  {/* Payment history breakdown */}
                  {booking.payment_history?.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Payment History
                      </div>
                      {booking.payment_history.map((ph, j) => (
                        <div
                          key={j}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "var(--color-text-body)",
                            padding: "4px 0",
                            borderBottom:
                              j < booking.payment_history.length - 1
                                ? "1px solid var(--color-border)"
                                : "none",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            >
                              {ph.type || "payment"}
                            </span>
                            <span style={{ color: "var(--color-text-muted)" }}>
                              {ph.mode?.replace(/_/g, " ") || "cash"}
                            </span>
                            {ph.ref && (
                              <span
                                style={{
                                  color: "var(--color-text-muted)",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 10,
                                }}
                              >
                                #{ph.ref}
                              </span>
                            )}
                          </span>
                          <span style={{ display: "flex", gap: 10 }}>
                            <span style={{ fontWeight: 600, color: "#16a34a" }}>
                              {fmt(ph.amount)}
                            </span>
                            <span style={{ color: "var(--color-text-muted)" }}>
                              {fmtDate(ph.date)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : /* BUSINESS VIEW */
        allPayments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--color-text-muted)",
            }}
          >
            <CreditCard
              size={40}
              style={{ margin: "0 auto 12px", opacity: 0.3 }}
            />
            <p style={{ fontSize: 15 }}>No payments recorded yet.</p>
            <p style={{ fontSize: 13 }}>
              Payments will show here once invoices receive payments.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Section toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                {allPayments.length} transaction
                {allPayments.length === 1 ? "" : "s"}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleExportPaymentsCSV}
                title="Export all payments as CSV"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FileDown size={13} />
                Export CSV
              </button>
            </div>
            {allPayments.map((p, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() =>
                  router.push(
                    `/billing/${p.invoice_id}?franchise_id=${fid}&branch_id=${bid}`,
                  )
                }
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#16a34a",
                      }}
                    >
                      {fmt(p.amount)}
                    </span>
                    <Badge variant="accent">
                      {p.mode?.replace(/_/g, " ") || "cash"}
                    </Badge>
                    {p.type && <Badge variant="neutral">{p.type}</Badge>}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{fmtDate(p.date)}</span>
                    <span>{p.customer_name}</span>
                    <span
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                    >
                      {p.invoice_number}
                    </span>
                    {p.ref && <span>Ref: {p.ref}</span>}
                    {p.received_by && <span>by {p.received_by}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
