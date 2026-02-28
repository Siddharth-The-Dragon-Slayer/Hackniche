"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Tag,
  CalendarDays,
  Users,
  Gift,
  Percent,
  BadgeIndianRupee,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import { useBranches } from "@/hooks/use-branches";
import {
  getCached,
  setCached,
  invalidateCache,
  cacheKeys,
} from "@/lib/firestore-cache";
// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BADGE_COLORS = {
  green: { bg: "rgba(39,174,96,0.12)", color: "#27ae60" },
  primary: { bg: "var(--color-primary-ghost)", color: "var(--color-primary)" },
  accent: { bg: "rgba(241,196,15,0.15)", color: "#d4a011" },
  red: { bg: "rgba(192,57,43,0.10)", color: "#c0392b" },
  neutral: { bg: "var(--color-bg-alt)", color: "var(--color-text-muted)" },
};

const fmt = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const isExpired = (d) => d && new Date(d) < new Date();
const isSingleUse = (o) => o.single_use || o.max_uses === 1;

function DiscountBadge({ type, value }) {
  if (type === "percentage")
    return <span className="ot ot-green">{value}% OFF</span>;
  if (type === "flat")
    return <span className="ot ot-blue">{fmt(value)} OFF</span>;
  return <span className="ot ot-purple">Free Add-on {fmt(value)}</span>;
}

function StatusPill({
  active,
  consumer_visible,
  expired,
  single_use,
  used_count,
  max_uses,
}) {
  if (expired)
    return (
      <span className="spill spill-red">
        <AlertTriangle size={11} /> Expired
      </span>
    );
  if (!active)
    return (
      <span className="spill spill-grey">
        <Clock size={11} /> Inactive
      </span>
    );
  if (single_use && used_count >= 1)
    return (
      <span className="spill spill-grey">
        <CheckCircle2 size={11} /> Used
      </span>
    );
  if (consumer_visible)
    return (
      <span className="spill spill-green">
        <CheckCircle2 size={11} /> Live
      </span>
    );
  return (
    <span className="spill spill-yellow">
      <Eye size={11} /> Internal
    </span>
  );
}

// â”€â”€ Copy Code Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 8,
        cursor: "pointer",
        border: "1.5px dashed var(--color-primary)",
        background: "var(--color-primary-ghost)",
        color: "var(--color-primary)",
        fontSize: 13,
        fontWeight: 800,
        fontFamily: "var(--font-mono)",
        letterSpacing: 1,
      }}
      title="Copy coupon code"
    >
      {code}
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

