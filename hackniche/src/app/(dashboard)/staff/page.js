"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  UserPlus,
  RefreshCw,
  Search,
  Users,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useStaff } from "@/hooks/use-staff";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { invalidateCache, cacheKeys } from "@/lib/firestore-cache";

const ROLE_COLORS = {
  super_admin: "badge-accent",
  franchise_admin: "badge-accent",
  branch_manager: "badge-primary",
  sales_executive: "badge-primary",
  kitchen_manager: "badge-warning",
  accountant: "badge-warning",
  decorator: "badge-green",
  operations_staff: "badge-neutral",
  receptionist: "badge-neutral",
};

const ALL_ROLES = [
  "branch_manager",
  "sales_executive",
  "kitchen_manager",
  "accountant",
  "decorator",
  "operations_staff",
  "receptionist",
];

// ── Edit Employee Modal ───────────────────────────────────────────
function EditStaffModal({ staffMember, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: staffMember.name || "",
    phone: staffMember.phone || "",
    role: staffMember.role || "receptionist",
    branch_name: staffMember.branch_name || "",
    employment_type: staffMember.employment_type || "Permanent",
    status: staffMember.status || "active",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!staffMember.uid) {
      setErr("Missing user UID.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await updateDoc(doc(db, "users", staffMember.uid), {
        name: form.name,
        phone: form.phone,
        role: form.role,
        employment_type: form.employment_type,
        status: form.status,
        updated_at: serverTimestamp(),
      });
      if (staffMember.franchise_id)
        invalidateCache(cacheKeys.staff(staffMember.franchise_id));
      if (staffMember.branch_id)
        invalidateCache(cacheKeys.staffBranch(staffMember.branch_id));
      onSaved?.();
      onClose();
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
          Edit Employee
        </h3>
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
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
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
                Full Name
              </label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
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
                Phone
              </label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
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
                Role
              </label>
              <select
                className="select"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
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
                Employment Type
              </label>
              <select
                className="select"
                value={form.employment_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, employment_type: e.target.value }))
                }
              >
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Contract">Contract</option>
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
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                Email (read-only)
              </label>
              <input
                className="input"
                value={staffMember.email}
                disabled
                style={{ opacity: 0.55 }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ marginTop: 4, alignSelf: "flex-start" }}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation ────────────────────────────────────────────
