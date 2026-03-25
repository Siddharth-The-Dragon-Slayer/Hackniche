"use client";
import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { invalidateCache, cacheKeys } from "@/lib/firestore-cache";

export default function FranchiseSettingsPage() {
  const { userProfile, role, refreshFranchiseProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id;

  const [form, setForm] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    logo_url: "",
    primary_color: "#7B1C1C",
    default_tax: "10",
    currency: "INR (₹)",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load franchise data from Firestore
  useEffect(() => {
    if (!franchiseId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "franchises", franchiseId));
        if (snap.exists()) {
          const d = snap.data();
          setForm({
            name: d.name || "",
            code: d.code || "",
            email: d.email || "",
            phone: d.phone || "",
            city: d.city || "",
            state: d.state || "",
            logo_url: d.logo_url || "",
            primary_color: d.primary_color || "#7B1C1C",
            default_tax: String(d.default_tax ?? 10),
            currency: d.currency || "INR (₹)",
          });
        }
      } catch (err) {
        setError("Failed to load franchise settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, [franchiseId]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!franchiseId) {
      setError("No franchise associated with your account.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateDoc(doc(db, "franchises", franchiseId), {
        name: form.name,
        code: form.code,
        email: form.email,
        phone: form.phone,
        city: form.city,
        state: form.state,
        logo_url: form.logo_url || null,
        primary_color: form.primary_color,
        default_tax: Number(form.default_tax),
        currency: form.currency,
        updated_at: serverTimestamp(),
      });
      invalidateCache(cacheKeys.franchise(franchiseId));
      // Refresh sidebar logo/name
      refreshFranchiseProfile?.();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-text-h)",
            }}
          >
            Franchise Settings
          </h1>
        </div>
        <div
          className="card"
          style={{
            padding: 32,
            maxWidth: 800,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--color-text-muted)",
          }}
        >
          <RefreshCw
            size={18}
            style={{ animation: "spin 1s linear infinite" }}
          />{" "}
          Loading settings…
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--color-text-h)",
          }}
        >
          Franchise Settings
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          {form.name || "Franchise"} — Configuration
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderRadius: 10,
            background: "rgba(192,57,43,0.08)",
            border: "1px solid rgba(192,57,43,0.2)",
            color: "var(--color-danger)",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderRadius: 10,
            background: "rgba(39,174,96,0.08)",
            border: "1px solid rgba(39,174,96,0.25)",
            color: "#27ae60",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} /> Settings saved successfully!
        </div>
      )}

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-text-h)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: 12,
            }}
          >
            Franchise Information
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Franchise Name
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
                  marginBottom: 6,
                }}
              >
                Code
              </label>
              <input
                className="input"
                value={form.code}
                onChange={set("code")}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Admin Email
              </label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Contact Phone
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
                  marginBottom: 6,
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
                  marginBottom: 6,
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
          </div>

          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-text-h)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: 12,
            }}
          >
            Branding
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Logo URL
              </label>
              <input
                className="input"
                placeholder="https://res.cloudinary.com/…"
                value={form.logo_url}
                onChange={set("logo_url")}
              />
              {form.logo_url && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    style={{
                      height: 40,
                      borderRadius: 6,
                      objectFit: "contain",
                      border: "1px solid var(--color-border)",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Primary Color
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={set("primary_color")}
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                />
                <input
                  className="input"
                  value={form.primary_color}
                  onChange={set("primary_color")}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-text-h)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: 12,
            }}
          >
            Default Settings
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Default Tax %
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="100"
                value={form.default_tax}
                onChange={set("default_tax")}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Currency
              </label>
              <input
                className="input"
                value={form.currency}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ alignSelf: "flex-start" }}
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} /> Save Settings
                </>
              )}
            </button>
            {role === "super_admin" && (
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Franchise ID:{" "}
                <code style={{ fontFamily: "var(--font-mono)" }}>
                  {franchiseId}
                </code>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