// â”€â”€ Offer Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OfferCard({
  offer,
  canManage,
  canDelete,
  onToggleVisible,
  onDelete,
  loading,
}) {
  const expired = isExpired(offer.valid_to);
  const bc = BADGE_COLORS[offer.badge_color] || BADGE_COLORS.neutral;
  const dimmed =
    !offer.active || expired || (offer.single_use && offer.used_count >= 1);
  const usageTxt =
    offer.max_uses > 0
      ? `${offer.used_count}/${offer.max_uses} uses`
      : offer.used_count > 0
        ? `${offer.used_count} uses`
        : null;

  return (
    <div
      className={`card offer-card${dimmed ? " offer-dim" : ""}`}
      style={{
        borderLeft: `3px solid ${!dimmed ? "var(--color-primary)" : "var(--color-border)"}`,
      }}
    >
      {/* Row 1: title + badge + discount */}
      <div className="oc-top">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              flexShrink: 0,
              background: bc.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: bc.color,
            }}
          >
            {offer.type === "percentage" ? (
              <Percent size={16} />
            ) : offer.type === "flat" ? (
              <BadgeIndianRupee size={16} />
            ) : (
              <Gift size={16} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--color-text-h)",
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {offer.title}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <StatusPill
                active={offer.active}
                consumer_visible={offer.consumer_visible}
                expired={expired}
                single_use={offer.single_use}
                used_count={offer.used_count}
                max_uses={offer.max_uses}
              />
              {offer.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: bc.bg,
                    color: bc.color,
                  }}
                >
                  {offer.badge}
                </span>
              )}
              {isSingleUse(offer) && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: "rgba(142,68,173,0.10)",
                    color: "#8e44ad",
                  }}
                >
                  Single-use
                </span>
              )}
              {usageTxt && (
                <span
                  style={{ fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  {usageTxt}
                </span>
              )}
            </div>
          </div>
        </div>
        <DiscountBadge type={offer.type} value={offer.discount_value} />
      </div>

      {/* Coupon Code */}
      <CopyCode code={offer.code} />

      {/* Description */}
      {offer.description && (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-body)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {offer.description}
        </p>
      )}

      {/* Meta row */}
      <div className="oc-meta">
        <span>
          <CalendarDays size={12} />
          {fmtDate(offer.valid_from)} — {fmtDate(offer.valid_to)}
          {expired && (
            <b style={{ color: "#c0392b", marginLeft: 4 }}>(Expired)</b>
          )}
        </span>
        {offer.min_guests > 0 && (
          <span>
            <Users size={12} /> Min {offer.min_guests} guests
          </span>
        )}
        <span>
          <Tag size={12} />{" "}
          {Array.isArray(offer.halls)
            ? offer.halls.join(", ")
            : offer.halls || "All"}
        </span>
        {offer.created_by_name && (
          <span style={{ color: "var(--color-text-muted)" }}>
            By {offer.created_by_name} (
            {offer.created_by_role?.replace(/_/g, " ")})
          </span>
        )}
      </div>

      {/* Terms */}
      {offer.terms && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            borderRadius: 7,
            padding: "7px 11px",
            fontSize: 12,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}
        >
          <b>T&amp;C: </b>
          {offer.terms}
        </div>
      )}

      {/* Actions */}
      <div className="oc-actions">
        {canManage && (
          <button
            onClick={() => onToggleVisible(offer)}
            className="btn btn-ghost btn-sm"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            {offer.consumer_visible ? (
              <>
                <EyeOff size={13} /> Hide
              </>
            ) : (
              <>
                <Eye size={13} /> Show
              </>
            )}
          </button>
        )}
        <Link
          href={`/offers/${offer.id}/edit`}
          className="btn btn-ghost btn-sm"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          <Pencil size={13} /> Edit
        </Link>
        {canDelete && (
          <button
            onClick={() => onDelete(offer.id)}
            className="btn btn-ghost btn-sm"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#c0392b",
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function OffersPage() {
  const { userProfile, role } = useAuth();

  const isBranchManager = role === "branch_manager";
  const isSalesExec = role === "sales_executive";
  const isFranchiseAdmin = role === "franchise_admin";
  const isSuperAdmin = role === "super_admin";

  const canManageFull = isBranchManager || isFranchiseAdmin || isSuperAdmin;
  const canCreate = canManageFull || isSalesExec;
  const canDelete = canManageFull;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setAL] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBranchId, setSBI] = useState(null);

  // Branch list (for franchise_admin / super_admin selector)
  const { branches, loading: branchesLoading } = useBranches(
    isBranchManager || isSalesExec
      ? { franchise_id: null, scope: "none" }
      : {
          franchise_id: isSuperAdmin ? undefined : userProfile?.franchise_id,
          scope: isSuperAdmin ? "all" : "franchise",
        },
  );

  useEffect(() => {
    if (
      !isBranchManager &&
      !isSalesExec &&
      branches.length > 0 &&
      !selectedBranchId
    ) {
      setSBI(branches[0].id);
    }
  }, [branches, isBranchManager, isSalesExec, selectedBranchId]);

  const effectiveBranchId =
    isBranchManager || isSalesExec ? userProfile?.branch_id : selectedBranchId;

  const fetchOffers = useCallback(
    async (bust = false) => {
      if (!effectiveBranchId && (isBranchManager || isSalesExec)) return;
      const key = cacheKeys.offers(effectiveBranchId || "all");
      if (!bust) {
        const cached = getCached(key);
        if (cached) {
          setOffers(cached);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      setError("");
      try {
        const qs = effectiveBranchId ? `?branch_id=${effectiveBranchId}` : "";
        const data = await apiFetch(`/api/offers${qs}`);
        const list = data.offers || [];
        setCached(key, list);
        setOffers(list);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [effectiveBranchId, isBranchManager, isSalesExec],
  );

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Toggle consumer visibility
  const handleToggleVisible = async (offer) => {
    setAL(true);
    try {
      await apiFetch(`/api/offers/${offer.id}`, {
        method: "PATCH",
        body: JSON.stringify({ consumer_visible: !offer.consumer_visible }),
      });
      invalidateCache(cacheKeys.offers(effectiveBranchId || "all"));
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id
            ? { ...o, consumer_visible: !o.consumer_visible }
            : o,
        ),
      );
    } catch (e) {
      setError(e.message);
    }
    setAL(false);
  };

  // Delete offer
  const handleDelete = async (id) => {
    if (!confirm("Delete this offer? This cannot be undone.")) return;
    setAL(true);
    try {
      await apiFetch(`/api/offers/${id}`, { method: "DELETE" });
      invalidateCache(cacheKeys.offers(effectiveBranchId || "all"));
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      setError(e.message);
    }
    setAL(false);
  };

  // Filtered list
  const filtered = offers
    .filter((o) => {
      const exp = isExpired(o.valid_to);
      if (filter === "active") return o.active && !exp;
      if (filter === "inactive") return !o.active || exp;
      if (filter === "live") return o.active && !exp && o.consumer_visible;
      if (filter === "single") return isSingleUse(o);
      return true;
    })
    .filter((o) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (o.title || "").toLowerCase().includes(q) ||
        (o.code || "").toLowerCase().includes(q) ||
        (o.description || "").toLowerCase().includes(q)
      );
    });

  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.active && !isExpired(o.valid_to)).length,
    live: offers.filter(
      (o) => o.active && o.consumer_visible && !isExpired(o.valid_to),
    ).length,
    expired: offers.filter((o) => isExpired(o.valid_to)).length,
    single: offers.filter((o) => isSingleUse(o)).length,
  };

  // Consumer-visible offers for sidebar preview
  const liveOffers = offers.filter(
    (o) => o.active && o.consumer_visible && !isExpired(o.valid_to),
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h1>{isSalesExec ? "My Coupons" : "Offers & Coupons"}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {isSalesExec
              ? "Create single-use coupons for your customers"
              : "Manage promotions and coupons visible to customers"}
          </p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchOffers(true)}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          {canCreate && (
            <Link
              href="/offers/create"
              className="btn btn-primary btn-sm"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Plus size={14} /> {isSalesExec ? "New Coupon" : "New Offer"}
            </Link>
          )}
        </div>
      </div>

      {/* Branch Selector (franchise_admin / super_admin) */}
      {!isBranchManager && !isSalesExec && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Branch
          </span>
          {branchesLoading ? (
            <div
              style={{
                height: 36,
                width: 200,
                borderRadius: 8,
                background: "var(--color-primary-ghost)",
              }}
            />
          ) : (
            <select
              className="select"
              value={selectedBranchId || ""}
              onChange={(e) => {
                setSBI(e.target.value);
                setOffers([]);
              }}
              style={{ minWidth: 200, maxWidth: 320 }}
            >
              <option value="" disabled>
                Select branch…
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.city ? ` — ${b.city}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* KPI Chips */}
      <div className="kpi-strip">
        {[
          {
            key: "all",
            label: "Total",
            val: stats.total,
            col: "var(--color-primary)",
          },
          { key: "active", label: "Active", val: stats.active, col: "#27ae60" },
          {
            key: "live",
            label: "Consumer Live",
            val: stats.live,
            col: "#27ae60",
          },
          {
            key: "single",
            label: "Single-Use",
            val: stats.single,
            col: "#8e44ad",
          },
          {
            key: "inactive",
            label: "Expired",
            val: stats.expired,
            col: "#c0392b",
          },
        ].map((k) => (
          <button
            key={k.key}
            onClick={() => setFilter(k.key)}
            className={`kpi-chip${filter === k.key ? " kpi-active" : ""}`}
          >
            <span
              style={{
                fontSize: 20,
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
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 340 }}>
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
            placeholder="Search title, code, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            { k: "all", l: "All" },
            { k: "active", l: "Active" },
            { k: "live", l: "Live" },
            { k: "single", l: "Single-Use" },
            { k: "inactive", l: "Expired" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                borderRadius: 20,
                cursor: "pointer",
                border: "1.5px solid",
                background:
                  filter === t.k ? "var(--color-primary)" : "transparent",
                color: filter === t.k ? "#fff" : "var(--color-text-body)",
                borderColor:
                  filter === t.k
                    ? "var(--color-primary)"
                    : "var(--color-border)",
              }}
            >
              {t.l}
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

      {/* Main layout: offers list + preview sidebar */}
      <div className="offers-layout">
        {/* Offers list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minWidth: 0,
          }}
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
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
                {[130, 90, 70, 50].map((w, j) => (
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
            ))
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <Tag
                size={36}
                style={{
                  color: "var(--color-text-muted)",
                  margin: "0 auto 12px",
                  display: "block",
                }}
              />
              <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                {search
                  ? `No offers matching "${search}"`
                  : "No offers in this category."}
              </p>
              {canCreate && (
                <Link
                  href="/offers/create"
                  className="btn btn-primary btn-sm"
                  style={{
                    textDecoration: "none",
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Plus size={13} />{" "}
                  {isSalesExec ? "Create Coupon" : "Create Offer"}
                </Link>
              )}
            </div>
          ) : (
            filtered.map((offer, i) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                canManage={canManageFull}
                canDelete={canDelete}
                onToggleVisible={handleToggleVisible}
                onDelete={handleDelete}
                loading={actionLoading}
              />
            ))
          )}
        </div>

        {/* Consumer Preview (hidden on mobile) */}
        {canManageFull && (
          <div className="preview-sidebar">
            <div className="card" style={{ padding: 20, marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 14,
                }}
              >
                <Eye size={15} style={{ color: "var(--color-primary)" }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--color-text-h)",
                  }}
                >
                  Consumer Preview
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "rgba(39,174,96,0.12)",
                    color: "#27ae60",
                  }}
                >
                  {stats.live} Live
                </span>
              </div>
              {liveOffers.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  No live offers visible to consumers.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {liveOffers.map((o) => {
                    const bc =
                      BADGE_COLORS[o.badge_color] || BADGE_COLORS.neutral;
                    return (
                      <div
                        key={o.id}
                        style={{
                          border: "1px solid var(--color-border)",
                          borderRadius: 10,
                          padding: "11px 13px",
                          background: bc.bg,
                        }}
                      >
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
                              fontWeight: 700,
                              fontSize: 13,
                              color: "var(--color-text-h)",
                            }}
                          >
                            {o.title}
                          </span>
                          <DiscountBadge
                            type={o.type}
                            value={o.discount_value}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--color-primary)",
                            marginBottom: 4,
                          }}
                        >
                          {o.code}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            margin: "0 0 4px",
                            lineHeight: 1.5,
                          }}
                        >
                          {o.description}
                        </p>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Expires {fmtDate(o.valid_to)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-h)",
                  marginBottom: 10,
                }}
              >
                📌 Tips
              </div>
              {[
                "Sales Executives can create single-use coupons for individual customers.",
                "Toggle Eye icon to make an offer consumer-visible on your marketing site.",
                "Expired offers auto-hide from customers.",
                "Coupon codes are unique per branch — click any code to copy it.",
              ].map((t, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                    margin: "0 0 7px",
                    paddingLeft: 10,
                    borderLeft: "2px solid var(--color-border)",
                  }}
                >
                  {t}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ot { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap; }
        .ot-green  { background:rgba(39,174,96,0.12);color:#27ae60; }
        .ot-blue   { background:rgba(52,152,219,0.12);color:#2980b9; }
        .ot-purple { background:rgba(142,68,173,0.12);color:#8e44ad; }
        .spill { display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:12px; }
        .spill-green  { background:rgba(39,174,96,0.12);color:#27ae60; }
        .spill-red    { background:rgba(192,57,43,0.10);color:#c0392b; }
        .spill-yellow { background:rgba(241,196,15,0.15);color:#d4a011; }
        .spill-grey   { background:var(--color-bg-alt);color:var(--color-text-muted); }

        .offer-card { padding:18px;display:flex;flex-direction:column;gap:12px;transition:opacity .2s; }
        .offer-dim  { opacity:0.6; }

        .oc-top { display:flex;justify-content:space-between;align-items:flex-start;gap:10px; }
        .oc-meta { display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--color-text-muted); }
        .oc-meta > span { display:flex;align-items:center;gap:4px; }
        .oc-actions { display:flex;flex-wrap:wrap;gap:7px;padding-top:8px;border-top:1px solid var(--color-border); }

        .kpi-strip { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px; }
        .kpi-chip  { display:flex;flex-direction:column;align-items:flex-start;padding:12px 16px;border-radius:10px;cursor:pointer;border:1.5px solid var(--color-border);background:var(--color-card);transition:border-color .15s; flex:1 1 100px;min-width:90px; }
        .kpi-chip:hover { border-color:var(--color-primary); }
        .kpi-active { border-color:var(--color-primary) !important;background:var(--color-primary-ghost); }

        .offers-layout { display:grid;grid-template-columns:1fr 310px;gap:18px;align-items:start; }
        .preview-sidebar { position:sticky;top:80px; }

        .spin { animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:900px) {
          .offers-layout { grid-template-columns:1fr; }
          .preview-sidebar { display:none; }
          .kpi-strip { gap:8px; }
          .kpi-chip { flex:1 1 80px;padding:10px 12px; }
        }
        @media (max-width:600px) {
          .offer-card { padding:14px; }
          .oc-top { flex-direction:column;gap:8px; }
          .oc-top > :last-child { align-self:flex-start; }
          .oc-actions { gap:5px; }
          .kpi-chip { flex:1 1 70px;min-width:70px;padding:9px 10px; }
          .kpi-strip { gap:6px; }
        }
      `}</style>
    </div>
  );
}
