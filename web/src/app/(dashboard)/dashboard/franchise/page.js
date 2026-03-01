"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  CalendarDays,
  Package,
  ShoppingCart,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import LowStockAlerts from "@/components/shared/LowStockAlerts";
import Badge from "@/components/ui/Badge";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtL = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : fmt(n));
const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const LEAD_STAGES = [
  "new",
  "contacted",
  "site_visit",
  "proposal_sent",
  "negotiation",
  "confirmed",
  "lost",
];
const LEAD_LABELS = {
  new: "New",
  contacted: "Contacted",
  site_visit: "Site Visit",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  confirmed: "Confirmed",
  lost: "Lost",
};

export default function FranchiseDashboard() {
  const { user, userProfile, franchiseProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || "pfd";
  const franchiseName =
    franchiseProfile?.name || userProfile?.franchise_name || "Franchise";

  const [branches, setBranches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [invAnalytics, setInvAnalytics] = useState(null);

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingInv, setLoadingInv] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userProfile || !user) return;
    let token = null;
    try {
      token = await user.getIdToken();
    } catch (_) {
      /* ignore */
    }
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    setLoadingBranches(true);
    setLoadingBookings(true);
    setLoadingLeads(true);
    setLoadingInv(true);

    await Promise.allSettled([
      fetch("/api/branches", { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => {
          if (d.branches) setBranches(d.branches);
        })
        .catch(console.error)
        .finally(() => setLoadingBranches(false)),

      fetch(`/api/bookings?franchise_id=${franchiseId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.bookings) setBookings(d.bookings);
        })
        .catch(console.error)
        .finally(() => setLoadingBookings(false)),

      fetch(`/api/leads?franchise_id=${franchiseId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.leads) setLeads(d.leads);
        })
        .catch(console.error)
        .finally(() => setLoadingLeads(false)),

      fetch(`/api/kitchen-inventory/analytics?franchise_id=${franchiseId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setInvAnalytics(d.data);
        })
        .catch(console.error)
        .finally(() => setLoadingInv(false)),
    ]);
    setLastRefresh(new Date());
  }, [user, userProfile, franchiseId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived KPIs ──
  const now = new Date();
  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const mtdEnd = now.toISOString().slice(0, 10);

  const mtdBookings = bookings.filter(
    (b) =>
      b.event_date >= mtdStart &&
      b.event_date <= mtdEnd &&
      b.status !== "cancelled",
  );
  const mtdRevenue = mtdBookings.reduce(
    (s, b) => s + (b.payments?.quote_total || b.payments?.total_paid || 0),
    0,
  );
  const totalRev = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce(
      (s, b) => s + (b.payments?.quote_total || b.payments?.total_paid || 0),
      0,
    );
  const activeLeads = leads.filter(
    (l) => !["confirmed", "lost"].includes(l.status),
  ).length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const confirmedLeads = leads.filter((l) => l.status === "confirmed").length;

  // Revenue by month (last 6 months)
  const revenueByMonth = (() => {
    const map = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map[d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })] =
        0;
    }
    bookings
      .filter((b) => b.status !== "cancelled" && b.event_date)
      .forEach((b) => {
        const d = new Date(b.event_date);
        const key = d.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        });
        if (key in map)
          map[key] += b.payments?.quote_total || b.payments?.total_paid || 0;
      });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  })();

  // Lead funnel
  const leadFunnel = LEAD_STAGES.map((s) => ({
    stage: LEAD_LABELS[s],
    count: leads.filter((l) => l.status === s).length,
  })).filter((s) => s.count > 0);
  const maxLeadCount = Math.max(...leadFunnel.map((s) => s.count), 1);

  // Booking status breakdown
  const bookingStatusMap = [
    { name: "Confirmed", color: "#10b981", status: "confirmed" },
    { name: "In Progress", color: "#6366f1", status: "in_progress" },
    { name: "Completed", color: "#06b6d4", status: "completed" },
    { name: "Cancelled", color: "#ef4444", status: "cancelled" },
  ]
    .map((r) => ({
      ...r,
      value: bookings.filter((b) => b.status === r.status).length,
    }))
    .filter((r) => r.value > 0);

  const inv = invAnalytics?.inventory || {};
  const po = invAnalytics?.purchaseOrders || {};
  const consumption = invAnalytics?.consumption || {};

  const kpis = [
    {
      icon: <Building2 size={20} />,
      label: "Branches",
      value: loadingBranches ? null : branches.length,
    },
    {
      icon: <DollarSign size={20} />,
      label: "Revenue (MTD)",
      value: loadingBookings ? null : fmtL(mtdRevenue),
      sub: `Total: ${fmtL(totalRev)}`,
    },
    {
      icon: <CalendarDays size={20} />,
      label: "Bookings (MTD)",
      value: loadingBookings ? null : mtdBookings.length,
      sub: `Total: ${bookings.length}`,
    },
    {
      icon: <Users size={20} />,
      label: "Active Leads",
      value: loadingLeads ? null : activeLeads,
      sub: `${newLeads} new`,
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Conversions",
      value: loadingLeads ? null : confirmedLeads,
      sub:
        leads.length > 0
          ? `${Math.round((confirmedLeads / leads.length) * 100)}% rate`
          : null,
    },
  ];

  const anyLoading = loadingBranches || loadingBookings || loadingLeads;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="page-header"
        style={{ marginBottom: 24 }}
      >
        <div className="page-header-left">
          <h1>Franchise Dashboard</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {franchiseName} — Franchise Admin View
          </p>
        </div>
        <div className="page-header-right">
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchAll}
            disabled={anyLoading}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: anyLoading ? "spin 1s linear infinite" : "none",
              }}
            />
            {lastRefresh
              ? `Updated ${lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
              : "Refresh"}
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={fadeUp}
        className="kpi-row"
        style={{ marginBottom: 28 }}
      >
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div className="kpi-label">{k.label}</div>
              <div style={{ color: "var(--color-primary)", opacity: 0.5 }}>
                {k.icon}
              </div>
            </div>
            <div className="kpi-value" style={{ fontSize: 24 }}>
              {k.value === null ? (
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite", opacity: 0.4 }}
                />
              ) : (
                k.value
              )}
            </div>
            {k.sub && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 4,
                }}
              >
                {k.sub}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Revenue + Lead Funnel */}
      <motion.div
        variants={fadeUp}
        className="card-grid-2"
        style={{ marginBottom: 28 }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              Revenue Trend (6 months)
            </h3>
            {loadingBookings && (
              <Loader2
                size={14}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-text-muted)",
                }}
              />
            )}
          </div>
          {!loadingBookings && revenueByMonth.every((m) => m.revenue === 0) ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                padding: "40px 0",
                textAlign: "center",
              }}
            >
              No booking revenue yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                  tickFormatter={(v) => fmtL(v)}
                />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  labelStyle={{ color: "var(--color-text-h)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-primary)"
                  radius={[5, 5, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              Lead Funnel
            </h3>
            {loadingLeads && (
              <Loader2
                size={14}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-text-muted)",
                }}
              />
            )}
          </div>
          {!loadingLeads && leadFunnel.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                padding: "40px 0",
                textAlign: "center",
              }}
            >
              No leads yet
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
              }}
            >
              {leadFunnel.map((s, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      width: 90,
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {s.stage}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 22,
                      background: "var(--color-primary-ghost)",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(s.count / maxLeadCount) * 100}%`,
                        height: "100%",
                        background: "var(--gradient-bar)",
                        borderRadius: 6,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: "var(--color-text-h)",
                      width: 28,
                      textAlign: "right",
                    }}
                  >
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Booking status + recent bookings */}
      <motion.div
        variants={fadeUp}
        className="card-grid-2"
        style={{ marginBottom: 28 }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              Booking Status
            </h3>
            <Link
              href="/bookings"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: "none", fontSize: 12 }}
            >
              View All
            </Link>
          </div>
          {loadingBookings ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Loader2
                size={20}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-text-muted)",
                }}
              />
            </div>
          ) : bookingStatusMap.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No bookings yet
            </p>
          ) : (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <ResponsiveContainer width="45%" height={180}>
                <PieChart>
                  <Pie
                    data={bookingStatusMap}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                  >
                    {bookingStatusMap.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
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
                  gap: 8,
                }}
              >
                {bookingStatusMap.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: s.color,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      {s.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Total
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
                  >
                    {bookings.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              Recent Bookings
            </h3>
            <Link
              href="/bookings"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: "none", fontSize: 12 }}
            >
              View All
            </Link>
          </div>
          {loadingBookings ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Loader2
                size={20}
                style={{
                  animation: "spin 1s linear infinite",
                  color: "var(--color-text-muted)",
                }}
              />
            </div>
          ) : bookings.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No bookings yet
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bookings.slice(0, 5).map((b, i) => (
                <div
                  key={b.id || i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "var(--color-surface-2)",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 600, color: "var(--color-text-h)" }}
                    >
                      {b.customer_name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                    >
                      {b.event_type} ·{" "}
                      {b.event_date
                        ? new Date(b.event_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
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
                      {fmt(b.payments?.quote_total || 0)}
                    </div>
                    <Badge
                      variant={
                        b.status === "confirmed"
                          ? "green"
                          : b.status === "completed"
                            ? "accent"
                            : b.status === "cancelled"
                              ? "red"
                              : "primary"
                      }
                      style={{ fontSize: 10 }}
                    >
                      {b.status?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Branches table */}
      <motion.div
        variants={fadeUp}
        className="card"
        style={{ padding: 24, marginBottom: 28 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-text-h)",
            }}
          >
            <Building2
              size={14}
              style={{
                display: "inline",
                marginRight: 6,
                verticalAlign: "text-bottom",
              }}
            />
            Branches
          </h3>
          <Link
            href="/branches"
            className="btn btn-outline btn-sm"
            style={{ textDecoration: "none" }}
          >
            Manage
          </Link>
        </div>
        {loadingBranches ? (
          <div style={{ padding: "30px 0", textAlign: "center" }}>
            <Loader2
              size={20}
              style={{
                animation: "spin 1s linear infinite",
                color: "var(--color-text-muted)",
              }}
            />
          </div>
        ) : branches.length === 0 ? (
          <div
            style={{
              padding: "30px 0",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            No branches found.{" "}
            <Link href="/branches" style={{ color: "var(--color-primary)" }}>
              Add one
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th>Manager</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b, i) => {
                const bkgs = bookings.filter((bk) => bk.branch_id === b.id);
                const rev = bkgs
                  .filter((bk) => bk.status !== "cancelled")
                  .reduce(
                    (s, bk) =>
                      s +
                      (bk.payments?.quote_total ||
                        bk.payments?.total_paid ||
                        0),
                    0,
                  );
                return (
                  <tr key={b.id || i}>
                    <td
                      style={{ fontWeight: 600, color: "var(--color-text-h)" }}
                    >
                      {b.name}
                    </td>
                    <td>{b.city || "—"}</td>
                    <td>{b.manager_name || b.manager || "—"}</td>
                    <td>{loadingBookings ? "—" : bkgs.length}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {loadingBookings ? "—" : fmtL(rev)}
                    </td>
                    <td>
                      <Badge
                        variant={b.status === "active" ? "green" : "neutral"}
                        style={{ fontSize: 11 }}
                      >
                        {b.status || "active"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* ── Inventory & Supply Chain ── */}
      <motion.div variants={fadeUp}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--color-text-h)",
            }}
          >
            <Package
              size={17}
              style={{
                display: "inline",
                marginRight: 8,
                verticalAlign: "text-bottom",
              }}
            />
            Inventory &amp; Supply Chain
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/inventory"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: "none" }}
            >
              Raw Materials
            </Link>
            <Link
              href="/purchase-orders"
              className="btn btn-outline btn-sm"
              style={{ textDecoration: "none" }}
            >
              Purchase Orders
            </Link>
          </div>
        </div>

        {loadingInv ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
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
              Loading inventory insights…
            </p>
          </div>
        ) : !invAnalytics ? (
          <div
            className="card"
            style={{
              padding: 30,
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            No inventory data yet.{" "}
            <Link href="/inventory" style={{ color: "var(--color-primary)" }}>
              Add raw materials
            </Link>
          </div>
        ) : (
          <>
            <div className="kpi-row" style={{ marginBottom: 20 }}>
              {[
                { label: "Total Materials", value: inv.totalItems || 0 },
                {
                  label: "Low Stock",
                  value: inv.lowStockCount || 0,
                  alert: inv.lowStockCount > 0,
                },
                {
                  label: "Out of Stock",
                  value: inv.outOfStockCount || 0,
                  alert: inv.outOfStockCount > 0,
                },
                { label: "Inventory Value", value: fmt(inv.totalValue) },
                { label: "Pending POs", value: po.pendingCount || 0 },
                { label: "PO Spend", value: fmtL(po.totalValue || 0) },
              ].map((k, i) => (
                <div
                  key={i}
                  className="kpi-card"
                  style={k.alert ? { borderLeft: "3px solid #ef4444" } : {}}
                >
                  <div className="kpi-label">{k.label}</div>
                  <div
                    className="kpi-value"
                    style={{
                      fontSize: 20,
                      color: k.alert ? "#ef4444" : undefined,
                    }}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-grid-2" style={{ marginBottom: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  Stock Levels (Lowest 15)
                </h3>
                {inv.stockLevels?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={(inv.stockLevels || []).slice(0, 15)}
                      layout="vertical"
                      margin={{ left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(v, name) => [
                          v,
                          name === "currentStock" ? "Current" : "Min Level",
                        ]}
                      />
                      <Bar
                        dataKey="currentStock"
                        fill="var(--color-primary)"
                        name="Current"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="minStock"
                        fill="var(--color-accent)"
                        name="Min Level"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    No stock data
                  </p>
                )}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  Category Breakdown
                </h3>
                {inv.categoryBreakdown?.length > 0 ? (
                  <div
                    style={{ display: "flex", gap: 16, alignItems: "center" }}
                  >
                    <ResponsiveContainer width="48%" height={200}>
                      <PieChart>
                        <Pie
                          data={inv.categoryBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                        >
                          {inv.categoryBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
                        gap: 5,
                      }}
                    >
                      {inv.categoryBreakdown.map((cat, i) => (
                        <div
                          key={cat.name}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 2,
                                background: COLORS[i % COLORS.length],
                                display: "inline-block",
                              }}
                            />
                            {cat.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                            }}
                          >
                            {cat.count}
                            {cat.lowStock > 0 ? (
                              <span style={{ color: "#ef4444" }}>
                                {" "}
                                ({cat.lowStock}⚠)
                              </span>
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    No data
                  </p>
                )}
              </div>
            </div>

            <div className="card-grid-2" style={{ marginBottom: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  <ShoppingCart
                    size={13}
                    style={{
                      display: "inline",
                      marginRight: 6,
                      verticalAlign: "text-bottom",
                    }}
                  />
                  Monthly PO Spend
                </h3>
                {po.monthlySpend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={po.monthlySpend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                      />
                      <Tooltip formatter={(v) => fmt(v)} />
                      <Bar
                        dataKey="amount"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    No purchase orders yet
                  </p>
                )}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  Top Vendors
                </h3>
                {po.topVendors?.length > 0 ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
                  >
                    {po.topVendors.map((v) => (
                      <div
                        key={v.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "7px 10px",
                          borderRadius: 7,
                          background: "var(--color-surface-2)",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: "var(--color-text-h)",
                            }}
                          >
                            {v.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              marginLeft: 7,
                            }}
                          >
                            {v.orderCount} orders
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            fontSize: 12,
                            color: "var(--color-primary)",
                          }}
                        >
                          {fmt(v.totalValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    No vendor data yet
                  </p>
                )}
              </div>
            </div>

            <div className="card-grid-2" style={{ marginBottom: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  Consumption Summary
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    {
                      label: "Total Deductions",
                      value: consumption.totalDeductions || 0,
                    },
                    {
                      label: "Guests Served",
                      value: (
                        consumption.totalGuestsServed || 0
                      ).toLocaleString(),
                    },
                    {
                      label: "Shortage Incidents",
                      value: consumption.shortageIncidents || 0,
                      alert: consumption.shortageIncidents > 0,
                    },
                    {
                      label: "Unpaid POs",
                      value: `${po.unpaidCount || 0} (${fmt(po.unpaidValue || 0)})`,
                      alert: po.unpaidCount > 0,
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom:
                          i < 3 ? "1px solid var(--color-border)" : "none",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          color: row.alert ? "#ef4444" : undefined,
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text-h)",
                    marginBottom: 14,
                  }}
                >
                  Top Used Materials
                </h3>
                {consumption.topUsedMaterials?.length > 0 ? (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    {consumption.topUsedMaterials.slice(0, 8).map((m, i) => {
                      const maxVal =
                        consumption.topUsedMaterials[0]?.totalUsed || 1;
                      return (
                        <div
                          key={m.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              width: 100,
                              flexShrink: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {m.name}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 16,
                              background: "var(--color-primary-ghost)",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(m.totalUsed / maxVal) * 100}%`,
                                height: "100%",
                                background: COLORS[i % COLORS.length],
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                              width: 60,
                              textAlign: "right",
                              flexShrink: 0,
                            }}
                          >
                            {m.totalUsed} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                    No usage data yet
                  </p>
                )}
              </div>
            </div>

            <LowStockAlerts />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
