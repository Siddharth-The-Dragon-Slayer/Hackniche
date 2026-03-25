"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import {
  Palette,
  Sparkles,
  Plus,
  RefreshCw,
  IndianRupee,
  Package,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";

const THEME_COLORS = {
  Royal: { bg: "rgba(142,68,173,0.10)", color: "#8e44ad" },
  Minimalist: { bg: "rgba(52,73,94,0.08)", color: "#2c3e50" },
  Garden: { bg: "rgba(39,174,96,0.10)", color: "#27ae60" },
  Traditional: { bg: "rgba(211,84,0,0.10)", color: "#d35400" },
  Modern: { bg: "rgba(41,128,185,0.10)", color: "#2980b9" },
  Rustic: { bg: "rgba(127,96,0,0.10)", color: "#7f6000" },
  Floral: { bg: "rgba(231,76,60,0.10)", color: "#e74c3c" },
  Bollywood: { bg: "rgba(243,156,18,0.12)", color: "#f39c12" },
  Custom: { bg: "var(--color-primary-ghost)", color: "var(--color-primary)" },
};

const fmt = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");

function calcTotal(items = [], base_price = 0) {
  const t = items.reduce(
    (s, it) => s + Number(it.unit_price || 0) * Number(it.qty || 1),
    0,
  );
  return t > 0 ? t : Number(base_price);
}

