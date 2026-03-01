"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Palette,
  Sparkles,
  Edit3,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  Users,
  IndianRupee,
  Package,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getCached,
  setCached,
  invalidateCache,
  cacheKeys,
} from "@/lib/firestore-cache";

// ── Constants ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Corporate",
  "Sangeet",
  "Anniversary",
  "Baby Shower",
  "Naming Ceremony",
  "Other",
];
const THEMES = [
  "Royal",
  "Minimalist",
  "Garden",
  "Traditional",
  "Modern",
  "Rustic",
  "Floral",
  "Bollywood",
  "Custom",
];
const THEME_COLORS = {
  Royal: { bg: "rgba(142,68,173,0.10)", color: "#8e44ad", dot: "#8e44ad" },
  Minimalist: { bg: "rgba(52,73,94,0.08)", color: "#2c3e50", dot: "#2c3e50" },
  Garden: { bg: "rgba(39,174,96,0.10)", color: "#27ae60", dot: "#27ae60" },
  Traditional: { bg: "rgba(211,84,0,0.10)", color: "#d35400", dot: "#d35400" },
  Modern: { bg: "rgba(41,128,185,0.10)", color: "#2980b9", dot: "#2980b9" },
  Rustic: { bg: "rgba(127,96,0,0.10)", color: "#7f6000", dot: "#7f6000" },
  Floral: { bg: "rgba(231,76,60,0.10)", color: "#e74c3c", dot: "#e74c3c" },
  Bollywood: { bg: "rgba(243,156,18,0.12)", color: "#f39c12", dot: "#f39c12" },
  Custom: {
    bg: "var(--color-primary-ghost)",
    color: "var(--color-primary)",
    dot: "var(--color-primary)",
  },
};

const fmt = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");

function calcTotal(items = [], base_price = 0) {
  const itemsTotal = items.reduce(
    (s, it) => s + Number(it.unit_price || 0) * Number(it.qty || 1),
    0,
  );
  return itemsTotal > 0 ? itemsTotal : Number(base_price);
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────
function DeleteModal({ pkg, onClose, onConfirm, loading }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          padding: 28,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Trash2
          size={40}
          style={{ color: "#c0392b", margin: "0 auto 14px", display: "block" }}
        />
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 8,
          }}
        >
          Delete Package?
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 20,
          }}
        >
          <b>{pkg.name}</b> will be permanently removed. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: "#c0392b",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Decor Package Card ────────────────────────────────────────────────────