function DeleteStaffModal({ staffMember, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  const handleDelete = async () => {
    if (!staffMember.uid) {
      setErr("Missing user UID.");
      return;
    }
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", staffMember.uid));
      if (staffMember.franchise_id)
        invalidateCache(cacheKeys.staff(staffMember.franchise_id));
      if (staffMember.branch_id)
        invalidateCache(cacheKeys.staffBranch(staffMember.branch_id));
      onDeleted?.();
      onClose();
    } catch (ex) {
      setErr("Failed to delete: " + ex.message);
    }
    setDeleting(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
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
          maxWidth: 420,
          position: "relative",
          textAlign: "center",
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
        <Trash2
          size={36}
          style={{
            color: "var(--color-danger)",
            margin: "0 auto 12px",
            display: "block",
          }}
        />
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 8,
          }}
        >
          Delete Employee?
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            marginBottom: 6,
          }}
        >
          This will permanently remove{" "}
          <strong>{staffMember.name || staffMember.email}</strong>.
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-danger)",
            marginBottom: 20,
          }}
        >
          This action cannot be undone.
        </p>
        {err && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: 16,
              borderRadius: 8,
              background: "rgba(192,57,43,0.08)",
              color: "var(--color-danger)",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: "var(--color-danger)",
              borderColor: "var(--color-danger)",
            }}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[180, 110, 100, 200, 90, 70, 70].map((w, i) => (
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

export default function StaffPage() {
  const { userProfile, role } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  const scope =
    role === "super_admin"
      ? "all"
      : role === "franchise_admin"
        ? "franchise"
        : "branch";

  const { staff, loading, error, refresh } = useStaff({
    franchise_id: userProfile?.franchise_id,
    branch_id: userProfile?.branch_id,
    scope,
  });

  // Franchise admin should NOT see other franchise admins
  const visibleStaff = useMemo(() => {
    if (role === "franchise_admin")
      return staff.filter((s) => s.role !== "franchise_admin");
    return staff;
  }, [staff, role]);

  const availableRoles = useMemo(
    () => [...new Set(visibleStaff.map((s) => s.role))].sort(),
    [visibleStaff],
  );

  const filtered = useMemo(
    () =>
      visibleStaff.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.branch_name?.toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || s.role === roleFilter;
        return matchSearch && matchRole;
      }),
    [visibleStaff, search, roleFilter],
  );

  const scopeLabel =
    scope === "all"
      ? "All Staff — Global"
      : scope === "franchise"
        ? `All Staff — ${userProfile?.franchise_name || "Franchise"}`
        : `${userProfile?.branch_name || "Branch"} Staff`;

  const canManage = [
    "super_admin",
    "franchise_admin",
    "branch_manager",
  ].includes(role);
  const colSpan =
    (scope === "all" ? 7 : scope === "franchise" ? 6 : 5) + (canManage ? 1 : 0);

  return (
    <div>
      {editingStaff && (
        <EditStaffModal
          staffMember={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSaved={refresh}
        />
      )}
      {deletingStaff && (
        <DeleteStaffModal
          staffMember={deletingStaff}
          onClose={() => setDeletingStaff(null)}
          onDeleted={refresh}
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
            Staff Management
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
              : `${filtered.length} of ${visibleStaff.length} members · ${scopeLabel}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={refresh}
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
          {canManage && (
            <>
              <Link
                href="/staff/create?type=temporary"
                className="btn btn-outline btn-sm"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <UserPlus size={14} /> Add Temp Staff
              </Link>
              <Link
                href="/staff/create"
                className="btn btn-primary btn-sm"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={14} /> Add Staff
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
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
            placeholder="Search name, email, branch…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 14 }}
          />
        </div>
        <select
          className="select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="all">All Roles</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
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
          Failed to load staff: {error}
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
              <th>Name</th>
              <th>Role</th>
              {(scope === "franchise" || scope === "all") && <th>Branch</th>}
              {scope === "all" && <th>Franchise</th>}
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              {canManage && <th style={{ width: 90 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && [...Array(7)].map((_, i) => <SkeletonRow key={i} />)}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={colSpan}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Users
                    size={32}
                    style={{
                      display: "block",
                      margin: "0 auto 10px",
                      opacity: 0.4,
                    }}
                  />
                  {visibleStaff.length === 0
                    ? "No staff found in database."
                    : "No results match your search."}
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((s) => (
                <tr key={s.uid || s.email}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-h)" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: "var(--gradient-btn)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--color-text-on-gold)",
                        }}
                      >
                        {(s.name || s.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div>{s.name || "—"}</div>
                        {s.phone && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-muted)",
                              fontWeight: 400,
                            }}
                          >
                            {s.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${ROLE_COLORS[s.role] || "badge-neutral"}`}
                    >
                      {(s.role || "").replace(/_/g, " ")}
                    </span>
                  </td>
                  {(scope === "franchise" || scope === "all") && (
                    <td
                      style={{ fontSize: 13, color: "var(--color-text-muted)" }}
                    >
                      {s.branch_name || "—"}
                    </td>
                  )}
                  {scope === "all" && (
                    <td
                      style={{ fontSize: 13, color: "var(--color-text-muted)" }}
                    >
                      {s.franchise_name || "—"}
                    </td>
                  )}
                  <td style={{ fontSize: 13 }}>{s.email}</td>
                  <td>
                    <span
                      className={`badge ${s.employment_type === "Temporary" ? "badge-warning" : "badge-neutral"}`}
                    >
                      {s.employment_type || "Permanent"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${s.status === "active" ? "badge-green" : "badge-warning"}`}
                    >
                      {s.status || "active"}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingStaff(s)}
                          title="Edit"
                          style={{ padding: "5px 8px" }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeletingStaff(s)}
                          title="Delete"
                          style={{
                            padding: "5px 8px",
                            color: "var(--color-danger)",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// const ROLE_COLORS = {
//   super_admin: "badge-accent",
//   franchise_admin: "badge-accent",
//   branch_manager: "badge-primary",
//   sales_executive: "badge-primary",
//   kitchen_manager: "badge-warning",
//   accountant: "badge-warning",
//   operations_staff: "badge-neutral",
//   receptionist: "badge-neutral",
// };

// function SkeletonRow() {
//   return (
//     <tr>
//       {[180, 110, 100, 200, 90, 70].map((w, i) => (
//         <td key={i}>
//           <div
//             style={{
//               height: 15,
//               borderRadius: 4,
//               background: "var(--color-primary-ghost)",
//               width: w,
//             }}
//           />
//         </td>
//       ))}
//     </tr>
//   );
// }

// export default function StaffPage() {
//   const { userProfile, role } = useAuth();
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");

//   // Determine query scope based on role
//   const scope =
//     role === "super_admin"
//       ? "all"
//       : role === "franchise_admin"
//         ? "franchise"
//         : "branch";

//   const { staff, loading, error, refresh } = useStaff({
//     franchise_id: userProfile?.franchise_id,
//     branch_id: userProfile?.branch_id,
//     scope,
//   });

//   const availableRoles = useMemo(
//     () => [...new Set(staff.map((s) => s.role))].sort(),
//     [staff],
//   );

//   const filtered = useMemo(
//     () =>
//       staff.filter((s) => {
//         const q = search.toLowerCase();
//         const matchSearch =
//           !q ||
//           s.name?.toLowerCase().includes(q) ||
//           s.email?.toLowerCase().includes(q) ||
//           s.branch_name?.toLowerCase().includes(q);
//         const matchRole = roleFilter === "all" || s.role === roleFilter;
//         return matchSearch && matchRole;
//       }),
//     [staff, search, roleFilter],
//   );

//   const scopeLabel =
//     scope === "all"
//       ? "All Staff — Global"
//       : scope === "franchise"
//         ? `All Staff — ${userProfile?.franchise_name || "Franchise"}`
//         : `${userProfile?.branch_name || "Branch"} Staff`;

//   const canManage = [
//     "super_admin",
//     "franchise_admin",
//     "branch_manager",
//   ].includes(role);

//   return (
//     <div>
//       {/* Header */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//           marginBottom: 24,
//           flexWrap: "wrap",
//           gap: 12,
//         }}
//       >
//         <div>
//           <h1
//             style={{
//               fontFamily: "var(--font-display)",
//               fontSize: 28,
//               fontWeight: 700,
//               color: "var(--color-text-h)",
//             }}
//           >
//             Staff Management
//           </h1>
//           <p
//             style={{
//               color: "var(--color-text-muted)",
//               fontSize: 14,
//               marginTop: 4,
//             }}
//           >
//             {loading
//               ? "Loading…"
//               : `${filtered.length} of ${staff.length} members · ${scopeLabel}`}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//           <button
//             className="btn btn-ghost btn-sm"
//             onClick={refresh}
//             title="Refresh list"
//           >
//             <RefreshCw size={14} />
//           </button>
//           {canManage && (
//             <>
//               <button className="btn btn-outline btn-sm">
//                 <UserPlus size={14} /> Add Temp Staff
//               </button>
//               <button className="btn btn-primary btn-sm">
//                 <Plus size={14} /> Add Staff
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Filters */}
//       <div
//         style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
//       >
//         <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
//           <Search
//             size={14}
//             style={{
//               position: "absolute",
//               left: 12,
//               top: "50%",
//               transform: "translateY(-50%)",
//               color: "var(--color-text-muted)",
//               pointerEvents: "none",
//             }}
//           />
//           <input
//             className="input"
//             placeholder="Search name, email, branch…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             style={{ paddingLeft: 34, fontSize: 14 }}
//           />
//         </div>
//         <select
//           className="select"
//           value={roleFilter}
//           onChange={(e) => setRoleFilter(e.target.value)}
//           style={{ minWidth: 160 }}
//         >
//           <option value="all">All Roles</option>
//           {availableRoles.map((r) => (
//             <option key={r} value={r}>
//               {r.replace(/_/g, " ")}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Error */}
//       {error && (
//         <div
//           className="card"
//           style={{
//             padding: "14px 18px",
//             marginBottom: 16,
//             background: "rgba(192,57,43,0.06)",
//             border: "1px solid rgba(192,57,43,0.2)",
//             color: "var(--color-danger)",
//             fontSize: 14,
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//           }}
//         >
//           Failed to load staff: {error}
//           <button className="btn btn-ghost btn-sm" onClick={refresh}>
//             Retry
//           </button>
//         </div>
//       )}

//       {/* Table */}
//       <div className="card" style={{ padding: 0, overflow: "hidden" }}>
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Role</th>
//               {(scope === "franchise" || scope === "all") && <th>Branch</th>}
//               {scope === "all" && <th>Franchise</th>}
//               <th>Email</th>
//               <th>Type</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && [...Array(7)].map((_, i) => <SkeletonRow key={i} />)}
//             {!loading && filtered.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={scope === "all" ? 7 : scope === "franchise" ? 6 : 5}
//                   style={{
//                     textAlign: "center",
//                     padding: 40,
//                     color: "var(--color-text-muted)",
//                   }}
//                 >
//                   <Users
//                     size={32}
//                     style={{
//                       display: "block",
//                       margin: "0 auto 10px",
//                       opacity: 0.4,
//                     }}
//                   />
//                   {staff.length === 0
//                     ? "No staff found in database."
//                     : "No results match your search."}
//                 </td>
//               </tr>
//             )}
//             {!loading &&
//               filtered.map((s) => (
//                 <tr key={s.uid || s.email}>
//                   <td style={{ fontWeight: 600, color: "var(--color-text-h)" }}>
//                     <div
//                       style={{ display: "flex", alignItems: "center", gap: 10 }}
//                     >
//                       <div
//                         style={{
//                           width: 32,
//                           height: 32,
//                           borderRadius: "50%",
//                           flexShrink: 0,
//                           background: "var(--gradient-btn)",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: 13,
//                           fontWeight: 700,
//                           color: "var(--color-text-on-gold)",
//                         }}
//                       >
//                         {(s.name || s.email || "?")[0].toUpperCase()}
//                       </div>
//                       <div>
//                         <div>{s.name || "—"}</div>
//                         {s.phone && (
//                           <div
//                             style={{
//                               fontSize: 11,
//                               color: "var(--color-text-muted)",
//                               fontWeight: 400,
//                             }}
//                           >
//                             {s.phone}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                   <td>
//                     <span
//                       className={`badge ${ROLE_COLORS[s.role] || "badge-neutral"}`}
//                     >
//                       {(s.role || "").replace(/_/g, " ")}
//                     </span>
//                   </td>
//                   {(scope === "franchise" || scope === "all") && (
//                     <td
//                       style={{ fontSize: 13, color: "var(--color-text-muted)" }}
//                     >
//                       {s.branch_name || "—"}
//                     </td>
//                   )}
//                   {scope === "all" && (
//                     <td
//                       style={{ fontSize: 13, color: "var(--color-text-muted)" }}
//                     >
//                       {s.franchise_name || "—"}
//                     </td>
//                   )}
//                   <td style={{ fontSize: 13 }}>{s.email}</td>
//                   <td>
//                     <span
//                       className={`badge ${s.employment_type === "Temporary" ? "badge-warning" : "badge-neutral"}`}
//                     >
//                       {s.employment_type || "Permanent"}
//                     </span>
//                   </td>
//                   <td>
//                     <span
//                       className={`badge ${s.status === "active" ? "badge-green" : "badge-warning"}`}
//                     >
//                       {s.status || "active"}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
