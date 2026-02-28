"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  Tag,
  Percent,
  BadgeIndianRupee,
  Gift,
  Copy,
  Check,
  Shuffle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api-client";
import { invalidateCache, cacheKeys } from "@/lib/firestore-cache";
import { useBranches } from "@/hooks/use-branches";

// ── Coupon code generator ─────────────────────────────────────────────────────
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(prefix = "BQE") {
  let s = "";
  for (let i = 0; i < 6; i++)
    s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `${prefix}-${s}`;
}

const HALL_OPTIONS = [
  "Grand Ballroom",
  "Diamond Hall",
  "Crystal Room",
  "Garden Pavilion",
  "Executive Suite",
  "Rooftop Terrace",
];
const BADGE_OPTIONS = [
  "Early Bird",
  "Seasonal",
  "Corporate",
  "Bundle",
  "Flash Sale",
  "Loyalty",
  "New",
  "Limited",
];
const BADGE_COLORS = [
  { key: "green", hex: "#27ae60", label: "Green" },
  { key: "primary", hex: "var(--color-primary)", label: "Teal" },
  { key: "accent", hex: "#d4a011", label: "Gold" },
  { key: "red", hex: "#c0392b", label: "Red" },
  { key: "neutral", hex: "#7f8c8d", label: "Grey" },
];
const TYPE_OPTIONS = [
  {
    key: "percentage",
    label: "% Discount",
    icon: <Percent size={15} />,
    hint: "e.g. 10% off hall rent",
  },
  {
    key: "flat",
    label: "Flat Amount",
    icon: <BadgeIndianRupee size={15} />,
    hint: "e.g. ₹20,000 off total",
  },
  {
    key: "addon",
    label: "Free Add-on",
    icon: <Gift size={15} />,
    hint: "e.g. Free décor ₹50,000",
  },
];

