"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  DoorOpen,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Building2,
  Users,
  BadgeDollarSign,
  Tag,
  ChevronDown,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { useBranches } from "@/hooks/use-branches";
import {
  getCached,
  setCached,
  cacheKeys,
  invalidateCache,
} from "@/lib/firestore-cache";

// ── Skeleton loader ───────────────────────────────────────────────
function HallCardSkeleton() {
  return (
    <div
      className="card"
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}
    >
      {[120, 90, 70, 60].map((w, i) => (
        <div
          key={i}
          style={{
            height: 13,
            width: w,
            borderRadius: 4,
            background: "var(--color-primary-ghost)",
          }}
        />
      ))}
    </div>
  );
}

// ── Hall Form Modal (Add / Edit) ──────────────────────────────────
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
    if (!branch?.id) {
      setErr("Branch is required.");
      return;
    }
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
        branch_id: branch.id,
        branch_name: branch.name,
        franchise_id: branch.franchise_id,
        franchise_name: branch.franchise_name,
        updated_at: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, "halls", hall.id), payload);
        invalidateCache(cacheKeys.halls(branch.id));
      } else {
        await addDoc(collection(db, "halls"), {
          ...payload,
          created_at: serverTimestamp(),
        });
        invalidateCache(cacheKeys.halls(branch.id));
        invalidateCache(`hall_counts_${branch.franchise_id}`);
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
        overflowY: "auto",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          padding: 28,
          width: "100%",
          maxWidth: 520,
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
            marginBottom: 4,
          }}
        >
          {isEdit ? "Edit Hall" : "Add New Hall"}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginBottom: 20,
          }}
        >
          {branch?.name}
        </p>

        {done ? (
          <div
            style={{ textAlign: "center", padding: "28px 0", color: "#27ae60" }}
          >
            <CheckCircle2
              size={44}
              style={{ margin: "0 auto 12px", display: "block" }}
            />
            <p style={{ fontWeight: 600, fontSize: 16 }}>
              Hall {isEdit ? "updated" : "created"} successfully!
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
                    placeholder="e.g. Grand Ballroom"
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
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Conference Room">Conference Room</option>
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
                    placeholder="e.g. 200"
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
                    placeholder="e.g. 350"
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
                    placeholder="e.g. 50000"
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
                    placeholder="e.g. 450"
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
                    Features{" "}
                    <span style={{ fontWeight: 400 }}>(comma-separated)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="AC, Projector, Stage, DJ Console, Valet…"
                    value={form.features}
                    onChange={set("features")}
                  />
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
                    <Save size={14} /> {isEdit ? "Save Changes" : "Add Hall"}
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

// ── Hall Card ─────────────────────────────────────────────────────
function HallCard({ hall, onEdit, canManage }) {
  const statusColor =
    hall.status === "active"
      ? "badge-green"
      : hall.status === "maintenance"
        ? "badge-warning"
        : "badge-default";

  return (
    <div
      className="card"
      style={{
        padding: 20,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {canManage && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(hall)}
          style={{ position: "absolute", top: 12, right: 12, padding: "4px 6px" }}
          title="Edit Hall"
        >
          <Pencil size={13} />
        </button>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          paddingRight: canManage ? 32 : 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--gradient-btn)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <DoorOpen size={18} style={{ color: "var(--color-text-on-gold)" }} />
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
            {hall.name}
          </div>
          {hall.branch_name && (
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 2,
              }}
            >
              {hall.branch_name}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px 12px",
          fontSize: 12,
          color: "var(--color-text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Tag size={11} style={{ color: "var(--color-primary)" }} />
          <span>
            <strong>Type:</strong> {hall.type || "—"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={11} style={{ color: "var(--color-primary)" }} />
          <span>
            <strong>Seating:</strong> {hall.capacity_seating || "—"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Users size={11} style={{ color: "var(--color-text-muted)" }} />
          <span>
            <strong>Floating:</strong> {hall.capacity_floating || "—"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <BadgeDollarSign size={11} style={{ color: "var(--color-primary)" }} />
          <span>
            <strong>Plate:</strong> ₹{hall.price_per_plate || "—"}
          </span>
        </div>
        <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 5 }}>
          <BadgeDollarSign size={11} style={{ color: "var(--color-text-muted)" }} />
          <span>
            <strong>Base:</strong> ₹{(hall.base_price || 0).toLocaleString()}
          </span>
        </div>
        {hall.features?.length > 0 && (
          <div
            style={{
              gridColumn: "span 2",
              fontSize: 11,
              color: "var(--color-text-muted)",
              marginTop: 2,
              lineHeight: 1.5,
            }}
          >
            <strong>Features:</strong> {hall.features.join(", ")}
          </div>
        )}
      </div>

      <span
        className={`badge ${statusColor}`}
        style={{ alignSelf: "flex-start", marginTop: 2 }}
      >
        {hall.status}
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function HallsPage() {
  const { userProfile, role } = useAuth();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [editingHall, setEditingHall] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const isBranchManager = role === "branch_manager";
  const isFranchiseAdmin = role === "franchise_admin";
  const isSuperAdmin = role === "super_admin";
  const canManage =
    isBranchManager || isFranchiseAdmin || isSuperAdmin;

  // For branch_manager: fixed to their branch; others: pick from list
  const effectiveBranchId = isBranchManager
    ? userProfile?.branch_id
    : selectedBranchId;

  // Load branches for selector (franchise_admin / super_admin)
  const {
    branches,
    loading: branchesLoading,
    refresh: refreshBranches,
  } = useBranches(
    isBranchManager
      ? { franchise_id: null, scope: "franchise" } // won't fetch
      : {
          franchise_id: isSuperAdmin ? undefined : userProfile?.franchise_id,
          scope: isSuperAdmin ? "all" : "franchise",
        },
  );

  // Auto-select first branch for non-branch-managers
  useEffect(() => {
    if (!isBranchManager && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, isBranchManager, selectedBranchId]);

  // Fetch halls whenever the effective branch changes
  const fetchHalls = async (bust = false) => {
    const bid = effectiveBranchId;
    if (!bid) {
      setLoading(false);
      return;
    }

    const key = cacheKeys.halls(bid);
    if (!bust) {
      const cached = getCached(key);
      if (cached) {
        setHalls(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(
        query(collection(db, "halls"), where("branch_id", "==", bid)),
      );
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setCached(key, data);
      setHalls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBranchId]);

  const filtered = useMemo(() => {
    let data = halls;
    if (statusFilter !== "all") {
      data = data.filter((h) => h.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.type?.toLowerCase().includes(q) ||
          h.features?.some((f) => f.toLowerCase().includes(q)),
      );
    }
    return data;
  }, [halls, search, statusFilter]);

  const activeBranch = useMemo(() => {
    if (isBranchManager) {
      // Build a minimal branch object from userProfile
      return {
        id: userProfile?.branch_id,
        name: userProfile?.branch_name || "Your Branch",
        franchise_id: userProfile?.franchise_id,
        franchise_name: userProfile?.franchise_name,
      };
    }
    return branches.find((b) => b.id === selectedBranchId) || null;
  }, [isBranchManager, userProfile, branches, selectedBranchId]);

  const handleSaved = () => fetchHalls(true);

  return (
    <div>
      {/* Modals */}
      {showAdd && activeBranch && (
        <HallFormModal
          hall={null}
          branch={activeBranch}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}
      {editingHall && activeBranch && (
        <HallFormModal
          hall={editingHall}
          branch={activeBranch}
          onClose={() => setEditingHall(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Page Header */}
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
            Halls
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
              : `${filtered.length} of ${halls.length} hall${halls.length !== 1 ? "s" : ""} · ${activeBranch?.name || "—"}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchHalls(true)}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          {canManage && activeBranch?.id && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={14} /> Add Hall
            </button>
          )}
        </div>
      </div>

      {/* Branch Selector (franchise_admin / super_admin) */}
      {!isBranchManager && (
        <div
          className="card"
          style={{
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
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
            <Building2
              size={14}
              style={{ verticalAlign: "middle", marginRight: 5 }}
            />
            Branch
          </span>
          {branchesLoading ? (
            <div
              style={{
                height: 36,
                width: 220,
                borderRadius: 8,
                background: "var(--color-primary-ghost)",
              }}
            />
          ) : (
            <div style={{ position: "relative", minWidth: 220 }}>
              <select
                className="select"
                value={selectedBranchId || ""}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setHalls([]);
                  setLoading(true);
                }}
                style={{ width: "100%", paddingRight: 32 }}
              >
                <option value="" disabled>
                  Select a branch…
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.city ? ` — ${b.city}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          {branches.length === 0 && !branchesLoading && (
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              No branches found.
            </span>
          )}
        </div>
      )}

      {/* Branch Manager: show branch info banner */}
      {isBranchManager && activeBranch && (
        <div
          className="card"
          style={{
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-primary-ghost)",
          }}
        >
          <Building2 size={16} style={{ color: "var(--color-primary)" }} />
          <div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--color-text-h)",
              }}
            >
              {activeBranch.name}
            </span>
            {activeBranch.franchise_name && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginLeft: 8,
                }}
              >
                · {activeBranch.franchise_name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 340 }}>
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
            placeholder="Search by name, type, features…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 14 }}
          />
        </div>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: "auto", minWidth: 130 }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
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
          Failed to load halls: {error}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchHalls(true)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {!effectiveBranchId && !isBranchManager ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--color-text-muted)",
          }}
        >
          <Building2
            size={36}
            style={{ display: "block", margin: "0 auto 12px", opacity: 0.4 }}
          />
          <p style={{ fontSize: 14 }}>Select a branch to view its halls.</p>
        </div>
      ) : loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <HallCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--color-text-muted)",
          }}
        >
          <DoorOpen
            size={36}
            style={{ display: "block", margin: "0 auto 12px", opacity: 0.4 }}
          />
          <p style={{ fontSize: 14, marginBottom: 16 }}>
            {halls.length === 0
              ? "No halls configured for this branch yet."
              : "No halls match your filters."}
          </p>
          {canManage && halls.length === 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={14} /> Add First Hall
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((h) => (
            <HallCard
              key={h.id}
              hall={h}
              onEdit={setEditingHall}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
