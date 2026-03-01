"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";

/* ── helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  if (n == null) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
const STATUS_COLORS = {
  paid:    { bg: "rgba(39,174,96,0.12)",  text: "#27ae60", label: "Paid" },
  partial: { bg: "rgba(243,156,18,0.12)", text: "#e67e22", label: "Partial" },
  sent:    { bg: "rgba(52,152,219,0.12)", text: "#2980b9", label: "Sent" },
  draft:   { bg: "rgba(127,140,141,0.12)",text: "#7f8c8d", label: "Draft" },
  overdue: { bg: "rgba(192,57,43,0.12)",  text: "var(--color-danger)", label: "Overdue" },
};
function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      background: c.bg,
      color: c.text,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.3,
      textTransform: "capitalize",
    }}>{c.label}</span>
  );
}

/* ── invoice card ─────────────────────────────────────────────── */
function InvoiceCard({ inv }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      className="card"
      style={{ marginBottom: 0, overflow: "hidden" }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "18px 20px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          alignItems: "center",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--color-text-h)",
              fontFamily: "var(--font-display)",
            }}>
              {inv.invoice_number || inv.id}
            </span>
            <StatusBadge status={inv.status} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {inv.event_type && (
              <span style={{ fontSize: 13, color: "var(--color-text-body)" }}>
                🎉 {inv.event_type}
              </span>
            )}
            {inv.event_date && (
              <span style={{ fontSize: 13, color: "var(--color-text-body)" }}>
                📅 {fmtDate(inv.event_date)}
              </span>
            )}
            {inv.due_date && (
              <span style={{ fontSize: 13, color: "var(--color-text-body)" }}>
                📆 Due: {fmtDate(inv.due_date)}
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right", minWidth: 130 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
            {fmt(inv.total)}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 2 }}>
            <span style={{ fontSize: 12, color: "#27ae60" }}>✅ {fmt(inv.amount_paid)}</span>
            {inv.balance_due > 0 && (
              <span style={{ fontSize: 12, color: "var(--color-danger)" }}>⏳ {fmt(inv.balance_due)}</span>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--color-text-body)", opacity: 0.7 }}>
            {expanded ? "▲ Hide details" : "▼ View details"}
          </div>
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 20px 20px",
              borderTop: "1px solid var(--color-border)",
              paddingTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>

              {/* Line items */}
              {inv.line_items?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-h)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Items
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--color-primary-ghost)" }}>
                          <th style={thStyle}>Description</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Qty</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Rate</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.line_items.map((li, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={tdStyle}>{li.description}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{li.qty}</td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(li.rate)}</td>
                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmt(li.amount)}</td>
                          </tr>
                        ))}
                        <tr style={{ background: "var(--color-primary-ghost)" }}>
                          <td colSpan={3} style={{ ...tdStyle, fontWeight: 600, textAlign: "right" }}>Subtotal</td>
                          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmt(inv.subtotal)}</td>
                        </tr>
                        {inv.discount > 0 && (
                          <tr>
                            <td colSpan={3} style={{ ...tdStyle, textAlign: "right", color: "#27ae60" }}>Discount</td>
                            <td style={{ ...tdStyle, textAlign: "right", color: "#27ae60" }}>– {fmt(inv.discount)}</td>
                          </tr>
                        )}
                        {inv.tax_amount > 0 && (
                          <tr>
                            <td colSpan={3} style={{ ...tdStyle, textAlign: "right" }}>
                              Tax ({((inv.tax_rate || 0) * 100).toFixed(0)}%)
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(inv.tax_amount)}</td>
                          </tr>
                        )}
                        <tr style={{ background: "var(--color-primary-ghost)" }}>
                          <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, textAlign: "right", color: "var(--color-primary)" }}>Total</td>
                          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "var(--color-primary)", fontSize: 15 }}>{fmt(inv.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment history */}
              {inv.payment_history?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-h)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Payment History
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {inv.payment_history.map((p, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "var(--color-primary-ghost)",
                        flexWrap: "wrap",
                        gap: 8,
                      }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-h)" }}>
                            {fmt(p.amount)}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--color-text-body)", marginLeft: 8 }}>
                            via {p.mode || "—"}
                            {p.type ? ` · ${p.type}` : ""}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-body)", opacity: 0.7 }}>
                          {fmtDate(p.date)}{p.recorded_by ? ` · ${p.recorded_by}` : ""}
                          {p.ref && p.ref !== "null" ? ` · Ref: ${p.ref}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary strip */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 12,
              }}>
                {[
                  { label: "Total", value: fmt(inv.total), color: "var(--color-primary)" },
                  { label: "Paid",  value: fmt(inv.amount_paid),  color: "#27ae60" },
                  { label: "Balance Due", value: fmt(inv.balance_due), color: inv.balance_due > 0 ? "var(--color-danger)" : "#27ae60" },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: "var(--color-bg-page)",
                    border: "1px solid var(--color-border)",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-body)", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {inv.notes && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-body)", fontStyle: "italic" }}>
                  📝 {inv.notes}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const thStyle = {
  padding: "8px 12px",
  textAlign: "left",
  fontWeight: 600,
  color: "var(--color-text-h)",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "8px 12px",
  color: "var(--color-text-body)",
};

/* ── main page ─────────────────────────────────────────────────── */
export default function CustomerInvoicesPage() {
  const { user, userProfile } = useAuth();
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [statusFilter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const email       = userProfile?.email || user?.email;
    const uid         = user?.uid;
    const franchise   = userProfile?.franchise_id;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (email)    params.set("customer_email", email);
        if (uid)      params.set("customer_uid",   uid);
        if (franchise) params.set("franchise_id",  franchise);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const res  = await fetch(`/api/invoices?${params}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        setInvoices(data.invoices || []);
        
        if (!res.ok && data.error) {
          setError(data.error);
        }
      } catch (e) {
        if (e.name === "AbortError") {
          setError("Request took too long. Please refresh and try again.");
        } else {
          setError(e.message || "Failed to load invoices");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, userProfile]);

  /* derived */
  const filtered =
    statusFilter === "all" ? invoices : invoices.filter((i) => i.status === statusFilter);

  const totals = invoices.reduce(
    (acc, inv) => ({
      total:   acc.total   + (inv.total        || 0),
      paid:    acc.paid    + (inv.amount_paid   || 0),
      balance: acc.balance + (inv.balance_due   || 0),
    }),
    { total: 0, paid: 0, balance: 0 }
  );

  const statuses = ["all", ...Array.from(new Set(invoices.map((i) => i.status)))];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      style={{ padding: "24px 20px", maxWidth: 860, margin: "0 auto" }}
    >
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
        <h1 style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 800,
          color: "var(--color-text-h)",
          fontFamily: "var(--font-display)",
        }}>
          💳 My Payments &amp; Invoices
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-text-body)" }}>
          All your invoices and payment history in one place
        </p>
      </motion.div>

      {/* KPI strip */}
      {!loading && invoices.length > 0 && (
        <motion.div
          variants={fadeUp}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Invoiced", value: fmt(totals.total),   icon: "🧾", color: "var(--color-primary)" },
            { label: "Total Paid",     value: fmt(totals.paid),     icon: "✅", color: "#27ae60" },
            { label: "Balance Due",    value: fmt(totals.balance),  icon: "⏳", color: totals.balance > 0 ? "var(--color-danger)" : "#27ae60" },
            { label: "Invoices",       value: invoices.length,      icon: "📄", color: "var(--color-primary)" },
          ].map((kpi) => (
            <div key={kpi.label} className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{kpi.icon}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-body)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: kpi.color, fontFamily: "var(--font-display)" }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter chips */}
      {!loading && invoices.length > 0 && (
        <motion.div
          variants={fadeUp}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
        >
          {statuses.map((s) => {
            const c = STATUS_COLORS[s] || {};
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: active ? "2px solid var(--color-primary)" : "2px solid var(--color-border)",
                  background: active ? "var(--color-primary-ghost)" : "transparent",
                  color: active ? "var(--color-primary)" : "var(--color-text-body)",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s === "all" ? `All (${invoices.length})` : `${s} (${invoices.filter((i) => i.status === s).length})`}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* States */}
      {loading && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }}>⏳</div>
          <p style={{ color: "var(--color-text-body)", margin: "0 0 6px", fontWeight: 600 }}>
            Loading your invoices…
          </p>
          <p style={{ color: "var(--color-text-body)", margin: 0, fontSize: 13, opacity: 0.7 }}>
            This may take a moment on first load
          </p>
        </motion.div>
      )}

      {!loading && error && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "var(--color-danger)", margin: "0 0 16px", fontSize: 14 }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            🔄 Retry
          </button>
        </motion.div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ margin: "0 0 8px", color: "var(--color-text-h)", fontFamily: "var(--font-display)" }}>
            No invoices yet
          </h3>
          <p style={{ margin: 0, color: "var(--color-text-body)", fontSize: 14 }}>
            Once your booking is confirmed, invoices will appear here.
          </p>
        </motion.div>
      )}

      {/* Invoice list */}
      {!loading && !error && filtered.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {filtered.map((inv) => (
            <InvoiceCard key={inv.id} inv={inv} />
          ))}
        </motion.div>
      )}

      {!loading && !error && invoices.length > 0 && filtered.length === 0 && (
        <motion.div variants={fadeUp} className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--color-text-body)" }}>
            No invoices with status <strong>{statusFilter}</strong>.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
