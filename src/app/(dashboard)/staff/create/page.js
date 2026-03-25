"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { invalidateCache, cacheKeys } from "@/lib/firestore-cache";

// Roles each manager level is allowed to create
const ROLES_BY_MANAGER = {
  branch_manager: [
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
  franchise_admin: [
    "branch_manager",
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
  super_admin: [
    "super_admin",
    "franchise_admin",
    "branch_manager",
    "decorator",
    "sales_executive",
    "kitchen_manager",
    "accountant",
    "operations_staff",
    "receptionist",
  ],
};

const DEPARTMENTS = [
  "Operations",
  "Sales",
  "Catering",
  "Decoration",
  "Finance",
  "Support",
];
const CAN_CREATE = ["branch_manager", "franchise_admin", "super_admin"];

export default function CreateStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, role } = useAuth();

  const allowedRoles = ROLES_BY_MANAGER[role] || [];
  const branchId = userProfile?.branch_id || "";
  const franchiseId = userProfile?.franchise_id || "";
  const branchName = userProfile?.branch_name || "";

  const [staffType, setStaffType] = useState(
    searchParams?.get("type") === "temporary" ? "temporary" : "permanent",
  );
  // Pre-select role if passed as query param (e.g. ?role=decorator)
  const presetRole = searchParams?.get("role") || "";
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    role: allowedRoles.includes(presetRole)
      ? presetRole
      : allowedRoles[0] || "",
    department:
      allowedRoles.includes(presetRole) && presetRole === "decorator"
        ? "Decoration"
        : "",
    salary: "",
    joiningDate: "",
    employeeId: "",
    // Temporary only
    contractStartDate: "",
    contractEndDate: "",
    contractValue: "",
    agencyName: "",
    accessExpiry: "",
    // Notifications
    notifyEmail: true,
    notifyWhatsApp: false,
  });
  const [password, setPassword] = useState("123456789");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveErr, setSaveErr] = useState("");

  // When role changes to decorator, auto-set department; clear salary
  const set = (k, v) => {
    if (k === "role") {
      setForm((p) => ({
        ...p,
        role: v,
        department: v === "decorator" ? "Decoration" : p.department,
        salary: v === "decorator" ? "" : p.salary,
      }));
    } else {
      setForm((p) => ({ ...p, [k]: v }));
    }
  };
  const isDecoratorRole = form.role === "decorator";

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    if (password && password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (!form.role) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErr("");
    try {
      const res = await fetch("/api/users/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Uid": userProfile?.uid || "",
          "X-User-Role": role || "",
          "X-Branch-Id": branchId || "",
          "X-Franchise-Id": franchiseId || "",
          "X-Branch-Name": branchName || "",
        },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          password,
          role: form.role,
          phone: form.phone.trim(),
          employment_type:
            staffType === "temporary" ? "Temporary" : "Permanent",
          branch_id: branchId,
          branch_name: branchName,
          franchise_id: franchiseId,
        }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to create staff");
      // Bust staff cache
      if (franchiseId) invalidateCache(cacheKeys.staff(franchiseId));
      if (branchId) invalidateCache(cacheKeys.staffBranch(branchId));
      setSaved(true);
      setTimeout(() => router.push("/staff"), 2000);
    } catch (ex) {
      setSaveErr(ex.message);
    }
    setSaving(false);
  };

  // Saved success screen
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
            Staff Member Created!
          </p>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            They can now log in with their email and password. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  // Access denied
  if (role && !CAN_CREATE.includes(role)) {
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
          <p style={{ color: "#c0392b", marginBottom: 14 }}>
            You do not have permission to create staff accounts.
          </p>
          <Link href="/staff" className="btn btn-ghost">
            ← Back to Staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link
            href="/staff"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 8,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} /> Back to Staff
          </Link>
          <h1>Add Staff Member</h1>
          <p>
            Create a new permanent or temporary staff account for{" "}
            {branchName || "this branch"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/staff"
            className="btn btn-ghost"
            style={{ textDecoration: "none" }}
          >
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Save size={15} /> {saving ? "Creating…" : "Create Staff Member"}
          </button>
        </div>
      </div>

      {/* Staff Type Toggle */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 24,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--color-border)",
          width: "fit-content",
        }}
      >
        {["permanent", "temporary"].map((t) => (
          <button
            key={t}
            onClick={() => setStaffType(t)}
            style={{
              padding: "9px 24px",
              fontSize: 13,
              fontWeight: 600,
              background:
                staffType === t ? "var(--color-primary)" : "transparent",
              color: staffType === t ? "#fff" : "var(--color-text-muted)",
              border: "none",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {saveErr && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: 20,
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxWidth: 900,
        }}
      >
        {/* Section 1 — Personal Details */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Personal Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">First Name *</label>
              <input
                className={`input${errors.firstName ? " input-error" : ""}`}
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
              {errors.firstName && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#c0392b",
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.firstName}
                </span>
              )}
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                className={`input${errors.lastName ? " input-error" : ""}`}
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
              {errors.lastName && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#c0392b",
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.lastName}
                </span>
              )}
            </div>
            <div>
              <label className="form-label">Email Address *</label>
              <input
                className={`input${errors.email ? " input-error" : ""}`}
                type="email"
                placeholder="staff@branch.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              {errors.email && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#c0392b",
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.email}
                </span>
              )}
            </div>
            <div>
              <label className="form-label">Password *</label>
              <input
                className={`input${errors.password ? " input-error" : ""}`}
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#c0392b",
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.password}
                </span>
              )}
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                className="input"
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input
                className="input"
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
              />
            </div>
            <div className="form-span-2">
              <label className="form-label">Residential Address</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Full address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Role & Assignment */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Role & Assignment</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Role *</label>
              <select
                className={`input${errors.role ? " input-error" : ""}`}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              >
                <option value="">Select role</option>
                {allowedRoles.map((r) => (
                  <option key={r} value={r}>
                    {r
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#c0392b",
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {errors.role}
                </span>
              )}
            </div>
            <div>
              <label className="form-label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Branch</label>
              <input
                className="input"
                value={branchName || branchId || "—"}
                disabled
                style={{ opacity: 0.6 }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 3,
                  display: "block",
                }}
              >
                Assigned to your branch automatically
              </span>
            </div>
            <div>
              <label className="form-label">Joining Date</label>
              <input
                className="input"
                type="date"
                value={form.joiningDate}
                onChange={(e) => set("joiningDate", e.target.value)}
              />
            </div>
            {!isDecoratorRole && (
              <div>
                <label className="form-label">
                  {staffType === "permanent"
                    ? "Monthly Salary (₹)"
                    : "Daily Rate (₹)"}
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder="0.00"
                  value={form.salary}
                  onChange={(e) => set("salary", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 2b — Temporary Only Fields */}
        {staffType === "temporary" && (
          <div className="card" style={{ padding: 28 }}>
            <div className="form-section-title">
              Contract Details (Temporary Staff)
            </div>
            <div className="form-grid">
              <div>
                <label className="form-label">Contract Start Date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.contractStartDate}
                  onChange={(e) => set("contractStartDate", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Contract End Date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.contractEndDate}
                  onChange={(e) => set("contractEndDate", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Contract Value (₹)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Total contract amount"
                  value={form.contractValue}
                  onChange={(e) => set("contractValue", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Agency / Vendor</label>
                <input
                  className="input"
                  placeholder="Agency name if applicable"
                  value={form.agencyName}
                  onChange={(e) => set("agencyName", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">System Access Expiry *</label>
                <input
                  className="input"
                  type="date"
                  value={form.accessExpiry}
                  onChange={(e) => set("accessExpiry", e.target.value)}
                />
                <span className="form-hint">
                  User login will be auto-disabled after this date
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3 — Emergency Contact */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Emergency Contact</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Contact Name</label>
              <input
                className="input"
                placeholder="Full name"
                value={form.emergencyName}
                onChange={(e) => set("emergencyName", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Relation</label>
              <select
                className="input"
                value={form.emergencyRelation}
                onChange={(e) => set("emergencyRelation", e.target.value)}
              >
                <option value="">Select</option>
                <option>Spouse</option>
                <option>Parent</option>
                <option>Sibling</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input
                className="input"
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                value={form.emergencyPhone}
                onChange={(e) => set("emergencyPhone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4 — Notification Preferences */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Notification Preferences</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              [
                "notifyEmail",
                "Email notifications (shift schedules, payslips)",
              ],
              ["notifyWhatsApp", "WhatsApp notifications"],
            ].map(([key, label]) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  style={{ accentColor: "var(--color-accent)" }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Link href="/staff" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Save size={15} /> {saving ? "Creating…" : "Create Staff Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
