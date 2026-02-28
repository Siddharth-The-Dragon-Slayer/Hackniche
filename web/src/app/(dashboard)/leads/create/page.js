"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Sparkles,
  Building2,
  CalendarDays,
  Users,
  Palette,
  Utensils,
  IndianRupee,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────
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
const BUDGET_RANGES = [
  "0-200000",
  "200000-500000",
  "500000-1000000",
  "1000000-2000000",
  "2000000+",
];
const FRANCHISE_ID_DEFAULT = "pfd";
const STEPS = [
  { id: 1, label: "Details", icon: <Users size={15} /> },
  { id: 2, label: "Venue", icon: <Building2 size={15} /> },
  { id: 3, label: "Decoration", icon: <Palette size={15} /> },
  { id: 4, label: "Menu", icon: <Utensils size={15} /> },
  { id: 5, label: "Summary", icon: <IndianRupee size={15} /> },
];

const fmt = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");
const fmtD = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Step indicator ───────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div className="wizard-steps">
      {STEPS.map((s, i) => {
        const done = step > s.id;
        const current = step === s.id;
        return (
          <div key={s.id} className="ws-item">
            <div
              className={`ws-circle ${done ? "ws-done" : current ? "ws-active" : "ws-idle"}`}
            >
              {done ? <Check size={13} /> : s.icon}
            </div>
            <span className={`ws-label ${current ? "ws-label-active" : ""}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`ws-line ${done ? "ws-line-done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Bill rows component ──────────────────────────────────────────
function BillRow({ label, sub, amount, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: highlight ? 700 : 500,
            color: "var(--color-text-h)",
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: highlight ? 17 : 14,
          fontWeight: highlight ? 800 : 600,
          color: highlight ? "var(--color-primary)" : "var(--color-text-h)",
          fontFamily: "var(--font-mono)",
          whiteSpace: "nowrap",
          paddingLeft: 12,
        }}
      >
        {amount === 0 ? (
          <span style={{ color: "#27ae60", fontWeight: 600 }}>Included</span>
        ) : typeof amount === "number" ? (
          fmt(amount)
        ) : (
          amount
        )}
      </div>
    </div>
  );
}

// ── Main Wizard Page ─────────────────────────────────────────────
export default function CreateLeadPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const role = userProfile?.role || "customer";
  const isCustomer = role === "customer";
  const franchise_id = userProfile?.franchise_id || FRANCHISE_ID_DEFAULT;

  const [step, setStep] = useState(1);

  // ─ Step 1 state: customer details
  const [details, setDetails] = useState({
    customer_name: "",
    phone: "",
    email: "",
    event_type: "Wedding",
    budget_range: "",
  });

  // ─ Step 2 state: venue
  const [branches, setBranches] = useState([]);
  const [halls, setHalls] = useState([]);
  const [venue, setVenue] = useState({
    branch_id: userProfile?.branch_id || "",
    hall_id: "",
    hall_name: "",
    hall_base_price: 0,
    event_date: "",
    expected_guest_count: "",
    assigned_to_uid: "",
    assigned_to_name: "",
  });

  // ─ Step 3 state: decoration
  const [decorPackages, setDecorPackages] = useState([]);
  const [decorLoading, setDecorLoading] = useState(false);
  const [selectedDecor, setSelectedDecor] = useState(null); // full pkg object or null

  // ─ Step 4 state: menus
  const [menus, setMenus] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null); // full menu object or null

  // ─ Submit state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Sync userProfile into venue on load
  useEffect(() => {
    if (!userProfile) return;
    setDetails((p) => ({
      ...p,
      customer_name:
        p.customer_name || (isCustomer ? userProfile.name || "" : ""),
      phone: p.phone || (isCustomer ? userProfile.phone || "" : ""),
      email: p.email || (isCustomer ? userProfile.email || "" : ""),
    }));
    setVenue((p) => ({
      ...p,
      branch_id: p.branch_id || userProfile.branch_id || "",
      assigned_to_uid:
        p.assigned_to_uid || (!isCustomer ? userProfile.uid || "" : ""),
      assigned_to_name:
        p.assigned_to_name || (!isCustomer ? userProfile.name || "" : ""),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  // ── Load all branches (customers pick a branch)
  useEffect(() => {
    if (!isCustomer) return;
    getDocs(collection(db, "branches"))
      .then((snap) =>
        setBranches(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
        ),
      )
      .catch(() => {});
  }, [isCustomer]);

  // ── Load halls when branch changes
  const effectiveBranchId = venue.branch_id || userProfile?.branch_id || "";
  useEffect(() => {
    if (!effectiveBranchId) return;
    setHalls([]);
    getDocs(
      query(
        collection(db, "halls"),
        where("branch_id", "==", effectiveBranchId),
      ),
    )
      .then((snap) =>
        setHalls(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
        ),
      )
      .catch(() => {});
  }, [effectiveBranchId]);

  // ── Load decor packages when moving to step 3
  useEffect(() => {
    if (step !== 3 || !effectiveBranchId) return;
    if (decorPackages.length > 0) return;
    setDecorLoading(true);
    fetch(`/api/decor?branch_id=${effectiveBranchId}`)
      .then((r) => r.json())
      .then((d) =>
        setDecorPackages(
          (d.data || []).filter((p) => (p.status || "active") === "active"),
        ),
      )
      .catch(() => {})
      .finally(() => setDecorLoading(false));
  }, [step, effectiveBranchId]);

  // ── Load menus when moving to step 4
  useEffect(() => {
    if (step !== 4 || !effectiveBranchId) return;
    if (menus.length > 0) return;
    setMenusLoading(true);
    const bid = effectiveBranchId;
    const fid = franchise_id;
    getDocs(collection(db, "menus", fid, "branches", bid, "menus"))
      .then((snap) =>
        setMenus(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((m) => m.status !== "inactive")
            .sort((a, b) =>
              (a.menu_name || a.name || "").localeCompare(
                b.menu_name || b.name || "",
              ),
            ),
        ),
      )
      .catch(() => {})
      .finally(() => setMenusLoading(false));
  }, [step, effectiveBranchId, franchise_id]);

  // ── Validation per step
  const validateStep = (s) => {
    if (s === 1) {
      if (!details.customer_name.trim()) return "Full Name is required";
      if (!details.phone.trim()) return "Phone is required";
      if (!details.event_type) return "Event Type is required";
      return null;
    }
    if (s === 2) {
      if (isCustomer && !venue.branch_id) return "Select a branch";
      if (!venue.event_date) return "Event Date is required";
      if (!venue.expected_guest_count) return "Expected Guests is required";
      return null;
    }
    return null; // steps 3-5 are optional selections
  };

  const [stepError, setStepError] = useState(null);

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, 5));
  };
  const goPrev = () => {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  // ── Bill calculation
  const guests = Number(venue.expected_guest_count) || 0;
  const hallPrice = venue.hall_base_price || 0;
  const decorPrice = selectedDecor ? selectedDecor.base_price || 0 : 0;
  const menuPPP = selectedMenu
    ? selectedMenu.price_per_plate || selectedMenu.pricePerPlate || 0
    : 0;
  const menuTotal = menuPPP * guests;
  const grandTotal = hallPrice + decorPrice + menuTotal;

  // ── Submit
  const handleSubmit = async () => {
    setSaveError(null);
    setSaving(true);
    const bid = effectiveBranchId || "pfd_b1";
    try {
      const payload = {
        franchise_id,
        branch_id: bid,
        customer_name: details.customer_name.trim(),
        phone: details.phone.trim(),
        email: details.email.trim() || null,
        event_type: details.event_type,
        event_date: venue.event_date,
        expected_guest_count: guests,
        budget_range: details.budget_range || null,
        hall_id: venue.hall_id || null,
        hall_name: venue.hall_name || null,
        hall_base_price: hallPrice || null,
        decor_package_id: selectedDecor?.id || null,
        decor_package_name: selectedDecor?.name || null,
        decor_price: decorPrice || null,
        menu_id: selectedMenu?.id || null,
        menu_name: selectedMenu?.menu_name || selectedMenu?.name || null,
        menu_price_per_plate: menuPPP || null,
        estimated_menu_total: menuTotal || null,
        estimated_total: grandTotal || null,
        assigned_to_uid: venue.assigned_to_uid || null,
        assigned_to_name: venue.assigned_to_name || null,
        customer_uid: isCustomer ? userProfile?.uid : null,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");

      if (isCustomer) {
        setSubmitted(true);
      } else {
        router.push(
          `/leads/${data.id}?franchise_id=${franchise_id}&branch_id=${bid}`,
        );
      }
    } catch (e) {
      setSaveError(e.message);
    }
    setSaving(false);
  };

  // ── Success screen
  if (submitted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          textAlign: "center",
          padding: 32,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Sparkles size={36} style={{ color: "#16a34a" }} />
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-text-h)",
            marginBottom: 8,
            fontFamily: "var(--font-display)",
          }}
        >
          Enquiry Submitted!
        </h2>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 15,
            maxWidth: 420,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Thank you! Our team will review your enquiry and assign a sales
          executive to discuss the details with you.
        </p>
        {grandTotal > 0 && (
          <div
            style={{
              background: "var(--color-primary-ghost)",
              border: "1.5px solid var(--color-primary)",
              borderRadius: 12,
              padding: "14px 28px",
              marginBottom: 22,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginBottom: 4,
              }}
            >
              Estimated Total
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--color-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(grandTotal)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 3,
              }}
            >
              Hall + Decoration + Menu
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/dashboard/customer"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Go to Dashboard
          </Link>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const backHref = isCustomer ? "/dashboard/customer" : "/leads";
  const backLabel = isCustomer ? "Back to Dashboard" : "Back to Leads";

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <Link
            href={backHref}
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
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <h1>{isCustomer ? "Submit Event Enquiry" : "Create New Lead"}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {isCustomer
              ? "Tell us about your event — we'll build your perfect package"
              : "Capture enquiry details with venue, decoration & menu preferences"}
          </p>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} />

      {/* Step error */}
      {stepError && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#991b1b",
            fontSize: 13,
          }}
        >
          <AlertCircle size={14} /> {stepError}
        </div>
      )}

      {/* ─────────────────────── STEP 1: Details ─────────────────────── */}
      {step === 1 && (
        <div className="form-card">
          {isCustomer && (
            <>
              <div className="form-section-title">
                Select Branch / Venue City
              </div>
              <div className="form-grid">
                <div className="form-field form-span-2">
                  <label className="form-label">Branch *</label>
                  <select
                    className="input"
                    value={venue.branch_id}
                    onChange={(e) =>
                      setVenue((p) => ({
                        ...p,
                        branch_id: e.target.value,
                        hall_id: "",
                        hall_name: "",
                        hall_base_price: 0,
                      }))
                    }
                  >
                    <option value="">Choose a branch…</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div
            className="form-section-title"
            style={{ marginTop: isCustomer ? 24 : 0 }}
          >
            Your Information
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Full Name *</label>
              <input
                className="input"
                placeholder="Rajesh Sharma"
                value={details.customer_name}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, customer_name: e.target.value }))
                }
                readOnly={isCustomer && !!userProfile?.name}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Phone *</label>
              <input
                className="input"
                placeholder="+91-9876543210"
                value={details.phone}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, phone: e.target.value }))
                }
                readOnly={isCustomer && !!userProfile?.phone}
              />
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="rajesh@email.com"
                value={details.email}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, email: e.target.value }))
                }
                readOnly={isCustomer && !!userProfile?.email}
              />
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: 24 }}>
            Event Details
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Event Type *</label>
              <select
                className="input"
                value={details.event_type}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, event_type: e.target.value }))
                }
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Budget Range</label>
              <select
                className="input"
                value={details.budget_range}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, budget_range: e.target.value }))
                }
              >
                <option value="">Select…</option>
                {BUDGET_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r
                      .replace("-", " – \u20B9")
                      .replace("+", " & above")
                      .replace(/^(\d+)/, "\u20B9$1")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <span />
            <button
              className="btn btn-primary"
              onClick={goNext}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              Next: Venue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────── STEP 2: Venue ───────────────────────── */}
      {step === 2 && (
        <div className="form-card">
          <div className="form-section-title">Venue &amp; Date</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Event Date *</label>
              <input
                className="input"
                type="date"
                value={venue.event_date}
                onChange={(e) =>
                  setVenue((p) => ({ ...p, event_date: e.target.value }))
                }
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Expected Guests *</label>
              <input
                className="input"
                type="number"
                placeholder="250"
                min="1"
                value={venue.expected_guest_count}
                onChange={(e) =>
                  setVenue((p) => ({
                    ...p,
                    expected_guest_count: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field form-span-2">
              <label className="form-label">Select Hall</label>
              {!effectiveBranchId ? (
                <select className="input" disabled>
                  <option>Select a branch first</option>
                </select>
              ) : halls.length === 0 ? (
                <select className="input" disabled>
                  <option>Loading halls…</option>
                </select>
              ) : (
                <select
                  className="input"
                  value={venue.hall_id}
                  onChange={(e) => {
                    const h = halls.find((h) => h.id === e.target.value);
                    setVenue((p) => ({
                      ...p,
                      hall_id: e.target.value,
                      hall_name: h?.name || "",
                      hall_base_price: h?.base_price || 0,
                    }));
                  }}
                >
                  <option value="">No preference / decide later</option>
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — Seating:{" "}
                      {h.capacity_seating || h.capacity || "?"} |{" "}
                      {fmt(h.base_price || 0)}/day
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {venue.hall_id && venue.hall_base_price > 0 && (
            <div
              style={{
                background: "var(--color-primary-ghost)",
                border: "1.5px solid var(--color-primary)",
                borderRadius: 10,
                padding: "12px 16px",
                marginTop: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--color-text-h)",
                  }}
                >
                  {venue.hall_name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                  }}
                >
                  Hall hire charge
                </div>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 16,
                }}
              >
                {fmt(venue.hall_base_price)}
              </div>
            </div>
          )}

          {!isCustomer && (
            <>
              <div className="form-section-title" style={{ marginTop: 20 }}>
                Assignment
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Assigned To (Name)</label>
                  <input
                    className="input"
                    placeholder="Sales executive name"
                    value={venue.assigned_to_name}
                    onChange={(e) =>
                      setVenue((p) => ({
                        ...p,
                        assigned_to_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Assigned UID</label>
                  <input
                    className="input"
                    placeholder="optional"
                    value={venue.assigned_to_uid}
                    onChange={(e) =>
                      setVenue((p) => ({
                        ...p,
                        assigned_to_uid: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={goPrev}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              className="btn btn-primary"
              onClick={goNext}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              Next: Decoration <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────── STEP 3: Decoration ─────────────────── */}
      {step === 3 && (
        <div className="form-card">
          <div className="form-section-title">Choose Decoration Package</div>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginTop: -4,
              marginBottom: 16,
            }}
          >
            Select a decoration theme or skip to decide later
          </p>

          {decorLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 20,
                color: "var(--color-text-muted)",
                fontSize: 13,
              }}
            >
              <Loader2
                size={16}
                style={{ animation: "spin .8s linear infinite" }}
              />{" "}
              Loading packages…
            </div>
          ) : decorPackages.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                border: "1.5px dashed var(--color-border)",
                borderRadius: 12,
              }}
            >
              <Palette
                size={36}
                style={{
                  color: "var(--color-text-muted)",
                  margin: "0 auto 10px",
                  display: "block",
                }}
              />
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                No decoration packages available for this branch yet.
              </p>
            </div>
          ) : (
            <div className="decor-pick-grid">
              {/* None option */}
              <div
                className={`dp-card ${!selectedDecor ? "dp-selected" : ""}`}
                onClick={() => setSelectedDecor(null)}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>🚫</div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-h)",
                  }}
                >
                  No Decoration
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginTop: 4,
                  }}
                >
                  Decide later / self-arranged
                </div>
                {!selectedDecor && (
                  <Check
                    size={16}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: "var(--color-primary)",
                    }}
                  />
                )}
              </div>

              {decorPackages.map((pkg) => {
                const total = pkg.base_price || 0;
                const isChosen = selectedDecor?.id === pkg.id;
                const suitableMatch =
                  pkg.suitable_for?.includes(details.event_type) ||
                  pkg.suitableFor?.includes(details.event_type);
                return (
                  <div
                    key={pkg.id}
                    className={`dp-card ${isChosen ? "dp-selected" : ""}`}
                    onClick={() => setSelectedDecor(pkg)}
                  >
                    {isChosen && (
                      <Check
                        size={16}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          color: "var(--color-primary)",
                        }}
                      />
                    )}
                    {suitableMatch && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background: "rgba(39,174,96,0.12)",
                          color: "#27ae60",
                        }}
                      >
                        Recommended
                      </span>
                    )}
                    <div
                      style={{
                        fontSize: 24,
                        marginBottom: { suitableMatch } ? 26 : 8,
                      }}
                    >
                      🎨
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--color-text-h)",
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {pkg.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: "rgba(142,68,173,0.10)",
                        color: "#8e44ad",
                        marginBottom: 6,
                        display: "inline-block",
                      }}
                    >
                      {pkg.theme}
                    </div>
                    {pkg.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          lineHeight: 1.4,
                          marginBottom: 8,
                        }}
                      >
                        {pkg.description}
                      </div>
                    )}
                    {Array.isArray(pkg.items) && pkg.items.length > 0 && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        {pkg.items.length} item
                        {pkg.items.length !== 1 ? "s" : ""} included
                      </div>
                    )}
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-mono)",
                        marginTop: "auto",
                      }}
                    >
                      {fmt(total)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedDecor && (
            <div
              style={{
                background: "var(--color-primary-ghost)",
                border: "1.5px solid var(--color-primary)",
                borderRadius: 10,
                padding: "12px 16px",
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-h)",
                  }}
                >
                  {selectedDecor.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {selectedDecor.theme} theme selected
                </div>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 15,
                }}
              >
                {fmt(selectedDecor.base_price || 0)}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={goPrev}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              className="btn btn-primary"
              onClick={goNext}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              Next: Menu <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────── STEP 4: Menu ────────────────────────── */}
      {step === 4 && (
        <div className="form-card">
          <div className="form-section-title">Choose Menu Package</div>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginTop: -4,
              marginBottom: 16,
            }}
          >
            Price calculated as: menu price per plate ×{" "}
            {venue.expected_guest_count || "?"} guests
          </p>

          {menusLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 20,
                color: "var(--color-text-muted)",
                fontSize: 13,
              }}
            >
              <Loader2
                size={16}
                style={{ animation: "spin .8s linear infinite" }}
              />{" "}
              Loading menus…
            </div>
          ) : menus.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                border: "1.5px dashed var(--color-border)",
                borderRadius: 12,
              }}
            >
              <Utensils
                size={36}
                style={{
                  color: "var(--color-text-muted)",
                  margin: "0 auto 10px",
                  display: "block",
                }}
              />
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                No menus set up for this branch yet.
              </p>
            </div>
          ) : (
            <div className="menu-pick-grid">
              {/* None option */}
              <div
                className={`mp-card ${!selectedMenu ? "mp-selected" : ""}`}
                onClick={() => setSelectedMenu(null)}
              >
                {!selectedMenu && (
                  <Check
                    size={16}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      color: "var(--color-primary)",
                    }}
                  />
                )}
                <div style={{ fontSize: 26, marginBottom: 6 }}>🚫</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>No Menu Yet</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginTop: 4,
                  }}
                >
                  Decide during follow-up
                </div>
              </div>

              {menus.map((m) => {
                const ppp = m.price_per_plate || m.pricePerPlate || 0;
                const menuName = m.menu_name || m.name || "Menu";
                const isChosen = selectedMenu?.id === m.id;
                const lineTotal =
                  ppp * (Number(venue.expected_guest_count) || 0);
                const veg = m.isVeg || m.category === "Veg" || m.type === "Veg";
                const nveg =
                  !m.isVeg &&
                  (m.category === "Non-Veg" || m.type === "Non-Veg");
                return (
                  <div
                    key={m.id}
                    className={`mp-card ${isChosen ? "mp-selected" : ""}`}
                    onClick={() => setSelectedMenu(m)}
                  >
                    {isChosen && (
                      <Check
                        size={16}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          color: "var(--color-primary)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {veg ? "🥗" : nveg ? "🍗" : "🍽️"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background: veg
                            ? "rgba(39,174,96,0.12)"
                            : nveg
                              ? "rgba(192,57,43,0.10)"
                              : "var(--color-bg-alt)",
                          color: veg
                            ? "#27ae60"
                            : nveg
                              ? "#c0392b"
                              : "var(--color-text-muted)",
                        }}
                      >
                        {m.category || m.type || "Menu"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--color-text-h)",
                        marginBottom: 4,
                      }}
                    >
                      {menuName}
                    </div>
                    {m.description && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          marginBottom: 6,
                          lineHeight: 1.4,
                        }}
                      >
                        {m.description?.slice(0, 80)}
                        {m.description?.length > 80 ? "…" : ""}
                      </div>
                    )}
                    <div style={{ marginTop: "auto" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {fmt(ppp)}{" "}
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          /plate
                        </span>
                      </div>
                      {Number(venue.expected_guest_count) > 0 && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            marginTop: 3,
                          }}
                        >
                          {venue.expected_guest_count} guests ={" "}
                          <b style={{ color: "var(--color-text-h)" }}>
                            {fmt(lineTotal)}
                          </b>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedMenu && (
            <div
              style={{
                background: "var(--color-primary-ghost)",
                border: "1.5px solid var(--color-primary)",
                borderRadius: 10,
                padding: "12px 16px",
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--color-text-h)",
                  }}
                >
                  {selectedMenu.menu_name || selectedMenu.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {fmt(
                    selectedMenu.price_per_plate ||
                      selectedMenu.pricePerPlate ||
                      0,
                  )}
                  /plate × {venue.expected_guest_count || 0} guests
                </div>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 15,
                }}
              >
                {fmt(menuTotal)}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn btn-ghost"
              onClick={goPrev}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              className="btn btn-primary"
              onClick={goNext}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              Summary <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────── STEP 5: Summary ─────────────────────── */}
      {step === 5 && (
        <div className="wizard-summary-layout">
          {/* Left: Details review */}
          <div className="form-card" style={{ flex: 1 }}>
            <div className="form-section-title">Review &amp; Confirm</div>

            {/* Customer */}
            <div className="summary-section">
              <div className="ss-heading">
                <Users size={13} /> Customer
              </div>
              <div className="ss-row">
                <span>Name</span>
                <strong>{details.customer_name}</strong>
              </div>
              <div className="ss-row">
                <span>Phone</span>
                <strong>{details.phone}</strong>
              </div>
              {details.email && (
                <div className="ss-row">
                  <span>Email</span>
                  <strong>{details.email}</strong>
                </div>
              )}
              <div className="ss-row">
                <span>Event</span>
                <strong>{details.event_type}</strong>
              </div>
            </div>

            {/* Venue */}
            <div className="summary-section">
              <div className="ss-heading">
                <Building2 size={13} /> Venue &amp; Date
              </div>
              <div className="ss-row">
                <span>Date</span>
                <strong>{fmtD(venue.event_date)}</strong>
              </div>
              <div className="ss-row">
                <span>Guests</span>
                <strong>{venue.expected_guest_count}</strong>
              </div>
              <div className="ss-row">
                <span>Hall</span>
                <strong>{venue.hall_name || "—"}</strong>
              </div>
            </div>

            {/* Decoration */}
            <div className="summary-section">
              <div className="ss-heading">
                <Palette size={13} /> Decoration
              </div>
              <div className="ss-row">
                <span>Package</span>
                <strong>{selectedDecor?.name || "Not selected"}</strong>
              </div>
              {selectedDecor && (
                <div className="ss-row">
                  <span>Theme</span>
                  <strong>{selectedDecor.theme}</strong>
                </div>
              )}
            </div>

            {/* Menu */}
            <div className="summary-section">
              <div className="ss-heading">
                <Utensils size={13} /> Menu
              </div>
              <div className="ss-row">
                <span>Package</span>
                <strong>
                  {selectedMenu?.menu_name ||
                    selectedMenu?.name ||
                    "Not selected"}
                </strong>
              </div>
              {selectedMenu && (
                <div className="ss-row">
                  <span>Rate</span>
                  <strong>
                    {fmt(
                      selectedMenu.price_per_plate ||
                        selectedMenu.pricePerPlate ||
                        0,
                    )}
                    /plate
                  </strong>
                </div>
              )}
            </div>

            {saveError && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#991b1b",
                  fontSize: 13,
                }}
              >
                <AlertCircle size={14} /> {saveError}
              </div>
            )}

            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={goPrev}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {saving ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <Save size={14} />
                )}
                {saving
                  ? "Submitting…"
                  : isCustomer
                    ? "Submit Enquiry"
                    : "Create Lead"}
              </button>
            </div>
          </div>

          {/* Right: Bill estimate */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div
              className="card"
              style={{ padding: 22, position: "sticky", top: 80 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 16,
                }}
              >
                <IndianRupee
                  size={15}
                  style={{ color: "var(--color-primary)" }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--color-text-h)",
                  }}
                >
                  Bill Estimate
                </span>
              </div>

              <BillRow
                label="Hall Hire"
                sub={venue.hall_name || "No hall selected"}
                amount={hallPrice}
              />
              <BillRow
                label="Decoration"
                sub={
                  selectedDecor
                    ? `${selectedDecor.name} (${selectedDecor.theme})`
                    : "Not selected"
                }
                amount={decorPrice}
              />
              <BillRow
                label="Menu"
                sub={
                  selectedMenu
                    ? `${fmt(menuPPP)}/plate × ${venue.expected_guest_count} guests`
                    : "Not selected"
                }
                amount={menuTotal}
              />

              {/* Grand total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 14,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--color-text-h)",
                  }}
                >
                  Estimated Total
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 22,
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {fmt(grandTotal)}
                </div>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginTop: 8,
                  lineHeight: 1.5,
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: 10,
                }}
              >
                * This is an indicative estimate. Final pricing will be
                confirmed by the sales team after discussion. Taxes and
                additional services may apply.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Wizard step bar */
        .wizard-steps { display:flex;align-items:center;margin-bottom:24px;overflow-x:auto;padding-bottom:4px; }
        .ws-item  { display:flex;align-items:center;flex-shrink:0; }
        .ws-circle { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid;flex-shrink:0; }
        .ws-done   { background:var(--color-primary);border-color:var(--color-primary);color:#fff; }
        .ws-active { background:var(--color-primary-ghost);border-color:var(--color-primary);color:var(--color-primary); }
        .ws-idle   { background:var(--color-card);border-color:var(--color-border);color:var(--color-text-muted); }
        .ws-label  { font-size:11px;font-weight:600;color:var(--color-text-muted);margin-left:6px;white-space:nowrap; }
        .ws-label-active { color:var(--color-primary); }
        .ws-line   { height:2px;width:28px;background:var(--color-border);margin:0 6px;flex-shrink:0; }
        .ws-line-done { background:var(--color-primary); }

        /* Decoration picker */
        .decor-pick-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:4px; }
        .dp-card { position:relative;border:1.5px solid var(--color-border);border-radius:12px;padding:16px 14px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;transition:border-color .15s,box-shadow .15s; }
        .dp-card:hover { border-color:var(--color-primary); }
        .dp-selected { border-color:var(--color-primary) !important;background:var(--color-primary-ghost);box-shadow:0 0 0 2px rgba(var(--color-primary-rgb),.12); }

        /* Menu picker */
        .menu-pick-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:4px; }
        .mp-card { position:relative;border:1.5px solid var(--color-border);border-radius:12px;padding:16px 14px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;transition:border-color .15s,box-shadow .15s; }
        .mp-card:hover { border-color:var(--color-primary); }
        .mp-selected { border-color:var(--color-primary) !important;background:var(--color-primary-ghost); }

        /* Summary layout */
        .wizard-summary-layout { display:flex;gap:20px;align-items:flex-start; }
        .summary-section { margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--color-border); }
        .ss-heading { display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px; }
        .ss-row { display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;color:var(--color-text-body); }
        .ss-row span { color:var(--color-text-muted); }

        .spin { animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:800px) {
          .wizard-summary-layout { flex-direction:column; }
          .wizard-summary-layout > div:last-child { width:100% !important; }
          .decor-pick-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); }
          .menu-pick-grid  { grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); }
          .ws-label { display:none; }
          .ws-line  { width:16px; }
        }
      `}</style>
    </div>
  );
}
