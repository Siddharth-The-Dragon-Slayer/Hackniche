"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Star,
  Building2,
  DoorOpen,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { useBranches, useHalls } from "@/hooks/use-branches";
import {
  getCached,
  setCached,
  cacheKeys,
  invalidateCache,
} from "@/lib/firestore-cache";
import { apiFetch } from "@/lib/api-client";

function SkeletonRow() {
  return (
    <tr>
      {[200, 110, 120, 60, 90, 90, 80, 70].map((w, i) => (
        <td key={i}>
          <div
            style={{
              height: 15,
              borderRadius: 4,
              background: "var(--color-primary-ghost)",
              width: w,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

async function fetchHallCounts(franchise_id) {
  const key = `hall_counts_${franchise_id}`;
  const cached = getCached(key);
  if (cached) return cached;
  const snap = await getDocs(
    query(collection(db, "halls"), where("franchise_id", "==", franchise_id)),
  );
  const counts = {};
  snap.docs.forEach((d) => {
    const bid = d.data().branch_id;
    counts[bid] = (counts[bid] || 0) + 1;
  });
  setCached(key, counts);
  return counts;
}

// ── Branch Form Modal (Add or Edit) ──────────────────────────────
function BranchFormModal({
  branch,
  franchiseId,
  franchiseName,
  onClose,
  onSaved,
}) {
  const isEdit = !!branch;
  const [form, setForm] = useState({
    name: branch?.name || "",
    city: branch?.city || "",
    state: branch?.state || "Maharashtra",
    address: branch?.address || "",
    phone: branch?.phone || "",
    timings: branch?.timings || "11:00 AM – 11:30 PM",
    maps_url: branch?.maps_url || "",
    google_rating: branch?.google_rating ?? "",
    review_count: branch?.review_count ?? "",
    cost_for_two: branch?.cost_for_two ?? "",
    status: branch?.status || "active",
    type: branch?.type || "Outlet",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const payload = {
        name: form.name,
        city: form.city,
        state: form.state,
        address: form.address,
        phone: form.phone,
        timings: form.timings,
        maps_url: form.maps_url || null,
        google_rating: form.google_rating ? Number(form.google_rating) : null,
        review_count: form.review_count ? Number(form.review_count) : null,
        cost_for_two: form.cost_for_two ? Number(form.cost_for_two) : null,
        status: form.status,
        type: form.type,
      };

      if (isEdit) {
        await apiFetch(`/api/branches/${branch.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        invalidateCache(cacheKeys.branches(franchiseId));
        invalidateCache(cacheKeys.allBranches());
      } else {
        await apiFetch("/api/branches", {
          method: "POST",
          body: JSON.stringify({ ...payload, franchise_id: franchiseId, franchise_name: franchiseName }),
        });
        invalidateCache(cacheKeys.branches(franchiseId));
        invalidateCache(cacheKeys.allBranches());
        invalidateCache(`hall_counts_${franchiseId}`);
      }
      setDone(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1200);
    } catch (ex) {
      setErr("Failed to save: " + ex.message);
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 20px",
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          padding: 28,
          width: "100%",
          maxWidth: 600,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={18} />
        </button>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 20,
          }}
        >
          {isEdit ? "Edit Branch" : "Add New Branch"}
        </h3>
        {done ? (
          <div
            style={{ textAlign: "center", padding: "24px 0", color: "#27ae60" }}
          >
            <CheckCircle2
              size={44}
              style={{ margin: "0 auto 12px", display: "block" }}
            />
            <p style={{ fontWeight: 600, fontSize: 16 }}>
              Branch {isEdit ? "updated" : "created"} successfully!
            </p>
          </div>
        ) : (
          <>
            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 16,
                  borderRadius: 8,
                  background: "rgba(192,57,43,0.08)",
                  border: "1px solid rgba(192,57,43,0.2)",
                  color: "var(--color-danger)",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}
            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Branch Name *
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    City
                  </label>
                  <input
                    className="input"
                    value={form.city}
                    onChange={set("city")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    State
                  </label>
                  <input
                    className="input"
                    value={form.state}
                    onChange={set("state")}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Address
                  </label>
                  <input
                    className="input"
                    value={form.address}
                    onChange={set("address")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Phone
                  </label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Timings
                  </label>
                  <input
                    className="input"
                    value={form.timings}
                    onChange={set("timings")}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Google Maps URL
                  </label>
                  <input
                    className="input"
                    placeholder="https://www.google.com/maps?q=…"
                    value={form.maps_url}
                    onChange={set("maps_url")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Google Rating (0–5)
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.google_rating}
                    onChange={set("google_rating")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Review Count
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.review_count}
                    onChange={set("review_count")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Cost for Two (₹)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.cost_for_two}
                    onChange={set("cost_for_two")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Type
                  </label>
                  <select
                    className="select"
                    value={form.type}
                    onChange={set("type")}
                  >
                    <option value="Outlet">Outlet</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Banquet">Banquet</option>
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Status
                  </label>
                  <select
                    className="select"
                    value={form.status}
                    onChange={set("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ alignSelf: "flex-start", marginTop: 4 }}
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <Save size={14} />{" "}
                    {isEdit ? "Save Changes" : "Create Branch"}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Halls Panel (in-row expansion) ────────────────────────────────
function HallsPanel({ branch, onClose, canManageHalls = false }) {
  const { halls, loading, error, refresh } = useHalls({ branch_id: branch.id });
  const [editingHall, setEditingHall] = useState(null);

  return (
    <tr>
      <td
        colSpan={9}
        style={{ background: "var(--color-primary-ghost)", padding: 0 }}
      >
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-text-h)",
              }}
            >
              Halls — {branch.name}
            </h4>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          {loading && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              Loading halls…
            </p>
          )}
          {error && (
            <p style={{ color: "var(--color-danger)", fontSize: 13 }}>
              Failed to load halls: {error}
            </p>
          )}
          {!loading && halls.length === 0 && (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              No halls configured for this branch.
            </p>
          )}

          {editingHall && (
            <HallFormModal
              hall={editingHall}
              branch={branch}
              onClose={() => setEditingHall(null)}
              onSaved={() => {
                refresh();
                invalidateCache(`hall_counts_${branch.franchise_id}`);
              }}
            />
          )}

          {!loading && halls.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              {halls.map((h) => (
                <div
                  key={h.id}
                  className="card"
                  style={{ padding: 16, position: "relative" }}
                >
                  {canManageHalls && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingHall(h)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        padding: "4px 6px",
                      }}
                      title="Edit Hall"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--color-text-h)",
                      fontSize: 15,
                      marginBottom: 6,
                      paddingRight: 28,
                    }}
                  >
                    {h.name}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 4,
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>Seating:</span>{" "}
                      {h.capacity_seating}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Floating:</span>{" "}
                      {h.capacity_floating}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Type:</span> {h.type}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600 }}>Price/plate:</span> ₹
                      {h.price_per_plate}
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ fontWeight: 600 }}>Base Price:</span> ₹
                      {(h.base_price || 0).toLocaleString()}
                    </div>
                    {h.features?.length > 0 && (
                      <div style={{ gridColumn: "span 2", marginTop: 4 }}>
                        <span style={{ fontWeight: 600 }}>Features: </span>
                        {h.features.join(", ")}
                      </div>
                    )}
                  </div>
                  <span
                    className={`badge ${h.status === "active" ? "badge-green" : "badge-warning"}`}
                    style={{ marginTop: 8, display: "inline-block" }}
                  >
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {canManageHalls && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 14 }}
              onClick={() =>
                setEditingHall({
                  id: null,
                  branch_id: branch.id,
                  branch_name: branch.name,
                  franchise_id: branch.franchise_id,
                  franchise_name: branch.franchise_name,
                })
              }
            >
              <Plus size={13} /> Add Hall
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Hall Form Modal ────────────────────────────────────────────────
function HallFormModal({ hall, branch, onClose, onSaved }) {
  const isEdit = !!hall?.id;
  const [form, setForm] = useState({
    name: hall?.name || "",
    type: hall?.type || "Indoor",
    capacity_seating: hall?.capacity_seating ?? "",
    capacity_floating: hall?.capacity_floating ?? "",
    base_price: hall?.base_price ?? "",
    price_per_plate: hall?.price_per_plate ?? 450,
    features: (hall?.features || []).join(", "),
    status: hall?.status || "active",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const payload = {
        name: form.name,
        type: form.type,
        capacity_seating: Number(form.capacity_seating) || 0,
        capacity_floating: Number(form.capacity_floating) || 0,
        base_price: Number(form.base_price) || 0,
        price_per_plate: Number(form.price_per_plate) || 450,
        features: form.features
          ? form.features
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        status: form.status,
        branch_id: hall.branch_id,
      };
      if (isEdit) {
        await apiFetch(`/api/halls/${hall.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        invalidateCache(cacheKeys.halls(hall.branch_id));
      } else {
        await apiFetch("/api/halls", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        invalidateCache(cacheKeys.halls(hall.branch_id));
      }
      setDone(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1200);
    } catch (ex) {
      setErr("Failed to save: " + ex.message);
    }
    setSaving(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          padding: 28,
          width: "100%",
          maxWidth: 500,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={18} />
        </button>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 20,
          }}
        >
          {isEdit ? "Edit Hall" : "Add Hall"}
        </h3>
        {done ? (
          <div
            style={{ textAlign: "center", padding: "20px 0", color: "#27ae60" }}
          >
            <CheckCircle2
              size={40}
              style={{ margin: "0 auto 12px", display: "block" }}
            />
            <p style={{ fontWeight: 600 }}>
              Hall {isEdit ? "updated" : "created"}!
            </p>
          </div>
        ) : (
          <>
            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 14,
                  borderRadius: 8,
                  background: "rgba(192,57,43,0.08)",
                  color: "var(--color-danger)",
                  fontSize: 13,
                }}
              >
                {err}
              </div>
            )}
            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Hall Name *
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Type
                  </label>
                  <select
                    className="select"
                    value={form.type}
                    onChange={set("type")}
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Lawn">Lawn</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Status
                  </label>
                  <select
                    className="select"
                    value={form.status}
                    onChange={set("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Seating Capacity
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.capacity_seating}
                    onChange={set("capacity_seating")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Floating Capacity
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.capacity_floating}
                    onChange={set("capacity_floating")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Base Price (₹)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.base_price}
                    onChange={set("base_price")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Price per Plate (₹)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.price_per_plate}
                    onChange={set("price_per_plate")}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Features (comma-separated)
                  </label>
                  <input
                    className="input"
                    placeholder="AC, Projector, Stage…"
                    value={form.features}
                    onChange={set("features")}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ alignSelf: "flex-start" }}
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <Save size={14} /> {isEdit ? "Save Hall" : "Add Hall"}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function BranchesPage() {
  const { userProfile, role } = useAuth();
  const [search, setSearch] = useState("");
  const [hallCounts, setHallCounts] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [expandedBranch, setExpandedBranch] = useState(null);

  const scope = role === "super_admin" ? "all" : "franchise";

  const { branches, loading, error, refresh } = useBranches({
    franchise_id: userProfile?.franchise_id,
    scope,
  });

  useEffect(() => {
    if (!userProfile?.franchise_id) return;
    fetchHallCounts(userProfile.franchise_id)
      .then(setHallCounts)
      .catch(console.error);
  }, [userProfile?.franchise_id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q),
    );
  }, [branches, search]);

  const scopeLabel =
    scope === "all"
      ? "All Branches — Global"
      : `${userProfile?.franchise_name || "Franchise"} Branches`;

  const canManage = ["super_admin", "franchise_admin"].includes(role);
  const canManageHalls = ["super_admin", "franchise_admin", "branch_manager"].includes(role);

  const handleSaved = () => {
    if (userProfile?.franchise_id) {
      invalidateCache(`hall_counts_${userProfile.franchise_id}`);
      fetchHallCounts(userProfile.franchise_id)
        .then(setHallCounts)
        .catch(console.error);
    }
    refresh();
  };

  return (
    <div>
      {/* Add Branch Modal */}
      {showAdd && (
        <BranchFormModal
          franchiseId={userProfile?.franchise_id}
          franchiseName={userProfile?.franchise_name}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}
      {/* Edit Branch Modal */}
      {editingBranch && (
        <BranchFormModal
          branch={editingBranch}
          franchiseId={userProfile?.franchise_id || editingBranch.franchise_id}
          franchiseName={
            userProfile?.franchise_name || editingBranch.franchise_name
          }
          onClose={() => setEditingBranch(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
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
            Branches
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {loading
              ? "Loading…"
              : `${filtered.length} of ${branches.length} branches · ${scopeLabel}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={refresh}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          {canManage && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={14} /> Add Branch
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            className="input"
            placeholder="Search by name, city, address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 14 }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="card"
          style={{
            padding: "14px 18px",
            marginBottom: 16,
            background: "rgba(192,57,43,0.06)",
            border: "1px solid rgba(192,57,43,0.2)",
            color: "var(--color-danger)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          Failed to load branches: {error}
          <button className="btn btn-ghost btn-sm" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>City</th>
              <th>Address</th>
              <th>Halls</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Timings</th>
              <th>Status</th>
              {canManage && <th style={{ width: 100 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={canManage ? 9 : 8}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Building2
                    size={32}
                    style={{
                      display: "block",
                      margin: "0 auto 10px",
                      opacity: 0.4,
                    }}
                  />
                  {branches.length === 0
                    ? "No branches found in database."
                    : "No results match your search."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((b) => [
                <tr key={b.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-h)" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          flexShrink: 0,
                          background: "var(--gradient-btn)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--color-text-on-gold)",
                        }}
                      >
                        {(b.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div>{b.name}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                            fontWeight: 400,
                          }}
                        >
                          {b.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{b.city}</td>
                  <td
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      maxWidth: 220,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 5,
                      }}
                    >
                      <MapPin
                        size={11}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          color: "var(--color-primary)",
                        }}
                      />
                      <span style={{ lineHeight: 1.4 }}>
                        {b.address || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setExpandedBranch(expandedBranch === b.id ? null : b.id)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 8px",
                        fontSize: 13,
                      }}
                      title="View / Edit Halls"
                    >
                      <DoorOpen
                        size={14}
                        style={{ color: "var(--color-primary)" }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        {hallCounts[b.id] ?? "—"}
                      </span>
                      {expandedBranch === b.id ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Phone
                        size={11}
                        style={{
                          color: "var(--color-text-muted)",
                          flexShrink: 0,
                        }}
                      />
                      <a
                        href={`tel:${b.phone}`}
                        style={{
                          color: "var(--color-text-body)",
                          textDecoration: "none",
                        }}
                      >
                        {b.phone || "—"}
                      </a>
                    </div>
                  </td>
                  <td>
                    {b.google_rating ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Star
                          size={13}
                          style={{ color: "#E8B84B", fill: "#E8B84B" }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                          }}
                        >
                          {b.google_rating}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          ({(b.review_count || 0).toLocaleString()})
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.timings || "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${b.status === "active" ? "badge-green" : "badge-warning"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingBranch(b)}
                        title="Edit Branch"
                        style={{ padding: "5px 8px" }}
                      >
                        <Pencil size={13} />
                      </button>
                    </td>
                  )}
                </tr>,
                expandedBranch === b.id && (
                  <HallsPanel
                    key={`halls-${b.id}`}
                    branch={b}
                    onClose={() => setExpandedBranch(null)}
                    canManageHalls={canManageHalls}
                  />
                ),
              ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}
