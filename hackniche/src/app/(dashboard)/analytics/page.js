"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Loader2,
  AlertTriangle,
  Package,
  ShoppingCart,
  FileDown,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Users,
  CheckCircle2,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import { useAuth } from "@/contexts/auth-context";

const tabs = [
  "Revenue",
  "Bookings",
  "Leads",
  "Payments",
  "Inventory",
  "Events",
  "Staff",
];
const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function AnalyticsPage() {
  const [active, setActive] = useState("Revenue");
  const { userProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || "pfd";
  const branchId = userProfile?.branch_id || null; // null = franchise-level
  const COLORS = [
    "var(--color-primary)",
    "var(--color-accent)",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  // ── Live data state ──────────────────────────────────────────────
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invData, setInvData] = useState(null);
  const [invLoading, setInvLoading] = useState(false);

  // Lazy-load data per active tab
  useEffect(() => {
    const loadInvoices = async () => {
      if (invoices.length > 0 || invoicesLoading) return;
      setInvoicesLoading(true);
      try {
        const url = branchId
          ? `/api/billing?franchise_id=${franchiseId}&branch_id=${branchId}`
          : `/api/billing?franchise_id=${franchiseId}`;
        const d = await fetch(url).then((r) => r.json());
        if (d.invoices) setInvoices(d.invoices);
      } catch (e) {
        console.error(e);
      } finally {
        setInvoicesLoading(false);
      }
    };
    const loadBookings = async () => {
      if (bookings.length > 0 || bookingsLoading) return;
      setBookingsLoading(true);
      try {
        const url = branchId
          ? `/api/bookings?franchise_id=${franchiseId}&branch_id=${branchId}`
          : `/api/bookings?franchise_id=${franchiseId}`;
        const d = await fetch(url).then((r) => r.json());
        if (d.bookings) setBookings(d.bookings);
      } catch (e) {
        console.error(e);
      } finally {
        setBookingsLoading(false);
      }
    };
    const loadLeads = async () => {
      if (leads.length > 0 || leadsLoading) return;
      setLeadsLoading(true);
      try {
        const url = branchId
          ? `/api/leads?franchise_id=${franchiseId}&branch_id=${branchId}`
          : `/api/leads?franchise_id=${franchiseId}`;
        const d = await fetch(url).then((r) => r.json());
        if (d.leads) setLeads(d.leads);
      } catch (e) {
        console.error(e);
      } finally {
        setLeadsLoading(false);
      }
    };
    const loadInventory = async () => {
      if (invData || invLoading) return;
      setInvLoading(true);
      try {
        const d = await fetch(
          `/api/kitchen-inventory/analytics?franchise_id=${franchiseId}`,
        ).then((r) => r.json());
        if (d.success) setInvData(d.data);
      } catch (e) {
        console.error(e);
      } finally {
        setInvLoading(false);
      }
    };

    if (["Revenue", "Payments"].includes(active)) loadInvoices();
    if (active === "Bookings") loadBookings();
    if (["Leads", "Events"].includes(active)) loadLeads();
    if (active === "Inventory") loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ── Derived computations ──────────────────────────────────────────
  const now = new Date();

  // Revenue
  const allPaymentRecs = invoices.flatMap((inv) =>
    (inv.payments || []).map((p) => ({ ...p, branch_id: inv.branch_id })),
  );
  const totalRevenue = allPaymentRecs.reduce(
    (s, p) => s + Number(p.amount || 0),
    0,
  );
  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdRevenue = allPaymentRecs
    .filter((p) => new Date(p.date || p.recorded_at || 0) >= mtdStart)
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const revenueByMonth = (() => {
    const map = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map[d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })] =
        0;
    }
    allPaymentRecs.forEach((p) => {
      const d = new Date(p.date || p.recorded_at || 0);
      const key = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      if (key in map) map[key] += Number(p.amount || 0);
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  })();
  const paymentMethodBreakdown = Object.entries(
    allPaymentRecs.reduce((acc, p) => {
      const m = p.mode?.replace(/_/g, " ") || "Cash";
      acc[m] = (acc[m] || 0) + Number(p.amount || 0);
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const avgPayment =
    allPaymentRecs.length > 0
      ? Math.round(totalRevenue / allPaymentRecs.length)
      : 0;
  const outstandingBalance = invoices.reduce(
    (s, inv) => s + Number(inv.balance || 0),
    0,
  );

  // Bookings
  const CONVERTED_STATUSES = [
    "advance_paid",
    "decoration_scheduled",
    "full_payment_pending",
    "paid",
    "in_progress",
    "completed",
    "settlement_pending",
    "settlement_complete",
    "closed",
  ];
  const bookingStatusData = [
    {
      name: "Confirmed",
      color: "#10b981",
      value: bookings.filter((b) => b.status === "confirmed").length,
    },
    {
      name: "In Progress",
      color: "#6366f1",
      value: bookings.filter((b) => b.status === "in_progress").length,
    },
    {
      name: "Completed",
      color: "#06b6d4",
      value: bookings.filter((b) => b.status === "completed").length,
    },
    {
      name: "Cancelled",
      color: "#ef4444",
      value: bookings.filter((b) => b.status === "cancelled").length,
    },
  ].filter((s) => s.value > 0);
  const totalBookingRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce(
      (s, b) => s + (b.payments?.quote_total || b.payments?.total_paid || 0),
      0,
    );

  // Leads
  const LEAD_STAGE_LABELS = [
    { key: "new", label: "New Enquiry" },
    { key: "contacted", label: "Contacted" },
    { key: "visited", label: "Site Visit" },
    { key: "tasting_done", label: "Tasting Done" },
    { key: "menu_selected", label: "Menu Selected" },
    { key: "advance_paid", label: "Advance Paid" },
    { key: "decoration_scheduled", label: "Decor Scheduled" },
    { key: "paid", label: "Fully Paid" },
    { key: "completed", label: "Completed" },
    { key: "lost", label: "Lost" },
  ];
  const leadFunnelData = LEAD_STAGE_LABELS.map((s) => ({
    stage: s.label,
    count: leads.filter((l) => l.status === s.key).length,
  })).filter((s) => s.count > 0);
  const convertedLeads = leads.filter((l) =>
    CONVERTED_STATUSES.includes(l.status),
  );
  const conversionRate =
    leads.length > 0
      ? Math.round((convertedLeads.length / leads.length) * 100)
      : 0;
  const eventTypeBreakdown = Object.entries(
    leads.reduce((acc, l) => {
      const t = l.event_type || "Other";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Events (from leads with event_date)
  const today = new Date();
  const in30 = new Date();
  in30.setDate(today.getDate() + 30);
  const upcomingEvents = leads
    .filter((l) => {
      if (!l.event_date) return false;
      const d = new Date(l.event_date);
      return d >= today && d <= in30;
    })
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  const totalGuests = leads
    .filter((l) => l.expected_guest_count)
    .reduce((s, l) => s + Number(l.expected_guest_count || 0), 0);

  // ── CSV Export ───────────────────────────────────────────────────
  const exportCSV = (rows, filename) => {
    if (!rows?.length) return alert("No data to export.");
    const headers = Object.keys(rows[0]);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
    ].join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: filename,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExport = () => {
    if (active === "Revenue" || active === "Payments") {
      exportCSV(
        allPaymentRecs.map((p) => ({
          Date: p.date || p.recorded_at || "",
          Amount: Number(p.amount || 0),
          Mode: p.mode?.replace(/_/g, " ") || "Cash",
          Type: p.type || "",
          Ref: p.ref || "",
          Branch: p.branch_id || "",
        })),
        `analytics-revenue-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } else if (active === "Bookings") {
      exportCSV(
        bookings.map((b) => ({
          Customer: b.customer_name || "",
          "Event Type": b.event_type || "",
          "Event Date": b.event_date || "",
          Hall: b.hall_name || "",
          Guests: b.expected_guest_count || 0,
          "Quote Total": b.payments?.quote_total || 0,
          Status: b.status || "",
          Branch: b.branch_id || "",
        })),
        `analytics-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } else if (active === "Leads" || active === "Events") {
      exportCSV(
        leads.map((l) => ({
          Name: l.customer_name || "",
          Phone: l.phone || "",
          "Event Type": l.event_type || "",
          "Event Date": l.event_date || "",
          Guests: l.expected_guest_count || 0,
          Status: l.status || "",
          "Quote Total": l.quote?.total_estimated || 0,
          Branch: l.branch_id || "",
        })),
        `analytics-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } else {
      alert("Export not available for this tab.");
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>Reports and insights</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleExport}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <FileDown size={14} /> Export CSV
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="tab-list">
          {tabs.map((t) => (
            <div
              key={t}
              className={`tab-item ${active === t ? "active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="card" style={{ padding: 24 }}>
          {active === "Revenue" && (
            <div>
              {invoicesLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading revenue data…
                  </p>
                </div>
              ) : (
                <>
                  {/* KPI row */}
                  <div className="kpi-row" style={{ marginBottom: 24 }}>
                    {[
                      {
                        label: "Total Collected",
                        value: fmt(totalRevenue),
                        icon: <DollarSign size={16} />,
                      },
                      {
                        label: "Revenue (MTD)",
                        value: fmt(mtdRevenue),
                        icon: <TrendingUp size={16} />,
                      },
                      {
                        label: "Outstanding",
                        value: fmt(outstandingBalance),
                        icon: <CalendarDays size={16} />,
                        warn: outstandingBalance > 0,
                      },
                      {
                        label: "Payments Count",
                        value: allPaymentRecs.length,
                        icon: <CheckCircle2 size={16} />,
                      },
                      {
                        label: "Avg Payment",
                        value: fmt(avgPayment),
                        icon: <DollarSign size={16} />,
                      },
                    ].map((k, i) => (
                      <div key={i} className="kpi-card">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <div className="kpi-label">{k.label}</div>
                          <div
                            style={{
                              color: k.warn
                                ? "#dc2626"
                                : "var(--color-primary)",
                              opacity: 0.6,
                            }}
                          >
                            {k.icon}
                          </div>
                        </div>
                        <div
                          className="kpi-value"
                          style={{ color: k.warn ? "#dc2626" : undefined }}
                        >
                          {k.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      marginBottom: 16,
                    }}
                  >
                    Monthly Revenue Collected (12 months)
                  </h3>
                  {allPaymentRecs.length === 0 ? (
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      No payment records yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueByMonth}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-border)"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{
                            fontSize: 11,
                            fill: "var(--color-text-muted)",
                          }}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "var(--color-text-muted)",
                          }}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                          formatter={(v) => [fmt(v), "Collected"]}
                          labelStyle={{ color: "var(--color-text-h)" }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="var(--color-primary)"
                          radius={[6, 6, 0, 0]}
                          name="Revenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {paymentMethodBreakdown.length > 0 && (
                    <>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text-h)",
                          marginTop: 32,
                          marginBottom: 16,
                        }}
                      >
                        Payment Method Breakdown
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: 24,
                          alignItems: "center",
                        }}
                      >
                        <ResponsiveContainer width="40%" height={220}>
                          <PieChart>
                            <Pie
                              data={paymentMethodBreakdown}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              innerRadius={35}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {paymentMethodBreakdown.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => fmt(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {paymentMethodBreakdown.map((m, i) => (
                            <div
                              key={m.name}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: 13,
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background:
                                      PIE_COLORS[i % PIE_COLORS.length],
                                    display: "inline-block",
                                  }}
                                />
                                {m.name}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontWeight: 600,
                                }}
                              >
                                {fmt(m.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Bookings" && (
            <div>
              {bookingsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading bookings…
                  </p>
                </div>
              ) : (
                <>
                  <div className="kpi-row" style={{ marginBottom: 24 }}>
                    {[
                      { label: "Total Bookings", value: bookings.length },
                      {
                        label: "Confirmed",
                        value: bookings.filter((b) => b.status === "confirmed")
                          .length,
                      },
                      {
                        label: "Completed",
                        value: bookings.filter((b) => b.status === "completed")
                          .length,
                      },
                      {
                        label: "Cancelled",
                        value: bookings.filter((b) => b.status === "cancelled")
                          .length,
                      },
                      { label: "Quote Value", value: fmt(totalBookingRevenue) },
                    ].map((k, i) => (
                      <div key={i} className="kpi-card">
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value">{k.value}</div>
                      </div>
                    ))}
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      marginBottom: 16,
                    }}
                  >
                    Booking Status Distribution
                  </h3>
                  {bookings.length === 0 ? (
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      No bookings yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={bookingStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={45}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {bookingStatusData.map((s, i) => (
                              <Cell key={i} fill={s.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          justifyContent: "center",
                        }}
                      >
                        {bookingStatusData.map((s) => (
                          <div
                            key={s.name}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              borderRadius: 8,
                              background: "var(--color-surface-2)",
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 3,
                                  background: s.color,
                                  display: "inline-block",
                                }}
                              />
                              {s.name}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                              }}
                            >
                              {s.value}
                            </span>
                          </div>
                        ))}
                        <div
                          style={{
                            padding: "8px 12px",
                            borderTop: "1px solid var(--color-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: "var(--color-text-muted)" }}>
                            Total
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                            }}
                          >
                            {bookings.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Leads" && (
            <div>
              {leadsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading leads…
                  </p>
                </div>
              ) : (
                <>
                  <div className="kpi-row" style={{ marginBottom: 24 }}>
                    {[
                      { label: "Total Leads", value: leads.length },
                      { label: "Conversions", value: convertedLeads.length },
                      { label: "Conv. Rate", value: `${conversionRate}%` },
                      {
                        label: "Lost",
                        value: leads.filter((l) => l.status === "lost").length,
                      },
                      {
                        label: "Active",
                        value: leads.filter(
                          (l) =>
                            !["lost", "closed", ...CONVERTED_STATUSES].includes(
                              l.status,
                            ),
                        ).length,
                      },
                    ].map((k, i) => (
                      <div key={i} className="kpi-card">
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value">{k.value}</div>
                      </div>
                    ))}
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      marginBottom: 16,
                    }}
                  >
                    Lead Pipeline Funnel
                  </h3>
                  {leadFunnelData.length === 0 ? (
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      No leads yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={leadFunnelData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-border)"
                        />
                        <XAxis
                          type="number"
                          tick={{
                            fontSize: 12,
                            fill: "var(--color-text-muted)",
                          }}
                        />
                        <YAxis
                          dataKey="stage"
                          type="category"
                          tick={{
                            fontSize: 12,
                            fill: "var(--color-text-muted)",
                          }}
                          width={110}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="var(--color-accent)"
                          radius={[0, 6, 6, 0]}
                          name="Leads"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {eventTypeBreakdown.length > 0 && (
                    <>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text-h)",
                          marginTop: 32,
                          marginBottom: 16,
                        }}
                      >
                        Event Type Breakdown
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: 24,
                          alignItems: "center",
                        }}
                      >
                        <ResponsiveContainer width="40%" height={200}>
                          <PieChart>
                            <Pie
                              data={eventTypeBreakdown}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={75}
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {eventTypeBreakdown.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {eventTypeBreakdown.map((e, i) => (
                            <div
                              key={e.name}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 13,
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background:
                                      PIE_COLORS[i % PIE_COLORS.length],
                                    display: "inline-block",
                                  }}
                                />
                                {e.name}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontWeight: 600,
                                }}
                              >
                                {e.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Payments" && (
            <div>
              {invoicesLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading payments…
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    style={{ marginBottom: 24 }}
                  >
                    <div className="kpi-card">
                      <div className="kpi-label">Total Collected</div>
                      <div className="kpi-value">{fmt(totalRevenue)}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Payments Count</div>
                      <div className="kpi-value">{allPaymentRecs.length}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Avg Payment</div>
                      <div className="kpi-value">{fmt(avgPayment)}</div>
                    </div>
                    <div
                      className="kpi-card"
                      style={{
                        borderLeft:
                          outstandingBalance > 0
                            ? "3px solid #dc2626"
                            : undefined,
                      }}
                    >
                      <div className="kpi-label">Outstanding</div>
                      <div
                        className="kpi-value"
                        style={{
                          color: outstandingBalance > 0 ? "#dc2626" : undefined,
                        }}
                      >
                        {fmt(outstandingBalance)}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Revenue (MTD)</div>
                      <div className="kpi-value">{fmt(mtdRevenue)}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Total Invoices</div>
                      <div className="kpi-value">{invoices.length}</div>
                    </div>
                  </div>
                  {allPaymentRecs.length === 0 ? (
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      No payment records yet.
                    </p>
                  ) : (
                    <>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text-h)",
                          marginBottom: 16,
                        }}
                      >
                        Monthly Collections (12 months)
                      </h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenueByMonth}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{
                              fontSize: 11,
                              fill: "var(--color-text-muted)",
                            }}
                          />
                          <YAxis
                            tick={{
                              fontSize: 11,
                              fill: "var(--color-text-muted)",
                            }}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                          />
                          <Tooltip formatter={(v) => [fmt(v), "Collected"]} />
                          <Bar
                            dataKey="revenue"
                            fill="#10b981"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      {paymentMethodBreakdown.length > 0 && (
                        <>
                          <h3
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "var(--color-text-h)",
                              marginTop: 28,
                              marginBottom: 12,
                            }}
                          >
                            By Payment Method
                          </h3>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {paymentMethodBreakdown.map((m, i) => (
                              <div
                                key={m.name}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    width: 110,
                                    color: "var(--color-text-body)",
                                    flexShrink: 0,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {m.name}
                                </span>
                                <div
                                  style={{
                                    flex: 1,
                                    height: 8,
                                    borderRadius: 4,
                                    background: "var(--color-border)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${(m.value / totalRevenue) * 100}%`,
                                      height: "100%",
                                      background:
                                        PIE_COLORS[i % PIE_COLORS.length],
                                      borderRadius: 4,
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    width: 100,
                                    textAlign: "right",
                                  }}
                                >
                                  {fmt(m.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Inventory" && (
            <div>
              {invLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading live inventory data...
                  </p>
                </div>
              ) : !invData ? (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  No inventory data available
                </p>
              ) : (
                <>
                  {/* KPI Row */}
                  <div className="kpi-row" style={{ marginBottom: 24 }}>
                    <div className="kpi-card">
                      <div className="kpi-label">Total Materials</div>
                      <div className="kpi-value">
                        {invData.inventory.totalItems}
                      </div>
                    </div>
                    <div
                      className="kpi-card"
                      style={{
                        borderLeft:
                          invData.inventory.lowStockCount > 0
                            ? "3px solid #ef4444"
                            : undefined,
                      }}
                    >
                      <div className="kpi-label">Low Stock</div>
                      <div
                        className="kpi-value"
                        style={{
                          color:
                            invData.inventory.lowStockCount > 0
                              ? "#ef4444"
                              : undefined,
                        }}
                      >
                        {invData.inventory.lowStockCount}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Inventory Value</div>
                      <div className="kpi-value">
                        {fmt(invData.inventory.totalValue)}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">PO Spend</div>
                      <div className="kpi-value">
                        {fmt(invData.purchaseOrders.totalValue)}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Guests Served</div>
                      <div className="kpi-value">
                        {(
                          invData.consumption.totalGuestsServed || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Stock Levels Bar Chart */}
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      marginBottom: 12,
                    }}
                  >
                    <Package
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: 6,
                        verticalAlign: "text-bottom",
                      }}
                    />
                    Stock Levels
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={(invData.inventory.stockLevels || []).slice(0, 15)}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="currentStock"
                        fill="var(--color-primary)"
                        name="Current"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="minStock"
                        fill="var(--color-accent)"
                        name="Min Level"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Category & Vendor row */}
                  <div className="card-grid-2" style={{ marginTop: 24 }}>
                    <div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          marginBottom: 10,
                          color: "var(--color-text-h)",
                        }}
                      >
                        Category Breakdown
                      </h3>
                      {invData.inventory.categoryBreakdown?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={invData.inventory.categoryBreakdown}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              label={({ name }) => name}
                            >
                              {invData.inventory.categoryBreakdown.map(
                                (_, i) => (
                                  <Cell
                                    key={i}
                                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip formatter={(v) => fmt(v)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p
                          style={{
                            color: "var(--color-text-muted)",
                            fontSize: 13,
                          }}
                        >
                          No category data
                        </p>
                      )}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          marginBottom: 10,
                          color: "var(--color-text-h)",
                        }}
                      >
                        <ShoppingCart
                          size={14}
                          style={{
                            display: "inline",
                            marginRight: 6,
                            verticalAlign: "text-bottom",
                          }}
                        />
                        Top Vendors
                      </h3>
                      {invData.purchaseOrders.topVendors?.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {invData.purchaseOrders.topVendors.map((v) => (
                            <div
                              key={v.name}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "6px 10px",
                                borderRadius: 6,
                                background: "var(--color-surface-2)",
                                fontSize: 13,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {v.name}{" "}
                                <span
                                  style={{
                                    color: "var(--color-text-muted)",
                                    fontWeight: 400,
                                  }}
                                >
                                  ({v.orderCount} POs)
                                </span>
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontWeight: 600,
                                  color: "var(--color-primary)",
                                }}
                              >
                                {fmt(v.totalValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          style={{
                            color: "var(--color-text-muted)",
                            fontSize: 13,
                          }}
                        >
                          No vendor data
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Most Used Materials */}
                  {invData.consumption.topUsedMaterials?.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          marginBottom: 10,
                          color: "var(--color-text-h)",
                        }}
                      >
                        Most Consumed Materials
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={invData.consumption.topUsedMaterials.slice(
                            0,
                            10,
                          )}
                          layout="vertical"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis
                            type="number"
                            tick={{
                              fontSize: 11,
                              fill: "var(--color-text-muted)",
                            }}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{
                              fontSize: 11,
                              fill: "var(--color-text-muted)",
                            }}
                            width={120}
                          />
                          <Tooltip
                            formatter={(v, _, { payload }) => [
                              `${v} ${payload.unit}`,
                              "Total Used",
                            ]}
                          />
                          <Bar
                            dataKey="totalUsed"
                            fill="#8b5cf6"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Low Stock Alert Table */}
                  {invData.inventory.lowStockItems?.length > 0 && (
                    <div
                      style={{
                        marginTop: 20,
                        padding: 16,
                        borderRadius: 10,
                        background: "rgba(239,68,68,0.04)",
                        border: "1px solid rgba(239,68,68,0.15)",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#ef4444",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <AlertTriangle size={14} /> Low Stock Items (
                        {invData.inventory.lowStockItems.length})
                      </h4>
                      {invData.inventory.lowStockItems.map((i) => (
                        <div
                          key={i.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                            fontSize: 13,
                            borderBottom: "1px solid rgba(239,68,68,0.08)",
                          }}
                        >
                          <span>{i.name}</span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#ef4444",
                              fontWeight: 600,
                            }}
                          >
                            {i.currentStock}/{i.minStock} {i.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Events" && (
            <div>
              {leadsLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2
                    size={24}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Loading events…
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    style={{ marginBottom: 24 }}
                  >
                    <div className="kpi-card">
                      <div className="kpi-label">Total Events (Leads)</div>
                      <div className="kpi-value">{leads.length}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Upcoming (30 days)</div>
                      <div className="kpi-value">{upcomingEvents.length}</div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Completed</div>
                      <div className="kpi-value">
                        {leads.filter((l) => l.status === "completed").length}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-label">Total Guests</div>
                      <div className="kpi-value">
                        {totalGuests.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {upcomingEvents.length > 0 && (
                    <>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text-h)",
                          marginBottom: 12,
                        }}
                      >
                        Upcoming Events (Next 30 Days)
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {upcomingEvents.slice(0, 10).map((l, i) => (
                          <div
                            key={l.id || i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 12px",
                              borderRadius: 8,
                              background: "var(--color-surface-2)",
                              fontSize: 13,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--color-text-h)",
                                }}
                              >
                                {l.customer_name}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {l.event_type} · {l.hall_name || "—"} ·{" "}
                                {l.expected_guest_count || 0} guests
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {l.event_date}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {l.branch_id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {active === "Staff" && (
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                  marginBottom: 16,
                }}
              >
                Staff Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="kpi-card">
                  <div className="kpi-label">Total Staff</div>
                  <div className="kpi-value">{staffData.length}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Permanent</div>
                  <div className="kpi-value">
                    {staffData.filter((s) => s.type === "Permanent").length}
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Temporary</div>
                  <div className="kpi-value">
                    {staffData.filter((s) => s.type === "Temporary").length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