// ── Package Card ───────────────────────────────────────────────────────────
function PackageRow({ pkg }) {
  const total = calcTotal(pkg.items, pkg.base_price);
  const tc = THEME_COLORS[pkg.theme] || THEME_COLORS.Custom;
  const isActive = pkg.status !== "inactive";
  const hasImages = Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 12,
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: tc.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.image_urls[0]}
            alt={pkg.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 22 }}>\uD83C\uDFA8</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--color-text-h)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200,
            }}
          >
            {pkg.name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              background: tc.bg,
              color: tc.color,
            }}
          >
            {pkg.theme}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              background: isActive ? "#dcfce7" : "#fee2e2",
              color: isActive ? "#16a34a" : "#b91c1c",
            }}
          >
            {pkg.status || "active"}
          </span>
          {hasImages && (
            <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              \uD83D\uDDBC {pkg.image_urls.length}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            marginTop: 3,
          }}
        >
          {pkg.items?.length || 0} item{pkg.items?.length !== 1 ? "s" : ""}
          {pkg.suitable_for?.length > 0 &&
            ` \u00B7 ${pkg.suitable_for.slice(0, 3).join(", ")}${pkg.suitable_for.length > 3 ? "\u2026" : ""}`}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: 15,
            color: "var(--color-primary)",
          }}
        >
          {fmt(total)}
        </div>
        <Link
          href={`/decor/${pkg.id}/edit`}
          style={{
            fontSize: 11,
            color: "var(--color-accent)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Edit \u2192
        </Link>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DecoratorDashboard() {
  const { userProfile } = useAuth();
  const uid = userProfile?.uid || "";
  const franchise_id = userProfile?.franchise_id || "";
  const branch_id = userProfile?.branch_id || "";
  const name = userProfile?.name || "there";

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /** Fetch decor packages created by this decorator */
  const fetchPackages = useCallback(async () => {
    if (!branch_id && !franchise_id) return;
    try {
      const qs = branch_id
        ? `branch_id=${branch_id}`
        : `franchise_id=${franchise_id}`;
      const res = await fetch(`/api/decor?${qs}`);
      const data = await res.json();
      const all = data.data || [];
      // Only keep this decorator's packages
      setPackages(
        all.filter((p) => p.created_by_uid === uid || !p.created_by_uid),
      );
    } catch {
      setPackages([]);
    }
  }, [uid, branch_id, franchise_id]);

  /** Fetch branch leads and keep decoration-relevant ones */
  const fetchLeads = useCallback(async () => {
    if (!franchise_id || !branch_id) return;
    try {
      const res = await fetch(
        `/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`,
      );
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setLeads([]);
    }
  }, [franchise_id, branch_id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPackages(), fetchLeads()]).finally(() =>
      setLoading(false),
    );
  }, [fetchPackages, fetchLeads]);

  // Auto-poll leads every 30 s so decorator sees new decoration orders live.
  useEffect(() => {
    const id = setInterval(fetchLeads, 30_000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  // ── Derived data ────────────────────────────────────────────────────────
  const myPackageIds = new Set(packages.map((p) => p.id));
  const activePackages = packages.filter((p) => p.status === "active");

  // Upcoming orders: decoration_scheduled or in_progress
  const upcomingOrders = leads
    .filter((l) => DECOR_STATUSES.includes(l.status))
    .sort((a, b) => (a.event_date || "").localeCompare(b.event_date || ""));

  // Past orders: completed / closed / paid
  const pastOrders = leads
    .filter((l) => PAST_STATUSES.includes(l.status))
    .sort((a, b) => (b.event_date || "").localeCompare(a.event_date || ""));

  // Earnings: each completed order × avg package price or fixed fee
  const avgPkg =
    packages.reduce((s, p) => {
      const price = p.items?.reduce(
        (t, it) => t + Number(it.unit_price || 0) * Number(it.qty || 1),
        0,
      );
      return s + (price > 0 ? price : Number(p.base_price || 0));
    }, 0) / (packages.length || 1);
  const estimatedEarnings =
    pastOrders.filter((l) =>
      ["completed", "paid", "settlement_complete", "closed"].includes(l.status),
    ).length * Math.round(avgPkg);

  // Today upcoming
  const today = new Date().toISOString().slice(0, 10);
  const todayJobs = upcomingOrders.filter((l) => l.event_date === today);

  const kpis = [
    {
      icon: <Package size={20} />,
      label: "My Packages",
      value: loading ? "…" : String(packages.length),
      sub: `${activePackages.length} active`,
      color: "#6366f1",
    },
    {
      icon: <CalendarDays size={20} />,
      label: "Upcoming Jobs",
      value: loading ? "…" : String(upcomingOrders.length),
      sub: `${todayJobs.length} today`,
      color: "#0369a1",
    },
    {
      icon: <CheckCircle2 size={20} />,
      label: "Completed Jobs",
      value: loading
        ? "…"
        : String(
            pastOrders.filter((l) =>
              ["completed", "paid", "closed", "settlement_complete"].includes(
                l.status,
              ),
            ).length,
          ),
      sub: "All time",
      color: "#16a34a",
    },
    {
      icon: <IndianRupee size={20} />,
      label: "Est. Earnings",
      value: loading ? "…" : `₹${(estimatedEarnings / 1000).toFixed(1)}K`,
      sub: "From completed jobs",
      color: "#f59e0b",
    },
  ];

  /** After marking status success, update local state */
  const handleStatusDone = (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );
    setMarkTarget(null);
  };

  const shown = activeTab === "upcoming" ? upcomingOrders : pastOrders;

  const refresh = () => {
    setLoading(true);
    Promise.all([fetchPackages(), fetchLeads()]).finally(() =>
      setLoading(false),
    );
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Mark Status Modal */}
      {markTarget && (
        <MarkStatusModal
          lead={markTarget}
          franchise_id={franchise_id}
          branch_id={branch_id}
          onClose={() => setMarkTarget(null)}
          onDone={handleStatusDone}
        />
      )}

      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={24} style={{ color: "var(--color-accent)" }} />{" "}
              Decorator Dashboard
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
              {userProfile?.branch_name || "Your Branch"} — Welcome back, {name}
              !
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={refresh}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw
                size={14}
                style={loading ? { animation: "spin 1s linear infinite" } : {}}
              />
            </button>
            <Link
              href="/decor/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={14} /> New Package
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick action banner */}
      <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
        <div
          className="card"
          style={{
            padding: "18px 24px",
            background: "var(--gradient-primary)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {todayJobs.length > 0
                ? `🎨 You have ${todayJobs.length} decoration job${todayJobs.length > 1 ? "s" : ""} today!`
                : "✨ Create or manage your decoration packages"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
              {todayJobs.length > 0
                ? `Client${todayJobs.length > 1 ? "s" : ""}: ${todayJobs.map((l) => l.customer_name).join(", ")}`
                : "Add beautiful themes and itemised pricing to attract more bookings."}
            </div>
          </div>
          <Link
            href="/decor"
            style={{
              textDecoration: "none",
              background: "#fff",
              color: "var(--color-primary)",
              borderRadius: 10,
              padding: "9px 18px",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <Palette size={14} /> My Packages →
          </Link>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="kpi-row"
        style={{ marginBottom: 28 }}
      >
        {kpis.map((k, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} className="kpi-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div className="kpi-label">{k.label}</div>
              <div style={{ color: k.color, opacity: 0.6 }}>{k.icon}</div>
            </div>
            <div className="kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 4,
              }}
            >
              {k.sub}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: Orders Panel */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 0 }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border)",
              padding: "0 24px",
            }}
          >
            {[
              {
                key: "upcoming",
                label: `Upcoming Orders`,
                count: upcomingOrders.length,
                icon: <Clock size={13} />,
              },
              {
                key: "past",
                label: `Past Orders`,
                count: pastOrders.length,
                icon: <CheckCircle2 size={13} />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "14px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    activeTab === tab.key
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                  borderBottom:
                    activeTab === tab.key
                      ? "2px solid var(--color-primary)"
                      : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all .15s",
                  marginBottom: -1,
                }}
              >
                {tab.icon} {tab.label}
                <span
                  style={{
                    background:
                      activeTab === tab.key
                        ? "var(--color-primary-ghost)"
                        : "var(--color-bg-hover)",
                    color:
                      activeTab === tab.key
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)",
                    borderRadius: 20,
                    padding: "1px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ padding: 24 }}>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 32,
                }}
              >
                <Loader2
                  size={24}
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>
            ) : shown.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 0",
                  color: "var(--color-text-muted)",
                }}
              >
                <Palette
                  size={36}
                  style={{
                    opacity: 0.3,
                    marginBottom: 10,
                    display: "block",
                    margin: "0 auto 10px",
                  }}
                />
                <p style={{ fontSize: 13 }}>
                  {activeTab === "upcoming"
                    ? "No upcoming decoration jobs."
                    : "No past decoration orders yet."}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Event</th>
                      <th>Event Date</th>
                      <th>Hall</th>
                      <th>Status</th>
                      {activeTab === "upcoming" && (
                        <th style={{ textAlign: "center" }}>Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text-h)",
                              fontSize: 13,
                            }}
                          >
                            {l.customer_name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {l.phone}
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{l.event_type || "—"}</td>
                        <td
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                          }}
                        >
                          {l.event_date || "—"}
                        </td>
                        <td style={{ fontSize: 13 }}>{l.hall_name || "—"}</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        {activeTab === "upcoming" && (
                          <td style={{ textAlign: "center" }}>
                            {NEXT_STATUSES[l.status] ? (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: 11, padding: "4px 12px" }}
                                onClick={() => setMarkTarget(l)}
                              >
                                Mark Status
                              </button>
                            ) : (
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Packages + Payouts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* My Packages */}
          <motion.div
            variants={fadeUp}
            className="card"
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Palette size={16} style={{ color: "#8b5cf6" }} /> My Packages
              </h3>
              <Link
                href="/decor"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
              >
                View All →
              </Link>
            </div>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 20,
                }}
              >
                <Loader2
                  size={18}
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>
            ) : packages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginBottom: 10,
                  }}
                >
                  No packages yet.
                </p>
                <Link
                  href="/decor/create"
                  className="btn btn-primary btn-sm"
                  style={{
                    textDecoration: "none",
                    fontSize: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Plus size={12} /> Add Package
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {packages.slice(0, 5).map((pkg) => {
                  const price = pkg.items?.reduce(
                    (t, it) =>
                      t + Number(it.unit_price || 0) * Number(it.qty || 1),
                    0,
                  );
                  const total = price > 0 ? price : Number(pkg.base_price || 0);
                  return (
                    <Link
                      key={pkg.id}
                      href={`/decor`}
                      style={{
                        textDecoration: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "var(--color-primary-ghost)",
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-text-h)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {pkg.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                            marginTop: 1,
                          }}
                        >
                          {pkg.theme || "Custom"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-text-h)",
                          }}
                        >
                          ₹{total.toLocaleString("en-IN")}
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            background:
                              pkg.status === "active" ? "#dcfce7" : "#fee2e2",
                            color:
                              pkg.status === "active" ? "#16a34a" : "#b91c1c",
                            borderRadius: 20,
                            padding: "1px 7px",
                            fontWeight: 700,
                          }}
                        >
                          {pkg.status || "active"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {packages.length > 5 && (
                  <Link
                    href="/decor"
                    style={{
                      fontSize: 12,
                      textAlign: "center",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      padding: "6px 0",
                    }}
                  >
                    +{packages.length - 5} more
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* Payouts */}
          <motion.div
            variants={fadeUp}
            className="card"
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <IndianRupee size={16} style={{ color: "#f59e0b" }} /> Payouts
              </h3>
            </div>

            {/* Payout summary */}
            {(() => {
              const completed = pastOrders.filter((l) =>
                ["completed", "paid", "closed", "settlement_complete"].includes(
                  l.status,
                ),
              ).length;
              const pending = pastOrders.filter(
                (l) => l.status === "settlement_pending",
              ).length;
              const totalPaid = completed * Math.round(avgPkg);
              const totalPending = pending * Math.round(avgPkg);
              return (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#dcfce7",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#15803d",
                          fontWeight: 600,
                        }}
                      >
                        Settled
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          color: "#15803d",
                        }}
                      >
                        ₹{(totalPaid / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <CheckCircle2
                      size={22}
                      style={{ color: "#16a34a", opacity: 0.6 }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#fef3c7",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#b45309",
                          fontWeight: 600,
                        }}
                      >
                        Pending Settlement
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                          color: "#b45309",
                        }}
                      >
                        ₹{(totalPending / 1000).toFixed(1)}K
                      </div>
                    </div>
                    <Clock
                      size={22}
                      style={{ color: "#d97706", opacity: 0.6 }}
                    />
                  </div>
                  {pending > 0 && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      <AlertCircle
                        size={11}
                        style={{
                          display: "inline",
                          marginRight: 4,
                          color: "#d97706",
                        }}
                      />
                      {pending} job{pending > 1 ? "s" : ""} awaiting settlement
                      payout.
                    </p>
                  )}
                  {completed === 0 && pending === 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "8px 0",
                      }}
                    >
                      No payouts recorded yet.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Recent completed jobs */}
            {pastOrders.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                  }}
                >
                  Recent Orders
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {pastOrders.slice(0, 4).map((l) => (
                    <div
                      key={l.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 9,
                        background: "var(--color-bg-hover)",
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-text-h)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {l.customer_name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {l.event_date || "—"}
                        </div>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={fadeUp}
            className="card"
            style={{ padding: 20 }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
                marginBottom: 12,
              }}
            >
              Quick Links
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  href: "/decor/create",
                  label: "➕ Add New Package",
                  color: "var(--color-primary-ghost)",
                },
                {
                  href: "/decor",
                  label: "🎨 All My Packages",
                  color: "var(--color-primary-ghost)",
                },
                {
                  href: "/calendar",
                  label: "📅 Calendar",
                  color: "var(--color-primary-ghost)",
                },
                {
                  href: "/events",
                  label: "🎉 Upcoming Events",
                  color: "var(--color-primary-ghost)",
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    textDecoration: "none",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: l.color,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-text-body)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {l.label}{" "}
                  <ChevronRight
                    size={13}
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
