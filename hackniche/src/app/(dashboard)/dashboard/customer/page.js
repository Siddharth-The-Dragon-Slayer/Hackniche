"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  CalendarDays,
  CreditCard,
  Clock,
  MapPin,
  Users,
  Plus,
  ChevronRight,
  CheckCircle2,
  Circle,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";

// Simplified pipeline stages shown to customers
const CUSTOMER_STAGES = [
  { key: "new", label: "Enquiry Received" },
  { key: "visited", label: "Site Visit Done" },
  { key: "tasting_done", label: "Tasting Done" },
  { key: "menu_selected", label: "Menu Finalised" },
  { key: "advance_paid", label: "Booking Confirmed" },
  { key: "decoration_scheduled", label: "Decor Planned" },
  { key: "paid", label: "Fully Paid" },
  { key: "completed", label: "Event Done" },
];
const STAGE_ORDER = CUSTOMER_STAGES.map((s) => s.key);

const STATUS_STYLE = {
  new: { bg: "#dbeafe", color: "#1d4ed8" },
  visited: { bg: "#ede9fe", color: "#6d28d9" },
  tasting_scheduled: { bg: "#fef3c7", color: "#d97706" },
  tasting_done: { bg: "#fde68a", color: "#b45309" },
  menu_selected: { bg: "#d1fae5", color: "#065f46" },
  advance_paid: { bg: "#ecfdf5", color: "#059669" },
  decoration_scheduled: { bg: "#e0f2fe", color: "#0369a1" },
  paid: { bg: "#dcfce7", color: "#16a34a" },
  in_progress: { bg: "#fef3c7", color: "#b45309" },
  completed: { bg: "#f0fdf4", color: "#15803d" },
  closed: { bg: "#f1f5f9", color: "#475569" },
  lost: { bg: "#fee2e2", color: "#991b1b" },
};

function statusLabel(s) {
  const m = {
    new: "Enquiry Received",
    visited: "Site Visited",
    tasting_scheduled: "Tasting Scheduled",
    tasting_done: "Tasting Done",
    menu_selected: "Menu Finalised",
    advance_paid: "Booking Confirmed",
    decoration_scheduled: "Decor Planned",
    paid: "Fully Paid",
    in_progress: "In Progress",
    completed: "Event Done",
    closed: "Closed",
    lost: "Cancelled",
  };
  return m[s] || s;
}