// ── Live Preview ──────────────────────────────────────────────────────────────
function LivePreview({ form }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(form.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const discTxt =
    form.type === "percentage" && form.discount_value
      ? `${form.discount_value}% OFF`
      : form.type === "flat" && form.discount_value
        ? `₹${Number(form.discount_value).toLocaleString("en-IN")} OFF`
        : form.type === "addon" && form.discount_value
          ? `Free ₹${Number(form.discount_value).toLocaleString("en-IN")}`
          : "—";

  const daysLeft = form.valid_to
    ? Math.ceil((new Date(form.valid_to) - new Date()) / 86400000)
    : null;

  return (
    <div className="card lp-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 14,
        }}
      >
        <Eye size={14} style={{ color: "var(--color-primary)" }} />
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--color-text-h)",
          }}
        >
          Live Preview
        </span>
        {form.consumer_visible ? (
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
            Consumer Visible
          </span>
        ) : (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 12,
              background: "var(--color-bg-alt)",
              color: "var(--color-text-muted)",
            }}
          >
            Internal Only
          </span>
        )}
      </div>

      {/* Coupon card mockup */}
      <div
        style={{
          border: "1.5px dashed var(--color-primary)",
          borderRadius: 12,
          padding: 16,
          background: "var(--color-primary-ghost)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "var(--color-text-h)",
                marginBottom: 4,
              }}
            >
              {form.title || "Offer Title"}
            </div>
            {form.badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: "rgba(39,174,96,0.12)",
                  color: "#27ae60",
                }}
              >
                {form.badge}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              padding: "5px 13px",
              borderRadius: 20,
              background: "rgba(39,174,96,0.15)",
              color: "#27ae60",
              whiteSpace: "nowrap",
            }}
          >
            {discTxt}
          </span>
        </div>
        {form.description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              margin: "0 0 10px",
              lineHeight: 1.55,
            }}
          >
            {form.description}
          </p>
        )}
        {/* Coupon code chip */}
        <button
          onClick={copy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 14px",
            border: "1.5px dashed var(--color-primary)",
            borderRadius: 8,
            cursor: "pointer",
            background: "#fff",
            color: "var(--color-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          {form.code || "BQE-XXXXXX"}
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
        {form.valid_to && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "var(--color-text-muted)",
            }}
          >
            Valid till {fmtDate(form.valid_to)}
            {daysLeft !== null &&
              daysLeft > 0 &&
              ` · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
            {daysLeft !== null && daysLeft <= 0 && (
              <b style={{ color: "#c0392b" }}> · Expired!</b>
            )}
          </div>
        )}
        {form.single_use && (
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: 600,
              color: "#8e44ad",
            }}
          >
            🎟 Single-use coupon
          </div>
        )}
      </div>

      {form.terms && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 11px",
            borderRadius: 8,
            background: "var(--color-bg-alt)",
            fontSize: 12,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}
        >
          <b>T&amp;C: </b>
          {form.terms}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateOfferPage() {
  const router = useRouter();
  const { userProfile, role } = useAuth();

  const isSalesExec = role === "sales_executive";
  const isBranchMgr = role === "branch_manager";
  const isFullManager = [
    "super_admin",
    "franchise_admin",
    "branch_manager",
  ].includes(role);
  const isSuperAdmin = role === "super_admin";
  const isFranchiseAdmin = role === "franchise_admin";

  // Branch list (for admins who manage multiple branches)
  const needsBranchSelect = isSuperAdmin || isFranchiseAdmin;
  const { branches, loading: branchesLoading } = useBranches(
    needsBranchSelect
      ? {
          franchise_id: isSuperAdmin ? undefined : userProfile?.franchise_id,
          scope: isSuperAdmin ? "all" : "franchise",
        }
      : { franchise_id: null, scope: "none" },
  );

  const today = new Date().toISOString().split("T")[0];

  // Resolved branch_id: fixed for branch_manager/sales_exec, selectable for admins
  const resolvedBranchId =
    isBranchMgr || isSalesExec ? userProfile?.branch_id || "" : null; // will be set via selector

  const [branchId, setBranchId] = useState(resolvedBranchId || "");
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "percentage",
    discount_value: "",
    valid_from: today,
    valid_to: "",
    halls: [],
    min_guests: "",
    badge: "",
    badge_color: "green",
    terms: "",
    active: true,
    consumer_visible: !isSalesExec,
    single_use: isSalesExec,
    max_uses: isSalesExec ? 1 : 0,
    code: genCode("BQE"),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Auto-select first branch for admin selectors once loaded
  useEffect(() => {
    if (needsBranchSelect && branches.length > 0 && !branchId) {
      setBranchId(branches[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length, needsBranchSelect]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleHall = (h) =>
    setForm((p) => ({
      ...p,
      halls: p.halls.includes(h)
        ? p.halls.filter((x) => x !== h)
        : [...p.halls, h],
    }));

  const regenCode = () => set("code", genCode("BQE"));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.discount_value) e.discount_value = "Value is required";
    if (!form.valid_to) e.valid_to = "Expiry date is required";
    if (needsBranchSelect && !branchId) e.branch_id = "Select a branch";
    if (form.valid_to && form.valid_to < form.valid_from)
      e.valid_to = "Expiry must be after start date";
    if (!form.code.trim()) e.code = "Coupon code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErr("");
    try {
      const payload = {
        ...form,
        branch_id: branchId,
        discount_value: Number(form.discount_value),
        min_guests: Number(form.min_guests) || 0,
        max_uses: form.single_use ? 1 : Number(form.max_uses) || 0,
        halls: form.halls.length === 0 ? "All" : form.halls,
        code: form.code.trim().toUpperCase(),
      };
      await apiFetch("/api/offers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      invalidateCache(cacheKeys.offers(branchId || "all"));
      setSaved(true);
      setTimeout(() => router.push("/offers"), 1500);
    } catch (e) {
      setSaveErr(e.message);
    }
    setSaving(false);
  };

  if (saved) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 360,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <CheckCircle2
            size={52}
            style={{
              color: "#27ae60",
              margin: "0 auto 14px",
              display: "block",
            }}
          />
          <p
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "var(--color-text-h)",
            }}
          >
            {isSalesExec ? "Coupon Created!" : "Offer Published!"}
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="co-layout">
      {/* ── Form column ─────────────────────────────────────── */}
      <div>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 22 }}>
          <div className="page-header-left">
            <Link
              href="/offers"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--color-text-muted)",
                marginBottom: 6,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={13} /> Back to Offers
            </Link>
            <h1>{isSalesExec ? "Create Coupon" : "Create Offer"}</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              {isSalesExec
                ? "Single-use coupon for a specific customer"
                : "Promotional offer / multi-use coupon for your branch"}
            </p>
          </div>
          <div className="page-actions co-header-actions">
            <Link
              href="/offers"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: "none" }}
            >
              Cancel
            </Link>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Save size={14} />{" "}
              {saving
                ? "Saving…"
                : isSalesExec
                  ? "Create Coupon"
                  : "Publish Offer"}
            </button>
          </div>
        </div>

        {saveErr && (
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
            {saveErr}
          </div>
        )}

        <div className="form-card">
          {/* ── Branch selector (admins only) ── */}
          {needsBranchSelect && (
            <>
              <div className="form-section-title">Branch</div>
              <div className="form-field" style={{ marginBottom: 20 }}>
                {branchesLoading ? (
                  <div
                    style={{
                      height: 42,
                      borderRadius: 8,
                      background: "var(--color-primary-ghost)",
                    }}
                  />
                ) : (
                  <select
                    className={`input${errors.branch_id ? " input-error" : ""}`}
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
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
                {errors.branch_id && (
                  <span className="form-error">{errors.branch_id}</span>
                )}
              </div>
            </>
          )}

          {/* ── Coupon Code ── */}
          <div className="form-section-title">Coupon Code</div>
          <div className="form-field" style={{ marginBottom: 20 }}>
            <label className="form-label">Unique Code *</label>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                className={`input co-code-input${errors.code ? " input-error" : ""}`}
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="BQE-XXXXXX"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: 1.5,
                  flex: 1,
                  minWidth: 160,
                }}
              />
              <button
                type="button"
                onClick={regenCode}
                className="btn btn-ghost btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                }}
                title="Generate new code"
              >
                <Shuffle size={13} /> Regenerate
              </button>
            </div>
            {errors.code && <span className="form-error">{errors.code}</span>}
            <span className="form-hint">
              Code is unique per branch · customers enter this at checkout
            </span>
          </div>

          {/* ── Offer Details ── */}
          <div className="form-section-title">Offer Details</div>
          <div className="form-grid">
            <div className="form-field form-span-2">
              <label className="form-label">Title *</label>
              <input
                className={`input${errors.title ? " input-error" : ""}`}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Early Bird Wedding Discount"
              />
              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short description shown to customers (1–2 sentences)"
              />
            </div>
          </div>

          {/* ── Offer Type ── */}
          <div className="form-section-title" style={{ marginTop: 22 }}>
            Discount Type &amp; Value
          </div>
          <div className="co-type-row">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => set("type", opt.key)}
                className={`co-type-btn${form.type === opt.key ? " co-type-active" : ""}`}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                  }}
                >
                  {opt.hint}
                </span>
              </button>
            ))}
          </div>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="form-field">
              <label className="form-label">
                {form.type === "percentage"
                  ? "Discount %"
                  : form.type === "flat"
                    ? "Amount Off (₹)"
                    : "Add-on Value (₹)"}{" "}
                *
              </label>
              <input
                className={`input${errors.discount_value ? " input-error" : ""}`}
                type="number"
                min="0"
                step={form.type === "percentage" ? "1" : "100"}
                placeholder={
                  form.type === "percentage" ? "e.g. 10" : "e.g. 20000"
                }
                value={form.discount_value}
                onChange={(e) => set("discount_value", e.target.value)}
              />
              {errors.discount_value && (
                <span className="form-error">{errors.discount_value}</span>
              )}
              <span className="form-hint">
                {form.type === "percentage"
                  ? "Applied on base hall rent"
                  : form.type === "flat"
                    ? "Flat rupee reduction on bill"
                    : "Value of free add-on"}
              </span>
            </div>
            {!isSalesExec && (
              <div className="form-field">
                <label className="form-label">
                  Max Uses{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    (0 = unlimited)
                  </span>
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.single_use ? 1 : form.max_uses}
                  disabled={form.single_use}
                  onChange={(e) => set("max_uses", e.target.value)}
                />
                <span className="form-hint">
                  How many times this coupon can be used
                </span>
              </div>
            )}
            <div className="form-field">
              <label className="form-label">Minimum Guests</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder="0 = no minimum"
                value={form.min_guests}
                onChange={(e) => set("min_guests", e.target.value)}
              />
            </div>
          </div>

          {/* ── Validity ── */}
          <div className="form-section-title" style={{ marginTop: 22 }}>
            Validity Period
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Valid From</label>
              <input
                className="input"
                type="date"
                value={form.valid_from}
                onChange={(e) => set("valid_from", e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Expiry Date *</label>
              <input
                className={`input${errors.valid_to ? " input-error" : ""}`}
                type="date"
                value={form.valid_to}
                onChange={(e) => set("valid_to", e.target.value)}
                min={form.valid_from || today}
              />
              {errors.valid_to && (
                <span className="form-error">{errors.valid_to}</span>
              )}
            </div>
          </div>

          {/* ── Scope (hidden for sales exec) ── */}
          {!isSalesExec && (
            <>
              <div className="form-section-title" style={{ marginTop: 22 }}>
                Applies To
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">
                  Halls{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    (leave empty = all)
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {HALL_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleHall(h)}
                      style={{
                        padding: "6px 13px",
                        fontSize: 13,
                        borderRadius: 8,
                        cursor: "pointer",
                        border: "1.5px solid",
                        background: form.halls.includes(h)
                          ? "var(--color-primary)"
                          : "transparent",
                        color: form.halls.includes(h)
                          ? "#fff"
                          : "var(--color-text-body)",
                        borderColor: form.halls.includes(h)
                          ? "var(--color-primary)"
                          : "var(--color-border)",
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Badge (admin only) ── */}
          {!isSalesExec && (
            <>
              <div className="form-section-title" style={{ marginTop: 22 }}>
                Label &amp; Badge
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Badge Label</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                      marginTop: 4,
                    }}
                  >
                    {BADGE_OPTIONS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => set("badge", form.badge === b ? "" : b)}
                        style={{
                          padding: "5px 11px",
                          fontSize: 12,
                          borderRadius: 20,
                          cursor: "pointer",
                          border: "1.5px solid",
                          background:
                            form.badge === b
                              ? "var(--color-primary)"
                              : "transparent",
                          color:
                            form.badge === b
                              ? "#fff"
                              : "var(--color-text-body)",
                          borderColor:
                            form.badge === b
                              ? "var(--color-primary)"
                              : "var(--color-border)",
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Badge Colour</label>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {BADGE_COLORS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => set("badge_color", c.key)}
                        title={c.label}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: c.hex,
                          outline: "none",
                          border:
                            form.badge_color === c.key
                              ? "3px solid var(--color-text-h)"
                              : "3px solid transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Terms ── */}
          <div className="form-section-title" style={{ marginTop: 22 }}>
            Terms &amp; Conditions
          </div>
          <div className="form-field">
            <textarea
              className="input"
              rows={2}
              value={form.terms}
              onChange={(e) => set("terms", e.target.value)}
              placeholder="e.g. Cannot be combined with other offers. Valid for new bookings only."
            />
            <span className="form-hint">Shown below the coupon card</span>
          </div>

          {/* ── Settings ── */}
          <div className="form-section-title" style={{ marginTop: 22 }}>
            Settings
          </div>
          <div className="form-grid">
            {/* Single-use toggle (locked for sales exec) */}
            <div className="form-field">
              <label className="form-label">Coupon Type</label>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Single-Use", val: true },
                  { label: "Multi-Use", val: false },
                ].map((opt) => (
                  <label
                    key={opt.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      cursor:
                        isSalesExec && !opt.val ? "not-allowed" : "pointer",
                      opacity: isSalesExec && !opt.val ? 0.4 : 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="single_use"
                      checked={form.single_use === opt.val}
                      disabled={isSalesExec && !opt.val}
                      onChange={() => {
                        set("single_use", opt.val);
                        if (opt.val) set("max_uses", 1);
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {isSalesExec && (
                <span className="form-hint">
                  Sales executives can only create single-use coupons
                </span>
              )}
            </div>

            {/* Status */}
            <div className="form-field">
              <label className="form-label">Status</label>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                {["Active", "Inactive"].map((s) => (
                  <label
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="active"
                      checked={form.active === (s === "Active")}
                      onChange={() => set("active", s === "Active")}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Consumer Visible (admin only) */}
            {!isSalesExec && (
              <div className="form-field form-span-2">
                <label className="form-label">Consumer Visibility</label>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Show on website", val: true },
                    { label: "Internal only", val: false },
                  ].map((opt) => (
                    <label
                      key={opt.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="consumer_visible"
                        checked={form.consumer_visible === opt.val}
                        onChange={() => set("consumer_visible", opt.val)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <span className="form-hint">
                  Controls whether this coupon appears on your marketing website
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions co-form-actions">
            <Link
              href="/offers"
              className="btn btn-ghost"
              style={{ textDecoration: "none" }}
            >
              Cancel
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Save size={15} />{" "}
              {saving
                ? "Saving…"
                : isSalesExec
                  ? "Create Coupon"
                  : "Publish Offer"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Preview column ────────────────────────────────── */}
      <div className="co-preview-col">
        <LivePreview form={form} />
        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "var(--color-text-h)",
              marginBottom: 10,
            }}
          >
            {isSalesExec ? "🎟 Coupon Rules" : "📌 Offer Tips"}
          </div>
          {(isSalesExec
            ? [
                "Single-use coupons can only be redeemed once.",
                "Share the coupon code directly with your customer.",
                "Set a realistic expiry — expired coupons are rejected at checkout.",
                "You can deactivate a coupon from the Coupons list if needed.",
              ]
            : [
                "Coupon codes are unique per branch — click the code in the preview to copy.",
                'Toggle "Show on website" to make the offer visible to customers.',
                "Single-use: for individual customer deals. Multi-use: for bulk promotions.",
                "Layer with Dynamic Pricing: discounts apply after demand multipliers.",
              ]
          ).map((t, i) => (
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

      <style>{`
        .co-layout { display:grid;grid-template-columns:1fr 320px;gap:22px;align-items:start; }
        .co-preview-col { position:sticky;top:80px; }
        .lp-card { padding:20px; }
        .co-type-row { display:flex;gap:10px;flex-wrap:wrap; }
        .co-type-btn { display:flex;flex-direction:column;align-items:flex-start;padding:10px 16px;border-radius:10px;cursor:pointer;border:2px solid var(--color-border);background:transparent;color:var(--color-text-body);transition:border-color .15s;min-width:140px;flex:1; }
        .co-type-active { border-color:var(--color-primary);background:var(--color-primary-ghost);color:var(--color-primary); }
        .co-code-input { max-width:260px; }
        .co-header-actions { display:flex;gap:8px; }
        .co-form-actions { margin-top:22px; }
        .input-error { border-color:#c0392b !important; }
        .form-error  { font-size:11px;color:#c0392b;margin-top:3px;display:block; }

        @media (max-width:900px) {
          .co-layout { grid-template-columns:1fr; }
          .co-preview-col { position:static; }
        }
        @media (max-width:600px) {
          .co-type-row { gap:7px; }
          .co-type-btn { min-width:calc(50% - 4px);padding:9px 12px; }
          .co-code-input { max-width:100%; }
          .co-header-actions { flex-direction:row; }
          .form-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
