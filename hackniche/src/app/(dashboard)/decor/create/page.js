"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Palette,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { invalidateCache, cacheKeys } from "@/lib/firestore-cache";
import ImageUpload from "@/components/shared/ImageUpload";

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
const CAN_CREATE = [
  "decorator",
  "branch_manager",
  "franchise_admin",
  "super_admin",
];
const fmt = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");

export default function CreateDecorPackagePage() {
  const router = useRouter();
  const { userProfile, role } = useAuth();

  const branchId = userProfile?.branch_id || "";
  const franchiseId = userProfile?.franchise_id || "";
  const isDecorator = role === "decorator";

  const [form, setForm] = useState({
    name: "",
    theme: "Royal",
    description: "",
    status: "active",
  });
  const [items, setItems] = useState([{ name: "", qty: 1, unit_price: "" }]);
  const [suitable, setSuitable] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    if (role && !CAN_CREATE.includes(role)) router.replace("/decor");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const addItem = () =>
    setItems((p) => [...p, { name: "", qty: 1, unit_price: "" }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const setItem = (i, k, v) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const toggleSuitable = (e) =>
    setSuitable((p) => (p.includes(e) ? p.filter((x) => x !== e) : [...p, e]));

  const totalPrice = items.reduce(
    (s, it) => s + Number(it.unit_price || 0) * Number(it.qty || 1),
    0,
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Package name is required";
    if (!form.theme) e.theme = "Theme is required";
    if (!items.some((it) => it.name.trim() && Number(it.unit_price) > 0))
      e.items = "Add at least one item with a price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErr("");
    try {
      const validItems = items
        .filter((it) => it.name.trim() && Number(it.unit_price) > 0)
        .map((it) => ({
          name: it.name.trim(),
          qty: Number(it.qty) || 1,
          unit_price: Number(it.unit_price),
        }));

      const res = await fetch("/api/decor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          franchise_id: franchiseId,
          branch_id: branchId,
          name: form.name.trim(),
          theme: form.theme,
          description: form.description.trim(),
          status: form.status,
          items: validItems,
          base_price: totalPrice,
          suitable_for: suitable,
          image_urls: imageUrls,
          created_by_uid: userProfile?.uid || "",
          created_by_name: userProfile?.name || "",
          created_by_role: role || "",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save");
      invalidateCache(cacheKeys.decor(branchId || franchiseId));
      setSaved(true);
      setTimeout(() => router.push("/decor"), 1500);
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
            Package Created!
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cdp-layout">
      <div>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 22 }}>
          <div className="page-header-left">
            <Link
              href="/decor"
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
              <ArrowLeft size={13} /> Back to Decor
            </Link>
            <h1>Add Decor Package</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              {isDecorator
                ? "Build your decoration offering with item-by-item pricing"
                : "Add a new decoration package for this branch"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/decor"
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
              <Save size={14} /> {saving ? "Saving…" : "Save Package"}
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
          {/* Basic Info */}
          <div className="form-section-title">Package Details</div>
          <div className="form-grid">
            <div className="form-field form-span-2">
              <label className="form-label">Package Name *</label>
              <input
                className={`input${errors.name ? " input-error" : ""}`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Royal Floral Premium"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Theme *</label>
              <select
                className="input"
                value={form.theme}
                onChange={(e) => set("theme", e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Status</label>
              <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                {["active", "inactive"].map((s) => (
                  <label
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={form.status === s}
                      onChange={() => set("status", s)}
                    />{" "}
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description — colours, highlights, special elements…"
              />
            </div>
          </div>

          {/* Itemised Pricing */}
          <div className="form-section-title" style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Itemised Pricing *</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                }}
              >
                Total:{" "}
                <b
                  style={{
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {fmt(totalPrice)}
                </b>
              </span>
            </div>
          </div>
          {errors.items && (
            <p
              style={{ color: "#c0392b", fontSize: 12, margin: "-4px 0 10px" }}
            >
              {errors.items}
            </p>
          )}

          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div className="cdp-table-wrap">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  minWidth: 520,
                }}
              >
                <thead>
                  <tr style={{ background: "var(--color-bg-alt)" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "9px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Item / Element
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "9px 8px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        width: 70,
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "9px 8px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        width: 150,
                      }}
                    >
                      Unit Price (\u20B9)
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "9px 12px",
                        fontWeight: 600,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        width: 110,
                      }}
                    >
                      Total
                    </th>
                    <th style={{ width: 36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const rowTotal =
                      Number(it.unit_price || 0) * Number(it.qty || 1);
                    return (
                      <tr
                        key={i}
                        style={{ borderTop: "1px solid var(--color-border)" }}
                      >
                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="input"
                            value={it.name}
                            onChange={(e) => setItem(i, "name", e.target.value)}
                            placeholder="e.g. Stage decoration"
                            style={{ fontSize: 13, padding: "6px 10px" }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            value={it.qty}
                            onChange={(e) => setItem(i, "qty", e.target.value)}
                            style={{
                              fontSize: 13,
                              padding: "6px 8px",
                              textAlign: "center",
                            }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <input
                            className="input"
                            type="number"
                            min={0}
                            step={100}
                            value={it.unit_price}
                            onChange={(e) =>
                              setItem(i, "unit_price", e.target.value)
                            }
                            placeholder="0"
                            style={{
                              fontSize: 13,
                              padding: "6px 10px",
                              textAlign: "right",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "6px 12px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "var(--color-text-h)",
                            fontFamily: "var(--font-mono)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(rowTotal)}
                        </td>
                        <td style={{ padding: "6px 4px", textAlign: "center" }}>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(i)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#c0392b",
                                display: "flex",
                                alignItems: "center",
                                padding: 4,
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr
                    style={{
                      borderTop: "2px solid var(--color-border)",
                      background: "var(--color-bg-alt)",
                    }}
                  >
                    <td
                      colSpan={3}
                      style={{
                        padding: "10px 12px",
                        fontWeight: 700,
                        textAlign: "right",
                        color: "var(--color-text-h)",
                      }}
                    >
                      Package Total
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        textAlign: "right",
                        fontWeight: 800,
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 15,
                      }}
                    >
                      {fmt(totalPrice)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <button
            onClick={addItem}
            className="btn btn-ghost btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
            }}
          >
            <Plus size={14} /> Add Item
          </button>

          {/* Suitable For */}
          <div className="form-section-title" style={{ marginTop: 24 }}>
            Suitable For
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginTop: -4,
              marginBottom: 10,
            }}
          >
            Select event types where this package can be applied
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EVENT_TYPES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => toggleSuitable(e)}
                style={{
                  padding: "6px 13px",
                  fontSize: 13,
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1.5px solid",
                  background: suitable.includes(e)
                    ? "var(--color-primary)"
                    : "transparent",
                  color: suitable.includes(e)
                    ? "#fff"
                    : "var(--color-text-body)",
                  borderColor: suitable.includes(e)
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              >
                {e}
              </button>
            ))}
          </div>

          <ImageUpload
            images={imageUrls}
            onChange={setImageUrls}
            folder={`decor_packages/${branchId || franchiseId}`}
            maxImages={8}
            label="Reference Images (optional)"
          />

          <div className="form-actions" style={{ marginTop: 24 }}>
            <Link
              href="/decor"
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
              <Save size={15} /> {saving ? "Saving…" : "Save Package"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview column */}
      <div className="cdp-preview-col">
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 14,
            }}
          >
            <Palette size={15} style={{ color: "var(--color-primary)" }} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "var(--color-text-h)",
              }}
            >
              Live Preview
            </span>
          </div>
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
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(142,68,173,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🎨
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--color-text-h)",
                  }}
                >
                  {form.name || "Package Name"}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 10,
                    background: "rgba(142,68,173,0.10)",
                    color: "#8e44ad",
                    marginTop: 4,
                    display: "inline-block",
                  }}
                >
                  {form.theme}
                </span>
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(totalPrice)}
              </span>
            </div>
            {form.description && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  margin: "0 0 10px",
                  lineHeight: 1.5,
                }}
              >
                {form.description}
              </p>
            )}
            {suitable.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginBottom: 8,
                }}
              >
                {suitable.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 10,
                      padding: "2px 7px",
                      borderRadius: 10,
                      background: "rgba(39,174,96,0.10)",
                      color: "#27ae60",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {items.filter((it) => it.name.trim()).length > 0 && (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                <Package
                  size={11}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {items.filter((it) => it.name.trim()).length} item
                {items.filter((it) => it.name.trim()).length !== 1
                  ? "s"
                  : ""}{" "}
                included
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 18, marginTop: 14 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "var(--color-text-h)",
              marginBottom: 10,
            }}
          >
            💡 Pricing Tips
          </div>
          {[
            "Break costs into separate items — customers trust transparent pricing.",
            "Add all physical elements: stage, flowers, lights, backdrop, table decor.",
            "Set qty = 1 for lump-sum elements (e.g. full stage setup).",
            '"Suitable For" tags help sales staff match packages to leads.',
            "Create multiple packages at different price tiers.",
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

      <style>{`
        .cdp-layout { display:grid;grid-template-columns:1fr 300px;gap:22px;align-items:start; }
        .cdp-preview-col { position:sticky;top:80px; }
        .cdp-table-wrap { overflow-x:auto; }
        .input-error { border-color:#c0392b !important; }
        .form-error  { font-size:11px;color:#c0392b;margin-top:3px;display:block; }
        @media (max-width:900px) {
          .cdp-layout { grid-template-columns:1fr; }
          .cdp-preview-col { position:static; }
        }
      `}</style>
    </div>
  );
}