function stageProgress(status) {
  const idx = STAGE_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export default function CustomerDashboard() {
  const { userProfile } = useAuth();
  const uid = userProfile?.uid;
  const name = userProfile?.name || "there";

  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, completed, payments, logs

  const fetchLeads = useCallback(() => {
    if (!uid) return;
    fetch(`/api/leads?customer_uid=${uid}`)
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [uid]);

  // Fetch bookings linked to this customer's leads
  const fetchBookings = useCallback(() => {
    if (!uid || leads.length === 0) return;
    // For simplicity, fetch all bookings - can be optimized with customer_uid filtering
    const leadIds = leads.map((l) => l.id);
    Promise.all(
      leadIds.map((leadId) =>
        fetch(`/api/bookings?lead_id=${leadId}`)
          .then((r) => r.json())
          .catch(() => ({ bookings: [] })),
      ),
    )
      .then((results) => {
        const allBookings = results.flatMap((r) => r.bookings || []);
        setBookings(allBookings);
      })
      .catch(() => {});
  }, [uid, leads]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (leads.length > 0) {
      fetchBookings();
    }
  }, [leads, fetchBookings]);

  // Auto-poll every 30 s so customers see their booking confirmed status live.
  useEffect(() => {
    const id = setInterval(fetchLeads, 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const activeLeads = leads.filter(
    (l) => !["closed", "lost", "completed"].includes(l.status),
  );
  const completedLeads = leads.filter(
    (l) => l.status === "completed" || l.status === "closed",
  );

  const today = new Date();
  const in30 = new Date();
  in30.setDate(today.getDate() + 30);
  const upcoming = leads.filter((l) => {
    if (!l.event_date) return false;
    const d = new Date(l.event_date);
    return d >= today && d <= in30;
  });

  // ── Inner tab components ────────────────────────────────────────

  function ActiveTab() {
    if (loading)
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 14,
                background: "var(--color-surface-2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      );

    if (activeLeads.length === 0)
      return (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            No active enquiries yet.
          </p>
          <Link
            href="/leads/create"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Submit Your First Enquiry
          </Link>
        </div>
      );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {activeLeads.map((lead, idx) => {
          const st = STATUS_STYLE[lead.status] || {};
          const progress = stageProgress(lead.status);
          const pct = Math.round((progress / (STAGE_ORDER.length - 1)) * 100);
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      marginBottom: 4,
                    }}
                  >
                    {lead.event_type}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <CalendarDays size={12} /> {lead.event_date || "--"}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Users size={12} /> {lead.expected_guest_count} guests
                    </span>
                    {lead.hall_name && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <MapPin size={12} /> {lead.hall_name}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  style={{
                    background: st.bg,
                    color: st.color,
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {statusLabel(lead.status)}
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span>Enquiry</span>
                  <span>Booking</span>
                  <span>Event</span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "var(--color-primary-ghost)",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "var(--gradient-bar)",
                      borderRadius: 3,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {CUSTOMER_STAGES.map((stage, i) => {
                  const done = i <= progress;
                  const current = i === progress;
                  return (
                    <div
                      key={stage.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      {i > 0 && (
                        <div
                          style={{
                            width: 16,
                            height: 2,
                            background: done
                              ? "var(--color-primary)"
                              : "var(--color-border)",
                          }}
                        />
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {done ? (
                          <CheckCircle2
                            size={14}
                            style={{
                              color: current
                                ? "var(--color-primary)"
                                : "var(--color-success)",
                            }}
                          />
                        ) : (
                          <Circle
                            size={14}
                            style={{ color: "var(--color-border)" }}
                          />
                        )}
                        {current && (
                          <span
                            style={{
                              fontSize: 9,
                              color: "var(--color-primary)",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {stage.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {lead.assigned_to_name && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  Your point of contact:{" "}
                  <strong style={{ color: "var(--color-text-h)" }}>
                    {lead.assigned_to_name}
                  </strong>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  function CompletedTab() {
    if (loading)
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 120,
                borderRadius: 14,
                background: "var(--color-surface-2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      );
    if (completedLeads.length === 0)
      return (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
            No completed events yet.
          </p>
        </div>
      );
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {completedLeads.map((lead) => (
          <div key={lead.id} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                }}
              >
                {lead.event_type}
              </h3>
              <span
                style={{
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                Done
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span>
                <CalendarDays
                  size={12}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {lead.event_date}
              </span>
              <span>
                <Users
                  size={12}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {lead.expected_guest_count} guests
                {lead.hall_name ? " - " + lead.hall_name : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function PaymentsTab() {
    if (loading)
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 100,
                borderRadius: 14,
                background: "var(--color-surface-2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      );
    if (bookings.length === 0)
      return (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <CreditCard
            size={40}
            style={{ margin: "0 auto 16px", opacity: 0.3 }}
          />
          <p style={{ color: "var(--color-text-muted)" }}>
            No payment records yet.
          </p>
        </div>
      );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bookings.map((booking) => {
          const payments = booking.payments || {};
          const totalPaid = payments.total_paid || 0;
          const quoteTtl = payments.quote_total || 0;
          const paidPct =
            quoteTtl > 0 ? Math.round((totalPaid / quoteTtl) * 100) : 0;
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}
                  >
                    {booking.customer_name} - {booking.event_type}
                  </h3>
                  <div
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    Event: {booking.event_date} |{" "}
                    {booking.expected_guest_count || "?"} guests
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    ₹{totalPaid.toLocaleString("en-IN")}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    of ₹{quoteTtl.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginBottom: 4,
                  }}
                >
                  <span>Payment Progress</span>
                  <span>{paidPct}%</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: "var(--color-border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${paidPct}%`,
                      height: "100%",
                      background: "var(--color-success)",
                      transition: "width 0.5s",
                    }}
                  />
                </div>
              </div>
              {payments.payment_history &&
                payments.payment_history.length > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      background: "var(--color-surface-2)",
                      borderRadius: 8,
                      padding: 12,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "var(--color-text-h)",
                      }}
                    >
                      Payment History:
                    </div>
                    {payments.payment_history.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          padding: "4px 0",
                          borderBottom:
                            i < payments.payment_history.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                        }}
                      >
                        <span>
                          <strong>
                            ₹{(p.amount || 0).toLocaleString("en-IN")}
                          </strong>{" "}
                          • {p.mode || "—"} • {p.type || "payment"}
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          {p.date || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              {payments.balance_due > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: "#fee2e2",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#991b1b",
                  }}
                >
                  <strong>Balance Due:</strong> ₹
                  {payments.balance_due.toLocaleString("en-IN")}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  function LogsTab() {
    if (loading)
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 60,
                borderRadius: 8,
                background: "var(--color-surface-2)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      );
    if (leads.length === 0)
      return (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <FileText size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ color: "var(--color-text-muted)" }}>
            No lead history yet.
          </p>
        </div>
      );
    return (
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "var(--color-surface-2)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Lead ID
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Event Type
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Created At
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: 13,
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    <Link
                      href={`/leads/${lead.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {lead.id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    {lead.event_type || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {lead.event_date || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background:
                          lead.status === "completed"
                            ? "#dcfce7"
                            : lead.status === "lost"
                              ? "#fee2e2"
                              : "var(--color-primary-ghost)",
                        color:
                          lead.status === "completed"
                            ? "#15803d"
                            : lead.status === "lost"
                              ? "#991b1b"
                              : "var(--color-primary)",
                      }}
                    >
                      {lead.status || "—"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                      fontSize: 12,
                    }}
                  >
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                      fontSize: 12,
                    }}
                  >
                    {lead.updated_at
                      ? new Date(lead.updated_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-text-h)",
            }}
          >
            Welcome back, {name}!
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Track your event enquiries and bookings
          </p>
        </div>
        <Link
          href="/leads/create"
          className="btn btn-primary"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plus size={16} /> New Enquiry
        </Link>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            icon: <CalendarDays size={20} />,
            label: "Total Enquiries",
            value: loading ? "..." : leads.length,
            color: "var(--color-primary)",
          },
          {
            icon: <Clock size={20} />,
            label: "Active",
            value: loading ? "..." : activeLeads.length,
            color: "var(--color-accent)",
          },
          {
            icon: <CalendarDays size={20} />,
            label: "Upcoming (30d)",
            value: loading ? "..." : upcoming.length,
            color: "var(--color-success)",
          },
          {
            icon: <CreditCard size={20} />,
            label: "Completed Events",
            value: loading ? "..." : completedLeads.length,
            color: "#64748b",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="kpi-card"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--color-primary-ghost)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: kpi.color,
                }}
              >
                {kpi.icon}
              </div>
            </div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 360° Hall Tours promo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/dashboard/customer/hall-tours"
          style={{ textDecoration: "none", display: "block", marginBottom: 32 }}
        >
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "stretch",
              minHeight: 120,
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(212,175,55,0.15)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.transform = "";
            }}
          >
            <div
              style={{
                width: 140,
                minHeight: "100%",
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(212,175,55,0.15)",
                  border: "2px solid rgba(212,175,55,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Eye size={24} style={{ color: "#D4AF37" }} />
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    360° Virtual Hall Tours
                  </h3>
                  <span
                    style={{
                      background: "rgba(212,175,55,0.15)",
                      color: "#D4AF37",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 6,
                      letterSpacing: "0.5px",
                    }}
                  >
                    NEW
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Explore our banquet halls in immersive 360° — Kalyan West
                  Grand Hall &amp; more
                </p>
              </div>
              <ChevronRight
                size={22}
                style={{ color: "var(--color-primary)", flexShrink: 0 }}
              />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Tabs for different views */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        {[
          { key: "active", label: "Active Enquiries" },
          { key: "completed", label: "Past Events" },
          { key: "payments", label: "Payments" },
          { key: "logs", label: "Leads History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 700 : 400,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              color:
                activeTab === tab.key
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ACTIVE ENQUIRIES TAB ── */}
      {activeTab === "active" && <ActiveTab />}

      {/* ── COMPLETED/PAST EVENTS TAB ── */}
      {activeTab === "completed" && <CompletedTab />}

      {/* ── PAYMENTS TAB ── */}
      {activeTab === "payments" && <PaymentsTab />}

      {/* ── LEADS HISTORY/LOGS TAB ── */}
      {activeTab === "logs" && <LogsTab />}

      {/* ── CTA if no leads at all ── */}
      {!loading && leads.length === 0 && activeTab === "active" && (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
            background: "var(--color-primary-ghost)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--color-text-h)",
              marginBottom: 8,
              fontFamily: "var(--font-display)",
            }}
          >
            Planning an Event?
          </h3>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 14,
              maxWidth: 400,
              margin: "0 auto 20px",
            }}
          >
            Submit an enquiry and our team will help you plan the perfect event
            at any of our venues.
          </p>
          <Link
            href="/leads/create"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Submit an Enquiry →
          </Link>
        </div>
      )}
    </div>
  );
}