function DecorCard({
  pkg,
  canEdit,
  canDelete,
  onToggleStatus,
  onDelete,
  actionLoading,
}) {
  const [expanded, setExpanded] = useState(false);
  const tc = THEME_COLORS[pkg.theme] || THEME_COLORS.Custom;
  const total = calcTotal(pkg.items, pkg.base_price);
  const isActive = pkg.status === "active";
  const hasItems = Array.isArray(pkg.items) && pkg.items.length > 0;

  return (
    <div
      className="card decor-card"
      style={{
        borderLeft: `3px solid ${isActive ? tc.dot : "var(--color-border)"}`,
        opacity: isActive ? 1 : 0.65,
      }}
    >
      {/* Header */}
      <div className="dc-header">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              background: tc.bg,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              overflow: "hidden",
            }}
          >
            {Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pkg.image_urls[0]}
                alt={pkg.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              "🎨"
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--color-text-h)",
                lineHeight: 1.3,
              }}
            >
              {pkg.name}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 5,
                marginTop: 5,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: tc.bg,
                  color: tc.color,
                }}
              >
                {pkg.theme || "Custom"}
              </span>
              {Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "rgba(39,174,96,0.10)",
                    color: "#27ae60",
                  }}
                >
                  🖼 {pkg.image_urls.length}
                </span>
              )}
              {!isActive && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: "var(--color-bg-alt)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Inactive
                </span>
              )}
              {pkg.created_by_name && (
                <span
                  style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  by {pkg.created_by_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--color-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {fmt(total)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            total price
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 8,
            borderTop: "1px solid var(--color-border)",
            paddingTop: 12,
          }}
        >
          {pkg.image_urls.map((imgUrl, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={imgUrl}
              alt={`${pkg.name} ${idx + 1}`}
              style={{
                width: "100%",
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "opacity .2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            />
          ))}
        </div>
      )}

      {/* Description */}
      {pkg.description && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-body)",
            lineHeight: 1.55,
            margin: 0,
            paddingTop: 6,
            borderTop:
              Array.isArray(pkg.image_urls) && pkg.image_urls.length > 0
                ? "1px solid var(--color-border)"
                : "none",
          }}
        >
          {pkg.description}
        </p>
      )}

      {/* Suitable For */}
      {(pkg.suitable_for?.length > 0 || pkg.suitableFor?.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(pkg.suitable_for || pkg.suitableFor || []).map((e) => (
            <span
              key={e}
              style={{
                fontSize: 11,
                padding: "2px 9px",
                borderRadius: 12,
                background: "rgba(39,174,96,0.10)",
                color: "#27ae60",
                fontWeight: 600,
              }}
            >
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Items breakdown — expandable */}
      {hasItems && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Package size={13} /> {pkg.items.length} item
            {pkg.items.length !== 1 ? "s" : ""} in package
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {expanded && (
            <div
              style={{
                marginTop: 8,
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "var(--color-bg-alt)" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "7px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Item
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "7px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "7px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Unit Price
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "7px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.items.map((item, i) => (
                    <tr
                      key={i}
                      style={{ borderTop: "1px solid var(--color-border)" }}
                    >
                      <td
                        style={{
                          padding: "7px 12px",
                          color: "var(--color-text-body)",
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "7px 12px",
                          textAlign: "right",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {item.qty}
                      </td>
                      <td
                        style={{
                          padding: "7px 12px",
                          textAlign: "right",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {fmt(item.unit_price)}
                      </td>
                      <td
                        style={{
                          padding: "7px 12px",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--color-text-h)",
                        }}
                      >
                        {fmt(
                          Number(item.unit_price || 0) * Number(item.qty || 1),
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      borderTop: "2px solid var(--color-border)",
                      background: "var(--color-bg-alt)",
                    }}
                  >
                    <td
                      colSpan={3}
                      style={{
                        padding: "8px 12px",
                        fontWeight: 700,
                        color: "var(--color-text-h)",
                        textAlign: "right",
                      }}
                    >
                      Package Total
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontWeight: 800,
                        color: "var(--color-primary)",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                      }}
                    >
                      {fmt(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(canEdit || canDelete) && (
        <div className="dc-actions">
          {canEdit && (
            <>
              <button
                onClick={() => onToggleStatus(pkg)}
                className="btn btn-ghost btn-sm"
                disabled={actionLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                }}
              >
                {isActive ? <EyeOff size={13} /> : <Eye size={13} />}{" "}
                {isActive ? "Deactivate" : "Activate"}
              </button>
              <Link
                href={`/decor/${pkg.id}/edit`}
                className="btn btn-ghost btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                <Pencil size={13} /> Edit
              </Link>
            </>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(pkg)}
              className="btn btn-ghost btn-sm"
              disabled={actionLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#c0392b",
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function DecorPage() {
  const { userProfile, role } = useAuth();

  const isDecorator = role === "decorator";
  const isBranchManager = role === "branch_manager";
  const isFranchiseAdmin = role === "franchise_admin";
  const isSuperAdmin = role === "super_admin";
  // branch_manager can only VIEW decor packages — create/edit/delete is for decorators
  const canCreate = isDecorator || isFranchiseAdmin || isSuperAdmin;
  const canModify = isDecorator || isFranchiseAdmin || isSuperAdmin;

  const branchId = userProfile?.branch_id || "";
  const franchiseId = userProfile?.franchise_id || "";

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoad, setActionLoad] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPackages = useCallback(
    async (bust = false) => {
      if (!branchId && !franchiseId) {
        setLoading(false);
        return;
      }
      const cKey = cacheKeys.decor(branchId || franchiseId);
      if (!bust) {
        const c = getCached(cKey);
        if (c) {
          setPackages(c);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      setError("");
      try {
        const qs = branchId
          ? `branch_id=${branchId}`
          : `franchise_id=${franchiseId}`;
        const res = await fetch(`/api/decor?${qs}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to fetch");
        const pkgs = data.data || [];
        setPackages(pkgs);
        setCached(cKey, pkgs);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    },
    [branchId, franchiseId],
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleToggleStatus = async (pkg) => {
    setActionLoad(true);
    try {
      const res = await fetch(`/api/decor/${pkg.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-Uid": userProfile?.uid || "",
          "X-User-Role": role || "",
          "X-Branch-Id": branchId || "",
          "X-Franchise-Id": franchiseId || "",
        },
        body: JSON.stringify({
          status: pkg.status === "active" ? "inactive" : "active",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      invalidateCache(cacheKeys.decor(branchId || franchiseId));
      fetchPackages(true);
    } catch (e) {
      setError(e.message);
    }
    setActionLoad(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoad(true);
    try {
      const res = await fetch(`/api/decor/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          "X-User-Uid": userProfile?.uid || "",
          "X-User-Role": role || "",
          "X-Branch-Id": branchId || "",
          "X-Franchise-Id": franchiseId || "",
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      invalidateCache(cacheKeys.decor(branchId || franchiseId));
      setDeleteTarget(null);
      fetchPackages(true);
    } catch (e) {
      setError(e.message);
    }
    setActionLoad(false);
  };

  const themes = [
    "all",
    ...THEMES.filter((t) => packages.some((p) => p.theme === t)),
  ];

  const filtered = packages
    .filter((p) => theme === "all" || p.theme === theme)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.theme || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.created_by_name || "").toLowerCase().includes(q)
      );
    })
    .filter((p) => {
      // decorators only see their own packages
      if (isDecorator)
        return p.created_by_uid === userProfile?.uid || !p.created_by_uid;
      return true;
    });

  const stats = {
    total: packages.length,
    active: packages.filter((p) => p.status === "active").length,
    mine: isDecorator
      ? packages.filter((p) => p.created_by_uid === userProfile?.uid).length
      : null,
    avgPrice: packages.length
      ? Math.round(
          packages.reduce((s, p) => s + calcTotal(p.items, p.base_price), 0) /
            packages.length,
        )
      : 0,
  };

  return (
    <div>
      {deleteTarget && (
        <DeleteModal
          pkg={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={actionLoad}
        />
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h1>{isDecorator ? "My Decor Packages" : "Decor Packages"}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {isDecorator
              ? "Create and manage your decoration offerings with itemised pricing"
              : "Decoration packages available for hall bookings"}
          </p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchPackages(true)}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? "spin .8s linear infinite" : "none",
              }}
            />
          </button>
          {canCreate && (
            <Link
              href="/decor/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Plus size={14} /> Add Package
            </Link>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip" style={{ marginBottom: 16 }}>
        {[
          {
            label: "Total Packages",
            val: stats.total,
            col: "var(--color-primary)",
          },
          { label: "Active", val: stats.active, col: "#27ae60" },
          ...(stats.mine !== null
            ? [{ label: "My Packages", val: stats.mine, col: "#8e44ad" }]
            : []),
          { label: "Avg Price", val: fmt(stats.avgPrice), col: "#d4a011" },
        ].map((k, i) => (
          <div key={i} className="kpi-chip">
            <span
              style={{
                fontSize: i === 3 ? 16 : 20,
                fontWeight: 800,
                color: k.col,
                fontFamily: "var(--font-mono)",
              }}
            >
              {k.val}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 1,
              }}
            >
              {k.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            className="input"
            placeholder="Search packages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: 20,
                cursor: "pointer",
                border: "1.5px solid",
                background:
                  theme === t ? "var(--color-primary)" : "transparent",
                color: theme === t ? "#fff" : "var(--color-text-body)",
                borderColor:
                  theme === t ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              {t === "all" ? "All Themes" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: 14,
            borderRadius: 8,
            background: "rgba(192,57,43,0.08)",
            border: "1px solid rgba(192,57,43,0.2)",
            color: "#c0392b",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="decor-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[150, 90, 70, 50].map((w, j) => (
                <div
                  key={j}
                  style={{
                    height: 12,
                    width: w,
                    borderRadius: 4,
                    background: "var(--color-primary-ghost)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <Palette
            size={44}
            style={{
              color: "var(--color-text-muted)",
              margin: "0 auto 14px",
              display: "block",
            }}
          />
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {search
              ? `No packages matching "${search}"`
              : isDecorator
                ? "You haven't added any packages yet."
                : "No decoration packages found."}
          </p>
          {canCreate && (
            <Link
              href="/decor/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Plus size={13} /> Add First Package
            </Link>
          )}
        </div>
      ) : (
        <div className="decor-grid">
          {filtered.map((pkg) => (
            <DecorCard
              key={pkg.id}
              pkg={pkg}
              canEdit={
                canModify &&
                (isDecorator ? pkg.created_by_uid === userProfile?.uid : true)
              }
              canDelete={
                isFranchiseAdmin ||
                isSuperAdmin ||
                (isDecorator && pkg.created_by_uid === userProfile?.uid)
              }
              onToggleStatus={handleToggleStatus}
              onDelete={setDeleteTarget}
              actionLoading={actionLoad}
            />
          ))}
        </div>
      )}

      <style>{`
        .decor-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px; }
        .decor-card { padding:20px;display:flex;flex-direction:column;gap:12px;transition:opacity .2s; }
        .dc-header  { display:flex;justify-content:space-between;align-items:flex-start;gap:12px; }
        .dc-actions { display:flex;flex-wrap:wrap;gap:7px;padding-top:10px;border-top:1px solid var(--color-border); }

        .kpi-strip  { display:flex;flex-wrap:wrap;gap:10px; }
        .kpi-chip   { display:flex;flex-direction:column;align-items:flex-start;padding:12px 16px;border-radius:10px;border:1.5px solid var(--color-border);background:var(--color-bg-card);flex:1 1 100px;min-width:90px; }

        .spin { animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:700px) {
          .decor-grid { grid-template-columns:1fr; }
          .dc-header  { flex-direction:column; }
        }
      `}</style>
    </div>
  );
}
